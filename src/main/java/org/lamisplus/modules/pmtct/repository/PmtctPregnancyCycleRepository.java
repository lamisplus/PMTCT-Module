package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PmtctPregnancyCycle;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PmtctPregnancyCycleRepository extends CommonJpaRepository<PmtctPregnancyCycle, String> {

    Optional<PmtctPregnancyCycle> findByPatientUuidAndArchivedAndIsClosed(String patientUuid, Boolean archived, Boolean isClosed);

    List<PmtctPregnancyCycle> findByPatientUuidAndArchived(String patientUuid, Boolean archived);

    @Query(value = "SELECT * FROM pmtct_pregnancy_cycle WHERE patient_uuid = ?1 AND archived = false ORDER BY created_date DESC", nativeQuery = true)
    List<PmtctPregnancyCycle> findAllByPatientUuid(String patientUuid);

    @Query(value = "SELECT * FROM pmtct_pregnancy_cycle WHERE patient_uuid = ?1 AND archived = false ORDER BY created_date DESC LIMIT 1", nativeQuery = true)
    Optional<PmtctPregnancyCycle> findLatestByPatientUuid(String patientUuid);

    @Query(value = "SELECT * FROM pmtct_pregnancy_cycle WHERE patient_uuid = ?1 AND pmtct_status = 'INACTIVE' AND archived = false ORDER BY created_date DESC LIMIT 1", nativeQuery = true)
    Optional<PmtctPregnancyCycle> findInactiveByPatientUuid(String patientUuid);
}
