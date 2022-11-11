package org.lamisplus.modules.pmtct.service;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.ANCRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRespondDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PMTCTEnrollmentService {
  private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
  private final ANCRepository ancRepository;
  private final PersonRepository personRepository;
  private final UserService userService;
  private final PersonService personService;
  
  public PMTCTEnrollmentRespondDto save(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
      //System.out.println(pmtctEnrollmentRequestDto);
     return convertEntitytoRespondDto(convertEntitytoRespondDto(pmtctEnrollmentRequestDto));
  }
  
  public PMTCTEnrollment convertEntitytoRespondDto(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
      PMTCTEnrollment pmtctEnrollment = new PMTCTEnrollment();
     pmtctEnrollment.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
      pmtctEnrollment.setAncNo(pmtctEnrollmentRequestDto.getAncNo());
      pmtctEnrollment.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
      pmtctEnrollment.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());
      pmtctEnrollment.setGravida(pmtctEnrollmentRequestDto.getGravida());
      pmtctEnrollment.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
      pmtctEnrollment.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
      pmtctEnrollment.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
      pmtctEnrollment.setUuid(UUID.randomUUID().toString());
      ANC anc = this.ancRepository.findByAncNoAndArchived(pmtctEnrollmentRequestDto.getAncNo(), Long.valueOf(0L));
       if (anc != null)
      { pmtctEnrollment.setGAWeeks(anc.getGAWeeks());
        pmtctEnrollment.setHospitalNumber(anc.getHospitalNumber());
        pmtctEnrollment.setFacilityId(anc.getFacilityId());
        pmtctEnrollment.setCreatedBy(anc.getCreatedBy());
        pmtctEnrollment.setLastModifiedBy(anc.getLastModifiedBy());
      }
     else { throw new RuntimeException("YET TO REGISTER FOR ANC"); }
    
      return (PMTCTEnrollment)this.pmtctEnrollmentReporsitory.save(pmtctEnrollment);
  }
  public PMTCTEnrollmentRespondDto convertEntitytoRespondDto(PMTCTEnrollment pmtctEnrollment) {
       PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = new PMTCTEnrollmentRespondDto();
       if(pmtctEnrollment != null) {
           pmtctEnrollmentRespondDto.setId(pmtctEnrollment.getId());
           pmtctEnrollmentRespondDto.setAncNo(pmtctEnrollment.getAncNo());
           pmtctEnrollmentRespondDto.setGAWeeks(pmtctEnrollment.getGAWeeks());
           pmtctEnrollmentRespondDto.setHospitalNumber(pmtctEnrollment.getHospitalNumber());
           pmtctEnrollmentRespondDto.setPmtctEnrollmentDate(pmtctEnrollment.getPmtctEnrollmentDate());
           pmtctEnrollmentRespondDto.setTbStatus(pmtctEnrollment.getTbStatus());
           pmtctEnrollmentRespondDto.setUuid(pmtctEnrollment.getUuid());
           pmtctEnrollmentRespondDto.setEntryPoint(pmtctEnrollment.getEntryPoint());
           pmtctEnrollmentRespondDto.setGravida(pmtctEnrollment.getGravida());
           pmtctEnrollmentRespondDto.setArtStartDate(pmtctEnrollment.getArtStartDate());
           pmtctEnrollmentRespondDto.setArtStartTime(pmtctEnrollment.getArtStartTime());
           ANC anc = this.ancRepository.findByAncNoAndArchived(pmtctEnrollment.getAncNo(), Long.valueOf(0L));
           if (anc != null) {
               pmtctEnrollmentRespondDto.setHospitalNumber(anc.getHospitalNumber());
               pmtctEnrollmentRespondDto.setFullName(getFullName(anc.getPersonUuid()));
               pmtctEnrollmentRespondDto.setAge(calculateAge(anc.getPersonUuid()));
           }
       }
     return pmtctEnrollmentRespondDto;
  }
  
  private String getFullName(String uuid) {
      Optional<User> currentUser = this.userService.getUserWithRoles();
      User user = (User) currentUser.get();
      Long facilityId = user.getCurrentOrganisationUnitId();
      Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId,0);
      String fullName = "";
      if (persons.isPresent())
      { Person person = persons.get();
        String fn = person.getFirstName();
        String sn = person.getSurname();
        String on = person.getOtherName();
        if (fn == null) fn = "";
        if (sn == null) sn = "";
        if (on == null) on = "";
        fullName = sn + ", " + fn + " " + on; }
      else { fullName = ""; }
      return fullName;
  }
  
  public int calculateAge(String uuid) {
      Optional<User> currentUser = this.userService.getUserWithRoles();
      User user = (User) currentUser.get();
      Long facilityId = user.getCurrentOrganisationUnitId();
      Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId,0);
      int age = 0;
      if (persons.isPresent()) {
        Person person = persons.get();
        LocalDate dob = person.getDateOfBirth();
        LocalDate curDate = LocalDate.now();
        if (dob != null && curDate != null) {
          age = Period.between(dob, curDate).getYears();
      } else {
          age = 0;
      } 
    } 
      System.out.println("Age " + age);
      return age;
  }
  
  public List<PMTCTEnrollmentRespondDto> getAllPmtctEnrollment() {
      List<PMTCTEnrollment> pmtctEnrollments = this.pmtctEnrollmentReporsitory.findAll();
      List<PMTCTEnrollmentRespondDto> pmtctEnrollmentRespondDtoList = new ArrayList<>();
      pmtctEnrollments.forEach(pmtctEnrollment -> pmtctEnrollmentRespondDtoList.add(convertEntitytoRespondDto(pmtctEnrollment)));
    
      return pmtctEnrollmentRespondDtoList;
  }

    @SneakyThrows
    public PMTCTEnrollment getSinglePmtctEnrollment(Long id) {
        return this.pmtctEnrollmentReporsitory.findById(id)
                .orElseThrow(() -> new Exception("PMTCTEnrollment NOT FOUND"));
    }
    @SneakyThrows
    public PMTCTEnrollmentRespondDto getSinglePmtctEnrollmentByAncNo(String ancNo) {
        return convertEntitytoRespondDto(this.pmtctEnrollmentReporsitory.findByAncNo(ancNo));
                //.orElseThrow(() -> new Exception("PMTCTEnrollment NOT FOUND"));
    }


    //PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto
