package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.dto.HTSPatient;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;

public interface PMTCTEnrollmentReporsitory extends CommonJpaRepository<PMTCTEnrollment, Long> {
  PMTCTEnrollment findByAncNo(String ancNo);

  Optional  <PMTCTEnrollment> getByAncNo(String ancNo);

  Optional<PMTCTEnrollment> getByPersonUuid(String personUuid);


  PMTCTEnrollment findByPersonUuidAndArchived(String personUuid, Long archived);
  PMTCTEnrollment getPMTCTEnrollmentById(Long id);

  PMTCTEnrollment findPMTCTEnrollmentByPersonUuid(String personUuid);




  @Query(value = "SELECT pa.entry_point AS entryPoint, pa.tb_status AS tbStatus, pa.anc_no AS ancNo, pa.art_start_date AS ArtStartDate, date_of_birth AS dateOfBirth, pp.id AS personId, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS Id, pa.hiv_status AS hivStatus, sex,first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_enrollment pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5 ) ORDER BY pa.id desc", nativeQuery = true)
  Page<PatientPerson> getActiveOnPMTCT(Integer archived, Long facilityId, Pageable pageable);

  @Query(value = "SELECT pa.entry_point AS entryPoint, pa.tb_status AS tbStatus, pa.anc_no AS ancNo, pa.art_start_date AS ArtStartDate, date_of_birth AS dateOfBirth, pp.id AS personId, pp.uuid AS personUuid, pa.uuid AS uuid, pa.id AS Id, pa.hiv_status AS hivStatus, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber, CAST(address AS TEXT) AS address, CAST(contact_point AS TEXT) AS contactPoint FROM patient_person pp INNER JOIN pmtct_enrollment pa ON (pp.uuid=pa.person_uuid and pa.archived=0) WHERE (first_name ilike ?1 OR surname ilike ?1 OR other_name ilike ?1 OR full_name ilike ?1 OR pp.hospital_number ilike ?1) AND pp.archived=?2 AND pp.facility_id=?3 AND pp.sex ilike 'FEMALE' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 5 ) ORDER BY pa.id desc", nativeQuery = true)
  Page<PatientPerson> getActiveOnPMTCTBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

  @Query(value = "SELECT active, deceased_date_time, deceased, date_of_registration AS dateOfRegistration, CAST(identifier AS TEXT) AS identifier, CAST(education AS TEXT) AS education, CAST(employment_status AS TEXT) AS employmentStatus, CAST(marital_status AS TEXT) AS maritalStatus, CAST(gender AS TEXT) AS gender, CAST(organization AS TEXT) AS organization, CAST(contact_point AS TEXT) AS contactPoint, CAST(address AS TEXT) AS address,CAST(contact AS TEXT) AS contact, is_date_of_birth_estimated AS isDateOfBirthEstimated, facility_id AS facilityId, emr_id AS emrId, nin_number AS niNumber, date_of_birth AS dateOfBirth, pp.id, pp.uuid, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber FROM patient_person pp WHERE pp.archived = ?2 AND pp.facility_id = ?3 AND UPPER(pp.sex) = 'FEMALE' AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 5 AND NOT EXISTS ( SELECT 1 FROM pmtct_anc pa WHERE pa.person_uuid = pp.uuid AND pa.archived = ?2 ) AND NOT EXISTS ( SELECT 1 FROM pmtct_enrollment pe WHERE pe.person_uuid = pp.uuid AND pe.archived = ?2 )  AND  (pp.first_name ilike ?1 OR pp.surname ilike ?1 OR pp.other_name ilike ?1 OR pp.full_name ilike ?1 OR pp.hospital_number ilike ?1) ORDER BY pp.id DESC", nativeQuery = true)
  Page<PatientInfo> findFemalePersonBySearchParameters(String queryParam, Integer archived, Long facilityId, Pageable pageable);

