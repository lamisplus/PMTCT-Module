package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantVisit;

import java.util.List;

public interface InfantVisitRepository extends CommonJpaRepository<InfantVisit, Long>
{
    List<InfantVisit> findInfantVisitsByInfantHospitalNumber(String infanHospitalNumber);
}
