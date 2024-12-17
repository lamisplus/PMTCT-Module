package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.InfantPCRTestDto;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public  interface InfantPCRTestRepository  extends CommonJpaRepository<InfantPCRTest, Long>
{

    List<InfantPCRTest> findByAncNumber (String ancNo);
    List<InfantPCRTest> findByInfantHospitalNumber  (String hospitalNumber);
    InfantPCRTest getTopByUuid (String uuid);
    Optional<InfantPCRTestDto> findTopByInfantHospitalNumber  (String hospitalNumber);

    Optional<InfantPCRTest> findByInfantHospitalNumberAndVisitDate  (String hospitalNumber, LocalDate visitDate);
    Optional<InfantPCRTest> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_pcr \n" +
            "WHERE infant_hospital_number = ?1 and  visit_date =( \n" +
            "SELECT  MAX(visit_date) FROM public.pmtct_infant_pcr  WHERE infant_hospital_number = ?1 \n" +
            ")", nativeQuery = true)
    InfantPCRTest getLastPCR (String infantHospitalNumber);
}