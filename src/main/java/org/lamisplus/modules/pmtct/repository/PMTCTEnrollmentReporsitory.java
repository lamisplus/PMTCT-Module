package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;

import java.util.List;
import java.util.Optional;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.dto.PatientInfo;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface PMTCTEnrollmentReporsitory extends CommonJpaRepository<PMTCTEnrollment, Long> {
   PMTCTEnrollment findByAncNo(String ancNo);

  Optional  <PMTCTEnrollment> getByAncNo(String ancNo);

  Optional<PMTCTEnrollment> getByPersonUuid(String personUuid);


  PMTCTEnrollment findByPersonUuidAndArchived(String personUuid, Long archived);
  PMTCTEnrollment getPMTCTEnrollmentById(Long id);

  PMTCTEnrollment findPMTCTEnrollmentByPersonUuid(String personUuid);

    @Query(value = "SELECT pa.entry_point AS entryPoint, pa.tb_status AS tbStatus, pa.anc_no AS ancNo, pa.art_start_date AS ArtStartDate, date_of_birth AS dateOfBirth, pp.id AS personId, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS Id, pa.hiv_status AS hivStatus, sex,first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_enrollment pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
    Page<PatientPerson> getActiveOnPMTCT(Integer archived, Long facilityId, Pageable pageable);

  @Query(value = "SELECT pa.entry_point AS entryPoint, pa.tb_status AS tbStatus, pa.anc_no AS ancNo, pa.art_start_date AS ArtStartDate, date_of_birth AS dateOfBirth, pp.id AS personId, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS Id, pa.hiv_status AS hivStatus, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_enrollment pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pa.id desc", nativeQuery = true)
  Page<PatientPerson> getActiveOnPMTCTBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

  @Query(value = "SELECT active, deceased_date_time, deceased, date_of_registration AS dateOfRegistration, CAST(identifier AS TEXT) AS identifier, CAST(education AS TEXT) AS education, CAST(employment_status AS TEXT) AS employmentStatus, CAST(marital_status AS TEXT) AS maritalStatus, CAST(gender AS TEXT) AS gender, CAST(organization AS TEXT) AS organization, CAST(address AS TEXT) AS address,CAST(contact AS TEXT) AS contact, is_date_of_birth_estimated AS isDateOfBirthEstimated, facility_id AS facilityId, emr_id AS emrId, nin_number AS niNumber, date_of_birth AS dateOfBirth, pp.id, pp.uuid, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0 UNION SELECT person_uuid FROM pmtct_enrollment pe where pe.archived = 0) and (pp.first_name ilike ?1 OR pp.surname ilike ?1 OR pp.other_name ilike ?1 OR pp.full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
  Page<PatientInfo> findFemalePersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

  //@Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
  @Query(value = "SELECT active, deceased_date_time, deceased, date_of_registration AS dateOfRegistration, CAST(identifier AS TEXT) AS identifier, CAST(education AS TEXT) AS education, CAST(employment_status AS TEXT) AS employmentStatus, CAST(marital_status AS TEXT) AS maritalStatus, CAST(gender AS TEXT) AS gender, CAST(organization AS TEXT) AS organization, CAST(contact_point AS TEXT) AS contactPoint, CAST(address AS TEXT) AS address,CAST(contact AS TEXT) AS contact, is_date_of_birth_estimated AS isDateOfBirthEstimated, facility_id AS facilityId, emr_id AS emrId, nin_number AS niNumber, date_of_birth AS dateOfBirth, pp.id, pp.uuid, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber FROM patient_person pp WHERE uuid NOT IN (SELECT person_uuid FROM pmtct_anc pa where pa.archived = 0 UNION SELECT person_uuid FROM pmtct_enrollment pe where pe.archived = 0) and pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
  Page<PatientInfo> findFemalePerson(Integer archived, Long facilityId, Pageable pageable);


  List<PMTCTEnrollment> getAllByPersonUuid(String personUuid);
}