//    public PMTCTEnrollmentRequestDto updatePMTCTEnrollment(Long id, PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
//        // PmtctVisit existVisit = getExistVisit(id);
//        PMTCTEnrollment pmtctEnrollment = convertEntitytoRespondDto(pmtctEnrollmentRequestDto);
//        pmtctEnrollment.setId(id);
//        //pmtctVisit.setArchived(0);
//        pmtctEnrollmentReporsitory.save(pmtctEnrollment);
//        return pmtctEnrollmentRequestDto;
//    }

    public PMTCTEnrollmentRequestDto updatePMTCTEnrollment(Long id, PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto)
    {
        Optional <PMTCTEnrollment> pmtctEnrollment = this.pmtctEnrollmentReporsitory.findById(id);
        if(pmtctEnrollment.isPresent())
        {
            PMTCTEnrollment pmtctEnrollment1 = pmtctEnrollment.get();
            pmtctEnrollment1.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
            pmtctEnrollment1.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
            pmtctEnrollment1.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
            pmtctEnrollment1.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());
            pmtctEnrollment1.setGravida(pmtctEnrollmentRequestDto.getGravida());
            pmtctEnrollment1.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
            pmtctEnrollment1.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
            this.pmtctEnrollmentReporsitory.save(pmtctEnrollment1);
        }
        return pmtctEnrollmentRequestDto;
    }

    public  PMTCTEnrollmentRespondDto  viewPMTCTEnrollmentById(Long id) {
       return convertEntitytoRespondDto(pmtctEnrollmentReporsitory.findById(id).orElseThrow(()-> new EntityNotFoundException(PMTCTEnrollment.class, "Id", id+ "") ));
    }

}
