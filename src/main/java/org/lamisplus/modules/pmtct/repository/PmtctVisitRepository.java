package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PmtctVisitRepository extends CommonJpaRepository<PmtctVisit, String> {

        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where patient_uuid = ?1 and date_of_visit > ?2 and archived = false order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getPNCVisitsByPatientUuid(String patientUuid, LocalDate deliveryDate);

        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where patient_uuid = ?1 and pmtct_cycle_uuid = ?2 and date_of_visit > ?3 and archived = false order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getPNCVisitsByPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid, LocalDate deliveryDate);

        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where patient_uuid = ?1 and date_of_visit <= ?2 and archived = false order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getANCVisitsByPatientUuid(String patientUuid, LocalDate deliveryDate);

        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where patient_uuid = ?1 and pmtct_cycle_uuid = ?2 and date_of_visit <= ?3 and archived = false order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getANCVisitsByPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid, LocalDate deliveryDate);

        @Query(value = "SELECT count(*) FROM public.pmtct_mother_visitation where patient_uuid = ?1", nativeQuery = true)
        Integer getMotherVisitsWithPatientUuid(String patientUuid);

        @Query(value = "SELECT count(*) FROM public.pmtct_mother_visitation where patient_uuid = ?1 AND pmtct_cycle_uuid = ?2", nativeQuery = true)
        Integer getMotherVisitsWithPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid);


        //
        @Query(value = "SELECT maternal_outcome FROM public.pmtct_mother_visitation WHERE patient_uuid=?1 ORDER BY ID DESC LIMIT 1", nativeQuery = true)
        Optional<String> findLatestMaternalOutcome(String patientUuid);

        @Query(value = "SELECT maternal_outcome FROM public.pmtct_mother_visitation WHERE patient_uuid=?1 AND pmtct_cycle_uuid = ?2 ORDER BY ID DESC LIMIT 1", nativeQuery = true)
        Optional<String> findLatestMaternalOutcomeByCycle(String patientUuid, String pmtctCycleUuid);

        @Query(value = "SELECT CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) AS vl_result " +
                "FROM laboratory_result lr " +
                "INNER JOIN laboratory_test lt ON lr.test_id = lt.id " +
                "WHERE lt.lab_test_id = 16 " +
                "AND lr.patient_uuid = ?1 " +
                "AND lr.archived = 0 " +
                "AND lr.result_reported IS NOT NULL " +
                "AND lr.date_result_reported IS NOT NULL " +
                "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
                "ORDER BY lr.date_result_reported DESC, lr.id DESC LIMIT 1", nativeQuery = true)
        Optional<Long> findLatestViralLoadResult(String patientUuid);

        @Query(value = "SELECT pharmacy_object->>'regimenName' AS regimen_name " +
                "FROM hiv_art_pharmacy h, " +
                "jsonb_array_elements(h.extra->'regimens') AS pharmacy_object " +
                "WHERE h.person_uuid = ?1 AND h.archived = 0 " +
                "ORDER BY h.visit_date DESC, h.id DESC LIMIT 1", nativeQuery = true)
        Optional<String> findLatestArtRegimenFromPharmacy(String patientUuid);

        @Query(value = "SELECT maternal_outcome FROM public.pmtct_mother_visitation WHERE pmtct_cycle_uuid = ?1 AND archived = false ORDER BY date_of_visit DESC, id DESC LIMIT 1", nativeQuery = true)
        Optional<String> findLatestMaternalOutcomeByCycleUuid(String pmtctCycleUuid);

}
