package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HivExposedInfantRepository extends CommonJpaRepository<Infant, String> {

    // Candidates for the HIV-Exposed Infant grid: 0-24 months old, with a positive HTS
    // record on the HTS module's own hts_encounter table (not PMTCT's ANC-side pmtct_hts) —
    // regardless of gender, and independent of any PMTCT/maternal enrollment.
    @Query(
            value = "SELECT * FROM ( " +
                    "  SELECT DISTINCT ON (pp.uuid) pp.* " +
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
                    "  ORDER BY pp.uuid, he.id DESC " +
                    ") AS subquery ORDER BY id DESC",
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
                    "  )",
            nativeQuery = true
    )
    Page<PatientPerson> getHivExposedInfantCandidates(Long facilityId, Pageable pageable);

    @Query(
            value = "SELECT * FROM ( " +
                    "  SELECT DISTINCT ON (pp.uuid) pp.* " +
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
                    "  ORDER BY pp.uuid, he.id DESC " +
                    ") AS subquery ORDER BY id DESC",
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
                    "  )",
            nativeQuery = true
    )
    Page<PatientPerson> searchHivExposedInfantCandidates(Long facilityId, String searchParam, Pageable pageable);
}
