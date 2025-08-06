package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PmtctHtsRepository extends CommonJpaRepository<PmtctHts, Long> {

    Optional<PmtctHts> findRecordByPersonUuid(String personUuid);


    List<PmtctHts> findByPersonUuid(String personUuid);


    @Query(value = "SELECT * FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY ID DESC", nativeQuery = true)
    List<PmtctHts> findByPersonUuidAndUnarchived(String personUuid);

    @Query(value = "SELECT confirmatory_hiv_test FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY id DESC LIMIT 1 ", nativeQuery = true)
    Optional<String> findLatestConfirmatoryResult(String personUuid);

}
