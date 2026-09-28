package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.D;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends CommonJpaRepository<Delivery, String>
{
    //Delivery getDeliveryById(Long id);

    @Query(value = "SELECT * FROM pmtct_delivery WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Delivery getDeliveryByPatientUuid(String patientUuid);

    @Query(value = "SELECT * FROM pmtct_delivery WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Delivery getDeliveryByPatientUuidAndPmtctCycleUuid(String patientUuid, String pmtctCycleUuid);

    @Query(value = "SELECT * FROM pmtct_delivery WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Delivery> findDeliveryByPatientUuid(String patientUuid);

    @Query(value = "SELECT * FROM pmtct_delivery WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Delivery> findDeliveryByPatientUuidAndPmtctCycleUuid(String patientUuid, String pmtctCycleUuid);

    @Query(value = "SELECT date_of_delivery FROM public.pmtct_delivery WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    LocalDate getLatestDeliveryDate(String patientUuid);

    // LV3-1965 historical backfill, L&D branch: every existing Delivery cycle to check for
    // unmapped HTS candidates. Deliberately NOT restricted to cycles without an ANC record -
    // the spec's third condition (ANC Enrolment AND L&D Form both exist) says the HTS record's
    // own Setting decides which branch applies, with no exclusivity requirement once both forms
    // exist. This branch only ever matches Setting = L&D records (findUnmappedDeliverySyncCandidateIds
    // filters on modality), and the ANC branch above only ever matches Setting = ANC records -
    // mutually exclusive by construction, so running both branches unconditionally on every
    // cycle is exactly the unified §03 rule, not a risk of double-mapping the same record.
    // (An earlier version of this query excluded cycles with an ANC record, which silently
    // skipped legitimate L&D-setting matches for clients with both forms on file - fixed.)
    // One row per (patientUuid, cycleUuid, dateOfDelivery).
    @Query(value = "SELECT DISTINCT ON (d.pmtct_cycle_uuid) d.patient_uuid, d.pmtct_cycle_uuid, d.date_of_delivery "
            + "FROM pmtct_delivery d "
            + "WHERE d.archived = false AND d.pmtct_cycle_uuid IS NOT NULL AND d.date_of_delivery IS NOT NULL "
            + "ORDER BY d.pmtct_cycle_uuid, d.id DESC", nativeQuery = true)
    List<Object[]> findCyclesForHtsBackfill();
}
