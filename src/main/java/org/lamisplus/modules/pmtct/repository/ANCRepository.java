package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.HtsClientProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ANCRepository extends CommonJpaRepository<ANC, String> {
    @Query(value = "SELECT * FROM pmtct_anc WHERE anc_no = CAST(?1 AS VARCHAR) AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    ANC findByAncNoAndArchived(String ancNo, Boolean archived);

    @Query(value = "SELECT * FROM pmtct_anc WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> findANCByPatientUuid(String PatientUuid);

    @Query(value = "SELECT * FROM pmtct_anc WHERE anc_no = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> getByAncNoAndArchived(String ancNo, Boolean archived);

    @Query(value = "SELECT * FROM pmtct_anc WHERE anc_no = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> getByAncNo(String ancNo);

    List<ANC> findByArchived(Boolean archived);

    @Query(value = "SELECT * FROM pmtct_anc WHERE patient_uuid = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> findANCByPatientUuidAndArchived(String patientUuid, Boolean archived);

    @Query(value = "SELECT * FROM pmtct_anc WHERE patient_uuid = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> findLatestANCByPatientUuidAndArchived(String patientUuid, Boolean archived);

    @Query(value = "SELECT * FROM pmtct_anc WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = ?3 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<ANC> findANCByPatientUuidAndCycleIdAndArchived(String patientUuid, String pmtctCycleUuid, Boolean archived);

    @Query(value = "SELECT count(*) FROM pmtct_anc pa", nativeQuery = true)
    Integer getTotalAnc();

    List<ANC> getANCByAncNo(String ancNo);

    @Query(value = "SELECT COUNT(*) > 0 FROM pmtct_anc WHERE anc_no = ?1 AND archived = false", nativeQuery = true)
    boolean existsByAnc(String ancNo);

    ANC getANCById(Long id);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    @Query(value = "SELECT static_hiv_status FROM pmtct_anc WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<String> findStaticHivStatusByPatientUuid(String patientUuid);

    /*@Query(value = "SELECT id, client_code AS clientCode, date_visit AS dateVisit, hc.patient_uuid AS patientUuid, " +
            "uuid, (CASE WHEN hiv_test_result2 IS NULL OR hiv_test_result2='' THEN hiv_test_result " +
            " ELSE hiv_test_result2 END)  AS hivTestResult FROM hts_client hc " +
            " INNER JOIN (SELECT patient_uuid, MAX(date_visit) max_date " +
            " FROM hts_client " +
            " WHERE archived=0 " +
            " GROUP BY patient_uuid) p ON p.patient_uuid=hc.patient_uuid " +
            " AND p.max_date=hc.date_visit WHERE hc.patient_uuid = ?1 and hc.facility_id =?2 ORDER BY id DESC", nativeQuery = true)
    List<HtsClientProjection> getHtsRecordsByPersonsUuidAAndFacilityId(String puuid, Long facilityId);*/


    @Query(value = "SELECT id, client_code AS clientCode, date_visit AS dateVisit, hc.person_uuid AS patientUuid, " +
            "uuid, (CASE WHEN hiv_test_result2 IS NULL OR hiv_test_result2='' THEN hiv_test_result " +
            " ELSE hiv_test_result2 END)  AS hivTestResult FROM hts_client hc " +
            " INNER JOIN (SELECT person_uuid, MAX(date_visit) max_date " +
            " FROM hts_client " +
            " WHERE archived=0" +
            " GROUP BY person_uuid) p ON p.person_uuid=hc.person_uuid " +
            " AND p.max_date=hc.date_visit WHERE hc.person_uuid = ?1 and hc.facility_id =?2 ORDER BY id DESC", nativeQuery = true)
    Optional<HtsClientProjection> getHtsRecordByPersonsUuidAAndFacilityId(String puuid, Long facilityId);

    //    @Query(
//            value = "SELECT date_of_birth AS dateOfBirth, pp.id AS id, pp.uuid AS patientUuid, pa.uuid AS uuid, pa.id AS personId, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.patient_uuid and pa.archived=0) WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc",
//            nativeQuery = true
//    )
    @Query(
            value =
                    "SELECT * FROM ( " +
                    "SELECT DISTINCT ON (pp.uuid) " +
                            "  pp.date_of_birth AS dateOfBirth, " +
                            "  pp.id AS id, " +
                            "  pp.uuid AS patientUuid, " +
                            "  pa.uuid AS uuid, " +
                            "  pa.uuid AS ancUuid, " +
                            "  pa.id AS personId, " +
                            "  pp.sex, " +
                            "  hac.visit_date AS artStartDate, " +
                            "  pp.first_name AS firstName, " +
                            "  pp.surname, " +
                            "  pp.other_name AS otherName, " +
                            "  pp.full_name AS fullName, " +
                            "  pp.hospital_number AS hospitalNumber, " +
                            "  CAST(pp.address AS TEXT) AS address, " +
                            "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                            "  pa.anc_no AS ancNo, " +
                            "  pa.anc_setting AS ancSetting, " +
                            "  pa.community_setting AS communitySetting, " +
                            "  pa.currently_on_art AS currentlyOnArt, " +
                            "  pa.date_of_enrollment AS dateOfEnrollment, " +
                            "  pa.gaweeks AS gaweeks, " +
                            "  pa.gravida AS gravida, " +
                            "  pa.lmp AS lmp, " +
                            "  pa.parity AS parity, " +
                            "  pa.previously_known_hiv_status AS previouslyKnownHivStatus, " +
                            "  NULL AS referredSyphilisTreatment, " +
                            "  pa.static_hiv_status AS staticHivStatus, " +
                            "  pa.pmtct_cycle_uuid AS pmtctCycleUuid, " +
                            "  COALESCE(( " +
                            "     SELECT COUNT(*) " +
                            "     FROM pmtct_pregnancy_cycle ppc " +
                            "     WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "  ), 0) AS pregnancyCount " +
                            "FROM patient_person pp " +
                            "INNER JOIN ( " +
                            "  SELECT DISTINCT ON (patient_uuid, pmtct_cycle_uuid) * " +
                            "  FROM pmtct_anc " +
                            "  WHERE archived = false " +
                            "  ORDER BY patient_uuid, pmtct_cycle_uuid, id DESC " +
                            ") pa ON pp.uuid = pa.patient_uuid " +
                            "  AND pa.pmtct_cycle_uuid = ( " +
                            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                            "  ) " +
                            "LEFT JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid) person_uuid, visit_date " +
                            "  FROM hiv_art_clinical " +
                            "  WHERE is_commencement = true " +
                            "  ORDER BY person_uuid, visit_date ASC " +
                            ") hac ON pp.uuid = hac.person_uuid " +
                            "WHERE ( " +
                            "   pp.first_name ILIKE ?1 OR " +
                            "   pp.surname ILIKE ?1 OR " +
                            "   pp.other_name ILIKE ?1 OR " +
                            "   pp.full_name ILIKE ?1 OR " +
                            "   pp.hospital_number ILIKE ?1 " +
                            ") " +
                            "AND pp.archived = 0 " +
                            "AND pp.facility_id = ?2 " +
                            "AND pp.sex ILIKE 'FEMALE' " +
                            "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10) " +
                            "ORDER BY pp.uuid, pa.id DESC " +
                    ") AS subquery ORDER BY personId DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                            "FROM patient_person pp " +
                            "INNER JOIN pmtct_anc pa ON pp.uuid = pa.patient_uuid AND pa.archived = false " +
                            "  AND pa.pmtct_cycle_uuid = ( " +
                            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                            "  ) " +
                            "WHERE ( " +
                            "   pp.first_name ILIKE ?1 OR " +
                            "   pp.surname ILIKE ?1 OR " +
                            "   pp.other_name ILIKE ?1 OR " +
                            "   pp.full_name ILIKE ?1 OR " +
                            "   pp.hospital_number ILIKE ?1 " +
                            ") " +
                            "AND pp.archived = 0 " +
                            "AND pp.facility_id = ?2 " +
                            "AND pp.sex ILIKE 'FEMALE' " +
                            "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10)",
            nativeQuery = true
    )
    Page<PatientPerson> getActiveOnANCBySearchParameters(String queryParam, Long facilityId, Pageable pageable);


    //    @Query(
//            value = "SELECT date_of_birth AS dateOfBirth, pp.id AS id, pp.uuid AS patientUuid, pa.uuid AS uuid, pa.id AS personId, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.patient_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc",
//            nativeQuery = true
    @Query(
            value =
                    "SELECT * FROM ( " +
                    "SELECT DISTINCT ON (pp.uuid) " +
                            "  pp.date_of_birth AS dateOfBirth, " +
                            "  pp.id AS id, " +
                            "  pp.uuid AS patientUuid, " +
                            "  pa.uuid AS uuid, " +
                            "  pa.uuid AS ancUuid, " +
                            "  pa.id AS personId, " +
                            "  pp.sex, " +
                            "  hac.visit_date AS artStartDate, " +
                            "  pp.first_name AS firstName, " +
                            "  pp.surname, " +
                            "  pp.other_name AS otherName, " +
                            "  pp.full_name AS fullName, " +
                            "  pp.hospital_number AS hospitalNumber, " +
                            "  CAST(pp.address AS TEXT) AS address, " +
                            "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                            "  pa.anc_no AS ancNo, " +
                            "  pa.anc_setting AS ancSetting, " +
                            "  pa.community_setting AS communitySetting, " +
                            "  pa.currently_on_art AS currentlyOnArt, " +
                            "  pa.date_of_enrollment AS dateOfEnrollment, " +
                            "  pa.gaweeks AS gaweeks, " +
                            "  pa.gravida AS gravida, " +
                            "  pa.lmp AS lmp, " +
                            "  pa.parity AS parity, " +
                            "  pa.previously_known_hiv_status AS previouslyKnownHivStatus, " +
                            "  NULL AS referredSyphilisTreatment, " +
                            "  pa.static_hiv_status AS staticHivStatus, " +
                            "  pa.pmtct_cycle_uuid AS pmtctCycleUuid, " +
                            "  COALESCE( ( " +
                            "     SELECT COUNT(*) FROM pmtct_pregnancy_cycle ppc " +
                            "     WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "  ), 0) AS pregnancyCount " +
                            "FROM patient_person pp " +
                            "INNER JOIN ( " +
                            "  SELECT DISTINCT ON (patient_uuid, pmtct_cycle_uuid) * " +
                            "  FROM pmtct_anc " +
                            "  WHERE archived = false " +
                            "  ORDER BY patient_uuid, pmtct_cycle_uuid, id DESC " +
                            ") pa ON pp.uuid = pa.patient_uuid " +
                            "  AND pa.pmtct_cycle_uuid = ( " +
                            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                            "  ) " +
                            "LEFT JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid) person_uuid, visit_date " +
                            "  FROM hiv_art_clinical " +
                            "  WHERE is_commencement = true " +
                            "  ORDER BY person_uuid, visit_date ASC " +
                            ") hac ON pp.uuid = hac.person_uuid " +
                            "WHERE pp.archived = 0 " +
                            "  AND pp.facility_id = ?1 " +
                            "  AND pp.sex ILIKE 'FEMALE' " +
                            "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10) " +
                            "ORDER BY pp.uuid, pa.id DESC " +
                    ") AS subquery ORDER BY personId DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                            "FROM patient_person pp " +
                            "INNER JOIN pmtct_anc pa ON pp.uuid = pa.patient_uuid AND pa.archived = false " +
                            "  AND pa.pmtct_cycle_uuid = ( " +
                            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                            "  ) " +
                            "WHERE pp.archived = 0 " +
                            "  AND pp.facility_id = ?1 " +
                            "  AND pp.sex ILIKE 'FEMALE' " +
                            "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10)",
            nativeQuery = true
    )
    Page<PatientPerson> getActiveOnANC(Long facilityId, Pageable pageable);




}