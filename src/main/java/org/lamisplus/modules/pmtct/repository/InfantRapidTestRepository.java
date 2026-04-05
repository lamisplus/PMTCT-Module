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
            "WHERE infant_hospital_number = ?1 and archived = 0 and visit_date =(  \n" +
            "\t\t SELECT  MAX(visit_date) FROM public.pmtct_infant_visit  WHERE infant_hospital_number = ?1 and mother_person_uuid = CAST(?2 AS VARCHAR) and archived = 0 \t\n" +
            ")", nativeQuery = true)
    String getLastInfantVisit (String infantHospitalNumber, String motherUuid);

    @Query(value = "SELECT unique_uuid FROM public.pmtct_infant_visit " +
            "WHERE infant_hospital_number = ?1 AND mother_person_uuid = CAST(?2 AS VARCHAR) AND pmtct_cycle_id = ?3 AND archived = 0 " +
            "ORDER BY visit_date DESC LIMIT 1", nativeQuery = true)
    String getLastInfantVisitByCycle(String infantHospitalNumber, String motherUuid, Long pmtctCycleId);

    @Query(value = "SELECT * FROM public.pmtct_infant_rapid_antibody WHERE unique_uuid = CAST(?1 AS VARCHAR) AND archived = 0 ORDER BY visit_date DESC LIMIT 1", nativeQuery = true)
    InfantRapidAntiBodyTest getLastInfantRapid (String lastVistUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_rapid_antibody WHERE mother_person_uuid = CAST(?1 AS VARCHAR) AND date_of_test = ?2 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantRapidAntiBodyTest getLatestByMotherPersonUuidAndDateOfTest(String motherPersonUuid, LocalDate dateOfTest);

    @Query(value = "SELECT * FROM public.pmtct_infant_rapid_antibody WHERE unique_uuid = CAST(?1 AS VARCHAR) AND mother_person_uuid = CAST(?2 AS VARCHAR) AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantRapidAntiBodyTest getByUniqueUuidAndMotherPersonUuid(String uniqueUuid, String motherPersonUuid);
}




