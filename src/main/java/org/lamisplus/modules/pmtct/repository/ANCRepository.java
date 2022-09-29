package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.ANC;

import java.util.List;
public interface ANCRepository extends CommonJpaRepository<ANC, Long>
{
    ANC findByAncNoAndArchived (String ancNo, Long archived);

    List<ANC> findByArchived(Long archived);
}
