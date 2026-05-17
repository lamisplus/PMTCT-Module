package org.lamisplus.modules.pmtct.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PageDTO;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
//import org.lamisplus.modules.pmtct.projection.PatientPerson;
import org.lamisplus.modules.pmtct.domain.dto.PatientPerson;

import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Data
@Service
@RequiredArgsConstructor
public class PmtctHtsService {
    private final UserService userService;
    private final PersonRepository personRepository;
    private final PmtctHtsRepository pmtctHtsRepository;
    private final PmtctPregnancyCycleService pmtctPregnancyCycleService;
    private final PersonService personService;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
    private final PmtctPregnancyCycleRepository pmtctPregnancyCycleRepository;
    private final ANCRepository ancRepository;


    public PmtctHtsReponseDTO save(PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        System.out.println(pmtctHtsRequestDTO);
        return convertEntitytoRespondDto(converRequestDtotoEntity(pmtctHtsRequestDTO));
    }


    public PmtctHtsReponseDTO convertEntitytoRespondDto(PmtctHts pmtctHts) {
        PmtctHtsReponseDTO pmtctHtsReponseDTO = new PmtctHtsReponseDTO();
        pmtctHtsReponseDTO.setId(pmtctHts.getId());
        pmtctHtsReponseDTO.setDateOfHivTest(pmtctHts.getDateOfHivTest());
        pmtctHtsReponseDTO.setTestEntryPoint(pmtctHts.getTestEntryPoint());
        pmtctHtsReponseDTO.setTestSetting(pmtctHts.getTestSetting());
        pmtctHtsReponseDTO.setUuid(pmtctHts.getUuid());
        pmtctHtsReponseDTO.setInitialHivTest(pmtctHts.getInitialHivTest());
        pmtctHtsReponseDTO.setConfirmatoryHivTest(pmtctHts.getConfirmatoryHivTest());
        pmtctHtsReponseDTO.setStageOfPregnancy(pmtctHts.getStageOfPregnancy());
        pmtctHtsReponseDTO.setHepatitisC(pmtctHts.getHepatitisC());
        pmtctHtsReponseDTO.setHepatitisB(pmtctHts.getHepatitisB());
        pmtctHtsReponseDTO.setTestingType(pmtctHts.getTestingType());
        pmtctHtsReponseDTO.setSyphilis(pmtctHts.getSyphilis());
        pmtctHtsReponseDTO.setRetesting(pmtctHts.getRetesting());
        pmtctHtsReponseDTO.setFinalResult(pmtctHts.getFinalResult());

        pmtctHtsReponseDTO.setSource(pmtctHts.getSource());
        pmtctHtsReponseDTO.setPregnancyStatusAtEntry(pmtctHts.getPregnancyStatusAtEntry());
        pmtctHtsReponseDTO.setPreviouslyKnownHivPositive(pmtctHts.getPreviouslyKnownHivPositive());
        pmtctHtsReponseDTO.setEnrolledOnArt(pmtctHts.getEnrolledOnArt());
        pmtctHtsReponseDTO.setTypeOfHivTest(pmtctHts.getTypeOfHivTest());
        pmtctHtsReponseDTO.setHivEarlyDetect(pmtctHts.getHivEarlyDetect());
        pmtctHtsReponseDTO.setHivEarlyDetectViralLoad(pmtctHts.getHivEarlyDetectViralLoad());
        pmtctHtsReponseDTO.setConfirmatoryFromSpokes(pmtctHts.getConfirmatoryFromSpokes());
        pmtctHtsReponseDTO.setInitiatedOnProphylaxis(pmtctHts.getInitiatedOnProphylaxis());
        pmtctHtsReponseDTO.setTbReferred(pmtctHts.getTbReferred());
        pmtctHtsReponseDTO.setSyphilisInfo(pmtctHts.getSyphilisInfo());
        pmtctHtsReponseDTO.setHbvInfo(pmtctHts.getHbvInfo());
        pmtctHtsReponseDTO.setPartnerInfo(pmtctHts.getPartnerInfo());
        pmtctHtsReponseDTO.setTbScreeningStatus(pmtctHts.getTbScreeningStatus());
        pmtctHtsReponseDTO.setPmtctTestEntryPoint(pmtctHts.getPmtctTestEntryPoint());
        pmtctHtsReponseDTO.setViralLoadMonitoring(pmtctHts.getViralLoadMonitoring());
               try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctHts.getPatientUuid(), facilityId, 0);
            if (persons.isPresent()) {
                Person person = persons.get();
                pmtctHtsReponseDTO.setHospitalNumber(person.getHospitalNumber());
                pmtctHtsReponseDTO.setPatientUuid(person.getUuid());
                pmtctHtsReponseDTO.setFirstName(person.getFirstName());
                pmtctHtsReponseDTO.setSurname(person.getSurname());
                pmtctHtsReponseDTO.setOtherName(person.getOtherName());
                pmtctHtsReponseDTO.setSex(person.getSex());
                pmtctHtsReponseDTO.setDateOfBirth(person.getDateOfBirth());
                pmtctHtsReponseDTO.setAge(calculateAge(person.getDateOfBirth()));
                pmtctHtsReponseDTO.setFullName(person.getFullName());
                if (person.getAddress() != null) {
                    pmtctHtsReponseDTO.setAddress(person.getAddress().toString());
                }
                if (person.getContactPoint() != null) {
                    pmtctHtsReponseDTO.setContactPoint(person.getContactPoint().toString());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        return pmtctHtsReponseDTO;
    }

    public PmtctHts converRequestDtotoEntity(PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        PmtctHts pmtctHts = new PmtctHts();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        pmtctHts.setFacilityId(facilityId);
        pmtctHts.setDateOfHivTest(pmtctHtsRequestDTO.getDateOfHivTest());
        pmtctHts.setTestEntryPoint(pmtctHtsRequestDTO.getTestEntryPoint());
        pmtctHts.setTestSetting(pmtctHtsRequestDTO.getTestSetting());
        pmtctHts.setInitialHivTest(pmtctHtsRequestDTO.getInitialHivTest());
        pmtctHts.setUuid(UUID.randomUUID().toString());
        pmtctHts.setConfirmatoryHivTest(pmtctHtsRequestDTO.getConfirmatoryHivTest());
        pmtctHts.setStageOfPregnancy(pmtctHtsRequestDTO.getStageOfPregnancy());
        pmtctHts.setSyphilis(pmtctHtsRequestDTO.getSyphilis());
        pmtctHts.setHepatitisB(pmtctHtsRequestDTO.getHepatitisB());
        pmtctHts.setTestingType(pmtctHtsRequestDTO.getTestingType());
        pmtctHts.setHepatitisC(pmtctHtsRequestDTO.getHepatitisC());
        pmtctHts.setArchived(0L);
        pmtctHts.setPatientUuid(pmtctHtsRequestDTO.getPatientUuid());
        pmtctHts.setRetesting(pmtctHtsRequestDTO.getRetesting());
        pmtctHts.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
        pmtctHts.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
        pmtctHts.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
        pmtctHts.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
        pmtctHts.setPmtctCycleUuid(pmtctHtsRequestDTO.getPmtctCycleUuid());
        pmtctHts.setFacilityId(facilityId);
        pmtctHts.setCreatedBy(user.getUserName());
        pmtctHts.setLastModifiedBy(user.getUserName());
        pmtctHts.setCreatedDate(java.time.LocalDateTime.now());
        pmtctHts.setLastModifiedDate(java.time.LocalDateTime.now());
        pmtctHts.setSource(pmtctHtsRequestDTO.getSource());
        pmtctHts.setPregnancyStatusAtEntry(pmtctHtsRequestDTO.getPregnancyStatusAtEntry());
        pmtctHts.setPreviouslyKnownHivPositive(pmtctHtsRequestDTO.getPreviouslyKnownHivPositive());
        pmtctHts.setEnrolledOnArt(pmtctHtsRequestDTO.getEnrolledOnArt());
        pmtctHts.setTypeOfHivTest(pmtctHtsRequestDTO.getTypeOfHivTest());
        pmtctHts.setHivEarlyDetect(pmtctHtsRequestDTO.getHivEarlyDetect());
        pmtctHts.setHivEarlyDetectViralLoad(pmtctHtsRequestDTO.getHivEarlyDetectViralLoad());
        pmtctHts.setConfirmatoryFromSpokes(pmtctHtsRequestDTO.getConfirmatoryFromSpokes());
        pmtctHts.setInitiatedOnProphylaxis(pmtctHtsRequestDTO.getInitiatedOnProphylaxis());
        pmtctHts.setTbReferred(pmtctHtsRequestDTO.getTbReferred());
        pmtctHts.setSyphilisInfo(pmtctHtsRequestDTO.getSyphilisInfo());
        pmtctHts.setHbvInfo(pmtctHtsRequestDTO.getHbvInfo());
        pmtctHts.setPartnerInfo(pmtctHtsRequestDTO.getPartnerInfo());
        pmtctHts.setTbScreeningStatus(pmtctHtsRequestDTO.getTbScreeningStatus());
        pmtctHts.setPmtctTestEntryPoint(pmtctHtsRequestDTO.getPmtctTestEntryPoint());
        pmtctHts.setViralLoadMonitoring(pmtctHtsRequestDTO.getViralLoadMonitoring());

        PmtctHts savedHts = this.pmtctHtsRepository.save(pmtctHts);

        // Update pregnancy cycle status to ACTIVE
        if (pmtctHtsRequestDTO.getPmtctCycleUuid() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleUuid());
        }

        return savedHts;
    }

//


