package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PageDTO;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
//import org.lamisplus.modules.pmtct.projection.PatientPerson;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;

import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.HtsEncounterProxyRepository;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Data
@Service
@RequiredArgsConstructor
public class PmtctHtsService {
    private final UserService userService;
    private final PersonRepository personRepository;
    private final PmtctHtsRepository pmtctHtsRepository;
    private final PmtctPregnancyCycleService pmtctPregnancyCycleService;
    private final PersonService personService;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
    private final PmtctPregnancyCycleRepository pmtctPregnancyCycleRepository;
    private final ANCRepository ancRepository;
    private final HtsEncounterProxyRepository htsEncounterProxyRepository;
    private final PmtctVisitRepository pmtctVisitRepository;
    private final ObjectMapper objectMapper;

    // LV3-1732: any documented VL result at or above this threshold, on a client with a
    // suspected-acute-infection HTS/PMTCT record, confirms Acute HIV Infection.
    private static final long ACUTE_INFECTION_VL_THRESHOLD = 1000L;


    public PmtctHtsReponseDTO save(PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        // Delegate to hts_encounter table — pmtct_hts is no longer used for writes
        return saveToHtsEncounter(pmtctHtsRequestDTO);
    }

    /**
     * Checks if there are un-migrated active records in pmtct_hts for the current facility.
     * Returns the count so the frontend can show a notification banner.
     */
    public long getUnmigratedRecordCount() {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        if (!currentUser.isPresent()) {
            return 0;
        }
        Long facilityId = currentUser.get().getCurrentOrganisationUnitId();
        return pmtctHtsRepository.countActiveMigratableRecords(facilityId);
    }

    /**
     * LV3-1732: if this patient has a suspected-acute-infection HTS/PMTCT record (from either
     * module — hts_encounter is shared) that hasn't been resolved yet, and they have a
     * documented viral load, resolve that record per the Acute HIV Infection spec: VL >= 1000
     * copies/mL confirms Acute HIV Infection (finalHivTestResult=Positive); VL < 1000 resolves
     * the suspicion as a negative result instead (finalHivTestResult=Negative). Either way
     * dateoffinalHivTestResult is set to the VL result date. Idempotent (the "already flagged"
     * check in the repository query means re-running this for the same patient after it has
     * fired is a no-op), so it's safe to call on every page load as well as from a dedicated
     * endpoint.
     */
    public AcuteInfectionStatusDto checkAndApplyAcuteInfectionStatus(String patientUuid) {
        List<HtsEncounterProxy> candidates = htsEncounterProxyRepository
                .findUnflaggedSuspectedAcuteInfectionRecords(patientUuid);
        if (candidates.isEmpty()) {
            return AcuteInfectionStatusDto.noUpdate();
        }

        List<Object[]> latestVlRows = pmtctVisitRepository.findLatestViralLoadResultWithDate(patientUuid);
        if (latestVlRows.isEmpty() || latestVlRows.get(0) == null) {
            return AcuteInfectionStatusDto.noUpdate();
        }
        Object[] latestVlRow = latestVlRows.get(0);
        if (latestVlRow[0] == null || latestVlRow[1] == null) {
            return AcuteInfectionStatusDto.noUpdate();
        }
        Long vlResult = ((Number) latestVlRow[0]).longValue();
        Object rawResultDate = latestVlRow[1];
        LocalDate vlResultDate = rawResultDate instanceof java.sql.Timestamp
                ? ((java.sql.Timestamp) rawResultDate).toLocalDateTime().toLocalDate()
                : rawResultDate instanceof java.time.LocalDateTime
                        ? ((java.time.LocalDateTime) rawResultDate).toLocalDate()
                        : rawResultDate instanceof java.sql.Date
                                ? ((java.sql.Date) rawResultDate).toLocalDate()
                                : (LocalDate) rawResultDate;
        boolean isAcute = vlResult >= ACUTE_INFECTION_VL_THRESHOLD;

        // Most recent unresolved suspected-acute record is the one that gets resolved.
        HtsEncounterProxy record = candidates.get(0);
        ObjectNode obs = record.getObservation() instanceof ObjectNode
                ? (ObjectNode) record.getObservation()
                : objectMapper.createObjectNode();
        obs.put("dateoffinalHivTestResult", vlResultDate.toString());
        if (isAcute) {
            obs.put("finalHivTestResult", "Positive");
            obs.put("confirmatoryHivTest", "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE");
            obs.put("acuteHivInfectionDetected", true);
            obs.put("acuteHivInfectionDetectedDate", LocalDate.now().toString());
            obs.put("acuteHivInfectionTriggerVl", vlResult);
        } else {
            obs.put("finalHivTestResult", "Negative");
            // Not an Acute HIV Infection — flip suspectedAcuteInfection off so the record no
            // longer matches findUnflaggedSuspectedAcuteInfectionRecords' WHERE clause (which
            // keys off suspectedAcuteInfection = 'YES_NO_YES', not acuteHivInfectionDetected,
            // so leaving that key at YES_NO_YES here would keep re-matching this record forever).
            obs.put("suspectedAcuteInfection", "YES_NO_NO");
            obs.put("acuteHivInfectionResolvedNegativeDate", LocalDate.now().toString());
            obs.put("acuteHivInfectionTriggerVl", vlResult);
        }
        record.setObservation(obs);
        htsEncounterProxyRepository.save(record);

        boolean fromHtsModule = record.getPmtctHts() == null || !record.getPmtctHts();
        return new AcuteInfectionStatusDto(true, vlResult, vlResultDate, fromHtsModule,
                isAcute ? "Positive" : "Negative");
    }


    // ══════════════════ HTS ENCOUNTER PROXY (saves to hts_encounter table) ══════════════════

    // Resolves HTS's numeric personId (patient_person.id) from patientUuid, scoped to the
    // current user's facility — the exact same lookup saveToHtsEncounter already does below.
    // Exists as its own call because HTS-Module's own POST /api/v1/hts-encounter requires this
    // numeric patientId, and the frontend has no reliable source for it: the PMTCT HTS grid's
    // own backing query (PmtctHtsRepository.getActiveOnPmtctHts) aliases a DIFFERENT value —
    // the previous hts_encounter record's own id, not the patient's — under the field name
    // "personId", so trusting whatever's already in patientObj would silently resolve to the
    // wrong id. Re-deriving from patientUuid here avoids that trap entirely.
    // Scenario: a client already has a positive HIV result documented via the standalone HTS
    // module (pmtct_hts = false), before ever coming through PMTCT. When she opens a NEW PMTCT
    // HTS form, the form should detect this, prepopulate PMTCT-relevant fields from that record,
    // and — on save — UPDATE that same existing hts_encounter row instead of creating a new
    // one (avoiding a duplicate record for the same client across HTS and PMTCT reporting).
    // Returns null (204/empty body via the controller) if no such record exists, so the
    // frontend can tell "found nothing" apart from "found an actual record."
    public PmtctHtsReponseDTO checkPriorHtsModulePositiveRecord(String patientUuid) {
        Optional<HtsEncounterProxy> proxyOpt = htsEncounterProxyRepository
                .findEarliestHtsModulePositiveRecord(patientUuid);
        if (!proxyOpt.isPresent()) {
            return null;
        }
        HtsEncounterProxy proxy = proxyOpt.get();

        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(
                patientUuid, facilityId, 0);

        return convertProxyToResponseDto(proxy, personOpt.orElse(null));
    }

