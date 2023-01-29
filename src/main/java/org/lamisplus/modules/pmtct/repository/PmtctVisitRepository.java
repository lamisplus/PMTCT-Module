package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PmtctVisitRepository extends CommonJpaRepository<PmtctVisit, Long> {
        List<PmtctVisit> findByAncNoOrderByDateOfVisitDesc(String ancNo);
        Optional  <PmtctVisit> getByAncNo(String ancNo);
        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where anc_no = ?1 and date_of_visit <= ?2 order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getANCVisits(String ancNo, LocalDate deliveryDate);

        @Query(value = "SELECT * FROM public.pmtct_mother_visitation where anc_no = ?1 and date_of_visit > ?2 order by date_of_visit DESC", nativeQuery = true)
        List<PmtctVisit> getPNCVisits(String ancNo, LocalDate deliveryDate);

        @Query(value = "SELECT count(*) FROM public.pmtct_mother_visitation where anc_no = ?1", nativeQuery = true)
        Integer getMotherVisits(String ancNO);



}
