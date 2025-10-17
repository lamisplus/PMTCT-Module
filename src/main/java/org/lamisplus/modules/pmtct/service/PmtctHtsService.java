package org.lamisplus.modules.pmtct.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

        return this.pmtctHtsRepository.save(pmtctHts);
    }

//


    public PmtctHtsRequestDTO updatePmtctHts(Long id, PmtctHtsRequestDTO pmtctHtsRequestDTO)
    {


        Optional <PmtctHts> pmtctHtsEnrollment = this.pmtctHtsRepository.findById(id);
        if(pmtctHtsEnrollment.isPresent())
        {
            PmtctHts pmtctEnrollment1 = pmtctHtsEnrollment.get();
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
//            pmtctEnrollment1.setTestingType(pmtctHtsRequestDTO.getTestingType());





            this.pmtctHtsRepository.save(pmtctEnrollment1);


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

    public  String  getLatestConfirmatoryResult(String personUuid) {
        return pmtctHtsRepository.findLatestFinalResult(personUuid).orElse("");
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
}


