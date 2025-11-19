package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.D;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;

public interface DeliveryRepository extends CommonJpaRepository<Delivery, Long>
{
    //Delivery getDeliveryById(Long id);

    Delivery getDeliveryByAncNo(String ancNo);

    Delivery getDeliveryByPersonUuid(String personUuid);

    Delivery getDeliveryByPersonUuidAndPmtctCycleId(String personUuid, Long pmtctCycleId);


    Optional<Delivery> findDeliveryByPersonUuid(String personUuid);

    Optional<Delivery> findDeliveryByPersonUuidAndPmtctCycleId(String personUuid, Long pmtctCycleId);

    Optional<Delivery> findDeliveryByAncNo(String ancNo);

    Optional<Delivery> findDeliveryByHospitalNumber(String hospitalNumber);

    @Query(value = "SELECT date_of_delivery FROM public.pmtct_delivery WHERE person_uuid = ?1 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    LocalDate getLatestDeliveryDate(String personUuid);
}
