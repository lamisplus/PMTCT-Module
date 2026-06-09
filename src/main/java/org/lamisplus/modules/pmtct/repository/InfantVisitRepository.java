package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.lamisplus.modules.pmtct.domain.entity.InfantVisit;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface InfantVisitRepository extends CommonJpaRepository<InfantVisit, String>
{
    List<InfantVisit> findInfantVisitsByInfantHospitalNumber(String infanHospitalNumber);

    @Query(value = "SELECT * FROM public.pmtct_infant_visit where anc_number = ?1 order by id DESC", nativeQuery = true)
    List<InfantVisit> getPreArvVisits(String hospitalNumber);

//    @Query(value = "SELECT * FROM public.pmtct_infant_visit where infant_hospital_number = ?1 and visit_date > ?2 order by visit_date DESC", nativeQuery = true)
//    List<InfantVisit> getPostArvVisits(String hospitalNumber, LocalDate visitDate);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where anc_number = ?1", nativeQuery = true)
    Integer getChildVisits(String ancNO);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where mother_patient_uuid = CAST(?1 AS VARCHAR)", nativeQuery = true)
    Integer getChildVisitsWithPatientUuid(String patientUuid);

    @Query(value = "SELECT count(*) FROM public.pmtct_infant_visit where mother_patient_uuid = CAST(?1 AS VARCHAR) AND pmtct_cycle_uuid = ?2", nativeQuery = true)
    Integer getChildVisitsWithPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid);

    List<InfantVisit> getInfantVisitsByAncNumber(String ancNO);

    @Query(value = "SELECT * FROM pmtct_infant_visit WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND archived = false", nativeQuery = true)
    List<InfantVisit> getInfantVisitsByMotherPatientUuid(String motherPatientUuid);

    @Query(value = "SELECT * FROM pmtct_infant_visit WHERE mother_patient_uuid = CAST(?1 AS VARCHAR) AND pmtct_cycle_uuid=?2 AND archived = false", nativeQuery = true)
    List<InfantVisit> getInfantVisitsByMotherPatientUuidAndCycleUuid(String motherPatientUuid, String pmtctCycleUuid);

      @Query(value = "SELECT visit_date FROM pmtct_infant_visit WHERE infant_hospital_number=?1 ORDER BY visit_date DESC LIMIT 1", nativeQuery = true)
    LocalDate getLatestInfantVisitDate(String infantHospitalNo);

    java.util.Optional<InfantVisit> findByUniqueUuid(String uniqueUuid);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM pmtct_infant_visit WHERE infant_hospital_number = ?1 AND visit_date = ?2 AND archived = false", nativeQuery = true)
    boolean existsByInfantHospitalNumberAndVisitDate(String hospitalNumber, LocalDate visitDate);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM pmtct_infant_visit WHERE infant_hospital_number = ?1 AND visit_date = ?2 AND uuid != CAST(?3 AS VARCHAR) AND archived = false", nativeQuery = true)
    boolean existsByInfantHospitalNumberAndVisitDateAndIdNot(String hospitalNumber, LocalDate visitDate, String uuid);

    @Query(value = "SELECT * FROM pmtct_infant_visit WHERE infant_hospital_number = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY visit_date DESC", nativeQuery = true)
    List<InfantVisit> getInfantVisitsByInfantHospitalNumberAndCycleUuid(String infantHospitalNumber, String pmtctCycleUuid);

    @Query(value = "SELECT * FROM pmtct_infant_visit WHERE infant_hospital_number = ?1 AND archived = false ORDER BY visit_date DESC", nativeQuery = true)
    List<InfantVisit> getInfantVisitsByInfantHospitalNumberOrdered(String infantHospitalNumber);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM pmtct_infant_visit WHERE art_enrollment_no = ?1 AND archived = false", nativeQuery = true)
    boolean existsByArtEnrollmentNo(String artEnrollmentNo);

}
