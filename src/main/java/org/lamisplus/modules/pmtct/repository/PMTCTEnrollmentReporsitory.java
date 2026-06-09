package org.lamisplus.modules.pmtct.repository;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;

import javax.transaction.Transactional;

public interface PMTCTEnrollmentReporsitory extends CommonJpaRepository<PMTCTEnrollment, String> {
  @Query(value = "SELECT * FROM pmtct_enrollment WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<PMTCTEnrollment> getByPatientUuid(String patientUuid);

  @Query(value = "SELECT * FROM pmtct_enrollment WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<PMTCTEnrollment> getByPatientUuidAndPmtctCycleId(String patientUuid, String pmtctCycleUuid);


  @Query(value = "SELECT * FROM pmtct_enrollment WHERE patient_uuid = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
  PMTCTEnrollment findByPatientUuidAndArchived(String patientUuid, Boolean archived);

  @Query(value = "SELECT * FROM pmtct_enrollment WHERE patient_uuid = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<PMTCTEnrollment> findLatestByPatientUuidAndArchived(String patientUuid, Boolean archived);

  PMTCTEnrollment getPMTCTEnrollmentById(Long id);

  PMTCTEnrollment findPMTCTEnrollmentByPatientUuid(String patientUuid);

  @Query(value = "SELECT * FROM pmtct_enrollment WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<PMTCTEnrollment> findLatestPMTCTEnrollmentByPatientUuid(String patientUuid);

  @Query(value = "SELECT hiv_status FROM pmtct_enrollment WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<String> findHivStatusByPatientUuid(String patientUuid);

  @Query(value = "SELECT * FROM pmtct_enrollment WHERE pmtct_cycle_uuid = ?1 AND archived = ?2 ORDER BY id DESC LIMIT 1", nativeQuery = true)
  Optional<PMTCTEnrollment> findByPmtctCycleIdAndArchived(String pmtctCycleUuid, Boolean archived);

  @Query(
          value =
                  "SELECT * FROM ( " +
                  "SELECT DISTINCT ON (pp.uuid) " +
                          "  pa.entry_point AS entryPoint, " +
                          "  pa.tb_status AS tbStatus, " +
                          "  (SELECT anc_no FROM pmtct_anc WHERE patient_uuid = pp.uuid AND pmtct_cycle_uuid = pa.pmtct_cycle_uuid AND archived = false ORDER BY id DESC LIMIT 1) AS ancNo, " +
                          "  pa.art_start_date AS artStartDate, " +
                          "  pp.date_of_birth AS dateOfBirth, " +
                          "  pp.id AS personId, " +
                          "  pp.uuid AS patientUuid, " +
                          "  pa.uuid AS uuid, " +
                          "  pa.id AS id, " +
                          "  pa.hiv_status AS hivStatus, " +
                          "  pp.sex, " +
                          "  pp.first_name AS firstName, " +
                          "  pp.surname, " +
                          "  pp.other_name AS otherName, " +
                          "  pp.full_name AS fullName, " +
                          "  pp.hospital_number AS hospitalNumber, " +
                          "  CAST(pp.address AS TEXT) AS address, " +
                          "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                          "  COALESCE( ( " +
                          "     SELECT COUNT(*) FROM pmtct_pregnancy_cycle ppc " +
                          "     WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "  ), 0) AS pregnancyCount " +
                          "FROM patient_person pp " +
                          "INNER JOIN ( " +
                          "  SELECT DISTINCT ON (patient_uuid, pmtct_cycle_uuid) * " +
                          "  FROM pmtct_enrollment " +
                          "  WHERE archived = false " +
                          "  ORDER BY patient_uuid, pmtct_cycle_uuid, id DESC " +
                          ") pa ON pp.uuid = pa.patient_uuid " +
                          "  AND pa.pmtct_cycle_uuid = ( " +
                          "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                          "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                          "  ) " +
                          "WHERE pp.archived = 0 " +
                          "  AND pp.facility_id = ?1 " +
                          "  AND pp.sex ILIKE 'FEMALE' " +
                          "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10) " +
                          "ORDER BY pp.uuid, pa.id DESC " +
                  ") AS subquery ORDER BY id DESC",
          countQuery =
                  "SELECT COUNT(DISTINCT pp.uuid) " +
                          "FROM patient_person pp " +
                          "INNER JOIN pmtct_enrollment pa ON pp.uuid = pa.patient_uuid AND pa.archived = false " +
                          "  AND pa.pmtct_cycle_uuid = ( " +
                          "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                          "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                          "  ) " +
                          "WHERE pp.archived = 0 " +
                          "  AND pp.facility_id = ?1 " +
                          "  AND pp.sex ILIKE 'FEMALE' " +
                          "  AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10)",
          nativeQuery = true
  )
  Page<PatientPerson> getActiveOnPMTCT(Long facilityId, Pageable pageable);


  @Query(
          value =
                  "SELECT * FROM ( " +
                  "SELECT DISTINCT ON (pp.uuid) " +
                          "  pa.entry_point AS entryPoint, " +
                          "  pa.tb_status AS tbStatus, " +
                          "  (SELECT anc_no FROM pmtct_anc WHERE patient_uuid = pp.uuid AND pmtct_cycle_uuid = pa.pmtct_cycle_uuid AND archived = false ORDER BY id DESC LIMIT 1) AS ancNo, " +
                          "  pa.art_start_date AS artStartDate, " +
                          "  pp.date_of_birth AS dateOfBirth, " +
                          "  pp.id AS personId, " +
                          "  pp.uuid AS patientUuid, " +
                          "  pa.uuid AS uuid, " +
                          "  pa.id AS id, " +
                          "  pa.hiv_status AS hivStatus, " +
                          "  pp.sex, " +
                          "  pp.first_name AS firstName, " +
                          "  pp.surname, " +
                          "  pp.other_name AS otherName, " +
                          "  pp.full_name AS fullName, " +
                          "  pp.hospital_number AS hospitalNumber, " +
                          "  CAST(pp.address AS TEXT) AS address, " +
                          "  CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                          "  COALESCE( ( " +
                          "     SELECT COUNT(*) FROM pmtct_pregnancy_cycle ppc " +
                          "     WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "  ), 0) AS pregnancyCount " +
                          "FROM patient_person pp " +
                          "INNER JOIN ( " +
                          "  SELECT DISTINCT ON (patient_uuid, pmtct_cycle_uuid) * " +
                          "  FROM pmtct_enrollment " +
                          "  WHERE archived = false " +
                          "  ORDER BY patient_uuid, pmtct_cycle_uuid, id DESC " +
                          ") pa ON pp.uuid = pa.patient_uuid " +
                          "  AND pa.pmtct_cycle_uuid = ( " +
                          "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                          "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                          "  ) " +
                          "WHERE ( " +
                          "   pp.first_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.surname ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.other_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.full_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.hospital_number ILIKE CONCAT('%', ?1, '%') " +
                          ") " +
                          "AND pp.archived = 0 " +
                          "AND pp.facility_id = ?2 " +
                          "AND pp.sex ILIKE 'FEMALE' " +
                          "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10) " +
                          "ORDER BY pp.uuid, pa.id DESC " +
                  ") AS subquery ORDER BY id DESC",
          countQuery =
                  "SELECT COUNT(DISTINCT pp.uuid) " +
                          "FROM patient_person pp " +
                          "INNER JOIN pmtct_enrollment pa ON pp.uuid = pa.patient_uuid AND pa.archived = false " +
                          "  AND pa.pmtct_cycle_uuid = ( " +
                          "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
                          "    WHERE ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "    ORDER BY ppc.created_date DESC LIMIT 1 " +
                          "  ) " +
                          "WHERE ( " +
                          "   pp.first_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.surname ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.other_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.full_name ILIKE CONCAT('%', ?1, '%') OR " +
                          "   pp.hospital_number ILIKE CONCAT('%', ?1, '%') " +
                          ") " +
                          "AND pp.archived = 0 " +
                          "AND pp.facility_id = ?2 " +
                          "AND pp.sex ILIKE 'FEMALE' " +
                          "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth) >= 10)",
          nativeQuery = true
  )
  Page<PatientPerson> getActiveOnPMTCTBySearchParameters(String queryParam, Long facilityId, Pageable pageable);


//  PMTCT FROM PERSON
@Query(
        value =
                "SELECT " +
                        "pp.active, " +
                        "pp.deceased_date_time, " +
                        "pp.deceased, " +
                        "pp.date_of_registration AS dateOfRegistration, " +
                        "CAST(pp.identifier AS TEXT) AS identifier, " +
                        "CAST(pp.education AS TEXT) AS education, " +
                        "CAST(pp.employment_status AS TEXT) AS employmentStatus, " +
                        "CAST(pp.marital_status AS TEXT) AS maritalStatus, " +
                        "CAST(pp.gender AS TEXT) AS gender, " +
                        "CAST(pp.organization AS TEXT) AS organization, " +
                        "CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                        "CAST(pp.address AS TEXT) AS address, " +
                        "CAST(pp.contact AS TEXT) AS contact, " +
                        "pp.is_date_of_birth_estimated AS isDateOfBirthEstimated, " +
                        "pp.facility_id AS facilityId, " +
                        "pp.emr_id AS emrId, " +
                        "pp.nin_number AS ninNumber, " +
                        "pp.date_of_birth AS dateOfBirth, " +
                        "pp.id, " +
                        "pp.uuid, " +
                        "pp.sex, " +
                        "pp.first_name AS firstName, " +
                        "pp.surname, " +
                        "pp.other_name AS otherName, " +
                        "pp.full_name AS fullName, " +
                        "pp.hospital_number AS hospitalNumber, " +
                        "COUNT(DISTINCT ppc.uuid) AS pregnancyCount, " +
                        "CASE WHEN COUNT(ppc.uuid) > 0 THEN TRUE ELSE FALSE END AS hasExistingEnrollment, " +
                        "(SELECT maternal_outcome FROM pmtct_pregnancy_cycle " +
                        "WHERE patient_uuid = pp.uuid AND archived = false " +
                        "ORDER BY id DESC LIMIT 1) AS maternalOutcome, " +
                        "(SELECT visit_status FROM pmtct_pregnancy_cycle " +
                        "WHERE patient_uuid = pp.uuid AND archived = false " +
                        "ORDER BY id DESC LIMIT 1) AS visitStatus " +
                        "FROM patient_person pp " +
                        "LEFT JOIN pmtct_anc pa ON pa.patient_uuid = pp.uuid AND pa.archived = false " +
                        "LEFT JOIN pmtct_enrollment pe ON pe.patient_uuid = pp.uuid AND pe.archived = false " +
                        "LEFT JOIN pmtct_pregnancy_cycle ppc ON ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                        "WHERE pp.archived = 0 " +
                        "AND pp.facility_id = ?2 " +
                        "AND UPPER(pp.sex) = 'FEMALE' " +
                        "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 10 " +
                        "AND (" +
                        "  pp.first_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.surname ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.other_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.full_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.hospital_number ILIKE CONCAT('%', ?1, '%')" +
                        ") " +
                        "GROUP BY " +
                        "pp.id, pp.active, pp.deceased_date_time, pp.deceased, " +
                        "pp.date_of_registration, pp.identifier, pp.education, " +
                        "pp.employment_status, pp.marital_status, pp.gender, " +
                        "pp.organization, pp.contact_point, pp.address, pp.contact, " +
                        "pp.is_date_of_birth_estimated, pp.facility_id, pp.emr_id, " +
                        "pp.nin_number, pp.date_of_birth, pp.uuid, pp.sex, " +
                        "pp.first_name, pp.surname, pp.other_name, pp.full_name, pp.hospital_number " +
                        "ORDER BY pp.id DESC",
        countQuery =
                "SELECT COUNT(DISTINCT pp.uuid) " +
                        "FROM patient_person pp " +
                        "LEFT JOIN pmtct_anc pa ON pa.patient_uuid = pp.uuid AND pa.archived = false " +
                        "LEFT JOIN pmtct_enrollment pe ON pe.patient_uuid = pp.uuid AND pe.archived = false " +
                        "LEFT JOIN pmtct_pregnancy_cycle ppc ON ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                        "WHERE pp.archived = 0 " +
                        "AND pp.facility_id = ?2 " +
                        "AND UPPER(pp.sex) = 'FEMALE' " +
                        "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 10 " +
                        "AND (" +
                        "  pp.first_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.surname ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.other_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.full_name ILIKE CONCAT('%', ?1, '%') OR " +
                        "  pp.hospital_number ILIKE CONCAT('%', ?1, '%')" +
                        ")",
        nativeQuery = true
)
Page<PatientInfo> findFemalePersonBySearchParameters(String queryParam, Long facilityId, Pageable pageable);

  @Query(
          value =
                  "SELECT " +
                          "pp.active, " +
                          "pp.deceased_date_time, " +
                          "pp.deceased, " +
                          "pp.date_of_registration AS dateOfRegistration, " +
                          "CAST(pp.identifier AS TEXT) AS identifier, " +
                          "CAST(pp.education AS TEXT) AS education, " +
                          "CAST(pp.employment_status AS TEXT) AS employmentStatus, " +
                          "CAST(pp.marital_status AS TEXT) AS maritalStatus, " +
                          "CAST(pp.gender AS TEXT) AS gender, " +
                          "CAST(pp.organization AS TEXT) AS organization, " +
                          "CAST(pp.contact_point AS TEXT) AS contactPoint, " +
                          "CAST(pp.address AS TEXT) AS address, " +
                          "CAST(pp.contact AS TEXT) AS contact, " +
                          "pp.is_date_of_birth_estimated AS isDateOfBirthEstimated, " +
                          "pp.facility_id AS facilityId, " +
                          "pp.emr_id AS emrId, " +
                          "pp.nin_number AS ninNumber, " +
                          "pp.date_of_birth AS dateOfBirth, " +
                          "pp.id, " +
                          "pp.uuid, " +
                          "pp.sex, " +
                          "pp.first_name AS firstName, " +
                          "pp.surname, " +
                          "pp.other_name AS otherName, " +
                          "pp.full_name AS fullName, " +
                          "pp.hospital_number AS hospitalNumber, " +
                          "COUNT(DISTINCT ppc.uuid) AS pregnancyCount, " +
                          "CASE WHEN COUNT(ppc.uuid) > 0 THEN TRUE ELSE FALSE END AS hasExistingEnrollment, " +
                          "(SELECT maternal_outcome FROM pmtct_pregnancy_cycle " +
                          "WHERE patient_uuid = pp.uuid AND archived = false " +
                          "ORDER BY id DESC LIMIT 1) AS maternalOutcome, " +
                          "(SELECT visit_status FROM pmtct_pregnancy_cycle " +
                          "WHERE patient_uuid = pp.uuid AND archived = false " +
                          "ORDER BY id DESC LIMIT 1) AS visitStatus " +
                          "FROM patient_person pp " +
                          "LEFT JOIN pmtct_anc pa ON pa.patient_uuid = pp.uuid AND pa.archived = false " +
                          "LEFT JOIN pmtct_enrollment pe ON pe.patient_uuid = pp.uuid AND pe.archived = false " +
                          "LEFT JOIN pmtct_pregnancy_cycle ppc ON ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "WHERE pp.archived = 0 " +
                          "AND pp.facility_id = ?1 " +
                          "AND UPPER(pp.sex) = 'FEMALE' " +
                          "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 10 " +
                          "GROUP BY " +
                          "pp.id, pp.active, pp.deceased_date_time, pp.deceased, " +
                          "pp.date_of_registration, pp.identifier, pp.education, " +
                          "pp.employment_status, pp.marital_status, pp.gender, " +
                          "pp.organization, pp.contact_point, pp.address, pp.contact, " +
                          "pp.is_date_of_birth_estimated, pp.facility_id, pp.emr_id, " +
                          "pp.nin_number, pp.date_of_birth, pp.uuid, pp.sex, " +
                          "pp.first_name, pp.surname, pp.other_name, pp.full_name, pp.hospital_number " +
                          "ORDER BY pp.id DESC",
          countQuery =
                  "SELECT COUNT(DISTINCT pp.uuid) " +
                          "FROM patient_person pp " +
                          "LEFT JOIN pmtct_anc pa ON pa.patient_uuid = pp.uuid AND pa.archived = false " +
                          "LEFT JOIN pmtct_enrollment pe ON pe.patient_uuid = pp.uuid AND pe.archived = false " +
                          "LEFT JOIN pmtct_pregnancy_cycle ppc ON ppc.patient_uuid = pp.uuid AND ppc.archived = false " +
                          "WHERE pp.archived = 0 " +
                          "AND pp.facility_id = ?1 " +
                          "AND UPPER(pp.sex) = 'FEMALE' " +
                          "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 10",
          nativeQuery = true
  )
  Page<PatientInfo> findFemalePerson(Long facilityId, Pageable pageable);



  @Query(value = "SELECT hec.date_art_started AS artStartDate, hac.regimen_type_id AS regimenTypeId, CAST(hac.regimen_id AS BIGINT) AS regimenId, bac.display AS regimenName, he.unique_id AS uniqueArtNumber " +
          "FROM hiv_enrollment_commencement hec " +
          "LEFT JOIN hiv_art_clinical hac ON hac.person_uuid = hec.person_uuid AND hac.is_commencement = true AND hac.archived = 0 " +
          "LEFT JOIN base_application_codeset bac ON bac.id = CAST(hac.regimen_id AS INTEGER) " +
          "LEFT JOIN hiv_enrollment he ON he.person_uuid = hec.person_uuid AND he.archived = 0 " +
          "WHERE hec.person_uuid = ?1 AND hec.facility_id = ?2 AND hec.archived = 0 ORDER BY hec.id DESC LIMIT 1", nativeQuery = true)
  List<PatientArtData> getArtDate (String patientUuid, Long facilityId);


  @Query(value = "SELECT currentViralLoad, dateOfCurrentViralLoad FROM (\n" +
          "SELECT patientUuid, vlFacility, vlArchived, currentViralLoad, dateOfCurrentViralLoad FROM (\n" +
          "         SELECT CAST(ls.date_sample_collected AS DATE ) AS dateOfCurrentViralLoadSample, sm.patient_uuid as patientUuid , sm.facility_id as vlFacility, sm.archived as vlArchived, acode.display as viralLoadIndication, sm.result_reported as currentViralLoad,CAST(sm.date_result_reported AS DATE) as dateOfCurrentViralLoad\n" +
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
          "   \tAND patientUuid = ?1 AND dateOfCurrentViralLoad = ?2\n" +
          "     AND  vl_result.vlFacility = ?3 ORDER BY dateOfCurrentViralLoadSample DESC LIMIT 1\n" +
          "\t ) lab", nativeQuery = true)
  List <SingleResultProjectionDTO> findByPatientUuidAndDateResultReceived(String patientUuid, LocalDateTime dateResultReceived, Long facilityId);


  List<PMTCTEnrollment> getAllByPatientUuid(String patientUuid);

  @Query(nativeQuery = true, value = "SELECT h.hiv_test_result FROM patient_person p\n" +
          "LEFT JOIN hts_client h on h.person_uuid = p.uuid\n" +
          "WHERE hiv_test_result IS NOT NULL \n" +
          "AND h.person_uuid IS NOT NULL \n" +
          "AND p.hospital_number = ?1 \n" +
          "AND p.uuid = ?2 ORDER BY h.date_created DESC LIMIT 1 ")
  String getHtsClientHivStatus(String hospitalNumber, String patientUuid);

  @Query(value = "select date_of_delivery from pmtct_enrollment where patient_uuid =?1 AND pmtct_cycle_uuid =?2 AND archived = false ORDER BY created_date DESC LIMIT 1", nativeQuery = true)
  String getDateOfDelivery(String patientUuid, String pmtctCycleUuid);


  @Query(value = "SELECT * FROM public.pmtct_enrollment WHERE hiv_status = :hivStatus OR entry_point = :entryPoint", nativeQuery = true)
  List<PMTCTEnrollment> findByHivStatusOrEntryPoint(String hivStatus, String entryPoint);

  @Query(value = "SELECT * FROM public.pmtct_delivery WHERE patient_uuid = :patientUuid AND pmtct_cycle_uuid = :pmtctCycleUuid AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  DeliveryResponseDto findDeliveryByPatientUuidAndCycleId(String patientUuid, String pmtctCycleUuid);

  @Query(value = "select * from pmtct_enrollment where patient_uuid = :patientUuid", nativeQuery = true)
  PMTCTEnrollment findBypatientuuid(String patientUuid);


  @Query(value = "SELECT  testing_setting  FROM public.hts_client WHERE client_code = ?1 ", nativeQuery = true)
  String checkSettingOnHts(String client_code);

  @Query(value = "SELECT hiv_test_result  FROM public.hts_client WHERE client_code = ?1 ", nativeQuery = true)
  String checkresultOnHts(String client_code);

  @Query(value = "SELECT person_uuid FROM public.hts_client WHERE client_code = ?1", nativeQuery = true)
  String checkPatientOnHts(String clientCode);


//
//  @Query(value = "SELECT full_name  AS fullName, age, uuid, date_of_birth as dateOfBirth, hospital_number as hospitalNumber, gender   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
//  Optional<PatientRec> findPatientInfo(String patientUuid);



  @Query(value = "SELECT full_name   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientName(String patientUuid);

  @Query(value = "SELECT hospital_number   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientHos(String patientUuid);

  @Query(value = "SELECT date_of_birth   FROM public.patient_person WHERE uuid = ?1 ", nativeQuery = true)
  String findPatientDOB(String patientUuid);

//  @Query(value = "  SELECT EXISTS (SELECT 1 FROM pmtct_enrollment WHERE patient_uuid = ?1)", nativeQuery = true)
//  boolean findPMTCTPatient(String patientUuid);


//  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_anc WHERE patient_uuid = ?1 )", nativeQuery = true)
//  boolean checkForInfantHighRisk (String patientUuid);


  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_anc WHERE patient_uuid = ?1 AND archived = false )", nativeQuery = true)
  boolean checkPatientOnANC(String patientUuid);

  @Modifying
  @Transactional
  @Query(value = "UPDATE public.pmtct_enrollment SET lmp = CAST(?1 AS DATE ) WHERE patient_uuid = ?2", nativeQuery = true)
  void updateLmp(LocalDate lmp , String patientUuid);

  @Query(value = "SELECT pmtct_enrollment_date FROM public.pmtct_enrollment WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  LocalDate getPmtctEnrollmentDate(String patientUuid, String pmtctCycleUuid);

  @Query(value = "SELECT pmtct_enrollment_date FROM public.pmtct_enrollment WHERE patient_uuid = ?1 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  LocalDate getLatestPmtctEnrollmentDate(String patientUuid);

  @Query(value = "SELECT pmtct_enrollment_date FROM public.pmtct_enrollment WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  LocalDate getInitialVisitDate(String patientUuid, String pmtctCycleUuid);

  @Query(value = "SELECT EXISTS (SELECT 1 FROM public.pmtct_enrollment WHERE patient_uuid = ?1 AND archived = false )", nativeQuery = true)
  boolean checkPatientOnPMTCT(String patientUuid);
  @Modifying
  @Transactional
  @Query(value = "UPDATE public.pmtct_enrollment SET lmp = ?1 WHERE patient_uuid = ?2", nativeQuery = true)
  void updateTheGA(Long gaweeks , String patientUuid);





  @Query(value = "select art_start_time from pmtct_enrollment WHERE patient_uuid = ?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
  String getMotherARTInitial (String patientUuid, String pmtctCycleUuid);

    @Query(value = "SELECT rom_delivery_interval FROM public.pmtct_delivery WHERE patient_uuid =?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    String checkRuptureMembraneAt4hrs (String patientUuid, String pmtctCycleUuid);

    @Query(value = "SELECT  infant_arv_type  from pmtct_infant_arv WHERE mother_patient_uuid =?1 AND pmtct_cycle_uuid = ?2 AND archived = false ORDER BY id DESC LIMIT 1", nativeQuery = true)
    String getNVPandAZT (String patientUuid, String pmtctCycleUuid);

    @Query(value = "SELECT result_reported FROM laboratory_result  WHERE  patient_uuid = ?1 ORDER BY date_result_reported DESC LIMIT 1", nativeQuery = true)
    String getMotherVL (String patientUuid);

    // Statistics queries

    // Total female patients >= 10 years
    @Query(value = "SELECT COUNT(DISTINCT pp.uuid) FROM patient_person pp " +
            "WHERE pp.archived = 0 " +
            "AND pp.facility_id = ?1 " +
            "AND UPPER(pp.sex) = 'FEMALE' " +
            "AND (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM pp.date_of_birth)) >= 10", nativeQuery = true)
    Long getTotalFemalePatients(Long facilityId);

    // Total ANC patients with enrollment date not blank
    @Query(value = "SELECT COUNT(DISTINCT pa.patient_uuid) FROM pmtct_anc pa " +
            "WHERE pa.archived = false " +
            "AND pa.facility_id = ?1 " +
            "AND pa.date_of_enrollment IS NOT NULL", nativeQuery = true)
    Long getTotalANCPatients(Long facilityId);

    // Total PMTCT patients with enrollment date not blank
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL", nativeQuery = true)
    Long getTotalPMTCTPatients(Long facilityId);

    // PMTCT Viral Load Numerator: HIV+ pregnant women on ART with VL result documented
    // Date of Viral load >= Date of PMTCT Enrollment
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date", nativeQuery = true)
    Long getPMTCTViralLoadNumerator(Long facilityId);

    // PMTCT Viral Load Denominator: HIV+ pregnant women enrolled on ART
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN hiv_art_clinical hac ON hac.person_uuid = pe.patient_uuid " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND hac.archived = 0", nativeQuery = true)
    Long getPMTCTViralLoadDenominator(Long facilityId);

    // Viral Suppression Numerator: HIV+ pregnant women on ART with VL result < 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) < 1000", nativeQuery = true)
    Long getViralSuppressionNumerator(Long facilityId);

    // Unsuppressed Total: HIV+ pregnant women on ART with VL result >= 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) >= 1000", nativeQuery = true)
    Long getUnsuppressedTotal(Long facilityId);

    // Unsuppressed Q1 (Oct-Dec): HIV+ pregnant women on ART with VL result >= 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) >= 1000 " +
            "AND EXTRACT(MONTH FROM lr.date_result_reported) IN (10, 11, 12)", nativeQuery = true)
    Long getUnsuppressedQ1(Long facilityId);

    // Unsuppressed Q2 (Jan-Mar): HIV+ pregnant women on ART with VL result >= 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) >= 1000 " +
            "AND EXTRACT(MONTH FROM lr.date_result_reported) IN (1, 2, 3)", nativeQuery = true)
    Long getUnsuppressedQ2(Long facilityId);

    // Unsuppressed Q3 (Apr-Jun): HIV+ pregnant women on ART with VL result >= 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) >= 1000 " +
            "AND EXTRACT(MONTH FROM lr.date_result_reported) IN (4, 5, 6)", nativeQuery = true)
    Long getUnsuppressedQ3(Long facilityId);

    // Unsuppressed Q4 (Jul-Sep): HIV+ pregnant women on ART with VL result >= 1000 c/ml
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN laboratory_result lr ON lr.patient_uuid = pe.patient_uuid " +
            "INNER JOIN laboratory_test lt ON lt.id = lr.test_id " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND lt.lab_test_id = 16 " +
            "AND lr.result_reported IS NOT NULL " +
            "AND lr.date_result_reported IS NOT NULL " +
            "AND CAST(lr.date_result_reported AS DATE) >= pe.pmtct_enrollment_date " +
            "AND REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') ~ '^[0-9]*\\.?[0-9]+$' " +
            "AND CAST(REGEXP_REPLACE(TRIM(lr.result_reported), '[^0-9.]', '', 'g') AS NUMERIC) >= 1000 " +
            "AND EXTRACT(MONTH FROM lr.date_result_reported) IN (7, 8, 9)", nativeQuery = true)
    Long getUnsuppressedQ4(Long facilityId);

    // PMTCT Exit Tracked - Active in PMTCT Cohort (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%ACTIVE%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitActiveInCohort(Long facilityId);

    // PMTCT Exit Tracked - Transferred Out (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%TRANSFERRED OUT%' " +
            "AND UPPER(ppc.maternal_outcome) NOT LIKE '%ANOTHER PMTCT%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitTransferredOut(Long facilityId);

    // PMTCT Exit Tracked - Transferred to another PMTCT cohort (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%ANOTHER PMTCT%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitTransferredToAnotherPMTCT(Long facilityId);

    // PMTCT Exit Tracked - Transitioned to ART clinic (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%TRANSITIONED%ART%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitTransitionedToART(Long facilityId);

    // PMTCT Exit Tracked - Lost to follow-up (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%LOST%FOLLOW%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitLostToFollowUp(Long facilityId);

    // PMTCT Exit Tracked - Dead (latest cycle, enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "INNER JOIN pmtct_enrollment pe ON pe.patient_uuid = ppc.patient_uuid AND pe.pmtct_cycle_uuid = ppc.uuid " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%DEAD%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false) " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitDead(Long facilityId);

    // PMTCT Exit Denominator - Total on PMTCT (enrollment > 24 months)
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL " +
            "AND pe.pmtct_enrollment_date <= CURRENT_DATE - INTERVAL '24 months'", nativeQuery = true)
    Long getPmtctExitDenominator(Long facilityId);

    // Mothers LTFU Numerator - HIV+ pregnant women with LTFU status (latest cycle)
    @Query(value = "SELECT COUNT(DISTINCT ppc.patient_uuid) FROM pmtct_pregnancy_cycle ppc " +
            "WHERE ppc.archived = false " +
            "AND ppc.facility_id = ?1 " +
            "AND UPPER(ppc.maternal_outcome) LIKE '%LOST%FOLLOW%' " +
            "AND ppc.id = (SELECT MAX(ppc2.id) FROM pmtct_pregnancy_cycle ppc2 WHERE ppc2.patient_uuid = ppc.patient_uuid AND ppc2.archived = false)", nativeQuery = true)
    Long getMothersLTFUNumerator(Long facilityId);

    // Mothers LTFU Denominator - HIV+ pregnant women on ART and PMTCT
    @Query(value = "SELECT COUNT(DISTINCT pe.patient_uuid) FROM pmtct_enrollment pe " +
            "INNER JOIN hiv_art_clinical hac ON hac.person_uuid = pe.patient_uuid AND hac.archived = 0 " +
            "WHERE pe.archived = false " +
            "AND pe.facility_id = ?1 " +
            "AND pe.pmtct_enrollment_date IS NOT NULL", nativeQuery = true)
    Long getMothersLTFUDenominator(Long facilityId);

    // Deliveries Total - date_of_delivery is not blank
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL", nativeQuery = true)
    Long getDeliveriesTotal(Long facilityId);

    // Deliveries Q1 (Oct-Dec)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (10, 11, 12)", nativeQuery = true)
    Long getDeliveriesQ1(Long facilityId);

    // Deliveries Q2 (Jan-Mar)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (1, 2, 3)", nativeQuery = true)
    Long getDeliveriesQ2(Long facilityId);

    // Deliveries Q3 (Apr-Jun)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (4, 5, 6)", nativeQuery = true)
    Long getDeliveriesQ3(Long facilityId);

    // Deliveries Q4 (Jul-Sep)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (7, 8, 9)", nativeQuery = true)
    Long getDeliveriesQ4(Long facilityId);

    // HEI Linked Total - live births (number_of_infants_alive - number_of_infants_dead >= 1)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND (COALESCE(pd.number_of_infants_alive, 0) - COALESCE(pd.number_of_infants_dead, 0)) >= 1", nativeQuery = true)
    Long getHEILinkedTotal(Long facilityId);

    // HEI Linked Q1 (Oct-Dec)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND (COALESCE(pd.number_of_infants_alive, 0) - COALESCE(pd.number_of_infants_dead, 0)) >= 1 " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (10, 11, 12)", nativeQuery = true)
    Long getHEILinkedQ1(Long facilityId);

    // HEI Linked Q2 (Jan-Mar)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND (COALESCE(pd.number_of_infants_alive, 0) - COALESCE(pd.number_of_infants_dead, 0)) >= 1 " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (1, 2, 3)", nativeQuery = true)
    Long getHEILinkedQ2(Long facilityId);

    // HEI Linked Q3 (Apr-Jun)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND (COALESCE(pd.number_of_infants_alive, 0) - COALESCE(pd.number_of_infants_dead, 0)) >= 1 " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (4, 5, 6)", nativeQuery = true)
    Long getHEILinkedQ3(Long facilityId);

    // HEI Linked Q4 (Jul-Sep)
    @Query(value = "SELECT COUNT(DISTINCT pd.id) FROM pmtct_delivery pd " +
            "WHERE pd.archived = false " +
            "AND pd.facility_id = ?1 " +
            "AND pd.date_of_delivery IS NOT NULL " +
            "AND (COALESCE(pd.number_of_infants_alive, 0) - COALESCE(pd.number_of_infants_dead, 0)) >= 1 " +
            "AND EXTRACT(MONTH FROM pd.date_of_delivery) IN (7, 8, 9)", nativeQuery = true)
    Long getHEILinkedQ4(Long facilityId);

    // Infant Tested: Count distinct infants tested (PCR or Rapid Antibody)
    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM ( " +
            "SELECT infant_hospital_number FROM pmtct_infant_pcr " +
            "WHERE archived = false " +
            "AND facility_id = ?1 " +
            "AND infant_hospital_number IS NOT NULL " +
            "AND infant_hospital_number != '' " +
            "UNION " +
            "SELECT iv.infant_hospital_number FROM pmtct_infant_rapid_antibody ra " +
            "INNER JOIN pmtct_infant_visit iv ON ra.unique_uuid = iv.uuid " +
            "WHERE ra.archived = false " +
            "AND ra.facility_id = ?1 " +
            "AND iv.infant_hospital_number IS NOT NULL " +
            "AND iv.infant_hospital_number != '' " +
            ") AS all_infants", nativeQuery = true)
    Long getInfantTested(Long facilityId);

    // Infant Positive: Count distinct infants with positive results (case-sensitive)
    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM ( " +
            "SELECT infant_hospital_number FROM pmtct_infant_pcr " +
            "WHERE archived = false " +
            "AND facility_id = ?1 " +
            "AND infant_hospital_number IS NOT NULL " +
            "AND infant_hospital_number != '' " +
            "AND results = 'positive' " +
            "UNION " +
            "SELECT iv.infant_hospital_number FROM pmtct_infant_rapid_antibody ra " +
            "INNER JOIN pmtct_infant_visit iv ON ra.unique_uuid = iv.uuid " +
            "WHERE ra.archived = false " +
            "AND ra.facility_id = ?1 " +
            "AND iv.infant_hospital_number IS NOT NULL " +
            "AND iv.infant_hospital_number != '' " +
            "AND ra.result = 'positive' " +
            ") AS positive_infants", nativeQuery = true)
    Long getInfantPositive(Long facilityId);

    // Infant Negative: Count distinct infants with negative results (case-sensitive)
    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM ( " +
            "SELECT infant_hospital_number FROM pmtct_infant_pcr " +
            "WHERE archived = false " +
            "AND facility_id = ?1 " +
            "AND infant_hospital_number IS NOT NULL " +
            "AND infant_hospital_number != '' " +
            "AND results = 'negative' " +
            "UNION " +
            "SELECT iv.infant_hospital_number FROM pmtct_infant_rapid_antibody ra " +
            "INNER JOIN pmtct_infant_visit iv ON ra.unique_uuid = iv.uuid " +
            "WHERE ra.archived = false " +
            "AND ra.facility_id = ?1 " +
            "AND iv.infant_hospital_number IS NOT NULL " +
            "AND iv.infant_hospital_number != '' " +
            "AND ra.result = 'negative' " +
            ") AS negative_infants", nativeQuery = true)
    Long getInfantNegative(Long facilityId);

    // PMTCT Exit Tracked - Infants: HIV-positive at 18 months (from latest cycle)
    @Query(value = "SELECT COUNT(DISTINCT i.id) FROM pmtct_infant_information i " +
            "INNER JOIN pmtct_infant_visit iv ON iv.mother_patient_uuid = i.mother_patient_uuid " +
            "AND iv.pmtct_cycle_uuid = i.pmtct_cycle_uuid AND iv.archived = false " +
            "WHERE i.archived = false " +
            "AND i.facility_id = ?1 " +
            "AND UPPER(iv.infant_outcome_at18_months) LIKE '%POSITIVE%' " +
            "AND i.pmtct_cycle_uuid = ( " +
            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
            "    WHERE ppc.patient_uuid = i.mother_patient_uuid " +
            "    AND ppc.archived = false " +
            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
            ")", nativeQuery = true)
    Long getInfantExitHivPositive(Long facilityId);

    // PMTCT Exit Tracked - Infants: HIV-negative at 18 months (from latest cycle)
    @Query(value = "SELECT COUNT(DISTINCT i.id) FROM pmtct_infant_information i " +
            "INNER JOIN pmtct_infant_visit iv ON iv.mother_patient_uuid = i.mother_patient_uuid " +
            "AND iv.pmtct_cycle_uuid = i.pmtct_cycle_uuid AND iv.archived = false " +
            "WHERE i.archived = false " +
            "AND i.facility_id = ?1 " +
            "AND UPPER(iv.infant_outcome_at18_months) LIKE '%NEGATIVE%' " +
            "AND i.pmtct_cycle_uuid = ( " +
            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
            "    WHERE ppc.patient_uuid = i.mother_patient_uuid " +
            "    AND ppc.archived = false " +
            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
            ")", nativeQuery = true)
    Long getInfantExitHivNegative(Long facilityId);

    // PMTCT Exit Tracked - Infants: HIV status unknown at 18 months (from latest cycle)
    @Query(value = "SELECT COUNT(DISTINCT i.id) FROM pmtct_infant_information i " +
            "INNER JOIN pmtct_infant_visit iv ON iv.mother_patient_uuid = i.mother_patient_uuid " +
            "AND iv.pmtct_cycle_uuid = i.pmtct_cycle_uuid AND iv.archived = false " +
            "WHERE i.archived = false " +
            "AND i.facility_id = ?1 " +
            "AND UPPER(iv.infant_outcome_at18_months) LIKE '%UNKNOWN%' " +
            "AND i.pmtct_cycle_uuid = ( " +
            "    SELECT ppc.uuid FROM pmtct_pregnancy_cycle ppc " +
            "    WHERE ppc.patient_uuid = i.mother_patient_uuid " +
            "    AND ppc.archived = false " +
            "    ORDER BY ppc.created_date DESC LIMIT 1 " +
            ")", nativeQuery = true)
    Long getInfantExitHivUnknown(Long facilityId);

    // PMTCT Exit Tracked - Infants: Total HEI exposed infants registered (denominator)
    @Query(value = "SELECT COUNT(DISTINCT i.id) FROM pmtct_infant_information i " +
            "WHERE i.archived = false " +
            "AND i.facility_id = ?1", nativeQuery = true)
    Long getInfantExitDenominator(Long facilityId);

    // Key PMTCT Indicators - Pregnancy Cycles
    @Query(value = "SELECT COUNT(*) FROM pmtct_pregnancy_cycle WHERE archived = false AND facility_id = ?1", nativeQuery = true)
    Long getTotalPregnancyCycles(Long facilityId);

    @Query(value = "SELECT COUNT(*) FROM pmtct_pregnancy_cycle WHERE archived = false AND (is_closed = false OR is_closed IS NULL) AND facility_id = ?1", nativeQuery = true)
    Long getActivePregnancyCycles(Long facilityId);

    @Query(value = "SELECT COUNT(*) FROM pmtct_pregnancy_cycle WHERE archived = false AND is_closed = true AND facility_id = ?1", nativeQuery = true)
    Long getClosedPregnancyCycles(Long facilityId);

    // Key PMTCT Indicators - Visits
    @Query(value = "SELECT COUNT(*) FROM pmtct_anc WHERE archived = false AND facility_id = ?1", nativeQuery = true)
    Long getTotalANCVisits(Long facilityId);

    @Query(value = "SELECT COUNT(*) FROM pmtct_mother_visitation WHERE archived = false AND facility_id = ?1", nativeQuery = true)
    Long getTotalMotherVisits(Long facilityId);

    // Infant Information Summary
    @Query(value = "SELECT COUNT(*) FROM pmtct_infant_information WHERE archived = false AND facility_id = ?1", nativeQuery = true)
    Long getTotalInfantsRegistered(Long facilityId);

    @Query(value = "SELECT COUNT(*) FROM pmtct_infant_information WHERE archived = false AND facility_id = ?1 AND (birth_outcome IS NULL OR UPPER(birth_outcome) != 'DEAD')", nativeQuery = true)
    Long getInfantsAlive(Long facilityId);

    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM (SELECT ii.infant_hospital_number FROM pmtct_infant_information ii WHERE ii.archived = false AND ii.facility_id = ?1 AND ii.infant_arv_data IS NOT NULL AND ii.infant_arv_data->>'infantArvType' IS NOT NULL AND ii.infant_arv_data->>'infantArvType' != '' UNION SELECT iv.infant_hospital_number FROM pmtct_infant_visit iv WHERE iv.archived = false AND iv.facility_id = ?1 AND iv.infant_arv_data IS NOT NULL AND iv.infant_arv_data->>'infantArvType' IS NOT NULL AND iv.infant_arv_data->>'infantArvType' != '') combined", nativeQuery = true)
    Long getInfantsOnARV(Long facilityId);

    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM (SELECT ii.infant_hospital_number FROM pmtct_infant_information ii WHERE ii.archived = false AND ii.facility_id = ?1 AND ii.infant_pcr_data IS NOT NULL UNION SELECT iv.infant_hospital_number FROM pmtct_infant_visit iv WHERE iv.archived = false AND iv.facility_id = ?1 AND iv.infant_pcr_data IS NOT NULL) combined", nativeQuery = true)
    Long getInfantsWithPCRTest(Long facilityId);

    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM (SELECT ii.infant_hospital_number FROM pmtct_infant_information ii WHERE ii.archived = false AND ii.facility_id = ?1 AND ii.infant_pcr_data IS NOT NULL AND UPPER(ii.infant_pcr_data->>'results') LIKE '%POSITIVE%' UNION SELECT iv.infant_hospital_number FROM pmtct_infant_visit iv WHERE iv.archived = false AND iv.facility_id = ?1 AND iv.infant_pcr_data IS NOT NULL AND UPPER(iv.infant_pcr_data->>'results') LIKE '%POSITIVE%') combined", nativeQuery = true)
    Long getInfantsPCRPositive(Long facilityId);

    @Query(value = "SELECT COUNT(DISTINCT infant_hospital_number) FROM (SELECT ii.infant_hospital_number FROM pmtct_infant_information ii WHERE ii.archived = false AND ii.facility_id = ?1 AND ii.infant_pcr_data IS NOT NULL AND UPPER(ii.infant_pcr_data->>'results') LIKE '%NEGATIVE%' UNION SELECT iv.infant_hospital_number FROM pmtct_infant_visit iv WHERE iv.archived = false AND iv.facility_id = ?1 AND iv.infant_pcr_data IS NOT NULL AND UPPER(iv.infant_pcr_data->>'results') LIKE '%NEGATIVE%') combined", nativeQuery = true)
    Long getInfantsPCRNegative(Long facilityId);

    @Query(value = "SELECT COUNT(DISTINCT iv.infant_hospital_number) FROM pmtct_infant_visit iv WHERE iv.archived = false AND iv.facility_id = ?1 AND iv.rapid_test_data IS NOT NULL", nativeQuery = true)
    Long getInfantsWithRapidTest(Long facilityId);

    @Query(value = "SELECT COUNT(*) FROM pmtct_infant_information WHERE archived = false AND facility_id = ?1 AND UPPER(birth_outcome) = 'DEAD'", nativeQuery = true)
    Long getInfantsDeceased(Long facilityId);

}