    public Map<String, Long> getPersonId(String patientUuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        Person person = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(patientUuid, facilityId, 0)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "uuid", patientUuid));

        return Collections.singletonMap("personId", person.getId());
    }

    public PmtctHtsReponseDTO saveToHtsEncounter(PmtctHtsRequestDTO dto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        // Resolve patient_id from patient_uuid
        Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(
                dto.getPatientUuid(), facilityId, 0);
        if (!personOpt.isPresent()) {
            throw new EntityNotFoundException(Person.class, "uuid", dto.getPatientUuid());
        }
        Person person = personOpt.get();

        // Build proxy entity targeting hts_encounter table
        HtsEncounterProxy encounter = new HtsEncounterProxy();
        encounter.setPersonId(person.getId());
        encounter.setPatientUuid(UUID.fromString(dto.getPatientUuid()));
        // Frontend is responsible for generating and verifying uniqueness of clientCode
        encounter.setClientCode(dto.getClientCode() != null ? dto.getClientCode().trim() : "");
        encounter.setDateOfVisit(dto.getDateOfHivTest());
        encounter.setFacilityId(facilityId);
        // hts_encounter.setting is shared with the HTS module, which stores the broad
        // Facility/Community/Other category here (not the testing-point subtype) —
        // use testEntryPoint to match that; testSetting (subtype) is kept in observation.
        // Normalized via mapToHtsSetting so this column always lands on HTS's own
        // HTS_ENTRY_POINT_* values, regardless of which codeset the frontend happened to
        // source testEntryPoint from (PMTCT's Setting dropdown now uses HTS_ENTRY_POINT
        // directly, but this keeps the column correct even if that ever drifts again).
        encounter.setSetting(mapToHtsSetting(dto.getTestEntryPoint()));
        encounter.setPmtctHts(true);
        encounter.setSource(dto.getSource() != null ? dto.getSource() : "WEB");
        encounter.setArchived(false);
        encounter.setObservation(buildPmtctObservation(dto));

        // Manually set audit fields (Spring JPA auditing not configured in PMTCT module)
        encounter.setCreatedBy(user.getUserName());
        encounter.setCreatedDate(java.time.LocalDateTime.now());
        encounter.setLastModifiedBy(user.getUserName());
        encounter.setLastModifiedDate(java.time.LocalDateTime.now());

        HtsEncounterProxy saved = this.htsEncounterProxyRepository.save(encounter);

        // Update pregnancy cycle status to ACTIVE
        if (dto.getPmtctCycleUuid() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(dto.getPmtctCycleUuid());
        }

        return convertProxyToResponseDto(saved, person);
    }

    public PmtctHtsReponseDTO updateHtsEncounter(Long id, PmtctHtsRequestDTO dto) {
        HtsEncounterProxy existing = this.htsEncounterProxyRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounterProxy.class, "id", id + ""));

        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        // Update columns
        existing.setDateOfVisit(dto.getDateOfHivTest());
        existing.setSetting(mapToHtsSetting(dto.getTestEntryPoint()));
        existing.setSource(dto.getSource() != null ? dto.getSource() : "WEB");
        existing.setObservation(buildPmtctObservation(dto));

        // Update audit fields
        existing.setLastModifiedBy(user.getUserName());
        existing.setLastModifiedDate(java.time.LocalDateTime.now());

        HtsEncounterProxy saved = this.htsEncounterProxyRepository.save(existing);

        // Update pregnancy cycle status to ACTIVE
        if (dto.getPmtctCycleUuid() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(dto.getPmtctCycleUuid());
        }

        // Resolve person for response
        Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(
                dto.getPatientUuid(), facilityId, 0);
        return convertProxyToResponseDto(saved, personOpt.orElse(null));
    }

    private JsonNode buildPmtctObservation(PmtctHtsRequestDTO dto) {
        ObjectNode obs = objectMapper.createObjectNode();

        // HIV Test Results
        putIfNotEmpty(obs, "finalHivTestResult", dto.getFinalResult());
        if (dto.getInitialHivTest() != null) {
            putIfNotEmpty(obs, "initialHivTest", dto.getInitialHivTest().getResult());
        }
        // confirmatoryHivTest: store ONLY the result string (no dateOfTest)
        if (dto.getConfirmatoryHivTest() != null) {
            putIfNotEmpty(obs, "confirmatoryHivTest", dto.getConfirmatoryHivTest().getResult());
        }
        // tieBreaker, tieBreaker2, retesting, confirmatoryTest2: EXCLUDED (obsolete)

        // LV3-1732: dateoffinalHivTestResult takes the HTS visit date when a genuine
        // confirmatory/final result (Positive or Negative) is documented on this form. Left
        // unset while the client is in the unresolved Suspected Acute HIV Infection state
        // (Antigen-Reactive Early Detect with no final result yet) — that date is only ever
        // set later, from the viral load result, by checkAndApplyAcuteInfectionStatus.
        if (dto.getFinalResult() != null && !dto.getFinalResult().isEmpty()
                && !isSuspectedAcuteInfection(dto.getHivEarlyDetect()) && dto.getDateOfHivTest() != null) {
            obs.put("dateoffinalHivTestResult", dto.getDateOfHivTest().toString());
        }

        // PMTCT Metadata
        putIfNotEmpty(obs, "pmtctCycleUuid", dto.getPmtctCycleUuid());
        putIfNotEmpty(obs, "testingType", dto.getTestingType());
        putIfNotEmpty(obs, "testEntryPoint", dto.getTestEntryPoint());
        putIfNotEmpty(obs, "testSetting", dto.getTestSetting());
        // Map testSetting into the correct HTS observation key based on entry point
        if (isCommunityEntry(dto.getTestEntryPoint())) {
            putIfNotEmpty(obs, "communityEntryPoint", dto.getTestSetting());
        } else {
            putIfNotEmpty(obs, "facilitySetting", dto.getTestSetting());
        }
        putIfNotEmpty(obs, "stageOfPregnancy", dto.getStageOfPregnancy());
        putIfNotEmpty(obs, "hospitalNumber", dto.getHospitalNumber());
        putIfNotEmpty(obs, "pmtctTestEntryPoint", dto.getPmtctTestEntryPoint());

        // Serology — syphilis and hepatitisB go inside their nested objects only
        putIfNotEmpty(obs, "hepatitisC", dto.getHepatitisC());
        if (dto.getSyphilisInfo() != null) {
            obs.set("syphilisInfo", objectMapper.valueToTree(dto.getSyphilisInfo()));
        }
        if (dto.getHbvInfo() != null) {
            obs.set("hbvInfo", objectMapper.valueToTree(dto.getHbvInfo()));
        }
        if (dto.getPartnerInfo() != null) {
            obs.set("partnerInfo", objectMapper.valueToTree(dto.getPartnerInfo()));
        }

        // PMTCT Register fields
        putIfNotEmpty(obs, "pregnancyStatusAtEntry", dto.getPregnancyStatusAtEntry());
        // HIV Prevention reads the standard HTS "pregnancyStatus" codeset key off the shared
        // hts_encounter table for dashboard display and form auto-population — it doesn't know
        // about PMTCT's own pregnancyStatusAtEntry key. Without this, PMTCT-originated HTS
        // records show Pregnancy Status = Unknown there even when it was actually captured.
        putIfNotEmpty(obs, "pregnancyStatus", mapPregnancyStatusToHtsCode(dto.getPregnancyStatusAtEntry()));
        putIfNotEmpty(obs, "previouslyKnownHivPositive", dto.getPreviouslyKnownHivPositive());
        putIfNotEmpty(obs, "enrolledOnArt", dto.getEnrolledOnArt());
        // Keys conform to the HTS module's naming (typeOfHivTestDone, hivEarlyDetectResult)
        // so both modules' records can be queried by the same observation key.
        putIfNotEmpty(obs, "typeOfHivTestDone", dto.getTypeOfHivTest());
        putIfNotEmpty(obs, "hivEarlyDetectResult", dto.getHivEarlyDetect());
        putIfNotEmpty(obs, "hivEarlyDetectViralLoad", dto.getHivEarlyDetectViralLoad());
        // Mirrors the "Suspected Acute HIV Infection" banner the PMTCT HTS form already shows
        // for these two Early Detect results (PmtctHtsForm.js). The HIV module's cross-module
        // eligibility queries read this key off the shared hts_encounter table for both HTS-
        // and PMTCT-authored rows, so it must be written here using the HTS module's own
        // YES_NO codeset values or PMTCT clients are invisible to that logic.
        putIfNotEmpty(obs, "suspectedAcuteInfection", isSuspectedAcuteInfection(dto.getHivEarlyDetect()) ? "YES_NO_YES" : "YES_NO_NO");
        putIfNotEmpty(obs, "confirmatoryFromSpokes", dto.getConfirmatoryFromSpokes());
        putIfNotEmpty(obs, "initiatedOnProphylaxis", dto.getInitiatedOnProphylaxis());
        putIfNotEmpty(obs, "tbReferred", dto.getTbReferred());
        putIfNotEmpty(obs, "tbScreeningStatus", dto.getTbScreeningStatus());
        putIfNotEmpty(obs, "viralLoadMonitoring", dto.getViralLoadMonitoring());

        // LV3-1732 / Item-14: the PMTCT HTS form's own Viral Load dropdown
        // (hivEarlyDetectViralLoad, shown only for the two suspected-acute Early Detect
        // results) lets a tester document "Target Detected"/"Target Not Detected" directly on
        // this form, without waiting for a separate Laboratory VL order. This value used to be
        // captured into observation but never acted on, so a record documented this way stayed
        // permanently "Suspected Acute HIV Infection" on the dashboard. Resolve it immediately
        // here — same outcome as checkAndApplyAcuteInfectionStatus's later lab-sourced
        // resolution, but keyed off this qualitative field and dated to the HTS visit date
        // (dateOfHivTest), since there is no separate VL order date in this direct-entry path.
        if (isSuspectedAcuteInfection(dto.getHivEarlyDetect())) {
            if ("Target Detected".equals(dto.getHivEarlyDetectViralLoad())) {
                obs.put("finalHivTestResult", "Positive");
                obs.put("confirmatoryHivTest", "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE");
                obs.put("suspectedAcuteInfection", "YES_NO_YES");
                obs.put("acuteHivInfectionDetected", true);
                obs.put("acuteHivInfectionDetectedDate", LocalDate.now().toString());
                obs.put("acuteHivInfectionTriggerVl", "Target Detected");
                if (dto.getDateOfHivTest() != null) {
                    obs.put("dateoffinalHivTestResult", dto.getDateOfHivTest().toString());
                }
            } else if ("Target Not Detected".equals(dto.getHivEarlyDetectViralLoad())) {
                obs.put("finalHivTestResult", "Negative");
                obs.put("suspectedAcuteInfection", "YES_NO_NO");
                obs.put("acuteHivInfectionResolvedNegativeDate", LocalDate.now().toString());
                obs.put("acuteHivInfectionTriggerVl", "Target Not Detected");
                if (dto.getDateOfHivTest() != null) {
                    obs.put("dateoffinalHivTestResult", dto.getDateOfHivTest().toString());
                }
            }
        }

        return obs;
    }

    private void putIfNotEmpty(ObjectNode node, String key, String value) {
        node.put(key, value != null ? value : "");
    }

    // Maps PMTCT's free-text pregnancyStatusAtEntry ("Pregnant", "Breastfeeding", etc.) onto
    // the standard PREGNANCY_STATUS codeset codes the HTS module writes, so HIV Prevention's
    // hts_encounter queries resolve the same way for PMTCT-originated records. Codes below
    // (including the "PREGANACY_STATUS_..." spelling) come directly from the live
    // base_application_codeset rows — not a typo, matches what's actually in the DB.
    private String mapPregnancyStatusToHtsCode(String pregnancyStatusAtEntry) {
        if (pregnancyStatusAtEntry == null) return null;
        switch (pregnancyStatusAtEntry.trim().toLowerCase()) {
            case "pregnant": return "PREGANACY_STATUS_PREGNANT";
            case "breastfeeding": return "PREGANACY_STATUS_BREASTFEEDING";
            case "post partum": return "PREGANACY_STATUS_POST_PARTUM";
            case "not pregnant": return "PREGANACY_STATUS_NOT_PREGNANT";
            default: return null;
        }
    }

    private String mapToHtsSetting(String testEntryPoint) {
        if (testEntryPoint == null) return "HTS_ENTRY_POINT_FACILITY";
        String upper = testEntryPoint.toUpperCase();
        if (upper.contains("COMMUNITY")) {
            return "HTS_ENTRY_POINT_COMMUNITY";
        }
        // ENROLLMENT_SETTING_FACILITY, PMTCT_ANC, PMTCT_L&D, PMTCT_POSTPARTUM, etc.
        return "HTS_ENTRY_POINT_FACILITY";
    }

    private boolean isCommunityEntry(String testEntryPoint) {
        return testEntryPoint != null && testEntryPoint.toUpperCase().contains("COMMUNITY");
    }

    // Same condition PmtctHtsForm.js uses to show the "Suspected Acute HIV Infection" banner:
    // Antigen-only or Antigen+Antibody Early Detect result, both Reactive.
    private boolean isSuspectedAcuteInfection(String hivEarlyDetect) {
        return "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE".equals(hivEarlyDetect)
                || "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE".equals(hivEarlyDetect);
    }

    private PmtctHtsReponseDTO convertProxyToResponseDto(HtsEncounterProxy saved, Person person) {
        PmtctHtsReponseDTO resp = new PmtctHtsReponseDTO();
        resp.setId(saved.getId());
        resp.setClientCode(saved.getClientCode());
        resp.setUuid(saved.getUuid() != null ? saved.getUuid().toString() : null);
        resp.setDateOfHivTest(saved.getDateOfVisit());
        resp.setSource(saved.getSource());

        // Extract fields from observation JSONB
        JsonNode obs = saved.getObservation();
        if (obs != null) {
            resp.setFinalResult(textOrNull(obs, "finalHivTestResult"));
            // hts_encounter.setting is the canonical HTS_ENTRY_POINT_FACILITY/COMMUNITY column —
            // both modules write it on every save. observation.testEntryPoint is a PMTCT-only key
            // HTS's own create/update never populates, so for a genuine HTS-module-authored record
            // (e.g. checkPriorHtsModulePositiveRecord adopting a positive result) it's always null;
            // falling back to it first silently defaulted every such record to Facility, including
            // the ~34% that were actually tested in a Community setting. Prefer the column.
            String settingColumn = saved.getSetting();
            resp.setTestEntryPoint(settingColumn != null && !settingColumn.isEmpty()
                    ? settingColumn : textOrNull(obs, "testEntryPoint"));
            // Same gap as testEntryPoint above: HTS stores the subtype under facilitySetting/
            // communityEntryPoint, never under a "testSetting" key — so on a genuine HTS-authored
            // record this was always null. That's silently harmless for viewing (PMTCT's Test
            // Setting field is hidden once Previously Known HIV+ = Yes), but priorHtsPositiveRecordId's
            // update path still round-trips this value back out as modality/facilitySetting/
            // communityEntryPoint on save — so an empty read here was blanking out the record's
            // real test-setting subtype (e.g. "COMMUNITY_HTS_TEST_SETTING_OUTREACH") on every update.
            String testSettingValue = textOrNull(obs, "testSetting");
            if (testSettingValue == null || testSettingValue.isEmpty()) {
                testSettingValue = textOrNull(obs, "facilitySetting");
            }
            if (testSettingValue == null || testSettingValue.isEmpty()) {
                testSettingValue = textOrNull(obs, "communityEntryPoint");
            }
            resp.setTestSetting(testSettingValue);
            resp.setStageOfPregnancy(textOrNull(obs, "stageOfPregnancy"));
            resp.setTestingType(textOrNull(obs, "testingType"));
            resp.setPmtctCycleUuid(textOrNull(obs, "pmtctCycleUuid"));
            resp.setHepatitisC(textOrNull(obs, "hepatitisC"));
            resp.setPmtctTestEntryPoint(textOrNull(obs, "pmtctTestEntryPoint"));
            resp.setPregnancyStatusAtEntry(textOrNull(obs, "pregnancyStatusAtEntry"));
            resp.setPreviouslyKnownHivPositive(textOrNull(obs, "previouslyKnownHivPositive"));
            resp.setEnrolledOnArt(textOrNull(obs, "enrolledOnArt"));
            resp.setTypeOfHivTest(textOrNullWithFallback(obs, "typeOfHivTestDone", "typeOfHivTest"));
            resp.setHivEarlyDetect(textOrNullWithFallback(obs, "hivEarlyDetectResult", "hivEarlyDetect"));
            resp.setHivEarlyDetectViralLoad(textOrNull(obs, "hivEarlyDetectViralLoad"));
            resp.setConfirmatoryFromSpokes(textOrNull(obs, "confirmatoryFromSpokes"));
            resp.setInitiatedOnProphylaxis(textOrNull(obs, "initiatedOnProphylaxis"));
            resp.setTbReferred(textOrNull(obs, "tbReferred"));
            resp.setTbScreeningStatus(textOrNull(obs, "tbScreeningStatus"));
            resp.setViralLoadMonitoring(textOrNull(obs, "viralLoadMonitoring"));

            // initialHivTest: stored as flat string; backward compat for old JSON object format
            JsonNode initialNode = obs.get("initialHivTest");
            if (initialNode != null && !initialNode.isNull()) {
                HivTestDto initial = new HivTestDto();
                if (initialNode.isTextual()) {
                    // New format: flat string e.g. "reactive"
                    initial.setResult(initialNode.asText());
                } else if (initialNode.isObject()) {
                    // Old format: JSON object e.g. {"result":"reactive","dateOfTest":"..."}
                    initial.setResult(textOrNull(initialNode, "result"));
                }
                resp.setInitialHivTest(initial);
            }

            // confirmatoryHivTest: stored as flat string, reconstruct as HivTestDto with result only
            String confirmatoryResult = textOrNull(obs, "confirmatoryHivTest");
            if (confirmatoryResult != null && !confirmatoryResult.isEmpty()) {
                HivTestDto confirmatory = new HivTestDto();
                confirmatory.setResult(confirmatoryResult);
                resp.setConfirmatoryHivTest(confirmatory);
            }

            // Nested JSONB objects — syphilis and hepatitisB live inside these
            try {
                JsonNode syphilisNode = obs.get("syphilisInfo");
                if (syphilisNode != null && !syphilisNode.isNull()) {
                    SyphilisDetailsDto syphDto = objectMapper.treeToValue(syphilisNode, SyphilisDetailsDto.class);
                    resp.setSyphilisInfo(syphDto);
                    resp.setSyphilis(syphDto.getTestResult());
                }
            } catch (Exception e) { /* skip deserialization error */ }
            // Backward compat: old records may only have flat "syphilis" key
            if (resp.getSyphilis() == null) {
                resp.setSyphilis(textOrNull(obs, "syphilis"));
            }

            try {
                JsonNode hbvNode = obs.get("hbvInfo");
                if (hbvNode != null && !hbvNode.isNull()) {
                    HbvInfoDto hbvDto = objectMapper.treeToValue(hbvNode, HbvInfoDto.class);
                    resp.setHbvInfo(hbvDto);
                    resp.setHepatitisB(hbvDto.getTestResult());
                }
            } catch (Exception e) { /* skip deserialization error */ }
            // Backward compat: old records may only have flat "hepatitisB" key
            if (resp.getHepatitisB() == null) {
                resp.setHepatitisB(textOrNull(obs, "hepatitisB"));
            }

            try {
                JsonNode partnerNode = obs.get("partnerInfo");
                if (partnerNode != null && !partnerNode.isNull()) {
                    resp.setPartnerInfo(objectMapper.treeToValue(partnerNode, PartnerInfoDto.class));
                }
            } catch (Exception e) { /* skip deserialization error */ }
        }

        // Person info
        if (person != null) {
            resp.setPatientUuid(person.getUuid());
            resp.setPersonId(person.getId());
            resp.setHospitalNumber(person.getHospitalNumber());
            resp.setFirstName(person.getFirstName());
            resp.setSurname(person.getSurname());
            resp.setOtherName(person.getOtherName());
            resp.setSex(person.getSex());
            resp.setDateOfBirth(person.getDateOfBirth());
            resp.setAge(calculateAge(person.getDateOfBirth()));
            resp.setFullName(person.getFullName());
            if (person.getAddress() != null) {
                resp.setAddress(person.getAddress().toString());
            }
            if (person.getContactPoint() != null) {
                resp.setContactPoint(person.getContactPoint().toString());
            }
        }

        return resp;
    }

    private PmtctHtsReponseDTO convertProxyToResponseDtoWithPersonLookup(HtsEncounterProxy proxy) {
        Person person = null;
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(
                    proxy.getPatientUuid().toString(), facilityId, 0);
            if (personOpt.isPresent()) {
                person = personOpt.get();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return convertProxyToResponseDto(proxy, person);
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode child = node.get(field);
        if (child == null || child.isNull()) return null;
        return child.asText();
    }

    // Reads a harmonized-with-HTS observation key, falling back to the old
    // PMTCT-only key name for records saved before the HTS field harmonization
    // migration (typeOfHivTest -> typeOfHivTestDone, hivEarlyDetect -> hivEarlyDetectResult).
    private String textOrNullWithFallback(JsonNode node, String newKey, String oldKey) {
        String value = textOrNull(node, newKey);
        return (value != null && !value.isEmpty()) ? value : textOrNull(node, oldKey);
    }

    // confirmatoryHivTest moved from plain Positive/Negative to the HIV_CONFIRMATORY_TEST_RESULT
    // codeset. Callers that use it as a hivStatus fallback (e.g. getPatientHivSummary) expect
    // the plain Positive/Negative contract, so normalize every prior generation of stored value
    // (reactive/non-reactive, plain Positive/Negative, and the new codeset codes) onto that.
    private String normalizeConfirmatoryResult(String value) {
        if (value == null || value.isEmpty()) return value;
        String v = value.toLowerCase();
        if (v.equals("reactive") || v.equals("positive") || v.equals("hiv_confirmatory_test_result_positive")) return "Positive";
        if (v.equals("non-reactive") || v.equals("negative") || v.equals("hiv_confirmatory_test_result_negative")) return "Negative";
        return value;
    }

    // ══════════════════ END HTS ENCOUNTER PROXY ══════════════════

    public PmtctHtsReponseDTO convertEntitytoRespondDto(PmtctHts pmtctHts) {
        PmtctHtsReponseDTO pmtctHtsReponseDTO = new PmtctHtsReponseDTO();
        pmtctHtsReponseDTO.setId(pmtctHts.getId());
        pmtctHtsReponseDTO.setDateOfHivTest(pmtctHts.getDateOfHivTest());
        pmtctHtsReponseDTO.setTestEntryPoint(pmtctHts.getTestEntryPoint());
        pmtctHtsReponseDTO.setTestSetting(pmtctHts.getTestSetting());
        pmtctHtsReponseDTO.setUuid(pmtctHts.getUuid());
        pmtctHtsReponseDTO.setInitialHivTest(pmtctHts.getInitialHivTest());
        pmtctHtsReponseDTO.setConfirmatoryHivTest(pmtctHts.getConfirmatoryHivTest());
        pmtctHtsReponseDTO.setStageOfPregnancy(pmtctHts.getStageOfPregnancy());
        pmtctHtsReponseDTO.setHepatitisC(pmtctHts.getHepatitisC());
        pmtctHtsReponseDTO.setHepatitisB(pmtctHts.getHepatitisB());
        pmtctHtsReponseDTO.setTestingType(pmtctHts.getTestingType());
        pmtctHtsReponseDTO.setSyphilis(pmtctHts.getSyphilis());
        pmtctHtsReponseDTO.setRetesting(pmtctHts.getRetesting());
        pmtctHtsReponseDTO.setFinalResult(pmtctHts.getFinalResult());

        pmtctHtsReponseDTO.setSource(pmtctHts.getSource());
        pmtctHtsReponseDTO.setPregnancyStatusAtEntry(pmtctHts.getPregnancyStatusAtEntry());
        pmtctHtsReponseDTO.setPreviouslyKnownHivPositive(pmtctHts.getPreviouslyKnownHivPositive());
        pmtctHtsReponseDTO.setEnrolledOnArt(pmtctHts.getEnrolledOnArt());
        pmtctHtsReponseDTO.setTypeOfHivTest(pmtctHts.getTypeOfHivTest());
        pmtctHtsReponseDTO.setHivEarlyDetect(pmtctHts.getHivEarlyDetect());
        pmtctHtsReponseDTO.setHivEarlyDetectViralLoad(pmtctHts.getHivEarlyDetectViralLoad());
        pmtctHtsReponseDTO.setConfirmatoryFromSpokes(pmtctHts.getConfirmatoryFromSpokes());
        pmtctHtsReponseDTO.setInitiatedOnProphylaxis(pmtctHts.getInitiatedOnProphylaxis());
        pmtctHtsReponseDTO.setTbReferred(pmtctHts.getTbReferred());
        pmtctHtsReponseDTO.setSyphilisInfo(pmtctHts.getSyphilisInfo());
        pmtctHtsReponseDTO.setHbvInfo(pmtctHts.getHbvInfo());
        pmtctHtsReponseDTO.setPartnerInfo(pmtctHts.getPartnerInfo());
        pmtctHtsReponseDTO.setTbScreeningStatus(pmtctHts.getTbScreeningStatus());
        pmtctHtsReponseDTO.setPmtctTestEntryPoint(pmtctHts.getPmtctTestEntryPoint());
        pmtctHtsReponseDTO.setViralLoadMonitoring(pmtctHts.getViralLoadMonitoring());
               try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctHts.getPatientUuid(), facilityId, 0);
            if (persons.isPresent()) {
                Person person = persons.get();
                pmtctHtsReponseDTO.setHospitalNumber(person.getHospitalNumber());
                pmtctHtsReponseDTO.setPatientUuid(person.getUuid());
                pmtctHtsReponseDTO.setFirstName(person.getFirstName());
                pmtctHtsReponseDTO.setSurname(person.getSurname());
                pmtctHtsReponseDTO.setOtherName(person.getOtherName());
                pmtctHtsReponseDTO.setSex(person.getSex());
                pmtctHtsReponseDTO.setDateOfBirth(person.getDateOfBirth());
                pmtctHtsReponseDTO.setAge(calculateAge(person.getDateOfBirth()));
                pmtctHtsReponseDTO.setFullName(person.getFullName());
                if (person.getAddress() != null) {
                    pmtctHtsReponseDTO.setAddress(person.getAddress().toString());
                }
                if (person.getContactPoint() != null) {
                    pmtctHtsReponseDTO.setContactPoint(person.getContactPoint().toString());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        return pmtctHtsReponseDTO;
    }

    public PmtctHts converRequestDtotoEntity(PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        PmtctHts pmtctHts = new PmtctHts();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        pmtctHts.setFacilityId(facilityId);
        pmtctHts.setDateOfHivTest(pmtctHtsRequestDTO.getDateOfHivTest());
        pmtctHts.setTestEntryPoint(pmtctHtsRequestDTO.getTestEntryPoint());
        pmtctHts.setTestSetting(pmtctHtsRequestDTO.getTestSetting());
        pmtctHts.setInitialHivTest(pmtctHtsRequestDTO.getInitialHivTest());
        pmtctHts.setUuid(UUID.randomUUID().toString());
        pmtctHts.setConfirmatoryHivTest(pmtctHtsRequestDTO.getConfirmatoryHivTest());
        pmtctHts.setStageOfPregnancy(pmtctHtsRequestDTO.getStageOfPregnancy());
        pmtctHts.setSyphilis(pmtctHtsRequestDTO.getSyphilis());
        pmtctHts.setHepatitisB(pmtctHtsRequestDTO.getHepatitisB());
        pmtctHts.setTestingType(pmtctHtsRequestDTO.getTestingType());
        pmtctHts.setHepatitisC(pmtctHtsRequestDTO.getHepatitisC());
        pmtctHts.setArchived(false);
        pmtctHts.setPatientUuid(pmtctHtsRequestDTO.getPatientUuid());
        pmtctHts.setRetesting(pmtctHtsRequestDTO.getRetesting());
        pmtctHts.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
        pmtctHts.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
        pmtctHts.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
        pmtctHts.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
        pmtctHts.setPmtctCycleUuid(pmtctHtsRequestDTO.getPmtctCycleUuid());
        pmtctHts.setFacilityId(facilityId);
        pmtctHts.setCreatedBy(user.getUserName());
        pmtctHts.setLastModifiedBy(user.getUserName());
        pmtctHts.setCreatedDate(java.time.LocalDateTime.now());
        pmtctHts.setLastModifiedDate(java.time.LocalDateTime.now());
        pmtctHts.setSource(pmtctHtsRequestDTO.getSource());
        pmtctHts.setPregnancyStatusAtEntry(pmtctHtsRequestDTO.getPregnancyStatusAtEntry());
        pmtctHts.setPreviouslyKnownHivPositive(pmtctHtsRequestDTO.getPreviouslyKnownHivPositive());
        pmtctHts.setEnrolledOnArt(pmtctHtsRequestDTO.getEnrolledOnArt());
        pmtctHts.setTypeOfHivTest(pmtctHtsRequestDTO.getTypeOfHivTest());
        pmtctHts.setHivEarlyDetect(pmtctHtsRequestDTO.getHivEarlyDetect());
        pmtctHts.setHivEarlyDetectViralLoad(pmtctHtsRequestDTO.getHivEarlyDetectViralLoad());
        pmtctHts.setConfirmatoryFromSpokes(pmtctHtsRequestDTO.getConfirmatoryFromSpokes());
        pmtctHts.setInitiatedOnProphylaxis(pmtctHtsRequestDTO.getInitiatedOnProphylaxis());
        pmtctHts.setTbReferred(pmtctHtsRequestDTO.getTbReferred());
        pmtctHts.setSyphilisInfo(pmtctHtsRequestDTO.getSyphilisInfo());
        pmtctHts.setHbvInfo(pmtctHtsRequestDTO.getHbvInfo());
        pmtctHts.setPartnerInfo(pmtctHtsRequestDTO.getPartnerInfo());
        pmtctHts.setTbScreeningStatus(pmtctHtsRequestDTO.getTbScreeningStatus());
        pmtctHts.setPmtctTestEntryPoint(pmtctHtsRequestDTO.getPmtctTestEntryPoint());
        pmtctHts.setViralLoadMonitoring(pmtctHtsRequestDTO.getViralLoadMonitoring());

        PmtctHts savedHts = this.pmtctHtsRepository.save(pmtctHts);

        // Update pregnancy cycle status to ACTIVE
        if (pmtctHtsRequestDTO.getPmtctCycleUuid() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleUuid());
        }

        return savedHts;
    }

//


    public PmtctHtsRequestDTO updatePmtctHts(String id, PmtctHtsRequestDTO pmtctHtsRequestDTO)
    {


        Optional <PmtctHts> pmtctHtsEnrollment = this.pmtctHtsRepository.findById(id);
        if(pmtctHtsEnrollment.isPresent())
        {
            PmtctHts pmtctEnrollment1 = pmtctHtsEnrollment.get();
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = currentUser.get();

            pmtctEnrollment1.setDateOfHivTest(pmtctHtsRequestDTO.getDateOfHivTest());
            pmtctEnrollment1.setTestEntryPoint(pmtctHtsRequestDTO.getTestEntryPoint());
            pmtctEnrollment1.setTestSetting(pmtctHtsRequestDTO.getTestSetting());
            pmtctEnrollment1.setInitialHivTest(pmtctHtsRequestDTO.getInitialHivTest());
            pmtctEnrollment1.setConfirmatoryHivTest(pmtctHtsRequestDTO.getConfirmatoryHivTest());
            pmtctEnrollment1.setStageOfPregnancy(pmtctHtsRequestDTO.getStageOfPregnancy());
            pmtctEnrollment1.setSyphilis(pmtctHtsRequestDTO.getSyphilis());
            pmtctEnrollment1.setHepatitisB(pmtctHtsRequestDTO.getHepatitisB());
            pmtctEnrollment1.setHepatitisC(pmtctHtsRequestDTO.getHepatitisC());
            pmtctEnrollment1.setRetesting(pmtctHtsRequestDTO.getRetesting());
            pmtctEnrollment1.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
            pmtctEnrollment1.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
            pmtctEnrollment1.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
            pmtctEnrollment1.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
            pmtctEnrollment1.setPmtctCycleUuid(pmtctHtsRequestDTO.getPmtctCycleUuid());
            pmtctEnrollment1.setPregnancyStatusAtEntry(pmtctHtsRequestDTO.getPregnancyStatusAtEntry());
            pmtctEnrollment1.setPreviouslyKnownHivPositive(pmtctHtsRequestDTO.getPreviouslyKnownHivPositive());
            pmtctEnrollment1.setEnrolledOnArt(pmtctHtsRequestDTO.getEnrolledOnArt());
            pmtctEnrollment1.setTypeOfHivTest(pmtctHtsRequestDTO.getTypeOfHivTest());
            pmtctEnrollment1.setHivEarlyDetect(pmtctHtsRequestDTO.getHivEarlyDetect());
            pmtctEnrollment1.setHivEarlyDetectViralLoad(pmtctHtsRequestDTO.getHivEarlyDetectViralLoad());
            pmtctEnrollment1.setConfirmatoryFromSpokes(pmtctHtsRequestDTO.getConfirmatoryFromSpokes());
            pmtctEnrollment1.setInitiatedOnProphylaxis(pmtctHtsRequestDTO.getInitiatedOnProphylaxis());
            pmtctEnrollment1.setTbReferred(pmtctHtsRequestDTO.getTbReferred());
            pmtctEnrollment1.setSyphilisInfo(pmtctHtsRequestDTO.getSyphilisInfo());
            pmtctEnrollment1.setHbvInfo(pmtctHtsRequestDTO.getHbvInfo());
            pmtctEnrollment1.setPartnerInfo(pmtctHtsRequestDTO.getPartnerInfo());
            pmtctEnrollment1.setTbScreeningStatus(pmtctHtsRequestDTO.getTbScreeningStatus());
            pmtctEnrollment1.setPmtctTestEntryPoint(pmtctHtsRequestDTO.getPmtctTestEntryPoint());
            pmtctEnrollment1.setViralLoadMonitoring(pmtctHtsRequestDTO.getViralLoadMonitoring());
//            pmtctEnrollment1.setTestingType(pmtctHtsRequestDTO.getTestingType());




            pmtctEnrollment1.setLastModifiedBy(user.getUserName());
            pmtctEnrollment1.setLastModifiedDate(java.time.LocalDateTime.now());

            this.pmtctHtsRepository.save(pmtctEnrollment1);

            // Update pregnancy cycle status to ACTIVE
            if (pmtctHtsRequestDTO.getPmtctCycleUuid() != null) {
                pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleUuid());
            }


        }
        return pmtctHtsRequestDTO;
    }



    public void deletePmtctHtsRecord(String id) throws Exception {
        try {
            // Numeric ID → hts_encounter table (post-migration records)
            Long htsId = Long.parseLong(id);
            HtsEncounterProxy proxy = this.htsEncounterProxyRepository.findByIdAndArchived(htsId, false)
                    .orElseThrow(() -> new Exception("RECORD NOT FOUND"));
            proxy.setArchived(true);
            htsEncounterProxyRepository.save(proxy);
        } catch (NumberFormatException e) {
            // UUID ID → legacy pmtct_hts table (pre-migration records)
            PmtctHts legacyRecord = this.pmtctHtsRepository.findById(id)
                    .orElseThrow(() -> new Exception("RECORD NOT FOUND"));
            legacyRecord.setArchived(true);
            pmtctHtsRepository.save(legacyRecord);
        }
    }


    public  PmtctHtsReponseDTO  viewPMTCTHTSEnrollmentById(String id) {
        try {
            // Numeric ID → hts_encounter table (post-migration records). pmtct_hts = true
            // required — enforces the same boundary PMTCT's own listing/history queries
            // already apply, so this single-record fetch can't be used to open a record
            // PMTCT never authored.
            Long htsId = Long.parseLong(id);
            HtsEncounterProxy proxy = htsEncounterProxyRepository.findByIdAndPmtctHtsAndArchived(htsId, true, false)
                    .orElseThrow(() -> new EntityNotFoundException(HtsEncounterProxy.class, "Id", id));
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(
                    proxy.getPatientUuid().toString(), facilityId, 0);
            return convertProxyToResponseDto(proxy, personOpt.orElse(null));
        } catch (NumberFormatException e) {
            // UUID ID → legacy pmtct_hts table (pre-migration records)
            PmtctHts legacyRecord = this.pmtctHtsRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException(PmtctHts.class, "Id", id));
            return convertEntitytoRespondDto(legacyRecord);
        }
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String patientUuid) {
        Optional<HtsEncounterProxy> proxyOpt = htsEncounterProxyRepository.findLatestByPatientUuid(patientUuid);
        if (!proxyOpt.isPresent()) {
            return null;
        }
        return convertProxyToResponseDtoWithPersonLookup(proxyOpt.get());
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String patientUuid, String pmtctCycleUuid) {
        Optional<HtsEncounterProxy> proxyOpt = htsEncounterProxyRepository.findLatestByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);
        if (!proxyOpt.isPresent()) {
            return null;
        }
        return convertProxyToResponseDtoWithPersonLookup(proxyOpt.get());
    }

    public  String  getLatestConfirmatoryResult(String patientUuid) {
        return htsEncounterProxyRepository.findLatestFinalResult(patientUuid).orElse("");
    }

    public  String  getLatestConfirmatoryResult(String patientUuid, String pmtctCycleUuid) {
        return htsEncounterProxyRepository.findLatestFinalResultByCycle(patientUuid, pmtctCycleUuid).orElse("");
    }



    public PatientHivSummaryDto getPatientHivSummary(String patientUuid, String pmtctCycleUuid) {
        // 1. Get latest PMTCT HTS record for this cycle
        String hivStatus = null;
        boolean hasHtsRecord = false;
        String syphilisResult = "";
        String hepatitisBResult = "";
        String hepatitisCResult = "";
        boolean acuteHivInfectionDetected = false;
        boolean suspectedAcuteInfection = false;
        // "via HTS" must always reflect the actual matched record's own pmtct_hts column —
        // that column is the sole source of truth for which module a record was entered
        // through — never inferred from the record's content or which lookup found it.
        boolean sourcedFromHtsModule = false;

        Optional<HtsEncounterProxy> proxyOpt = htsEncounterProxyRepository
                .findLatestByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);

        if (proxyOpt.isPresent()) {
            hasHtsRecord = true;
            HtsEncounterProxy proxy = proxyOpt.get();
            sourcedFromHtsModule = proxy.getPmtctHts() == null || !proxy.getPmtctHts();
            JsonNode obs = proxy.getObservation();

            if (obs != null) {
                // HIV status: prefer finalHivTestResult, fallback to confirmatoryHivTest
                String finalResult = textOrNull(obs, "finalHivTestResult");
                if (finalResult == null || finalResult.isEmpty()) {
                    finalResult = normalizeConfirmatoryResult(textOrNull(obs, "confirmatoryHivTest"));
                }
                hivStatus = finalResult;

                // LV3-1732: acuteHivInfectionDetected=true is a confirmed Acute HIV Infection
                // (finalHivTestResult is already "Positive" above, this just distinguishes it
                // from an ordinary confirmatory-test Positive for dashboard display).
                // suspectedAcuteInfection is the still-unresolved state — reactive Early Detect
                // with no acute-infection resolution (positive or negative) recorded yet.
                boolean rawSuspectedAcute = "YES_NO_YES".equals(textOrNull(obs, "suspectedAcuteInfection"));
                // Spec ("HTS & PMTCT HTS Workflow"): finalHivTestResult stays Null only while
                // genuinely unresolved-suspected; once a VL result resolves it (either
                // direction), finalHivTestResult holds a real value. Reading the raw field here
                // (not the confirmatoryHivTest-fallback-enriched hivStatus above) so a record
                // resolved to Negative isn't mistaken for still-open — suspectedAcuteInfection is
                // a snapshot of the moment the Early Detect result was documented and is never
                // reset back to YES_NO_NO on its own once finalHivTestResult is written; the
                // presence of a real finalHivTestResult is what actually means "resolved", not
                // this flag by itself. Previously this record could show "Suspected Acute HIV
                // Infection" on the dashboard even after having already resolved to Negative.
                boolean rawFinalResultIsBlank = textOrNull(obs, "finalHivTestResult") == null
                        || textOrNull(obs, "finalHivTestResult").isEmpty();
                boolean stillUnresolvedSuspectedAcute = rawSuspectedAcute && rawFinalResultIsBlank;
                acuteHivInfectionDetected = "true".equalsIgnoreCase(textOrNull(obs, "acuteHivInfectionDetected"))
                        // Fallback for records saved via HTS-Module's own POST/PUT
                        // /api/v1/hts-encounter (raised with their team as a gap, not yet
                        // fixed): that endpoint's request DTO has no field for
                        // acuteHivInfectionDetected at all, and silently drops unknown JSON
                        // properties, so the explicit flag can never be persisted through that
                        // path. A record that was ever flagged suspected-acute and has since
                        // resolved to a confirmed Positive result is, by definition, a confirmed
                        // Acute HIV Infection — detect that combination directly instead of
                        // depending on a flag this write path structurally cannot carry.
                        || (rawSuspectedAcute && "Positive".equalsIgnoreCase(hivStatus));
                suspectedAcuteInfection = stillUnresolvedSuspectedAcute && !acuteHivInfectionDetected;

                // Syphilis
                JsonNode syphNode = obs.get("syphilisInfo");
                if (syphNode != null && !syphNode.isNull()) {
                    syphilisResult = textOrNull(syphNode, "testResult");
                }

                // Hepatitis B
                JsonNode hbvNode = obs.get("hbvInfo");
                if (hbvNode != null && !hbvNode.isNull()) {
                    hepatitisBResult = textOrNull(hbvNode, "testResult");
                }

                // Hepatitis C
                hepatitisCResult = textOrNull(obs, "hepatitisC");
            }
        }

        // Fallback: a result documented directly via the standalone HTS module (not through
        // PMTCT) carries no pmtctCycleUuid, so it can never match the cycle-specific lookup
        // above — the dashboard would show no status even though the patient has a confirmed
        // result. HIV status doesn't reset per pregnancy cycle, so surface it here regardless.
        // Gate on hasHtsRecord, NOT on hivStatus's value — this must only fill in a status when
        // THIS cycle has no record of its own. Gating on "hivStatus != Positive" (the old bug)
        // let it fire even when this cycle already has a genuine PMTCT-documented Negative/blank
        // result, silently overwriting it with an unrelated, often-later, record from a
        // different cycle/module and wrongly tagging a PMTCT-documented result as "via HTS".
        if (!hasHtsRecord) {
            Optional<HtsEncounterProxy> latestAnyModule = htsEncounterProxyRepository.findLatestRecordAnyModule(patientUuid);
            if (latestAnyModule.isPresent()) {
                HtsEncounterProxy proxy = latestAnyModule.get();
                JsonNode obs = proxy.getObservation();
                String rawResult = obs != null
                        ? (textOrNull(obs, "finalHivTestResult") != null && !textOrNull(obs, "finalHivTestResult").isEmpty()
                            ? textOrNull(obs, "finalHivTestResult")
                            : textOrNull(obs, "confirmatoryHivTest"))
                        : null;
                String patientWideResult = normalizeConfirmatoryResult(rawResult);
                if ("Positive".equalsIgnoreCase(patientWideResult)) {
                    hivStatus = "Positive";
                    hasHtsRecord = true;
                    sourcedFromHtsModule = proxy.getPmtctHts() == null || !proxy.getPmtctHts();
                }
            }
        }

        // LV3-1732: a confirmed Acute HIV Infection must be reflected here even when the current
        // cycle's own record (found above) isn't the one checkAndApplyAcuteInfectionStatus
        // actually resolved — its resolution target is deliberately patient-wide (see
        // findUnflaggedSuspectedAcuteInfectionRecords' comment), so it can land on a different
        // hts_encounter row than this cycle's own pmtct_hts = true record. Runs unconditionally
        // (not gated on hasHtsRecord/!acuteHivInfectionDetected) and takes priority over whatever
        // the record-scoped checks above found — spec: "treat the client as HIV-positive from
        // that point forward" once confirmed, not just within the record/cycle it landed on.
        if (!acuteHivInfectionDetected) {
            Optional<HtsEncounterProxy> confirmedAcute = htsEncounterProxyRepository
                    .findConfirmedAcuteHivInfection(patientUuid);
            if (confirmedAcute.isPresent()) {
                HtsEncounterProxy proxy = confirmedAcute.get();
                acuteHivInfectionDetected = true;
                suspectedAcuteInfection = false;
                hivStatus = "Positive";
                hasHtsRecord = true;
                sourcedFromHtsModule = proxy.getPmtctHts() == null || !proxy.getPmtctHts();
            }
        }

        // 2. Get retest status for this cycle
        HivRetestStatusResponse retestStatus = getHivRetestStatus(patientUuid, pmtctCycleUuid);
        boolean seroconverted = Boolean.TRUE.equals(retestStatus.getSeroconverted());
        boolean remainedNegative = Boolean.TRUE.equals(retestStatus.getRemainedHivNegative());

        // hivStatus stays as the raw HTS result — frontend uses seroconverted/remainedHivNegative separately

        return PatientHivSummaryDto.builder()
                .hivStatus(hivStatus)
                .hasHtsRecord(hasHtsRecord)
                .acuteHivInfectionDetected(acuteHivInfectionDetected)
                .suspectedAcuteInfection(suspectedAcuteInfection)
                .seroconverted(seroconverted)
                .remainedHivNegative(remainedNegative)
                .syphilisResult(syphilisResult != null ? syphilisResult : "")
                .hepatitisBResult(hepatitisBResult != null ? hepatitisBResult : "")
                .hepatitisCResult(hepatitisCResult != null ? hepatitisCResult : "")
                .sourcedFromHtsModule(sourcedFromHtsModule)
                .build();
    }

    public boolean isClientCodeTaken(String code) {
        return htsEncounterProxyRepository.isClientCodeTaken(code);
    }

    public boolean confirmIfDateExist(String patientUuid, LocalDate dateOfHivTest) {
        return htsEncounterProxyRepository.existsByPatientUuidAndDateOfVisit(patientUuid, dateOfHivTest);
    }

    public boolean existsInitialHtsForCycle(String patientUuid, String pmtctCycleUuid) {
        if (patientUuid == null || pmtctCycleUuid == null) return false;
        return htsEncounterProxyRepository.existsInitialHtsForCycle(patientUuid, pmtctCycleUuid);
    }
