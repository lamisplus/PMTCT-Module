package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.dto.InfantArvDto;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InfantArvRepository extends CommonJpaRepository<InfantArv, Long>
{
    List<InfantArv> findByAncNumber (String ancNo);
    List<InfantArv> findByInfantHospitalNumber  (String hospitalNumber);

    Optional<InfantArv> getByInfantHospitalNumber (String hospitalNumber);
    Optional<InfantArvDto> getTopByInfantHospitalNumber (String hospitalNumber);
    InfantArv getTopByUuid (String uuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_visit where infant_hospital_number = ?1 and date_of_visit <= ?2 order by date_of_visit DESC", nativeQuery = true)
    List<InfantArv> getANCVisits(String ancNo, LocalDate deliveryDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_visit where infant_hospital_number = ?1 and date_of_visit > ?2 order by date_of_visit DESC", nativeQuery = true)
    List<InfantArv> getPNCVisits(String ancNo, LocalDate deliveryDate);

    Optional<InfantArv> getByInfantHospitalNumberAndVisitDate (String hospitalNumber, LocalDate visitDate);



}
