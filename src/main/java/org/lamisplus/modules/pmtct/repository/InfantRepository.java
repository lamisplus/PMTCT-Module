package org.lamisplus.modules.pmtct.repository;


import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.Infant;

public interface InfantRepository extends CommonJpaRepository<Infant, Long> {
}
