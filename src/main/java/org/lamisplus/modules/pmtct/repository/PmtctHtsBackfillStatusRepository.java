package org.lamisplus.modules.pmtct.repository;

import org.lamisplus.modules.pmtct.domain.entity.PmtctHtsBackfillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PmtctHtsBackfillStatusRepository extends JpaRepository<PmtctHtsBackfillStatus, Long> {
}
