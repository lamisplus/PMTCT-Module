package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.FamilyPlanningVisit;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FamilyPlanningVisitRepository extends CommonJpaRepository<FamilyPlanningVisit, String> {

    @Query(value = "SELECT * FROM public.pmtct_family_planning WHERE patient_uuid = ?1 AND archived = false ORDER BY visit_date DESC", nativeQuery = true)
    List<FamilyPlanningVisit> getByPatientUuid(String patientUuid);

    @Query(value = "SELECT * FROM public.pmtct_family_planning WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY visit_date DESC", nativeQuery = true)
    List<FamilyPlanningVisit> getByPatientUuidAndCycleUuid(String patientUuid, String pmtctCycleUuid);

    // Persistable<String>.getId() (see FamilyPlanningVisit.getId() override) returns the uuid,
    // not the numeric id column — matching InfantVisit/PmtctVisit's own getId() overrides. That's
    // exactly what ANCAcivityTracker's ActivityTracker.recordId (String) carries, so lookups by
    // uuid are what the activity feed's view/update/delete flow actually needs.
    @Query(value = "SELECT * FROM public.pmtct_family_planning WHERE uuid = ?1 AND archived = false", nativeQuery = true)
    Optional<FamilyPlanningVisit> findByUuidAndUnarchived(String uuid);
}
