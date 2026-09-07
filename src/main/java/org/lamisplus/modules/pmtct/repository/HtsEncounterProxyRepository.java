package org.lamisplus.modules.pmtct.repository;

import org.lamisplus.modules.pmtct.domain.entity.HtsEncounterProxy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HtsEncounterProxyRepository extends JpaRepository<HtsEncounterProxy, Long> {

    Optional<HtsEncounterProxy> findByIdAndArchived(Long id, Boolean archived);

    // Scenario: a patient already has a positive result documented via the standalone HTS
    // module (pmtct_hts = false) before ever touching PMTCT. Per business rule, a patient can
    // only ever have one active positive HTS result system-wide (HTS's own create/update
    // enforces this), so this should normally return at most one row — ORDER BY ... ASC LIMIT 1
    // is a defensive tie-breaker (earliest) for the case where more than one somehow exists.
    // Excludes pmtct_hts = true rows deliberately: if PMTCT already created its own positive
    // record for this patient, that's a different, already-handled path (edit via history),
    // not this "adopt HTS's existing record" scenario.
    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = false AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND ("
            + "    UPPER(COALESCE(observation->>'finalHivTestResult', '')) LIKE '%POSITIVE%' "
            + "    OR UPPER(COALESCE(observation->>'confirmatoryHivTest', '')) LIKE '%POSITIVE%'"
            + "  ) "
            + "ORDER BY date_of_visit ASC, id ASC LIMIT 1")
    Optional<HtsEncounterProxy> findEarliestHtsModulePositiveRecord(String patientUuid);

    // Used by viewPMTCTHTSEnrollmentById so opening a record for view/edit enforces the same
    // pmtct_hts = true boundary PMTCT's own listing/history queries already apply — otherwise
    // this single-record fetch (by numeric id alone) could load a record PMTCT never authored.
    Optional<HtsEncounterProxy> findByIdAndPmtctHtsAndArchived(Long id, Boolean pmtctHts, Boolean archived);

    List<HtsEncounterProxy> findByPatientUuidAndPmtctHtsAndArchivedOrderByDateOfVisitDesc(
            UUID patientUuid, Boolean pmtctHts, Boolean archived);

    Optional<HtsEncounterProxy> findByPatientUuidAndDateOfVisitAndPmtctHtsAndArchived(
            UUID patientUuid, LocalDate dateOfVisit, Boolean pmtctHts, Boolean archived);

    List<HtsEncounterProxy> findByFacilityIdAndPmtctHtsAndArchivedOrderByDateOfVisitDesc(
            Long facilityId, Boolean pmtctHts, Boolean archived);

    // Check uniqueness only against hts_encounter.client_code
    @Query(nativeQuery = true, value
            = "SELECT CASE WHEN EXISTS ("
            + "  SELECT 1 FROM hts_encounter WHERE archived = false AND client_code ILIKE :code "
            + ") THEN true ELSE false END")
    boolean isClientCodeTaken(String code);

    // ══════════════════ Phase 2: Native queries for PMTCT HTS reads ══════════════════
    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<HtsEncounterProxy> findLatestByPatientUuidAndCycleUuid(String patientUuid, String cycleUuid);

    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<HtsEncounterProxy> findLatestByPatientUuid(String patientUuid);

    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "ORDER BY id DESC LIMIT 1")
    Optional<HtsEncounterProxy> findByCycleUuidAndArchived(String cycleUuid);

    @Query(nativeQuery = true, value
            = "SELECT COALESCE(NULLIF(observation->>'finalHivTestResult', ''), observation->>'confirmatoryHivTest') "
            + "FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<String> findLatestFinalResultByCycle(String patientUuid, String cycleUuid);

    // Patient-wide (no cycle, no pmtct_hts filter) — every caller wants "has this patient ever
    // tested positive," regardless of whether the record was authored via the PMTCT HTS form
    // or the standalone HTS module. Previously filtered pmtct_hts = true, which meant a result
    // recorded directly in the HTS module (not through PMTCT) was invisible here — e.g. the
    // Patient Dashboard/HIV summary never reflected a Positive result entered that way.
    @Query(nativeQuery = true, value
            = "SELECT COALESCE(NULLIF(observation->>'finalHivTestResult', ''), observation->>'confirmatoryHivTest') "
            + "FROM hts_encounter "
            + "WHERE archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<String> findLatestFinalResult(String patientUuid);

    // Same as findLatestFinalResult but returns the full record — used when the caller needs
    // to know which module (pmtct_hts flag) authored the result, e.g. to tell the PMTCT user
    // it was documented on the HTS module rather than something they forgot entering here.
    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<HtsEncounterProxy> findLatestRecordAnyModule(String patientUuid);

    // LV3-1732 / Acute HIV Infection spec: "Once an Early Detect Result is now confirmed as
    // Acute HIV Infection, the system should treat the client as HIV-positive from that point
    // forward" — patient-wide, not scoped to the current pregnancy cycle or to pmtct_hts = true.
    // checkAndApplyAcuteInfectionStatus's own resolution target
    // (findUnflaggedSuspectedAcuteInfectionRecords) is deliberately patient-wide with no cycle/
    // pmtct_hts filter, so the record it resolves onto can be a different row than the current
    // cycle's own pmtct_hts = true record that getPatientHivSummary would otherwise display —
    // without this query, the dashboard badge silently misses the resolution and falls back to
    // showing plain "Positive" (or whatever the cycle's own record happens to hold) instead of
    // "Acute HIV Infection".
    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND COALESCE(CAST(observation->>'acuteHivInfectionDetected' AS boolean), false) = true "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<HtsEncounterProxy> findConfirmedAcuteHivInfection(String patientUuid);

    @Query(nativeQuery = true, value
            = "SELECT EXISTS("
            + "  SELECT 1 FROM hts_encounter "
            + "  WHERE pmtct_hts = true AND archived = false "
            + "    AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "    AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "    AND UPPER(COALESCE(observation->>'testingType','')) != 'RETESTING'"
            + ")")
    boolean existsInitialHtsForCycle(String patientUuid, String cycleUuid);

    @Query(nativeQuery = true, value
            = "SELECT EXISTS("
            + "  SELECT 1 FROM hts_encounter "
            + "  WHERE pmtct_hts = true AND archived = false "
            + "    AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "    AND date_of_visit = :dateOfVisit"
            + ")")
    boolean existsByPatientUuidAndDateOfVisit(String patientUuid, LocalDate dateOfVisit);

    @Query(nativeQuery = true, value
            = "SELECT COALESCE(NULLIF(observation->>'finalHivTestResult', ''), observation->>'confirmatoryHivTest') AS result, "
            + "  date_of_visit AS date_of_hiv_test "
            + "FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "  AND UPPER(COALESCE(observation->>'testingType','')) = 'RETESTING' "
            + "ORDER BY id DESC LIMIT 1")
    List<Object[]> findLatestRetestingResultByCycle(String patientUuid, String cycleUuid);

    @Query(nativeQuery = true, value
            = "SELECT COALESCE(NULLIF(observation->>'finalHivTestResult', ''), observation->>'confirmatoryHivTest') AS result, "
            + "  date_of_visit AS date_of_hiv_test "
            + "FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND UPPER(COALESCE(observation->>'testingType','')) = 'RETESTING' "
            + "ORDER BY id DESC LIMIT 1")
    List<Object[]> findLatestRetestingResult(String patientUuid);

    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND observation->>'pmtctCycleUuid' = :cycleUuid "
            + "ORDER BY id DESC")
    List<HtsEncounterProxy> findByPatientUuidAndCycleUuid(String patientUuid, String cycleUuid);

    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "ORDER BY id DESC")
    List<HtsEncounterProxy> findByPatientUuidAndUnarchived(String patientUuid);

    @Query(nativeQuery = true, value
            = "SELECT EXISTS(SELECT 1 FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND ("
            + "    LOWER(COALESCE(observation->'syphilisInfo'->>'testResult', '')) IN ('positive', 'reactive')"
            + "  )"
            + ")")
    boolean hasEverPositiveSyphilis(String patientUuid);

    @Query(nativeQuery = true, value
            = "SELECT EXISTS(SELECT 1 FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND ("
            + "    LOWER(COALESCE(observation->'hbvInfo'->>'testResult', '')) IN ('positive', 'reactive') OR "
            + "    LOWER(COALESCE(observation->>'hepatitisB', '')) IN ('positive', 'reactive') OR "
            + "    LOWER(COALESCE(observation->>'hepatitisC', '')) IN ('positive', 'reactive')"
            + "  )"
            + ")")
    boolean hasEverPositiveHepatitis(String patientUuid);

    // Scans ALL hts_encounter rows for the patient, not just pmtct_hts = true ones — the
    // Acute HIV Infection auto-update (LV3-1732) must catch suspected-acute clients regardless
    // of whether the record was originally entered via the HTS module or the PMTCT HTS form,
    // since they share this one physical table.
    @Query(nativeQuery = true, value
            = "SELECT * FROM hts_encounter "
            + "WHERE archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "  AND observation->>'suspectedAcuteInfection' = 'YES_NO_YES' "
            // CAST(... AS boolean), not the `::boolean` shorthand — Hibernate's native-query
            // parameter parser misreads the `::` cast operator as a second `:name` bind marker,
            // which corrupts parsing of the real :patientUuid parameter and sends it to Postgres
            // unresolved ("syntax error at or near \":\"" at runtime).
            + "  AND COALESCE(CAST(observation->>'acuteHivInfectionDetected' AS boolean), false) = false "
            + "ORDER BY date_of_visit DESC, id DESC")
    List<HtsEncounterProxy> findUnflaggedSuspectedAcuteInfectionRecords(String patientUuid);
}
