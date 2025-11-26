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
        pmtctHtsReponseDTO.setTieBreaker(pmtctHts.getTieBreaker());
        pmtctHtsReponseDTO.setConfirmatoryTest2(pmtctHts.getConfirmatoryTest2());
        pmtctHtsReponseDTO.setTieBreaker2(pmtctHts.getTieBreaker2());
        pmtctHtsReponseDTO.setFinalResult(pmtctHts.getFinalResult());

        pmtctHtsReponseDTO.setAncNo(pmtctHts.getAncNo());
               try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctHts.getPersonUuid(), facilityId, 0);
            if (persons.isPresent()) {
                System.out.println("Doc check me out here 1");
                Person person = persons.get();
                pmtctHtsReponseDTO.setHospitalNumber(person.getHospitalNumber());
                pmtctHtsReponseDTO.setPersonUuid(person.getUuid());
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
        pmtctHts.setHospitalNumber(pmtctHtsRequestDTO.getHospitalNumber());
        pmtctHts.setArchived(0L);
        pmtctHts.setPersonUuid(pmtctHtsRequestDTO.getPersonUuid());
        pmtctHts.setAncNo(pmtctHtsRequestDTO.getAncNo());
        pmtctHts.setRetesting(pmtctHtsRequestDTO.getRetesting());
        pmtctHts.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
        pmtctHts.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
        pmtctHts.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
        pmtctHts.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
        pmtctHts.setPmtctCycleId(pmtctHtsRequestDTO.getPmtctCycleId());

        PmtctHts savedHts = this.pmtctHtsRepository.save(pmtctHts);

        // Update pregnancy cycle status to ACTIVE
        if (pmtctHtsRequestDTO.getPmtctCycleId() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleId());
        }

        return savedHts;
    }

//


    public PmtctHtsRequestDTO updatePmtctHts(Long id, PmtctHtsRequestDTO pmtctHtsRequestDTO)
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
            pmtctEnrollment1.setAncNo(pmtctHtsRequestDTO.getAncNo());
            pmtctEnrollment1.setRetesting(pmtctHtsRequestDTO.getRetesting());
            pmtctEnrollment1.setTieBreaker(pmtctHtsRequestDTO.getTieBreaker());
            pmtctEnrollment1.setConfirmatoryTest2(pmtctHtsRequestDTO.getConfirmatoryTest2());
            pmtctEnrollment1.setTieBreaker2(pmtctHtsRequestDTO.getTieBreaker2());
            pmtctEnrollment1.setFinalResult(pmtctHtsRequestDTO.getFinalResult());
            pmtctEnrollment1.setPmtctCycleId(pmtctHtsRequestDTO.getPmtctCycleId());
//            pmtctEnrollment1.setTestingType(pmtctHtsRequestDTO.getTestingType());





            this.pmtctHtsRepository.save(pmtctEnrollment1);

            // Update pregnancy cycle status to ACTIVE
            if (pmtctHtsRequestDTO.getPmtctCycleId() != null) {
                pmtctPregnancyCycleService.updatePmtctStatusToActive(pmtctHtsRequestDTO.getPmtctCycleId());
            }


        }
        return pmtctHtsRequestDTO;
    }



    public void deletePmtctHtsRecord(Long id) throws Exception {
        PmtctHts existingRec = this.pmtctHtsRepository.findById(id)
                .orElseThrow(() -> new Exception("RECORD NOT FOUND"));
        existingRec.setArchived(1L);
        pmtctHtsRepository.save(existingRec);
    }


    public  PmtctHtsReponseDTO  viewPMTCTHTSEnrollmentById(Long id) {
        return convertEntitytoRespondDto(pmtctHtsRepository.findById(id).orElseThrow(()-> new EntityNotFoundException(PmtctHts.class, "Id", id+ "") ));
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String personUuid) {
        PmtctHts entity = pmtctHtsRepository.findLatestPMTCTHTSEnrollmentById(personUuid);

        if (entity == null) {
            return null;
        }

        return convertEntitytoRespondDto(entity);
    }

    public  PmtctHtsReponseDTO  getLastPMTCTHTSEnrollmentById(String personUuid, Long pmtctCycleId) {
        PmtctHts entity = pmtctHtsRepository.findLatestPMTCTHTSEnrollmentByIdAndCycleId(personUuid, pmtctCycleId);

        if (entity == null) {
            return null;
        }

        return convertEntitytoRespondDto(entity);
    }

    public  String  getLatestConfirmatoryResult(String personUuid) {
        return pmtctHtsRepository.findLatestFinalResult(personUuid).orElse("");
    }

    public  String  getLatestConfirmatoryResult(String personUuid, Long pmtctCycleId) {
        return pmtctHtsRepository.findLatestFinalResultByPersonUuidAndCycleId(personUuid, pmtctCycleId).orElse("");
    }



    public boolean confirmIfDateExist(String personUuid, LocalDate dateOfHivTest) {
        return pmtctHtsRepository.findIfDateExist(personUuid, dateOfHivTest);
    }
//

    public HivRetestStatusResponse getHivRetestStatus(String personUuid) {

        List<Object[]> results = pmtctHtsRepository.findLatestHivTestResultList(personUuid);

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

    public HivRetestStatusResponse getHivRetestStatus(String personUuid, Long pmtctCycleId) {

        List<Object[]> results = pmtctHtsRepository.findLatestHivTestResultListByPersonUuidAndCycleId(personUuid, pmtctCycleId);

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
        htsResponseDto.setPersonUuid(person.getPersonUuid());
        htsResponseDto.setPersonId(person.getPersonId());
        htsResponseDto.setHospitalNumber(person.getHospitalNumber());
        htsResponseDto.setAge(calculateAge(person.getDateOfBirth()));
        htsResponseDto.setSex(person.getSex());
        htsResponseDto.setDateOfBirth(person.getDateOfBirth());
        htsResponseDto.setPregnancyCount(person.getPregnancyCount());
        htsResponseDto.setFullName(person.getFullName());

        // Get latest pregnancy cycle ID and use it to fetch HTS and enrollment data
        Optional<PmtctPregnancyCycle> latestCycle = pmtctPregnancyCycleRepository.findLatestByPersonUuid(person.getPersonUuid());

        if (latestCycle.isPresent()) {
            Long cycleId = latestCycle.get().getId();
            htsResponseDto.setPmtctCycleId(cycleId);

            // Get HTS record for the latest cycle
            Optional<PmtctHts> pmtctHtsOptional = pmtctHtsRepository.findByPmtctCycleIdAndArchived(cycleId, 0L);

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
            }

            // Use cycle ID to get enrollment data for the latest pregnancy cycle
            Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(cycleId, 0L);

            if (enrollment.isPresent()) {
                PMTCTEnrollment enrollmentData = enrollment.get();
                htsResponseDto.setPmtctRegStatus(true);
                htsResponseDto.setAncNo(enrollmentData.getAncNo());
                htsResponseDto.setArtStartDate(enrollmentData.getArtStartDate());
                htsResponseDto.setEntryPoint(enrollmentData.getEntryPoint());
                htsResponseDto.setTbStatus(enrollmentData.getTbStatus());
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


