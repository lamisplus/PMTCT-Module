package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InfantMotherArtRepository extends CommonJpaRepository<InfantMotherArt, Long>
{
    List<InfantMotherArt> findByAncNumber (String ancNo);
    Optional<InfantMotherArt> findByAncNumberAndVisitDate(String ancNo, LocalDate visitDate);
    Optional<InfantMotherArt> findByUniqueUuid(String uniqueUuid);
}