//

    public HivRetestStatusResponse getHivRetestStatus(String patientUuid) {

        List<Object[]> results = htsEncounterProxyRepository.findLatestRetestingResult(patientUuid);

        if (results.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("No Test Result")
                    .testResult(null)
                    .testDate(null)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("No HIV test record found for this patient")
                    .build();
        }

        Object[] result = results.get(0);
        String testResult = null;
        String testDate = null;

        // Safely access array elements
        if (result != null && result.length > 0) {
            testResult = result[0] != null ? result[0].toString().toLowerCase() : null;
        }
        if (result != null && result.length > 1) {
            testDate = result[1] != null ? result[1].toString() : null;
        }

        return determineStatus(testResult, testDate);
    }

    public HivRetestStatusResponse getHivRetestStatus(String patientUuid, String pmtctCycleUuid) {

        List<Object[]> results = htsEncounterProxyRepository.findLatestRetestingResultByCycle(patientUuid, pmtctCycleUuid);

        if (results.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("No Test Result")
                    .testResult(null)
                    .testDate(null)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("No HIV test record found for this patient")
                    .build();
        }

        Object[] result = results.get(0);
        String testResult = null;
        String testDate = null;

        // Safely access array elements
        if (result != null && result.length > 0) {
            testResult = result[0] != null ? result[0].toString().toLowerCase() : null;
        }
        if (result != null && result.length > 1) {
            testDate = result[1] != null ? result[1].toString() : null;
        }

        return determineStatus(testResult, testDate);
    }    private HivRetestStatusResponse determineStatus(String testResult, String testDate) {
        if (testResult == null || testResult.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("Unknown")
                    .testResult(null)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("Test result is not available")
                    .build();
        }

        boolean isPositive = testResult.equalsIgnoreCase("reactive") ||
                testResult.equalsIgnoreCase("positive");
        boolean isNegative = testResult.equalsIgnoreCase("non-reactive") ||
                testResult.equalsIgnoreCase("negative");

        if (isPositive) {
            return HivRetestStatusResponse.builder()
                    .status("Seroconverted to HIV Positive")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(true)
                    .remainedHivNegative(false)
                    .message("Patient has seroconverted to HIV positive")
                    .build();
        } else if (isNegative) {
            return HivRetestStatusResponse.builder()
                    .status("Remained HIV Negative")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(true)
                    .message("Patient remained HIV negative")
                    .build();
        } else {
            return HivRetestStatusResponse.builder()
                    .status("Indeterminate")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("Test result is indeterminate")
                    .build();
        }
    }

    public PersonMetaDataDto getActiveOnPmtctHts(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();
        }

        Page<PatientPerson> persons = null;
        if ((searchValue == null) || (searchValue.equals("*"))) {
            persons = pmtctHtsRepository.getActiveOnPmtctHts(currentOrganisationUnitId, paging);
        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = pmtctHtsRepository.getActiveOnPmtctHtsBySearchParameters(queryParam, currentOrganisationUnitId, paging);
        }

        List<PatientPerson> personList = persons.getContent();
        ArrayList<PmtctHtsReponseDTO> htsResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            PmtctHtsReponseDTO htsResponseDto = getPmtctHtsRespondDtoFromPerson(person);
            htsResponseDtos.add(htsResponseDto);
        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords((int) persons.getTotalElements());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(htsResponseDtos);
        return personMetaDataDto;
    }

    private PmtctHtsReponseDTO getPmtctHtsRespondDtoFromPerson(PatientPerson person) {
        System.out.println(person);
        PmtctHtsReponseDTO htsResponseDto = new PmtctHtsReponseDTO();

        // Set basic person information
        htsResponseDto.setPatientUuid(person.getPatientUuid());
        htsResponseDto.setPersonId(person.getPersonId());
        htsResponseDto.setHospitalNumber(person.getHospitalNumber());
        htsResponseDto.setFirstName(person.getFirstName());
        htsResponseDto.setSurname(person.getSurname());
        htsResponseDto.setOtherName(person.getOtherName());
        htsResponseDto.setAge(calculateAge(person.getDateOfBirth()));
        htsResponseDto.setSex(person.getSex());
        htsResponseDto.setDateOfBirth(person.getDateOfBirth());
        htsResponseDto.setPregnancyCount(person.getPregnancyCount());
        htsResponseDto.setFullName(person.getFullName());
        htsResponseDto.setAddress(person.getAddress());
        htsResponseDto.setContactPoint(person.getContactPoint());

        // Get latest pregnancy cycle ID and use it to fetch HTS and enrollment data
        Optional<PmtctPregnancyCycle> latestCycle = pmtctPregnancyCycleRepository.findLatestByPatientUuid(person.getPatientUuid());

        if (latestCycle.isPresent()) {
            String cycleUuid = latestCycle.get().getUuid();
            htsResponseDto.setPmtctCycleUuid(cycleUuid);

            // Get ANC record for the patient to populate ancNo
            Optional<ANC> ancOpt = ancRepository.findANCByPatientUuid(person.getPatientUuid());
            if (ancOpt.isPresent()) {
                htsResponseDto.setAncNo(ancOpt.get().getAncNo());
            }

            // Get HTS record for the latest cycle from hts_encounter — same patient+cycle scoped,
            // visit-date-ordered selection getPatientHivSummary uses (findByCycleUuidAndArchived
            // was cycle-only, id-DESC/insertion-order, so on a cycle with more than one
            // hts_encounter row it could pick a different, stale row than the Patient Dashboard —
            // e.g. showing a leftover "Negative" here while the dashboard correctly still shows
            // Suspected Acute HIV Infection for the true current record).
            Optional<HtsEncounterProxy> proxyOptional = htsEncounterProxyRepository
                    .findLatestByPatientUuidAndCycleUuid(person.getPatientUuid(), cycleUuid);

            if (proxyOptional.isPresent()) {
                HtsEncounterProxy proxy = proxyOptional.get();
                htsResponseDto.setId(proxy.getId());
                htsResponseDto.setClientCode(proxy.getClientCode());
                htsResponseDto.setUuid(proxy.getUuid() != null ? proxy.getUuid().toString() : null);
                htsResponseDto.setDateOfHivTest(proxy.getDateOfVisit());
                htsResponseDto.setSource(proxy.getSource());
                JsonNode obs = proxy.getObservation();
                if (obs != null) {
                    htsResponseDto.setTestEntryPoint(textOrNull(obs, "testEntryPoint"));
                    htsResponseDto.setTestSetting(textOrNull(obs, "testSetting"));
                    htsResponseDto.setStageOfPregnancy(textOrNull(obs, "stageOfPregnancy"));
                    htsResponseDto.setTestingType(textOrNull(obs, "testingType"));
                    // LV3-1732 — same acuteHivInfectionDetected/suspectedAcuteInfection-aware
                    // label getPatientHivSummary computes for the Patient Dashboard badge, so
                    // this grid column always matches it instead of raw-passing-through
                    // finalHivTestResult (which is correctly null while still suspected-acute,
                    // per spec — a raw passthrough would show "N/A" there today, but reusing the
                    // same derivation keeps both displays identical if that logic ever changes).
                    String rawFinalResult = textOrNull(obs, "finalHivTestResult");
                    String normalizedFinalResult = (rawFinalResult == null || rawFinalResult.isEmpty())
                            ? normalizeConfirmatoryResult(textOrNull(obs, "confirmatoryHivTest"))
                            : rawFinalResult;
                    boolean rawSuspectedAcute = "YES_NO_YES".equals(textOrNull(obs, "suspectedAcuteInfection"));
                    // Same staleness fix as getPatientHivSummary — a definitive finalHivTestResult
                    // (Positive/Negative) always means resolved, regardless of whether the
                    // suspectedAcuteInfection flag itself was ever reset back to YES_NO_NO.
                    boolean stillUnresolvedSuspectedAcute = rawSuspectedAcute
                            && (rawFinalResult == null || rawFinalResult.isEmpty());
                    boolean acuteHivInfectionDetected = "true".equalsIgnoreCase(textOrNull(obs, "acuteHivInfectionDetected"))
                            || (rawSuspectedAcute && "Positive".equalsIgnoreCase(normalizedFinalResult));
                    boolean suspectedAcuteInfection = stillUnresolvedSuspectedAcute && !acuteHivInfectionDetected;
                    String displayResult = acuteHivInfectionDetected ? "Acute HIV Infection"
                            : suspectedAcuteInfection ? "Suspected Acute HIV Infection"
                            : normalizedFinalResult;
                    htsResponseDto.setFinalResult(displayResult);
                    htsResponseDto.setHepatitisC(textOrNull(obs, "hepatitisC"));
                    htsResponseDto.setPregnancyStatusAtEntry(textOrNull(obs, "pregnancyStatusAtEntry"));
                    htsResponseDto.setPreviouslyKnownHivPositive(textOrNull(obs, "previouslyKnownHivPositive"));
                    htsResponseDto.setEnrolledOnArt(textOrNull(obs, "enrolledOnArt"));
                    htsResponseDto.setTypeOfHivTest(textOrNullWithFallback(obs, "typeOfHivTestDone", "typeOfHivTest"));
                    htsResponseDto.setHivEarlyDetect(textOrNullWithFallback(obs, "hivEarlyDetectResult", "hivEarlyDetect"));
                    htsResponseDto.setHivEarlyDetectViralLoad(textOrNull(obs, "hivEarlyDetectViralLoad"));
                    htsResponseDto.setConfirmatoryFromSpokes(textOrNull(obs, "confirmatoryFromSpokes"));
                    htsResponseDto.setInitiatedOnProphylaxis(textOrNull(obs, "initiatedOnProphylaxis"));
                    htsResponseDto.setTbReferred(textOrNull(obs, "tbReferred"));
                    htsResponseDto.setTbScreeningStatus(textOrNull(obs, "tbScreeningStatus"));
                    htsResponseDto.setPmtctTestEntryPoint(textOrNull(obs, "pmtctTestEntryPoint"));
                    htsResponseDto.setViralLoadMonitoring(textOrNull(obs, "viralLoadMonitoring"));

                    // initialHivTest: flat string; backward compat for old JSON object
                    JsonNode initialNode = obs.get("initialHivTest");
                    if (initialNode != null && !initialNode.isNull()) {
                        HivTestDto initial = new HivTestDto();
                        if (initialNode.isTextual()) {
                            initial.setResult(initialNode.asText());
                        } else if (initialNode.isObject()) {
                            initial.setResult(textOrNull(initialNode, "result"));
                        }
                        htsResponseDto.setInitialHivTest(initial);
                    }
                    // confirmatoryHivTest
                    String confirmatoryResult = textOrNull(obs, "confirmatoryHivTest");
                    if (confirmatoryResult != null && !confirmatoryResult.isEmpty()) {
                        HivTestDto confirmatory = new HivTestDto();
                        confirmatory.setResult(confirmatoryResult);
                        htsResponseDto.setConfirmatoryHivTest(confirmatory);
                    }
                    // Nested objects — syphilis and hepatitisB live inside these
                    try {
                        JsonNode syphilisNode = obs.get("syphilisInfo");
                        if (syphilisNode != null && !syphilisNode.isNull()) {
                            SyphilisDetailsDto syphDto = objectMapper.treeToValue(syphilisNode, SyphilisDetailsDto.class);
                            htsResponseDto.setSyphilisInfo(syphDto);
                            htsResponseDto.setSyphilis(syphDto.getTestResult());
                        }
                    } catch (Exception ignored) {}
                    // Backward compat: old records may only have flat "syphilis" key
                    if (htsResponseDto.getSyphilis() == null) {
                        htsResponseDto.setSyphilis(textOrNull(obs, "syphilis"));
                    }

                    try {
                        JsonNode hbvNode = obs.get("hbvInfo");
                        if (hbvNode != null && !hbvNode.isNull()) {
                            HbvInfoDto hbvDto = objectMapper.treeToValue(hbvNode, HbvInfoDto.class);
                            htsResponseDto.setHbvInfo(hbvDto);
                            htsResponseDto.setHepatitisB(hbvDto.getTestResult());
                        }
                    } catch (Exception ignored) {}
                    // Backward compat: old records may only have flat "hepatitisB" key
                    if (htsResponseDto.getHepatitisB() == null) {
                        htsResponseDto.setHepatitisB(textOrNull(obs, "hepatitisB"));
                    }

                    try {
                        JsonNode partnerNode = obs.get("partnerInfo");
                        if (partnerNode != null && !partnerNode.isNull()) {
                            htsResponseDto.setPartnerInfo(objectMapper.treeToValue(partnerNode, PartnerInfoDto.class));
                        }
                    } catch (Exception ignored) {}
                }
            }

            // Use cycle UUID to get enrollment data for the latest pregnancy cycle
            Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(cycleUuid,false);

            if (enrollment.isPresent()) {
                PMTCTEnrollment enrollmentData = enrollment.get();
                htsResponseDto.setPmtctRegStatus(true);
                htsResponseDto.setArtStartDate(enrollmentData.getArtStartDate());
                htsResponseDto.setEntryPoint(enrollmentData.getEntryPoint());
                htsResponseDto.setTbStatus(enrollmentData.getTbStatus());
                htsResponseDto.setPmtctEnrollmentDate(enrollmentData.getPmtctEnrollmentDate());
                // Set hivStatus from enrollment - this takes priority over finalResult
                if (enrollmentData.getHivStatus() != null) {
                    htsResponseDto.setHivStatus(enrollmentData.getHivStatus());
                } else if (htsResponseDto.getFinalResult() != null) {
                    // Fallback to finalResult from HTS if enrollment hivStatus is null
                    htsResponseDto.setHivStatus(htsResponseDto.getFinalResult());
                }
            } else {
                // No enrollment found for the latest cycle
                htsResponseDto.setPmtctRegStatus(false);
                // If we have HTS data but no enrollment, use finalResult for hivStatus
                if (htsResponseDto.getFinalResult() != null) {
                    htsResponseDto.setHivStatus(htsResponseDto.getFinalResult());
                }
            }
        } else {
            // No pregnancy cycle found
            htsResponseDto.setPmtctRegStatus(false);
        }

        return htsResponseDto;
    }

    private Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return 0;
        }
        LocalDate currentDate = LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();
        if (currentDate.getMonthValue() < dateOfBirth.getMonthValue() ||
                (currentDate.getMonthValue() == dateOfBirth.getMonthValue() && currentDate.getDayOfMonth() < dateOfBirth.getDayOfMonth())) {
            age--;
        }
        return age;
    }
}


