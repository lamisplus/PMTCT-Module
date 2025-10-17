package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PmtctHtsRepository extends CommonJpaRepository<PmtctHts, Long> {

    Optional<PmtctHts> findRecordByPersonUuid(String personUuid);


    List<PmtctHts> findByPersonUuid(String personUuid);


    @Query(value = "SELECT * FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY ID DESC", nativeQuery = true)
    List<PmtctHts> findByPersonUuidAndUnarchived(String personUuid);



    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') FROM pmtct_hts where person_uuid=?1 AND archived = 0 ORDER BY date_of_hiv_test DESC, id DESC  LIMIT 1 ", nativeQuery = true)
    Optional<String> findLatestFinalResult(String personUuid);

    @Query(value = "SELECT * FROM pmtct_hts WHERE person_uuid=?1 AND archived = 0 ORDER BY date_of_hiv_test DESC LIMIT 1 ", nativeQuery = true)
    PmtctHts findLatestPMTCTHTSEnrollmentById(String personUuid);


    @Query(value = "SELECT EXISTS(SELECT 1 FROM pmtct_hts WHERE person_uuid=?1 AND date_of_hiv_test =?2 AND archived = 0 ORDER BY id DESC LIMIT 1)\n", nativeQuery = true)
    boolean findIfDateExist(String personUuid, LocalDate dateOfHivTest);


    @Query(value = "SELECT COALESCE(NULLIF(final_result, ''), confirmatory_hiv_test->>'result') as result, date_of_hiv_test FROM pmtct_hts WHERE person_uuid =?1 AND archived = 0 AND testing_type = 'RETESTING' ORDER BY id DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findLatestHivTestResultList(String personUuid);




}