  //@Query(value = "SELECT * FROM patient_person pp WHERE pp.archived=?1 AND pp.facility_id=?2 AND pp.sex ilike '%FEMALE%' AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10 ) ORDER BY pp.id desc", nativeQuery = true)
  @Query(value = "SELECT active, deceased_date_time, deceased, date_of_registration AS dateOfRegistration, CAST(identifier AS TEXT) AS identifier, CAST(education AS TEXT) AS education, CAST(employment_status AS TEXT) AS employmentStatus, CAST(marital_status AS TEXT) AS maritalStatus, CAST(gender AS TEXT) AS gender, CAST(organization AS TEXT) AS organization, CAST(contact_point AS TEXT) AS contactPoint, CAST(address AS TEXT) AS address,CAST(contact AS TEXT) AS contact, is_date_of_birth_estimated AS isDateOfBirthEstimated, facility_id AS facilityId, emr_id AS emrId, nin_number AS niNumber, date_of_birth AS dateOfBirth, pp.id, pp.uuid, sex, first_name AS firstName, surname, other_name AS otherName, full_name AS fullName, pp.hospital_number AS hospitalNumber FROM patient_person pp WHERE pp.archived = ?1 AND pp.facility_id = ?2 AND UPPER(pp.sex) = 'FEMALE' AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 5 AND NOT EXISTS ( SELECT 1 FROM pmtct_anc pa WHERE pa.person_uuid = pp.uuid AND pa.archived = ?1 ) AND NOT EXISTS ( SELECT 1 FROM pmtct_enrollment pe WHERE pe.person_uuid = pp.uuid AND pe.archived = ?1 )  ORDER BY pp.id DESC", nativeQuery = true)
  Page<PatientInfo> findFemalePerson(Integer archived, Long facilityId, Pageable pageable);

  @Query(value = "SELECT CASE WHEN date_started IS NULL THEN date_of_registration ELSE date_started END AS artStartDate from hiv_enrollment WHERE person_uuid = ?1 AND facility_id = ?2 AND archived = 0", nativeQuery = true)
  List<PatientArtData> getArtDate (String personUuid, Long facilityId);


  @Query(value = "SELECT currentViralLoad, dateOfCurrentViralLoad FROM (\n" +
          "SELECT personUuid, vlFacility, vlArchived, currentViralLoad, dateOfCurrentViralLoad FROM (\n" +
          "         SELECT CAST(ls.date_sample_collected AS DATE ) AS dateOfCurrentViralLoadSample, sm.patient_uuid as personUuid , sm.facility_id as vlFacility, sm.archived as vlArchived, acode.display as viralLoadIndication, sm.result_reported as currentViralLoad,CAST(sm.date_result_reported AS DATE) as dateOfCurrentViralLoad\n" +
          "         FROM public.laboratory_result  sm\n" +
          "      INNER JOIN public.laboratory_test  lt on sm.test_id = lt.id\n" +
          "  INNER JOIN public.laboratory_sample ls on ls.test_id = lt.id\n" +
          "      INNER JOIN public.base_application_codeset  acode on acode.id =  lt.viral_load_indication\n" +
          "         WHERE lt.lab_test_id = 16\n" +
          "           AND  lt.viral_load_indication !=719\n" +
          "           AND sm. date_result_reported IS NOT NULL\n" +
          "           AND sm.result_reported is NOT NULL\n" +
          "     )as vl_result\n" +
          "   WHERE (vl_result.vlArchived = 0 OR vl_result.vlArchived is null)\n" +
          "   \tAND personUuid = ?1 AND dateOfCurrentViralLoad = ?2\n" +
          "     AND  vl_result.vlFacility = ?3 ORDER BY dateOfCurrentViralLoadSample DESC LIMIT 1\n" +
          "\t ) lab", nativeQuery = true)
  List <SingleResultProjectionDTO> findByPatientUuidAndDateResultReceived(String patientUuid, LocalDateTime dateResultReceived, Long facilityId);


  List<PMTCTEnrollment> getAllByPersonUuid(String personUuid);

  @Query(nativeQuery = true, value = "SELECT h.hiv_test_result FROM patient_person p\n" +
          "LEFT JOIN hts_client h on h.person_uuid = p.uuid\n" +
          "WHERE hiv_test_result IS NOT NULL \n" +
          "AND h.person_uuid IS NOT NULL \n" +
          "AND p.hospital_number = ?1 \n" +
          "AND p.uuid = ?2 ORDER BY h.date_created DESC LIMIT 1 ")
  String getHtsClientHivStatus(String hospitalNumber, String personUuid);

