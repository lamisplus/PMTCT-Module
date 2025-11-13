package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PmtctPregnancyCycle;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PmtctPregnancyCycleRepository extends CommonJpaRepository<PmtctPregnancyCycle, Long> {

    Optional<PmtctPregnancyCycle> findByPersonUuidAndArchivedAndIsClosed(String personUuid, Long archived, Boolean isClosed);

    List<PmtctPregnancyCycle> findByPersonUuidAndArchived(String personUuid, Long archived);

    @Query(value = "SELECT * FROM pmtct_pregnancy_cycle WHERE person_uuid = ?1 AND archived = 0 ORDER BY id DESC", nativeQuery = true)
    List<PmtctPregnancyCycle> findAllByPersonUuid(String personUuid);

    @Query(value = "SELECT * FROM pmtct_pregnancy_cycle WHERE person_uuid = ?1 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<PmtctPregnancyCycle> findLatestByPersonUuid(String personUuid);
}
