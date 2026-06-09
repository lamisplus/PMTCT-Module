package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.D;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
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
}
