package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.D;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;

import java.util.Optional;

public interface DeliveryRepository extends CommonJpaRepository<Delivery, Long>
{
    //Delivery getDeliveryById(Long id);

    Delivery getDeliveryByAncNo(String ancNo);

    Optional<Delivery> findDeliveryByAncNo(String ancNo);

    Optional<Delivery> findDeliveryByHospitalNumber(String hospitalNumber);
}
