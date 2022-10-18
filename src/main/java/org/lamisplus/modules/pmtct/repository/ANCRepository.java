package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.O;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
// DeliveryRepository
public interface ANCRepository extends CommonJpaRepository<ANC, Long>
{
    ANC findByAncNoAndArchived (String ancNo, Long archived);

    List<ANC> findByArchived(Long archived);

    Optional<ANC> findByHospitalNumberAndArchived (String hospitalNumber, Long archived);

    Optional<ANC> findByHospitalNumber (String hospitalNumber);
}
