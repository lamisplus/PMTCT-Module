package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;

import java.util.List;

public interface InfantMotherArtRepository extends CommonJpaRepository<InfantMotherArt, Long>
{
    List<InfantMotherArt> findByAncNumber (String ancNo);
}
