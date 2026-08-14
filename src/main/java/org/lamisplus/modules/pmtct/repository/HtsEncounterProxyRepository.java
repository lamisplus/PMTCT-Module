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

    @Query(nativeQuery = true, value
            = "SELECT COALESCE(NULLIF(observation->>'finalHivTestResult', ''), observation->>'confirmatoryHivTest') "
            + "FROM hts_encounter "
            + "WHERE pmtct_hts = true AND archived = false "
            + "  AND CAST(patient_uuid AS TEXT) = :patientUuid "
            + "ORDER BY date_of_visit DESC, id DESC LIMIT 1")
    Optional<String> findLatestFinalResult(String patientUuid);

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
            + "  AND COALESCE((observation->>'acuteHivInfectionDetected')::boolean, false) = false "
            + "ORDER BY date_of_visit DESC, id DESC")
    List<HtsEncounterProxy> findUnflaggedSuspectedAcuteInfectionRecords(String patientUuid);
}
