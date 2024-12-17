package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.InfantPCRTestDto;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;
import org.lamisplus.modules.pmtct.domain.entity.InfantRapidAntiBodyTest;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface InfantRapidTestRepository  extends CommonJpaRepository<InfantRapidAntiBodyTest, Long>{


    Optional<InfantRapidAntiBodyTest> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT unique_uuid FROM public.pmtct_infant_visit \n" +
            "WHERE infant_hospital_number = ?1 and  visit_date =(  \n" +
            "\t\t SELECT  MAX(visit_date) FROM public.pmtct_infant_visit  WHERE infant_hospital_number = ?1 and mother_person_uuid =?2 \t\n" +
            ")", nativeQuery = true)
    String getLastInfantVisit (String infantHospitalNumber, String motherUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_rapid_antibody WHERE unique_uuid= ?1 ORDER BY visit_date DESC LIMIT 1", nativeQuery = true)
    InfantRapidAntiBodyTest getLastInfantRapid (String lastVistUuid);
}




