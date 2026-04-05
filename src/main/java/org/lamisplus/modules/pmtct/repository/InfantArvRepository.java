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

    Optional<InfantArv> getByInfantHospitalNumber(String hospitalNumber);

    Optional<InfantArvDto> getTopByInfantHospitalNumber(String hospitalNumber);

    InfantArv getTopByUuid(String uuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_arv where infant_hospital_number = ?1 and visit_date <= ?2 order by visit_date DESC", nativeQuery = true)
    List<InfantArv> getANCVisits(String ancNo, LocalDate deliveryDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_arv where infant_hospital_number = ?1 and visit_date > ?2 order by visit_date DESC", nativeQuery = true)
    List<InfantArv> getPNCVisits(String ancNo, LocalDate deliveryDate);

    Optional<InfantArv> getByInfantHospitalNumberAndVisitDate (String hospitalNumber, LocalDate visitDate);
    Optional<InfantArv> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_arv WHERE infant_hospital_number = ?1 AND visit_date = ?2 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantArv getLatestByHospitalNumberAndVisitDate(String hospitalNumber, LocalDate visitDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_arv WHERE mother_person_uuid = CAST(?1 AS VARCHAR) AND infant_hospital_number = ?2 AND visit_date = ?3 AND unique_uuid IS NULL AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantArv getLatestByUuidAndHospitalNumberAndVisitDate(String motherPersonUuid, String hospitalNumber, LocalDate visitDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_arv WHERE unique_uuid = CAST(?1 AS VARCHAR) AND infant_hospital_number = ?2 AND visit_date = ?3 AND archived = 0 ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantArv getByUniqueUuidAndHospitalNumberAndVisitDate(String uniqueUuid, String hospitalNumber, LocalDate visitDate);

}
