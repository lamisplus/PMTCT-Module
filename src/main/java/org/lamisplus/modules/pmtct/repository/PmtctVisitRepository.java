package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;

import java.util.List;
import java.util.Optional;

public interface PmtctVisitRepository extends CommonJpaRepository<PmtctVisit, Long> {
        List<PmtctVisit> findByAncNoOrderByDateOfVisitDesc(String ancNo);
        Optional  <PmtctVisit> getByAncNo(String ancNo);
}
