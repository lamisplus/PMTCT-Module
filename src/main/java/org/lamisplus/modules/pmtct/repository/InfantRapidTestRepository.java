package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.InfantPCRTestDto;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;
import org.lamisplus.modules.pmtct.domain.entity.InfantRapidAntiBodyTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface InfantRapidTestRepository  extends CommonJpaRepository<InfantRapidAntiBodyTest, Long>{


    Optional<InfantRapidAntiBodyTest> findByUniqueUuid(String uniqueUuid);

}
