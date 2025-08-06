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
//
//        try {
//            Optional<User> currentUser = this.userService.getUserWithRoles();
//            User user = (User) currentUser.get();
//            Long facilityId = user.getCurrentOrganisationUnitId();
//            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctHts.getPersonUuid(), facilityId, 0);
//            System.out.println("persons " + persons);
//            if (persons.isPresent()) {
//                Person person = persons.get();
//            }
//        } catch (Exception e) { e.printStackTrace(); }

        return this.pmtctHtsRepository.save(pmtctHts);
    }


//
//    public PmtctVisit convertRequestDtoToEntityUpdate(Long id,PmtctVisitRequestDto pmtctVisitRequestDto,PmtctVisit existingVisit) {
//        PmtctVisit pmtctVisit = new PmtctVisit();
//        pmtctVisit.setId(id);
//        pmtctVisit.setDateOfVisit(pmtctVisitRequestDto.getDateOfVisit());
//        pmtctVisit.setDateOfDelivery(pmtctVisitRequestDto.getDateOfDelivery());
//        pmtctVisit.setAncNo(pmtctVisitRequestDto.getAncNo());
//        pmtctVisit.setUuid(existingVisit.getUuid());
//        pmtctVisit.setPersonUuid(existingVisit.getUuid());
//        pmtctVisit.setEntryPoint(pmtctVisitRequestDto.getEnteryPoint());
//        pmtctVisit.setFpCounseling(pmtctVisitRequestDto.getFpCounseling());
//        pmtctVisit.setFpMethod(pmtctVisitRequestDto.getFpMethod());
//        pmtctVisit.setDateOfViralLoad(pmtctVisitRequestDto.getDateOfViralLoad());
//        pmtctVisit.setGaOfViralLoad(pmtctVisitRequestDto.getGaOfViralLoad());
//        pmtctVisit.setResultOfViralLoad(pmtctVisitRequestDto.getResultOfViralLoad());
//        if(pmtctVisitRequestDto.getGaOfViralLoad()!=null) {
//            int ga = pmtctVisitRequestDto.getGaOfViralLoad();
//            String tVL = "Other Time";
//            if ((ga >= 32) || (ga <= 36)) tVL = "Between 32 and 36";
//            pmtctVisit.setTimeOfViralLoad(tVL);
//        }
//        pmtctVisit.setDsd(pmtctVisitRequestDto.getDsd());
//        pmtctVisit.setDsdOption(pmtctVisitRequestDto.getDsdOption());
//        pmtctVisit.setDsdModel(pmtctVisitRequestDto.getDsdModel());
//        pmtctVisit.setMaternalOutcome(pmtctVisitRequestDto.getMaternalOutcome());
//        pmtctVisit.setDateOfMaternalOutcome(pmtctVisitRequestDto.getDateOfmeternalOutcome());
//        pmtctVisit.setVisitStatus(pmtctVisitRequestDto.getVisitStatus());
//        pmtctVisit.setTransferTo(pmtctVisitRequestDto.getTransferTo());
//        pmtctVisit.setNextAppointmentDate(nextAppointmentDate(pmtctVisitRequestDto.getDateOfVisit()));
//        String visitStatus = pmtctVisitRequestDto.getVisitStatus();
//        try {
//            Optional<User> currentUser = this.userService.getUserWithRoles();
//            User user = (User) currentUser.get();
//            Long facilityId = user.getCurrentOrganisationUnitId();
//            System.out.println("facilityId = "+facilityId);
//            System.out.println("pmtctVisitRequestDto.getPersonUuid() = "+pmtctVisitRequestDto.getPersonUuid());
//            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisitRequestDto.getPersonUuid(), facilityId, 0);
//            if (persons.isPresent()) {
//                Person person = persons.get();
//                pmtctVisit.setHospitalNumber(person.getHospitalNumber());
//                pmtctVisit.setPersonUuid(pmtctVisitRequestDto.getPersonUuid());
//                //System.out.println("visitStatus = " + visitStatus);
//                if (visitStatus != null) {
//                    System.out.println("Hummm we still get here "+ pmtctVisitRequestDto.getAncNo());
//                    Optional<ANC> ancs = ancRepository.getByAncNo(pmtctVisitRequestDto.getAncNo());
//                    if(ancs.isPresent()) {
//                        ANC anc = ancs.get();
//                        if (visitStatus.contains("_IN")) {
//
//                            ancService.updateANC(anc, visitStatus, pmtctVisitRequestDto.getDateOfVisit());
//                        } else {
//                            ancService.graduateFromANC(anc, visitStatus);
//                        }
//                    }
//
//                }
//
//
//            }
//        } catch (Exception e) { e.printStackTrace(); }
//
//        return this.pmtctVisitRepository.save(pmtctVisit);
//    }
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



    public  String  getLatestConfirmatoryResult(String personUuid) {
        return pmtctHtsRepository.findLatestConfirmatoryResult(personUuid).orElse("");
    }

//
}
