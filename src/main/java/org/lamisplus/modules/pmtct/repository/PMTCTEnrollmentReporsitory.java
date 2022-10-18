package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import java.util.Optional;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;

public interface PMTCTEnrollmentReporsitory extends CommonJpaRepository<PMTCTEnrollment, Long> {
  Optional<PMTCTEnrollment> findByAncNo(String paramString);
}
