package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import jdk.nashorn.internal.runtime.options.Option;
import org.lamisplus.modules.pmtct.domain.entity.ANC;

import java.util.List;
import java.util.Optional;

public interface ANCRepository extends CommonJpaRepository<ANC, Long>
{
    ANC findByAncNoAndArchived (String ancNo, Long archived);

//   ANC findByAncnoAndArchived2 (String ancNo, Long archived);

   List<ANC> findByArchived(Long archived);
}
