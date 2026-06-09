package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InfantMotherArtRepository extends CommonJpaRepository<InfantMotherArt, String>
{
    List<InfantMotherArt> findByAncNumber (String ancNo);
    Optional<InfantMotherArt> findByAncNumberAndVisitDate(String ancNo, LocalDate visitDate);
    Optional<InfantMotherArt> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT * FROM public.pmtct_infant_mother_art WHERE anc_number = ?1 AND visit_date = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantMotherArt getLatestByAncNumberAndVisitDate(String ancNumber, LocalDate visitDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_mother_art WHERE unique_uuid = CAST(?1 AS VARCHAR) AND anc_number = CAST(?2 AS VARCHAR) AND visit_date = ?3 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantMotherArt getByUniqueUuidAndAncNumberAndVisitDate(String uniqueUuid, String ancNumber, LocalDate visitDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_mother_art WHERE unique_uuid = CAST(?1 AS VARCHAR) AND visit_date = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantMotherArt getByUniqueUuidAndVisitDate(String uniqueUuid, LocalDate visitDate);

    @Query(value = "SELECT * FROM public.pmtct_infant_mother_art WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND visit_date = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    InfantMotherArt getLatestByMotherPatientUuidAndVisitDate(String motherPatientUuid, LocalDate visitDate);
}