  @Query(value = "select date_of_delivery from pmtct_enrollment where person_uuid =?1", nativeQuery = true)
  String getDateOfDelivery(String personUuid);


  @Query(value = "SELECT * FROM public.pmtct_enrollment WHERE hiv_status = :hivStatus OR entry_point = :entryPoint", nativeQuery = true)
  List<PMTCTEnrollment> findByHivStatusOrEntryPoint(String hivStatus, String entryPoint);

  @Query(value = "SELECT * FROM public.pmtct_delivery WHERE Person_uuid = :personUuid", nativeQuery = true)
  DeliveryResponseDto findDeliveryByPersonUuid(String personUuid);

  @Query(value = "select * from pmtct_enrollment where Person_uuid = :personUuid", nativeQuery = true)
  PMTCTEnrollment findBypersonuuid(String personUuid);


  @Query(value = "SELECT  testing_setting  FROM public.hts_client WHERE client_code = ?1 ", nativeQuery = true)
  String checkSettingOnHts(String client_code);

  @Query(value = "SELECT hiv_test_result  FROM public.hts_client WHERE client_code = ?1 ", nativeQuery = true)
  String checkresultOnHts(String client_code);

  @Query(value = "SELECT person_uuid FROM public.hts_client WHERE client_code = ?1", nativeQuery = true)
  String checkPatientOnHts(String clientCode);


//
//  @Query(value = "SELECT full_name  AS fullName, age, uuid, date_of_birth as dateOfBirth, hospital_number as hospitalNumber, gender   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
//  Optional<PatientRec> findPatientInfo(String personUuid);



  @Query(value = "SELECT full_name   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientName(String personUuid);

  @Query(value = "SELECT hospital_number   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientHos(String personUuid);

  @Query(value = "SELECT date_of_birth   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientDOB(String personUuid);

//  @Query(value = "  SELECT EXISTS (SELECT 1 FROM pmtct_enrollment WHERE person_uuid = ?1)", nativeQuery = true)
//  boolean findPMTCTPatient(String personUuid);


//  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_anc WHERE person_uuid = ?1 )", nativeQuery = true)
//  boolean checkForInfantHighRisk (String personUuid);


  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_anc WHERE person_uuid = ?1 )", nativeQuery = true)
  boolean checkPatientOnANC(String personUuid);

  @Modifying
  @Transactional
  @Query(value = "UPDATE public.pmtct_enrollment SET lmp = CAST(?1 AS DATE ) WHERE person_uuid = ?2", nativeQuery = true)
  void updateLmp(LocalDate lmp , String personUuid);

  @Query(value = "SELECT pmtct_enrollment_date FROM public.pmtct_enrollment WHERE person_uuid = ?1", nativeQuery = true)
  LocalDate getPmtctEnrollmentDate(String personUuid);

  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_enrollment WHERE person_uuid = ?1 )", nativeQuery = true)
  boolean checkPatientOnPMTCT(String personUuid);
  @Modifying
  @Transactional
  @Query(value = "UPDATE public.pmtct_enrollment SET lmp = ?1 WHERE person_uuid = ?2", nativeQuery = true)
  void updateTheGA(Long gaweeks , String personUuid);





  @Query(value = "select art_start_time from pmtct_enrollment WHERE person_uuid = ?1 LIMIT 1", nativeQuery = true)
  String getMotherARTInitial (String personUuid);

  @Query(value = "SELECT rom_delivery_interval FROM public.pmtct_delivery WHERE person_uuid =?1 ", nativeQuery = true)
  String checkRuptureMembraneAt4hrs (String personUuid);

  @Query(value = "SELECT  infant_arv_type  from pmtct_infant_arv WHERE uuid =?1  OR unique_uuid = ?1  ORDER BY id DESC LIMIT 1", nativeQuery = true)
  String getNVPandAZT (String personUuid);

  @Query(value = "SELECT result_reported FROM laboratory_result  WHERE  patient_uuid = ?1 ORDER BY date_result_reported DESC LIMIT 1", nativeQuery = true)
  String getMotherVL (String personUuid);

}
