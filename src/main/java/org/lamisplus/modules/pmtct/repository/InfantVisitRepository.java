package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.lamisplus.modules.pmtct.domain.entity.InfantVisit;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface InfantVisitRepository extends CommonJpaRepository<InfantVisit, Long>
{
    List<InfantVisit> findInfantVisitsByInfantHospitalNumber(String infanHospitalNumber);

    @Query(value = "SELECT * FROM public.pmtct_infant_visit where anc_number = ?1 order by id DESC", nativeQuery = true)
    List<InfantVisit> getPreArvVisits(String hospitalNumber);

//    @Query(value = "SELECT * FROM public.pmtct_infant_visit where infant_hospital_number = ?1 and visit_date > ?2 order by visit_date DESC", nativeQuery = true)
//    List<InfantVisit> getPostArvVisits(String hospitalNumber, LocalDate visitDate);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where anc_number = ?1", nativeQuery = true)
    Integer getChildVisits(String ancNO);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where mother_person_uuid = ?1", nativeQuery = true)
    Integer getChildVisitsWithPersonUuid(String personUuid);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where mother_person_uuid = ?1 AND pmtct_cycle_id = ?2", nativeQuery = true)
    Integer getChildVisitsWithPersonUuidAndCycleId(String personUuid, Long pmtctCycleId);

    List<InfantVisit> getInfantVisitsByAncNumber(String ancNO);

    List<InfantVisit> getInfantVisitsByMotherPersonUuid(String motherPersonUuid);

    @Query(value = "SELECT * FROM pmtct_infant_visit WHERE mother_person_uuid=?1 AND pmtct_cycle_id=?2", nativeQuery = true)
    List<InfantVisit> getInfantVisitsByMotherPersonUuidAndCycleId(String motherPersonUuid, Long pmtctCycleId);

      @Query(value = "SELECT visit_date FROM pmtct_infant_visit WHERE infant_hospital_number=?1 ORDER BY visit_date DESC LIMIT 1", nativeQuery = true)
    LocalDate getLatestInfantVisitDate(String infantHospitalNo);

    java.util.Optional<InfantVisit> findByUniqueUuid(String uniqueUuid);


}
