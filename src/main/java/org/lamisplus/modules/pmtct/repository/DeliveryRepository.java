package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;

import java.util.Optional;

public interface DeliveryRepository extends CommonJpaRepository<Delivery, Long>
{
    Optional<Delivery> findByAncNo (String ancNo);

    Delivery getDeliveryById(Long id);
}
