package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.HtsClientProjection;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ANCRepository extends CommonJpaRepository<ANC, Long> {
    ANC findByAncNoAndArchived(String ancNo, Long archived);

    Optional<ANC> getByAncNoAndArchived(String ancNo, Long archived);

    Optional<ANC> getByAncNo(String ancNo);

    List<ANC> findByArchived(Long archived);

    Optional<ANC> findByHospitalNumberAndArchived(String hospitalNumber, Long archived);

    Optional<ANC> findANCByPersonUuidAndArchived(String personUuid, Long archived);

    Optional<ANC> findByHospitalNumber(String hospitalNumber);

    @Query(value = "SELECT count(*) FROM pmtct_anc pa", nativeQuery = true)
    Integer getTotalAnc();

    List<ANC> getANCByAncNo(String ancNo);

    ANC getANCById(Long id);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    /*@Query(value = "SELECT id, client_code AS clientCode, date_visit AS dateVisit, hc.person_uuid AS personUuid, " +
            "uuid, (CASE WHEN hiv_test_result2 IS NULL OR hiv_test_result2='' THEN hiv_test_result " +
            " ELSE hiv_test_result2 END)  AS hivTestResult FROM hts_client hc " +
            " INNER JOIN (SELECT person_uuid, MAX(date_visit) max_date " +
            " FROM hts_client " +
            " WHERE archived=0 " +
            " GROUP BY person_uuid) p ON p.person_uuid=hc.person_uuid " +
            " AND p.max_date=hc.date_visit WHERE hc.person_uuid = ?1 and hc.facility_id =?2 ORDER BY id DESC", nativeQuery = true)
    List<HtsClientProjection> getHtsRecordsByPersonsUuidAAndFacilityId(String puuid, Long facilityId);*/


    @Query(value = "SELECT id, client_code AS clientCode, date_visit AS dateVisit, hc.person_uuid AS personUuid, " +
            "uuid, (CASE WHEN hiv_test_result2 IS NULL OR hiv_test_result2='' THEN hiv_test_result " +
            " ELSE hiv_test_result2 END)  AS hivTestResult FROM hts_client hc " +
            " INNER JOIN (SELECT person_uuid, MAX(date_visit) max_date " +
            " FROM hts_client " +
            " WHERE archived=0 " +
            " GROUP BY person_uuid) p ON p.person_uuid=hc.person_uuid " +
            " AND p.max_date=hc.date_visit WHERE hc.person_uuid = ?1 and hc.facility_id =?2 ORDER BY id DESC", nativeQuery = true)
    Optional<HtsClientProjection> getHtsRecordByPersonsUuidAAndFacilityId(String puuid, Long facilityId);

}