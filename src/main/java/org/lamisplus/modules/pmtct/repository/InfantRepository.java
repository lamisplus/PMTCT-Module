package org.lamisplus.modules.pmtct.repository;


import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InfantRepository extends CommonJpaRepository<Infant, Long> {
    List<Infant> findInfantByAncNo (String ancNo);

    @Query(value = "SELECT * FROM pmtct_infant_information WHERE mother_person_uuid = CAST(?1 AS VARCHAR) AND (archived = 0 OR archived IS NULL)", nativeQuery = true)
    List<Infant> findInfantByMotherPersonUuid(String personUuid);

    List<Infant> findInfantsByHospitalNumber(String hospitalNumber);

    Optional<Infant> findInfantByHospitalNumber(String hospitalNumber);

    Optional<Infant> getInfantByHospitalNumber(String hospitalNumber);

    @Query(
            value = "SELECT * FROM pmtct_infant_information pi WHERE pi.facility_id=?1 AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pi.date_of_delivery) < 10 ) ORDER BY pi.id desc",
            nativeQuery = true
    )
    Page<Infant> getInfant(Long facilityId, Pageable pageable);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_infant_information WHERE mother_person_uuid = CAST(?1 AS VARCHAR) )", nativeQuery = true)
    boolean checkInfant(String personUuid);


    @Modifying
    @Transactional
    @Query(value = "UPDATE public.pmtct_infant_information SET date_of_delivery = ?1 WHERE mother_person_uuid = CAST(?2 AS VARCHAR) ", nativeQuery = true)
    void updateDeliveryDate(LocalDate deliveryDate , String personUuid);


    @Query(value = "SELECT *  FROM pmtct_infant_information WHERE mother_person_uuid = CAST(?1 AS VARCHAR) AND (archived = 0 OR archived IS NULL) ", nativeQuery = true)
    List<Infant> getAllInfantByPersonUuid(String personUuid);

    @Query(value = "SELECT *  FROM pmtct_infant_information WHERE mother_person_uuid = CAST(?1 AS VARCHAR) AND pmtct_cycle_id=?2 AND (archived = 0 OR archived IS NULL) ", nativeQuery = true)
    List<Infant> getAllInfantByPersonUuidAndCycleId(String personUuid, Long pmtctCycleId);




}
