package org.lamisplus.modules.pmtct.service;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRespondDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
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
     return convertEntitytoRespondDto(convertEntitytoRespondDto(pmtctEnrollmentRequestDto));
  }
  
  public PMTCTEnrollment convertEntitytoRespondDto(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
      PMTCTEnrollment pmtctEnrollment = new PMTCTEnrollment();
     pmtctEnrollment.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
      pmtctEnrollment.setDiastolic(pmtctEnrollmentRequestDto.getDiastolic());
      pmtctEnrollment.setBodyWeight(pmtctEnrollmentRequestDto.getBodyWeight());
      pmtctEnrollment.setAncNo(pmtctEnrollmentRequestDto.getAncNo());
      pmtctEnrollment.setFpl(pmtctEnrollmentRequestDto.getFpl());
      pmtctEnrollment.setAgreed2PartnerNotification(pmtctEnrollmentRequestDto.getAgreed2PartnerNotification());
      pmtctEnrollment.setFundalHeight(pmtctEnrollmentRequestDto.getFundalHeight());
      pmtctEnrollment.setInfantFeeding(pmtctEnrollmentRequestDto.getInfantFeeding());
      pmtctEnrollment.setFetalPresentation(pmtctEnrollmentRequestDto.getFetalPresentation());
     pmtctEnrollment.setNextAppointmentDate(pmtctEnrollmentRequestDto.getNextAppointmentDate());
      pmtctEnrollment.setSystolic(pmtctEnrollmentRequestDto.getSystolic());
     pmtctEnrollment.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
       pmtctEnrollment.setVisitStatus(pmtctEnrollmentRequestDto.getVisitStatus());
      pmtctEnrollment.setVisitType(pmtctEnrollmentRequestDto.getVisitType());
     pmtctEnrollment.setAgreed2PartnerNotification(pmtctEnrollmentRequestDto.getAgreed2PartnerNotification());
      pmtctEnrollment.setReferredTo(pmtctEnrollmentRequestDto.getReferredTo());
      pmtctEnrollment.setNutritionalSupport(pmtctEnrollmentRequestDto.getNutritionalSupport());
     pmtctEnrollment.setViralLoadSample(pmtctEnrollmentRequestDto.getViralLoadSample());
       pmtctEnrollment.setViralLoadSampleDate(pmtctEnrollmentRequestDto.getViralLoadSampleDate());
     pmtctEnrollment.setUuid(UUID.randomUUID().toString());
      ANC anc = this.ancRepository.findByAncNoAndArchived(pmtctEnrollmentRequestDto.getAncNo(), Long.valueOf(0L));
       if (anc != null)
      { pmtctEnrollment.setGAWeeks(anc.getGAWeeks());
       pmtctEnrollment.setHospitalNumber(anc.getHospitalNumber());
        pmtctEnrollment.setFacilityId(anc.getFacilityId()); }
     else { throw new RuntimeException("YET TO REGISTER FOR ANC"); }
    
      return (PMTCTEnrollment)this.pmtctEnrollmentReporsitory.save(pmtctEnrollment);
  }

  
  public PMTCTEnrollmentRespondDto convertEntitytoRespondDto(PMTCTEnrollment pmtctEnrollment) {
       PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = new PMTCTEnrollmentRespondDto();
     pmtctEnrollmentRespondDto.setId(pmtctEnrollment.getId());
     pmtctEnrollmentRespondDto.setAncNo(pmtctEnrollment.getAncNo());
     pmtctEnrollmentRespondDto.setGAWeeks(pmtctEnrollment.getGAWeeks());
      pmtctEnrollmentRespondDto.setHospitalNumber(pmtctEnrollment.getHospitalNumber());
      pmtctEnrollmentRespondDto.setPmtctEnrollmentDate(pmtctEnrollment.getPmtctEnrollmentDate());
      pmtctEnrollmentRespondDto.setSystolic(pmtctEnrollment.getSystolic());
     pmtctEnrollmentRespondDto.setDiastolic(pmtctEnrollment.getDiastolic());
      pmtctEnrollmentRespondDto.setBodyWeight(pmtctEnrollment.getBodyWeight());
      pmtctEnrollmentRespondDto.setFundalHeight(pmtctEnrollment.getFundalHeight());
      pmtctEnrollmentRespondDto.setFetalPresentation(pmtctEnrollment.getFetalPresentation());
     pmtctEnrollmentRespondDto.setVisitStatus(pmtctEnrollment.getVisitStatus());
      pmtctEnrollmentRespondDto.setVisitType(pmtctEnrollment.getVisitType());
     pmtctEnrollmentRespondDto.setTbStatus(pmtctEnrollment.getTbStatus());
      pmtctEnrollmentRespondDto.setNextAppointmentDate(pmtctEnrollment.getNextAppointmentDate());
      pmtctEnrollmentRespondDto.setNutritionalSupport(pmtctEnrollment.getNutritionalSupport());
       pmtctEnrollmentRespondDto.setInfantFeeding(pmtctEnrollment.getInfantFeeding());
      pmtctEnrollmentRespondDto.setFpl(pmtctEnrollment.getFpl());
     pmtctEnrollmentRespondDto.setReferredTo(pmtctEnrollment.getReferredTo());
      pmtctEnrollmentRespondDto.setAgreed2PartnerNotification(pmtctEnrollment.getAgreed2PartnerNotification());
     pmtctEnrollmentRespondDto.setViralLoadSample(pmtctEnrollment.getViralLoadSample());
       pmtctEnrollmentRespondDto.setViralLoadSampleDate(pmtctEnrollment.getViralLoadSampleDate());
     pmtctEnrollmentRespondDto.setHospitalNumber(pmtctEnrollment.getHospitalNumber());
      pmtctEnrollmentRespondDto.setFullName(getFullName(pmtctEnrollment.getHospitalNumber()));
      pmtctEnrollmentRespondDto.setAge(calculateAge(pmtctEnrollment.getHospitalNumber()));
     pmtctEnrollmentRespondDto.setUuid(pmtctEnrollment.getUuid());
    
     return pmtctEnrollmentRespondDto;
  }
  
  private String getFullName(String hostpitalNumber) {
      Optional<Person> persons = this.personRepository.getPersonByHospitalNumber(hostpitalNumber);
      String fullName = "";
      System.out.println("HostpitalNumber in FullName " + hostpitalNumber);
      if (persons.isPresent())
      { Person person = persons.get();
        String fn = person.getFirstName();
        String sn = person.getSurname();
        String on = person.getOtherName();
        if (fn == null) fn = "";
        if (sn == null) sn = "";
        if (on == null) on = "";
        fullName = sn + " " + fn + " " + on; }
      else { fullName = "No Name"; }
       System.out.println("FullName " + fullName);
      return fullName;
  }
  
  public int calculateAge(String hostpitalNumber) {
      Optional<Person> persons = this.personRepository.getPersonByHospitalNumber(hostpitalNumber);
      int age = 0;
      System.out.println("HostpitalNumber in Age " + hostpitalNumber);
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
}
