package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.hiv.domain.dto.PatientProjection;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.HtsClientProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    //    @Query(
//            value = "SELECT date_of_birth AS dateOfBirth, pp.id AS id, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS personId, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc",
//            nativeQuery = true
//    )
    @Query(
            value = "SELECT p.dateOfBirth AS dateOfBirth, p.id AS id, p.personUuid AS personUuid, p.uuid AS uuid, p.personId AS personId, p.sex AS sex, p.artStartDate AS artStartDate, p.firstName AS firstName, p.surname AS surname, p.otherName AS otherName, p.fullName AS fullName, p.hospitalNumber AS hospitalNumber, CAST(p.address AS TEXT) AS address, CAST(p.contactPoint AS TEXT) AS contactPoint " +
                    "FROM (" +
                    "  SELECT " +
                    "    date_of_birth AS dateOfBirth, " +
                    "    pp.id AS id, " +
                    "    pp.uuid AS personUuid, " +
                    "    pa.uuid AS uuid, " +
                    "    pa.id AS personId, " +
                    "    sex, " +
                    "    hac.visit_date AS artStartDate, " +
                    "    first_name AS firstName, " +
                    "    surname, " +
                    "    other_name AS otherName, " +
                    "    full_name AS fullName, " +
                    "    pp.hospital_number AS hospitalNumber, " +
                    "    CAST(address AS TEXT) AS address, " +
                    "    CAST(contact_point AS TEXT) AS contactPoint " +
                    "  FROM " +
                    "    patient_person pp " +
                    "  INNER JOIN " +
                    "    pmtct_anc pa ON (pp.uuid = pa.person_uuid AND pa.archived = 0) " +
                    "  LEFT JOIN " +
                    " hiv_art_clinical hac ON (pp.uuid = hac.person_uuid AND hac.is_commencement = true) " +
                    "  WHERE " +
                    "    (first_name ILIKE :queryParam OR surname ILIKE :queryParam OR other_name ILIKE :queryParam OR full_name ILIKE :queryParam OR pp.hospital_number ILIKE :queryParam) " +
                    "    AND pp.archived = :archived " +
                    "    AND pp.facility_id = :facilityId " +
                    "    AND pp.sex ILIKE 'FEMALE' " +
                    "    AND (EXTRACT (YEAR FROM NOW()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5 ) " +
                    ") p " +
                    "ORDER BY p.personId DESC",
            nativeQuery = true
    )
    Page<PatientPerson> getActiveOnANCBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

    //    @Query(
//            value = "SELECT date_of_birth AS dateOfBirth, pp.id AS id, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS personId, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_anc pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc",
//            nativeQuery = true
//    )
    @Query(value = "SELECT " +
            "  date_of_birth AS dateOfBirth, " +
            "  pp.id AS id, " +
            "  pp.uuid AS personUuid, " +
            "  pa.uuid AS uuid, " +
            "  pa.id AS personId, " +
            "  sex, " +
            "  hac.visit_date AS artStartDate, " +
            "  first_name AS firstName, " +
            "  surname, " +
            "  other_name AS otherName, " +
            "  full_name AS fullName, " +
            "  pp.hospital_number AS hospitalNumber, " +
            "  CAST(address AS TEXT) AS address, " +
            "  CAST(contact_point AS TEXT) AS contactPoint " +
            "FROM " +
            "  patient_person pp " +
            "INNER JOIN " +
            "  pmtct_anc pa ON (pp.uuid = pa.person_uuid AND pa.archived = :archived) " +
            "  LEFT JOIN " +
            " hiv_art_clinical hac ON (pp.uuid = hac.person_uuid AND hac.is_commencement = true) " +
            "WHERE " +
            "  pp.archived = 0 " +
            "  AND pp.facility_id = :facilityId " +
            "  AND pp.sex ILIKE 'FEMALE' " +
            "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5) " +
            "ORDER BY " +
            "  pa.id DESC", nativeQuery = true)
    Page<PatientPerson> getActiveOnANC(Integer archived, Long facilityId, Pageable pageable);

}