    public PmtctHtsRequestDTO updatePmtctHts(String id, PmtctHtsRequestDTO pmtctHtsRequestDTO)
    {


        Optional <PmtctHts> pmtctHtsEnrollment = this.pmtctHtsRepository.findById(id);
        if(pmtctHtsEnrollment.isPresent())
        {
            PmtctHts pmtctEnrollment1 = pmtctHtsEnrollment.get();
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = currentUser.get();

            pmtctEnrollment1.setDateOfHivTest(pmtctHtsRequestDTO.getDateOfHivTest());
            pmtctEnrollment1.setTestEntryPoint(pmtctHtsRequestDTO.getTestEntryPoint());
            pmtctEnrollment1.setTestSetting(pmtctHtsRequestDTO.getTestSetting());
            pmtctEnrollment1.setInitialHivTest(pmtctHtsRequestDTO.getInitialHivTest());
            pmtctEnrollment1.setConfirmatoryHivTest(pmtctHtsRequestDTO.getConfirmatoryHivTest());
            pmtctEnrollment1.setStageOfPregnancy(pmtctHtsRequestDTO.getStageOfPregnancy());
            pmtctEnrollment1.setSyphilis(pmtctHtsRequestDTO.getSyphilis());
            pmtctEnrollment1.setHepatitisB(pmtctHtsRequestDTO.getHepatitisB());
            pmtctEnrollment1.setHepatitisC(pmtctHtsRequestDTO.getHepatitisC());
            pmtctEnrollment1.setRetesting(pmtctHtsRequestDTO.getRetesting());
            pmtctEnrollment1.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
            pmtctEnrollment1.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
            pmtctEnrollment1.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
            pmtctEnrollment1.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
            pmtctEnrollment1.setPmtctCycleUuid(pmtctHtsRequestDTO.getPmtctCycleUuid());
            pmtctEnrollment1.setPregnancyStatusAtEntry(pmtctHtsRequestDTO.getPregnancyStatusAtEntry());
            pmtctEnrollment1.setPreviouslyKnownHivPositive(pmtctHtsRequestDTO.getPreviouslyKnownHivPositive());
            pmtctEnrollment1.setEnrolledOnArt(pmtctHtsRequestDTO.getEnrolledOnArt());
            pmtctEnrollment1.setTypeOfHivTest(pmtctHtsRequestDTO.getTypeOfHivTest());
            pmtctEnrollment1.setHivEarlyDetect(pmtctHtsRequestDTO.getHivEarlyDetect());
            pmtctEnrollment1.setHivEarlyDetectViralLoad(pmtctHtsRequestDTO.getHivEarlyDetectViralLoad());
            pmtctEnrollment1.setConfirmatoryFromSpokes(pmtctHtsRequestDTO.getConfirmatoryFromSpokes());
            pmtctEnrollment1.setInitiatedOnProphylaxis(pmtctHtsRequestDTO.getInitiatedOnProphylaxis());
            pmtctEnrollment1.setTbReferred(pmtctHtsRequestDTO.getTbReferred());
            pmtctEnrollment1.setSyphilisInfo(pmtctHtsRequestDTO.getSyphilisInfo());
            pmtctEnrollment1.setHbvInfo(pmtctHtsRequestDTO.getHbvInfo());
            pmtctEnrollment1.setPartnerInfo(pmtctHtsRequestDTO.getPartnerInfo());
            pmtctEnrollment1.setTbScreeningStatus(pmtctHtsRequestDTO.getTbScreeningStatus());
            pmtctEnrollment1.setPmtctTestEntryPoint(pmtctHtsRequestDTO.getPmtctTestEntryPoint());
            pmtctEnrollment1.setViralLoadMonitoring(pmtctHtsRequestDTO.getViralLoadMonitoring());
//            pmtctEnrollment1.setTestingType(pmtctHtsRequestDTO.getTestingType());




            pmtctEnrollment1.setLastModifiedBy(user.getUserName());
            pmtctEnrollment1.setLastModifiedDate(java.time.LocalDateTime.now());

            this.pmtctHtsRepository.save(pmtctEnrollment1);

            // Update pregnancy cycle status to ACTIVE
            if (pmtctHtsRequestDTO.getPmtctCycleUuid() != null) {
                pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleUuid());
            }


        }
        return pmtctHtsRequestDTO;
    }



    public void deletePmtctHtsRecord(String id) throws Exception {
        PmtctHts existingRec = this.pmtctHtsRepository.findById(id)
                .orElseThrow(() -> new Exception("RECORD NOT FOUND"));
        existingRec.setArchived(1L);
        pmtctHtsRepository.save(existingRec);
    }


    public  PmtctHtsReponseDTO  viewPMTCTHTSEnrollmentById(String id) {
        return convertEntitytoRespondDto(pmtctHtsRepository.findById(id).orElseThrow(()-> new EntityNotFoundException(PmtctHts.class, "Id", id+ "") ));
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String patientUuid) {
        PmtctHts entity = pmtctHtsRepository.findLatestPMTCTHTSEnrollmentById(patientUuid);

        if (entity == null) {
            return null;
        }

        return convertEntitytoRespondDto(entity);
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String patientUuid, String pmtctCycleUuid) {
        PmtctHts entity = pmtctHtsRepository.findLatestPMTCTHTSEnrollmentByIdAndCycleId(patientUuid, pmtctCycleUuid);

        if (entity == null) {
            return null;
        }

        return convertEntitytoRespondDto(entity);
    }

    public  String  getLatestConfirmatoryResult(String patientUuid) {
        return pmtctHtsRepository.findLatestFinalResult(patientUuid).orElse("");
    }

    public  String  getLatestConfirmatoryResult(String patientUuid, String pmtctCycleUuid) {
        return pmtctHtsRepository.findLatestFinalResultByPatientUuidAndCycleId(patientUuid, pmtctCycleUuid).orElse("");
    }



    public boolean confirmIfDateExist(String patientUuid, LocalDate dateOfHivTest) {
        return pmtctHtsRepository.findIfDateExist(patientUuid, dateOfHivTest);
    }

    public boolean existsInitialHtsForCycle(String patientUuid, String pmtctCycleUuid) {
        if (patientUuid == null || pmtctCycleUuid == null) return false;
        return pmtctHtsRepository.existsInitialHtsForCycle(patientUuid, pmtctCycleUuid);
    }
