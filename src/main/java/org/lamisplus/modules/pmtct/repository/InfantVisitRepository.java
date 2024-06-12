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

    List<InfantVisit> getInfantVisitsByAncNumber(String ancNO);




}
