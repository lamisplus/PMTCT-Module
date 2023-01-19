package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;

import java.util.List;
import java.util.Optional;

public interface InfantPCRTestRepository  extends CommonJpaRepository<InfantPCRTest, Long>
{
    List<InfantPCRTest> findByAncNumber (String ancNo);
    List<InfantPCRTest> findByInfantHospitalNumber  (String hospitalNumber);
}
