package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.HivExposedInfantCandidateDto;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HivExposedInfantRepository extends CommonJpaRepository<Infant, String> {

    // Candidates for the HIV-Exposed Infant grid: 0-24 months old, with a positive HTS
    // record on the HTS module's own hts_encounter table (not PMTCT's ANC-side pmtct_hts) —
    // regardless of gender. Excludes anyone who already has a maternal-linked
    // pmtct_infant_information record (mother_patient_uuid set) - this grid is specifically
    // for infants with NO maternal record on file, so an infant whose mother is already
    // documented (Lost to Follow-Up or otherwise) must not appear here even if they'd
    // otherwise match every other filter. Written as a
    // CTE rather than a "SELECT * FROM (...) AS subquery" wrapper — the latter form reliably
    // triggered "missing FROM-clause entry for table pp" once Spring Data applied its own
    // pagination handling on top, even with an unsorted Pageable. Columns are explicitly
    // aliased to their HivExposedInfantCandidateDto getter's camelCase name — Spring Data's
    // native-query-to-interface-projection binding does NOT auto-convert snake_case column
    // labels.
    @Query(
            value = "WITH candidates AS ( " +
                    "  SELECT DISTINCT ON (pp.uuid) pp.id AS id, pp.uuid AS uuid, " +
                    "    pp.uuid AS \"patientUuid\", pp.id AS \"personId\", " +
                    "    pp.full_name AS \"fullName\", pp.first_name AS \"firstName\", pp.surname AS surname, " +
                    "    pp.hospital_number AS \"hospitalNumber\", " +
                    "    pp.sex AS sex, pp.date_of_birth AS \"dateOfBirth\", " +
                    "    pp.date_of_registration AS \"dateOfEnrollment\", " +
                    "    COALESCE(he.observation->>'finalHivTestResult', " +
                    "      CASE WHEN he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' THEN 'Positive' ELSE NULL END " +
                    "    ) AS \"hivStatus\" " +
                    "  FROM patient_person pp " +
                    "  INNER JOIN hts_encounter he ON he.patient_uuid = pp.uuid AND he.archived = false " +
                    "  WHERE pp.archived = 0 " +
                    "    AND pp.facility_id = ?1 " +
                    "    AND (EXTRACT(YEAR FROM age(CURRENT_DATE, pp.date_of_birth)) * 12 " +
                    "         + EXTRACT(MONTH FROM age(CURRENT_DATE, pp.date_of_birth))) BETWEEN 0 AND 24 " +
                    "    AND ( " +
                    "      he.observation->>'finalHivTestResult' ILIKE 'Positive' " +
                    "      OR he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' " +
                    "    ) " +
                    "    AND NOT EXISTS ( " +
                    "      SELECT 1 FROM pmtct_infant_information pi " +
                    "      WHERE pi.infant_patient_uuid = pp.uuid AND pi.archived = false " +
                    "        AND pi.mother_patient_uuid IS NOT NULL " +
                    "    ) " +
                    "  ORDER BY pp.uuid, he.id DESC " +
                    ") SELECT * FROM candidates ORDER BY id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                    "FROM patient_person pp " +
                    "INNER JOIN hts_encounter he ON he.patient_uuid = pp.uuid AND he.archived = false " +
                    "WHERE pp.archived = 0 " +
                    "  AND pp.facility_id = ?1 " +
                    "  AND (EXTRACT(YEAR FROM age(CURRENT_DATE, pp.date_of_birth)) * 12 " +
                    "       + EXTRACT(MONTH FROM age(CURRENT_DATE, pp.date_of_birth))) BETWEEN 0 AND 24 " +
                    "  AND ( " +
                    "    he.observation->>'finalHivTestResult' ILIKE 'Positive' " +
                    "    OR he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' " +
                    "  ) " +
                    "  AND NOT EXISTS ( " +
                    "    SELECT 1 FROM pmtct_infant_information pi " +
                    "    WHERE pi.infant_patient_uuid = pp.uuid AND pi.archived = false " +
                    "      AND pi.mother_patient_uuid IS NOT NULL " +
                    "  )",
            nativeQuery = true
    )
    Page<HivExposedInfantCandidateDto> getHivExposedInfantCandidates(Long facilityId, Pageable pageable);

    @Query(
            value = "WITH candidates AS ( " +
                    "  SELECT DISTINCT ON (pp.uuid) pp.id AS id, pp.uuid AS uuid, " +
                    "    pp.uuid AS \"patientUuid\", pp.id AS \"personId\", " +
                    "    pp.full_name AS \"fullName\", pp.first_name AS \"firstName\", pp.surname AS surname, " +
                    "    pp.hospital_number AS \"hospitalNumber\", " +
                    "    pp.sex AS sex, pp.date_of_birth AS \"dateOfBirth\", " +
                    "    pp.date_of_registration AS \"dateOfEnrollment\", " +
                    "    COALESCE(he.observation->>'finalHivTestResult', " +
                    "      CASE WHEN he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' THEN 'Positive' ELSE NULL END " +
                    "    ) AS \"hivStatus\" " +
                    "  FROM patient_person pp " +
                    "  INNER JOIN hts_encounter he ON he.patient_uuid = pp.uuid AND he.archived = false " +
                    "  WHERE pp.archived = 0 " +
                    "    AND pp.facility_id = ?1 " +
                    "    AND (pp.full_name ILIKE %?2% OR pp.hospital_number ILIKE %?2%) " +
                    "    AND (EXTRACT(YEAR FROM age(CURRENT_DATE, pp.date_of_birth)) * 12 " +
                    "         + EXTRACT(MONTH FROM age(CURRENT_DATE, pp.date_of_birth))) BETWEEN 0 AND 24 " +
                    "    AND ( " +
                    "      he.observation->>'finalHivTestResult' ILIKE 'Positive' " +
                    "      OR he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' " +
                    "    ) " +
                    "    AND NOT EXISTS ( " +
                    "      SELECT 1 FROM pmtct_infant_information pi " +
                    "      WHERE pi.infant_patient_uuid = pp.uuid AND pi.archived = false " +
                    "        AND pi.mother_patient_uuid IS NOT NULL " +
                    "    ) " +
                    "  ORDER BY pp.uuid, he.id DESC " +
                    ") SELECT * FROM candidates ORDER BY id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT pp.uuid) " +
                    "FROM patient_person pp " +
                    "INNER JOIN hts_encounter he ON he.patient_uuid = pp.uuid AND he.archived = false " +
                    "WHERE pp.archived = 0 " +
                    "  AND pp.facility_id = ?1 " +
                    "  AND (pp.full_name ILIKE %?2% OR pp.hospital_number ILIKE %?2%) " +
                    "  AND (EXTRACT(YEAR FROM age(CURRENT_DATE, pp.date_of_birth)) * 12 " +
                    "       + EXTRACT(MONTH FROM age(CURRENT_DATE, pp.date_of_birth))) BETWEEN 0 AND 24 " +
                    "  AND ( " +
                    "    he.observation->>'finalHivTestResult' ILIKE 'Positive' " +
                    "    OR he.observation->>'confirmatoryHivTest' = 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE' " +
                    "  ) " +
                    "  AND NOT EXISTS ( " +
                    "    SELECT 1 FROM pmtct_infant_information pi " +
                    "    WHERE pi.infant_patient_uuid = pp.uuid AND pi.archived = false " +
                    "      AND pi.mother_patient_uuid IS NOT NULL " +
                    "  )",
            nativeQuery = true
    )
    Page<HivExposedInfantCandidateDto> searchHivExposedInfantCandidates(Long facilityId, String searchParam, Pageable pageable);
}
