package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PmtctHtsRepository extends CommonJpaRepository<PmtctHts, Long> {

    Optional<PmtctHts> findRecordByPersonUuid(String personUuid);


    List<PmtctHts> findByPersonUuid(String personUuid);


    @Query(value = "SELECT * FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY ID DESC", nativeQuery = true)
    List<PmtctHts> findByPersonUuidAndUnarchived(String personUuid);

    @Query(value = "SELECT * FROM pmtct_hts where person_uuid=?1 AND pmtct_cycle_id=?2 AND archived = 0 ORDER BY ID DESC", nativeQuery = true)
    List<PmtctHts> findByPersonUuidAndPmtctCycleIdAndUnarchived(String personUuid, Long pmtctCycleId);



    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY date_of_hiv_test DESC, id DESC  LIMIT 1 ", nativeQuery = true)
    Optional<String> findLatestFinalResult(String personUuid);

    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') FROM pmtct_hts where person_uuid=?1 AND pmtct_cycle_id=?2 AND archived = 0 ORDER BY date_of_hiv_test DESC, id DESC  LIMIT 1 ", nativeQuery = true)
    Optional<String> findLatestFinalResultByPersonUuidAndCycleId(String personUuid, Long pmtctCycleId);

    @Query(value = "SELECT * FROM pmtct_hts WHERE person_uuid=?1 AND archived = 0 ORDER BY date_of_hiv_test DESC LIMIT 1 ", nativeQuery = true)
    PmtctHts findLatestPMTCTHTSEnrollmentById(String personUuid);

    @Query(value = "SELECT * FROM pmtct_hts WHERE person_uuid=?1 AND pmtct_cycle_id=?2 AND archived = 0 ORDER BY date_of_hiv_test DESC LIMIT 1 ", nativeQuery = true)
    PmtctHts findLatestPMTCTHTSEnrollmentByIdAndCycleId(String personUuid, Long pmtctCycleId);

    @Query(value = "SELECT * FROM pmtct_hts WHERE pmtct_cycle_id = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<PmtctHts> findByPmtctCycleIdAndArchived(Long pmtctCycleId, Long archived);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM pmtct_hts WHERE person_uuid=?1 AND date_of_hiv_test =?2 AND archived = 0 ORDER BY id DESC LIMIT 1)\n", nativeQuery = true)
    boolean findIfDateExist(String personUuid, LocalDate dateOfHivTest);


    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') as result, date_of_hiv_test FROM pmtct_hts WHERE person_uuid =?1 AND archived = 0 AND testing_type = 'RETESTING' ORDER BY id DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findLatestHivTestResultList(String personUuid);

    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') as result, date_of_hiv_test FROM pmtct_hts WHERE person_uuid =?1 AND pmtct_cycle_id =?2 AND archived = 0 AND testing_type = 'RETESTING' ORDER BY id DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findLatestHivTestResultListByPersonUuidAndCycleId(String personUuid, Long pmtctCycleId);


    @Query(
            value =
                    "SELECT DISTINCT ON (pp.uuid) " +
                            "  pp.date_of_birth AS dateOfBirth, " +
                            "  pp.id AS id, " +
                            "  pp.uuid AS personUuid, " +
                            "  ph.uuid AS uuid, " +
                            "  ph.id AS personId, " +
                            "  pp.sex, " +
                            "  hac.visit_date AS artStartDate, " +
                            "  pp.first_name AS firstName, " +
                            "  pp.surname, " +
                            "  pp.other_name AS otherName, " +
                            "  pp.full_name AS fullName, " +
                            "  pp.hospital_number AS hospitalNumber, " +
                            "  CAST(pp.address AS TEXT) AS address, " +
                            "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                            "  COALESCE( ( " +
                            "     SELECT COUNT(*) FROM pmtct_pregnancy_cycle ppc " +
                            "     WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?1 " +
                            "  ), 0) AS pregnancyCount " +
                            "FROM patient_person pp " +
                            "INNER JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid, pmtct_cycle_id) * " +
                            "  FROM pmtct_hts " +
                            "  WHERE archived = ?1 " +
                            "  ORDER BY person_uuid, pmtct_cycle_id, id DESC " +
                            ") ph ON pp.uuid = ph.person_uuid " +
                            "  AND ph.pmtct_cycle_id = ( " +
                            "    SELECT ppc.id FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?1 " +
                            "    ORDER BY ppc.id DESC LIMIT 1 " +
                            "  ) " +
                            "LEFT JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid) person_uuid, visit_date " +
                            "  FROM hiv_art_clinical " +
                            "  WHERE is_commencement = true " +
                            "  ORDER BY person_uuid, visit_date ASC " +
                            ") hac ON pp.uuid = hac.person_uuid " +
                            "WHERE pp.archived = ?1 " +
                            "  AND pp.facility_id = ?2 " +
                            "  AND pp.sex ILIKE 'FEMALE' " +
                            "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5) " +
                            "ORDER BY pp.uuid, ph.id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                            "FROM patient_person pp " +
                            "INNER JOIN pmtct_hts ph ON pp.uuid = ph.person_uuid AND ph.archived = ?1 " +
                            "  AND ph.pmtct_cycle_id = ( " +
                            "    SELECT ppc.id FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?1 " +
                            "    ORDER BY ppc.id DESC LIMIT 1 " +
                            "  ) " +
                            "WHERE pp.archived = ?1 " +
                            "  AND pp.facility_id = ?2 " +
                            "  AND pp.sex ILIKE 'FEMALE' " +
                            "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5)",
            nativeQuery = true
    )
    Page<PatientPerson> getActiveOnPmtctHts(Integer archived, Long facilityId, Pageable pageable);


    @Query(
            value =
                    "SELECT DISTINCT ON (pp.uuid) " +
                            "  pp.date_of_birth AS dateOfBirth, " +
                            "  pp.id AS id, " +
                            "  pp.uuid AS personUuid, " +
                            "  ph.uuid AS uuid, " +
                            "  ph.id AS personId, " +
                            "  pp.sex, " +
                            "  hac.visit_date AS artStartDate, " +
                            "  pp.first_name AS firstName, " +
                            "  pp.surname, " +
                            "  pp.other_name AS otherName, " +
                            "  pp.full_name AS fullName, " +
                            "  pp.hospital_number AS hospitalNumber, " +
                            "  CAST(pp.address AS TEXT) AS address, " +
                            "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                            "  COALESCE( ( " +
                            "     SELECT COUNT(*) FROM pmtct_pregnancy_cycle ppc " +
                            "     WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?2 " +
                            "  ), 0) AS pregnancyCount " +
                            "FROM patient_person pp " +
                            "INNER JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid, pmtct_cycle_id) * " +
                            "  FROM pmtct_hts " +
                            "  WHERE archived = ?2 " +
                            "  ORDER BY person_uuid, pmtct_cycle_id, id DESC " +
                            ") ph ON pp.uuid = ph.person_uuid " +
                            "  AND ph.pmtct_cycle_id = ( " +
                            "    SELECT ppc.id FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?2 " +
                            "    ORDER BY ppc.id DESC LIMIT 1 " +
                            "  ) " +
                            "LEFT JOIN ( " +
                            "  SELECT DISTINCT ON (person_uuid) person_uuid, visit_date " +
                            "  FROM hiv_art_clinical " +
                            "  WHERE is_commencement = true " +
                            "  ORDER BY person_uuid, visit_date ASC " +
                            ") hac ON pp.uuid = hac.person_uuid " +
                            "WHERE (" +
                            "   pp.first_name ILIKE ?1 OR " +
                            "   pp.surname ILIKE ?1 OR " +
                            "   pp.other_name ILIKE ?1 OR " +
                            "   pp.full_name ILIKE ?1 OR " +
                            "   pp.hospital_number ILIKE ?1 " +
                            ") " +
                            "AND pp.archived = ?2 " +
                            "AND pp.facility_id = ?3 " +
                            "AND pp.sex ILIKE 'FEMALE' " +
                            "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5) " +
                            "ORDER BY pp.uuid, ph.id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                            "FROM patient_person pp " +
                            "INNER JOIN pmtct_hts ph ON pp.uuid = ph.person_uuid AND ph.archived = ?2 " +
                            "  AND ph.pmtct_cycle_id = ( " +
                            "    SELECT ppc.id FROM pmtct_pregnancy_cycle ppc " +
                            "    WHERE ppc.person_uuid = pp.uuid AND ppc.archived = ?2 " +
                            "    ORDER BY ppc.id DESC LIMIT 1 " +
                            "  ) " +
                            "WHERE (" +
                            "   pp.first_name ILIKE ?1 OR " +
                            "   pp.surname ILIKE ?1 OR " +
                            "   pp.other_name ILIKE ?1 OR " +
                            "   pp.full_name ILIKE ?1 OR " +
                            "   pp.hospital_number ILIKE ?1 " +
                            ") " +
                            "AND pp.archived = ?2 " +
                            "AND pp.facility_id = ?3 " +
                            "AND pp.sex ILIKE 'FEMALE' " +
                            "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5)",
            nativeQuery = true
    )
    Page<PatientPerson> getActiveOnPmtctHtsBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

}
