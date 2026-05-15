package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.InfantPCRTestDto;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;
import org.lamisplus.modules.pmtct.domain.entity.InfantVisit;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public  interface InfantPCRTestRepository  extends CommonJpaRepository<InfantPCRTest, String>
{

    List<InfantPCRTest> findByAncNumber (String ancNo);
    @Query(value = "SELECT * FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1 AND archived = 0 ORDER BY id DESC", nativeQuery = true)
    List<InfantPCRTest> findByInfantHospitalNumber  (String hospitalNumber);
    InfantPCRTest getTopByUuid (String uuid);
    Optional<InfantPCRTestDto> findTopByInfantHospitalNumber  (String hospitalNumber);

    Optional<InfantPCRTest> findByInfantHospitalNumberAndVisitDate  (String hospitalNumber, LocalDate visitDate);
    Optional<InfantPCRTest> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr \n" +
            "            WHERE infant_hospital_number = ?1 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest getLastPCR (String infantHospitalNumber);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1 AND pmtct_cycle_uuid = ?2 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest getLastPCRByCycle(String infantHospitalNumber, String pmtctCycleUuid);

    @Query(value = "SELECT COUNT(*) > 0  FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1  AND test_type = 'INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT'", nativeQuery = true)
    boolean checkPcrExist (String infantHospitalNumber);

    @Query(value = "SELECT * FROM pmtct_infant_pcr WHERE visit_date =?2 and infant_hospital_number=?1 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest getLatestInfantPCRInfo(String infantHospitalNo, LocalDate visitDate);

    @Query(value = "SELECT COUNT(*) > 0 FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1 AND test_type = ?2 AND archived = 0", nativeQuery = true)
    boolean existsByInfantHospitalNumberAndTestType(String infantHospitalNumber, String testType);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1 AND test_type = ?2 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest findByInfantHospitalNumberAndTestType(String infantHospitalNumber, String testType);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr WHERE infant_hospital_number = ?1 AND visit_date = ?2 AND test_type = ?3 AND unique_uuid IS NULL AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest getLatestByHospitalNumberAndVisitDateAndTestType(String hospitalNumber, LocalDate visitDate, String testType);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr WHERE unique_uuid = CAST(?1 AS VARCHAR) AND infant_hospital_number = ?2 AND visit_date = ?3 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantPCRTest getByUniqueUuidAndHospitalNumberAndVisitDate(String uniqueUuid, String hospitalNumber, LocalDate visitDate);

}