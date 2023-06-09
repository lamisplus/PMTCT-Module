package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import liquibase.pro.packaged.O;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
// DeliveryRepository
public interface ANCRepository extends CommonJpaRepository<ANC, Long> {
    ANC findByAncNoAndArchived(String ancNo, Long archived);

    Optional<ANC> getByAncNoAndArchived(String ancNo, Long archived);

    Optional<ANC> getByAncNo(String ancNo);

    List<ANC> findByArchived(Long archived);

    Optional<ANC> findByHospitalNumberAndArchived(String hospitalNumber, Long archived);

    Optional<ANC> findANCByPersonUuidAndArchived(String personUuid, Long archived);

    Optional<ANC> findByHospitalNumber(String hospitalNumber);

    @Query(value = "SELECT count(*) FROM pmtct_anc pa", nativeQuery = true)
    Integer getTotalAnc();

    List<ANC> getANCByAncNo(String ancNo);

    ANC getANCById(Long id);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    @Query(value = "SELECT * FROM public.hts_client where person_uuid = ?1 and facility_id =?2 ORDER BY id DESC", nativeQuery = true)
    List<HtsClient> getHtsRecordsByPersonsUuidAAndFacilityId(String puuid, Long facilityId);

}