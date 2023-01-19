package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import java.util.List;
import java.util.Optional;

public interface InfantArvRepository extends CommonJpaRepository<InfantArv, Long>
{
    List<InfantArv> findByAncNumber (String ancNo);
    List<InfantArv> findByInfantHospitalNumber  (String hospitalNumber);
}
