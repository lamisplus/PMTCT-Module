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

public interface InfantRepository extends CommonJpaRepository<Infant, String> {

    @Query(value = "SELECT * FROM pmtct_infant_information WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND archived = false", nativeQuery = true)
    List<Infant> findInfantByMotherPatientUuid(String patientUuid);

    List<Infant> findInfantsByInfantHospitalNumber(String infantHospitalNumber);

    Optional<Infant> findInfantByInfantHospitalNumber(String infantHospitalNumber);

    Optional<Infant> getInfantByInfantHospitalNumber(String infantHospitalNumber);

    // Archived-aware variant — hospital numbers can be reused for a new infant after a
    // soft delete, so unscoped lookups risk matching the deleted infant (or throwing on
    // more than one match once the number is reused). Used where a stale/deleted infant's
    // data must not leak into the currently-active infant with the same hospital number.
    Optional<Infant> getInfantByInfantHospitalNumberAndArchived(String infantHospitalNumber, Boolean archived);

    @Query(
            value = "SELECT * FROM pmtct_infant_information pi WHERE pi.facility_id=?1 AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pi.date_of_delivery) < 10 ) ORDER BY pi.id desc",
            nativeQuery = true
    )
    Page<Infant> getInfant(Long facilityId, Pageable pageable);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_infant_information WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) )", nativeQuery = true)
    boolean checkInfant(String patientUuid);


    @Modifying
    @Transactional
    @Query(value = "UPDATE public.pmtct_infant_information SET date_of_delivery = ?1 WHERE mother_patient_uuid = CAST(?2 AS VARCHAR) AND pmtct_cycle_uuid = ?3 ", nativeQuery = true)
    void updateDeliveryDate(LocalDate deliveryDate , String patientUuid, String pmtctCycleUuid);


    @Query(value = "SELECT *  FROM pmtct_infant_information WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND archived = false ", nativeQuery = true)
    List<Infant> getAllInfantByPatientUuid(String patientUuid);

    @Query(value = "SELECT *  FROM pmtct_infant_information WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND pmtct_cycle_uuid=?2 AND archived = false ", nativeQuery = true)
    List<Infant> getAllInfantByPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid);



}
