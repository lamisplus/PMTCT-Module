package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;

import java.util.List;
import java.util.Optional;

public interface PmtctHtsRepository extends CommonJpaRepository<PmtctHts, Long> {

    Optional<PmtctHts> findRecordByPersonUuid(String personUuid);


    List<PmtctHts> findByPersonUuid(String personUuid);


}
