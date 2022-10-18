package org.lamisplus.modules.pmtct.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.ContactDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PmtctVisitService
{
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final PmtctVisitRepository pmtctVisitRepository;

    private final UserService userService;
    ObjectMapper mapper = new ObjectMapper();

    public PmtctVisitResponseDto save(PmtctVisitRequestDto pmtctVisitRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(pmtctVisitRequestDto));
    }

    public PmtctVisit converRequestDtotoEntity(PmtctVisitRequestDto pmtctVisitRequestDto) {
        PmtctVisit pmtctVisit = new PmtctVisit();
        pmtctVisit.setDateOfVisit(pmtctVisitRequestDto.getDateOfVisit());
        pmtctVisit.setDiastolic(pmtctVisitRequestDto.getDiastolic());
        pmtctVisit.setBodyWeight(pmtctVisitRequestDto.getBodyWeight());
        pmtctVisit.setAncNo(pmtctVisitRequestDto.getAncNo());
        pmtctVisit.setSystolic(pmtctVisitRequestDto.getSystolic());
        pmtctVisit.setPulse(pmtctVisitRequestDto.getPulse());
        pmtctVisit.setRespiratoryRate(pmtctVisitRequestDto.getRespiratoryRate());
        pmtctVisit.setTemperature(pmtctVisitRequestDto.getTemperature());
        pmtctVisit.setHeight(pmtctVisitRequestDto.getHeight());
        pmtctVisit.setClinicalNotes(pmtctVisitRequestDto.getClinicalNotes());
        pmtctVisit.setWhoStaging(pmtctVisitRequestDto.getWhoStaging());
        pmtctVisit.setFunctionalStatus(pmtctVisitRequestDto.getFunctionalStatus());
        List<Adr> ardList = pmtctVisitRequestDto.getAdr();
        List<OpportunisticInfection> opportunisticInfectionList = pmtctVisitRequestDto.getOpportunisticInfection();
        if (ardList != null && !ardList.isEmpty()) {
            ArrayNode ardArrayNode = mapper.valueToTree(ardList);
            JsonNode ardJsonNode = mapper.createObjectNode().set("ard", ardArrayNode);
            pmtctVisit.setAdr(ardJsonNode);
        }
        if (opportunisticInfectionList != null && !opportunisticInfectionList.isEmpty()) {
            ArrayNode opportunisticInfectionArrayNode = mapper.valueToTree(opportunisticInfectionList);
            JsonNode opportunisticInfectionJsonNode = mapper.createObjectNode().set("opportunisticInfection", opportunisticInfectionArrayNode);
            pmtctVisit.setOpportunisticInfection(opportunisticInfectionJsonNode);
        }
        
        pmtctVisit.setUuid(UUID.randomUUID().toString());
        ANC anc = this.ancRepository.findByAncNoAndArchived(pmtctVisitRequestDto.getAncNo(), Long.valueOf(0L));
        if (anc != null)
        { 
            pmtctVisit.setHospitalNumber(anc.getHospitalNumber());
            pmtctVisit.setFacilityId(anc.getFacilityId()); }
        else { throw new RuntimeException("YET TO REGISTER FOR ANC"); }

        return (PmtctVisit)this.pmtctVisitRepository.save(pmtctVisit);
    }


    public PmtctVisitResponseDto convertEntitytoRespondDto(PmtctVisit pmtctVisit) {
        PmtctVisitResponseDto pmtctVisitResponseDto = new PmtctVisitResponseDto();
        pmtctVisitResponseDto.setId(pmtctVisit.getId());
        pmtctVisitResponseDto.setAncNo(pmtctVisit.getAncNo());
        pmtctVisitResponseDto.setHospitalNumber(pmtctVisit.getHospitalNumber());
        pmtctVisitResponseDto.setSystolic(pmtctVisit.getSystolic());
        pmtctVisitResponseDto.setDiastolic(pmtctVisit.getDiastolic());
        pmtctVisitResponseDto.setBodyWeight(pmtctVisit.getBodyWeight());
        pmtctVisitResponseDto.setHospitalNumber(pmtctVisit.getHospitalNumber());
        pmtctVisitResponseDto.setFullName(getFullName(pmtctVisit.getHospitalNumber()));
        pmtctVisitResponseDto.setAge(calculateAge(pmtctVisit.getHospitalNumber()));
        pmtctVisitResponseDto.setUuid(pmtctVisit.getUuid());
        pmtctVisitResponseDto.setPulse(pmtctVisit.getPulse());
        pmtctVisitResponseDto.setRespiratoryRate(pmtctVisit.getRespiratoryRate());
        pmtctVisitResponseDto.setTemperature(pmtctVisit.getTemperature());
        pmtctVisitResponseDto.setHeight(pmtctVisit.getHeight());
        pmtctVisitResponseDto.setClinicalNotes(pmtctVisit.getClinicalNotes());
        pmtctVisitResponseDto.setWhoStaging(pmtctVisit.getWhoStaging());
        pmtctVisitResponseDto.setFunctionalStatus(pmtctVisit.getFunctionalStatus());


        return pmtctVisitResponseDto;
    }

    private String getFullName(String uuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = 0L;
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
        Long facilityId = 0L;
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId,0);

        int age = 0;
        System.out.println("HostpitalNumber in Age " + uuid);
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
    public List<PmtctVisitResponseDto> getAllPmtctVisits() {
        List<PmtctVisit> pmtctVisitList = this.pmtctVisitRepository.findAll();
        List<PmtctVisitResponseDto> PmtctVisitResponseDtoList = new ArrayList<>();
        pmtctVisitList.forEach(pmtctVisit -> PmtctVisitResponseDtoList.add(convertEntitytoRespondDto(pmtctVisit)));
        return PmtctVisitResponseDtoList;
    }

    @SneakyThrows
    public PmtctVisit getSinglePmtctVisit(Long id) {
        return this.pmtctVisitRepository.findById(id)
                .orElseThrow(() -> new Exception("ANC NOT FOUND"));

    }
}