//

    public HivRetestStatusResponse getHivRetestStatus(String patientUuid) {

        List<Object[]> results = pmtctHtsRepository.findLatestHivTestResultList(patientUuid);

        if (results.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("No Test Result")
                    .testResult(null)
                    .testDate(null)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("No HIV test record found for this patient")
                    .build();
        }

        Object[] result = results.get(0);
        String testResult = null;
        String testDate = null;

        // Safely access array elements
        if (result != null && result.length > 0) {
            testResult = result[0] != null ? result[0].toString().toLowerCase() : null;
        }
        if (result != null && result.length > 1) {
            testDate = result[1] != null ? result[1].toString() : null;
        }

        return determineStatus(testResult, testDate);
    }

    public HivRetestStatusResponse getHivRetestStatus(String patientUuid, String pmtctCycleUuid) {

        List<Object[]> results = pmtctHtsRepository.findLatestHivTestResultListByPatientUuidAndCycleId(patientUuid, pmtctCycleUuid);

        if (results.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("No Test Result")
                    .testResult(null)
                    .testDate(null)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("No HIV test record found for this patient")
                    .build();
        }

        Object[] result = results.get(0);
        String testResult = null;
        String testDate = null;

        // Safely access array elements
        if (result != null && result.length > 0) {
            testResult = result[0] != null ? result[0].toString().toLowerCase() : null;
        }
        if (result != null && result.length > 1) {
            testDate = result[1] != null ? result[1].toString() : null;
        }

        return determineStatus(testResult, testDate);
    }    private HivRetestStatusResponse determineStatus(String testResult, String testDate) {
        if (testResult == null || testResult.isEmpty()) {
            return HivRetestStatusResponse.builder()
                    .status("Unknown")
                    .testResult(null)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("Test result is not available")
                    .build();
        }

        boolean isPositive = testResult.equalsIgnoreCase("reactive") ||
                testResult.equalsIgnoreCase("positive");
        boolean isNegative = testResult.equalsIgnoreCase("non-reactive") ||
                testResult.equalsIgnoreCase("negative");

        if (isPositive) {
            return HivRetestStatusResponse.builder()
                    .status("Seroconverted to HIV Positive")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(true)
                    .remainedHivNegative(false)
                    .message("Patient has seroconverted to HIV positive")
                    .build();
        } else if (isNegative) {
            return HivRetestStatusResponse.builder()
                    .status("Remained HIV Negative")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(true)
                    .message("Patient remained HIV negative")
                    .build();
        } else {
            return HivRetestStatusResponse.builder()
                    .status("Indeterminate")
                    .testResult(testResult)
                    .testDate(testDate)
                    .seroconverted(false)
                    .remainedHivNegative(false)
                    .message("Test result is indeterminate")
                    .build();
        }
    }

    public PersonMetaDataDto getActiveOnPmtctHts(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();
        }

        Page<PatientPerson> persons = null;
        if ((searchValue == null) || (searchValue.equals("*"))) {
            persons = pmtctHtsRepository.getActiveOnPmtctHts(0, currentOrganisationUnitId, paging);
        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = pmtctHtsRepository.getActiveOnPmtctHtsBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);
        }

        List<PatientPerson> personList = persons.getContent();
        ArrayList<PmtctHtsReponseDTO> htsResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            PmtctHtsReponseDTO htsResponseDto = getPmtctHtsRespondDtoFromPerson(person);
            htsResponseDtos.add(htsResponseDto);
        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords((int) persons.getTotalElements());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(htsResponseDtos);
        return personMetaDataDto;
    }

    private PmtctHtsReponseDTO getPmtctHtsRespondDtoFromPerson(PatientPerson person) {
        System.out.println(person);
        PmtctHtsReponseDTO htsResponseDto = new PmtctHtsReponseDTO();

        // Set basic person information
        htsResponseDto.setPatientUuid(person.getPatientUuid());
        htsResponseDto.setPersonId(person.getPersonId());
        htsResponseDto.setHospitalNumber(person.getHospitalNumber());
        htsResponseDto.setFirstName(person.getFirstName());
        htsResponseDto.setSurname(person.getSurname());
        htsResponseDto.setOtherName(person.getOtherName());
        htsResponseDto.setAge(calculateAge(person.getDateOfBirth()));
        htsResponseDto.setSex(person.getSex());
        htsResponseDto.setDateOfBirth(person.getDateOfBirth());
        htsResponseDto.setPregnancyCount(person.getPregnancyCount());
        htsResponseDto.setFullName(person.getFullName());
        htsResponseDto.setAddress(person.getAddress());
        htsResponseDto.setContactPoint(person.getContactPoint());

        // Get latest pregnancy cycle ID and use it to fetch HTS and enrollment data
        Optional<PmtctPregnancyCycle> latestCycle = pmtctPregnancyCycleRepository.findLatestByPatientUuid(person.getPatientUuid());

        if (latestCycle.isPresent()) {
            String cycleUuid = latestCycle.get().getUuid();
            htsResponseDto.setPmtctCycleUuid(cycleUuid);

            // Get ANC record for the patient to populate ancNo
            Optional<ANC> ancOpt = ancRepository.findANCByPatientUuid(person.getPatientUuid());
            if (ancOpt.isPresent()) {
                htsResponseDto.setAncNo(ancOpt.get().getAncNo());
            }

            // Get HTS record for the latest cycle
            Optional<PmtctHts> pmtctHtsOptional = pmtctHtsRepository.findByPmtctCycleIdAndArchived(cycleUuid, 0L);

            if (pmtctHtsOptional.isPresent()) {
                PmtctHts pmtctHts = pmtctHtsOptional.get();
                htsResponseDto.setId(pmtctHts.getId());
                htsResponseDto.setUuid(pmtctHts.getUuid());
                htsResponseDto.setDateOfHivTest(pmtctHts.getDateOfHivTest());
                htsResponseDto.setTestEntryPoint(pmtctHts.getTestEntryPoint());
                htsResponseDto.setTestSetting(pmtctHts.getTestSetting());
                htsResponseDto.setInitialHivTest(pmtctHts.getInitialHivTest());
                htsResponseDto.setConfirmatoryHivTest(pmtctHts.getConfirmatoryHivTest());
                htsResponseDto.setStageOfPregnancy(pmtctHts.getStageOfPregnancy());
                htsResponseDto.setHepatitisB(pmtctHts.getHepatitisB());
                htsResponseDto.setHepatitisC(pmtctHts.getHepatitisC());
                htsResponseDto.setTestingType(pmtctHts.getTestingType());
                htsResponseDto.setSyphilis(pmtctHts.getSyphilis());
                htsResponseDto.setRetesting(pmtctHts.getRetesting());
                htsResponseDto.setFinalResult(pmtctHts.getFinalResult());

                // PMTCT Register fields
                htsResponseDto.setPregnancyStatusAtEntry(pmtctHts.getPregnancyStatusAtEntry());
                htsResponseDto.setPreviouslyKnownHivPositive(pmtctHts.getPreviouslyKnownHivPositive());
                htsResponseDto.setEnrolledOnArt(pmtctHts.getEnrolledOnArt());
                htsResponseDto.setTypeOfHivTest(pmtctHts.getTypeOfHivTest());
                htsResponseDto.setHivEarlyDetect(pmtctHts.getHivEarlyDetect());
                htsResponseDto.setHivEarlyDetectViralLoad(pmtctHts.getHivEarlyDetectViralLoad());
                htsResponseDto.setConfirmatoryFromSpokes(pmtctHts.getConfirmatoryFromSpokes());
                htsResponseDto.setInitiatedOnProphylaxis(pmtctHts.getInitiatedOnProphylaxis());
                htsResponseDto.setTbReferred(pmtctHts.getTbReferred());
                htsResponseDto.setSyphilisInfo(pmtctHts.getSyphilisInfo());
                htsResponseDto.setHbvInfo(pmtctHts.getHbvInfo());
                htsResponseDto.setPartnerInfo(pmtctHts.getPartnerInfo());
                htsResponseDto.setTbScreeningStatus(pmtctHts.getTbScreeningStatus());
                htsResponseDto.setPmtctTestEntryPoint(pmtctHts.getPmtctTestEntryPoint());
                htsResponseDto.setViralLoadMonitoring(pmtctHts.getViralLoadMonitoring());
                htsResponseDto.setSource(pmtctHts.getSource());
            }

            // Use cycle UUID to get enrollment data for the latest pregnancy cycle
            Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(cycleUuid, 0L);

            if (enrollment.isPresent()) {
                PMTCTEnrollment enrollmentData = enrollment.get();
                htsResponseDto.setPmtctRegStatus(true);
                htsResponseDto.setArtStartDate(enrollmentData.getArtStartDate());
                htsResponseDto.setEntryPoint(enrollmentData.getEntryPoint());
                htsResponseDto.setTbStatus(enrollmentData.getTbStatus());
                htsResponseDto.setPmtctEnrollmentDate(enrollmentData.getPmtctEnrollmentDate());
                // Set hivStatus from enrollment - this takes priority over finalResult
                if (enrollmentData.getHivStatus() != null) {
                    htsResponseDto.setHivStatus(enrollmentData.getHivStatus());
                } else if (htsResponseDto.getFinalResult() != null) {
                    // Fallback to finalResult from HTS if enrollment hivStatus is null
                    htsResponseDto.setHivStatus(htsResponseDto.getFinalResult());
                }
            } else {
                // No enrollment found for the latest cycle
                htsResponseDto.setPmtctRegStatus(false);
                // If we have HTS data but no enrollment, use finalResult for hivStatus
                if (htsResponseDto.getFinalResult() != null) {
                    htsResponseDto.setHivStatus(htsResponseDto.getFinalResult());
                }
            }
        } else {
            // No pregnancy cycle found
            htsResponseDto.setPmtctRegStatus(false);
        }

        return htsResponseDto;
    }

    private Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return 0;
        }
        LocalDate currentDate = LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();
        if (currentDate.getMonthValue() < dateOfBirth.getMonthValue() ||
                (currentDate.getMonthValue() == dateOfBirth.getMonthValue() && currentDate.getDayOfMonth() < dateOfBirth.getDayOfMonth())) {
            age--;
        }
        return age;
    }
}


