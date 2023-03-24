package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.ContactDto;
import org.lamisplus.modules.patient.domain.dto.VisitDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantPCRTestRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PmtctVisitService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final PmtctVisitRepository pmtctVisitRepository;

    private final ANCService ancService;
    private final UserService userService;
    ObjectMapper mapper = new ObjectMapper();
    private final InfantPCRTestRepository infantPCRTestRepository;

    public PmtctVisitResponseDto save(PmtctVisitRequestDto pmtctVisitRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(pmtctVisitRequestDto));
    }

    public LocalDate nextAppointmentDate(LocalDate lmd){
        LocalDate date = lmd;
        date = date.plusMonths(1);
        return date;
    }

    public PmtctVisit converRequestDtotoEntity(PmtctVisitRequestDto pmtctVisitRequestDto) {
        PmtctVisit pmtctVisit = new PmtctVisit();
        pmtctVisit.setDateOfVisit(pmtctVisitRequestDto.getDateOfVisit());
        pmtctVisit.setAncNo(pmtctVisitRequestDto.getAncNo());
        pmtctVisit.setUuid(UUID.randomUUID().toString());
        pmtctVisit.setEntryPoint(pmtctVisitRequestDto.getEnteryPoint());
        pmtctVisit.setFpCounseling(pmtctVisitRequestDto.getFpCounseling());
        pmtctVisit.setFpMethod(pmtctVisitRequestDto.getFpMethod());
        pmtctVisit.setDateOfViralLoad(pmtctVisitRequestDto.getDateOfViralLoad());
        pmtctVisit.setGaOfViralLoad(pmtctVisitRequestDto.getGaOfViralLoad());
        pmtctVisit.setResultOfViralLoad(pmtctVisitRequestDto.getResultOfViralLoad());
        int ga = pmtctVisitRequestDto.getGaOfViralLoad();
        String tVL = "Other Time";
        if((ga >= 32) || (ga<=36)) tVL = "Between 32 and 36";
        pmtctVisit.setTimeOfViralLoad(tVL);
        pmtctVisit.setDsd(pmtctVisitRequestDto.getDsd());
        pmtctVisit.setDsdOption(pmtctVisitRequestDto.getDsdOption());
        pmtctVisit.setDsdModel(pmtctVisitRequestDto.getDsdModel());
        pmtctVisit.setMaternalOutcome(pmtctVisitRequestDto.getMaternalOutcome());
        pmtctVisit.setDateOfMaternalOutcome(pmtctVisitRequestDto.getDateOfmeternalOutcome());
        pmtctVisit.setVisitStatus(pmtctVisitRequestDto.getVisitStatus());
        pmtctVisit.setTransferTo(pmtctVisitRequestDto.getTransferTo());
        pmtctVisit.setNextAppointmentDate(nextAppointmentDate(pmtctVisitRequestDto.getDateOfVisit()));
        String visitStatus = pmtctVisitRequestDto.getVisitStatus();
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            System.out.println("pmtctVisitRequestDto.getPersonUuid() = "+pmtctVisitRequestDto.getPersonUuid());
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisitRequestDto.getPersonUuid(), facilityId, 0);
            if (persons.isPresent()) {
                Person person = persons.get();
                pmtctVisit.setHospitalNumber(person.getHospitalNumber());
                pmtctVisit.setPersonUuid(pmtctVisitRequestDto.getPersonUuid());
                //System.out.println("visitStatus = " + visitStatus);
                if (visitStatus != null) {
                    System.out.println("Hummm we still get here "+ pmtctVisitRequestDto.getAncNo());
                    Optional<ANC> ancs = ancRepository.getByAncNo(pmtctVisitRequestDto.getAncNo());
                    if(ancs.isPresent()) {
                        ANC anc = ancs.get();
                        if (visitStatus.contains("_IN")) {

                            ancService.updateANC(anc, visitStatus, pmtctVisitRequestDto.getDateOfVisit());
                        } else {
                            ancService.graduateFromANC(anc, visitStatus);
                        }
                    }

                }


            }
        } catch (Exception e) { e.printStackTrace(); }

        return this.pmtctVisitRepository.save(pmtctVisit);
    }


    public PmtctVisitResponseDto convertEntitytoRespondDto(PmtctVisit pmtctVisit) {
        PmtctVisitResponseDto pmtctVisitResponseDto = new PmtctVisitResponseDto();
        pmtctVisitResponseDto.setId(pmtctVisit.getId());
        pmtctVisitResponseDto.setAncNo(pmtctVisit.getAncNo());
        pmtctVisitResponseDto.setDateOfVisit(pmtctVisit.getDateOfVisit());
        pmtctVisitResponseDto.setEnteryPoint(pmtctVisit.getEntryPoint());
        pmtctVisitResponseDto.setFpCounseling(pmtctVisit.getFpCounseling());
        pmtctVisitResponseDto.setFpMethod(pmtctVisit.getFpMethod());
        pmtctVisitResponseDto.setDateOfViralLoad(pmtctVisit.getDateOfViralLoad());
        pmtctVisitResponseDto.setGaOfViralLoad(pmtctVisit.getGaOfViralLoad());
        pmtctVisitResponseDto.setResultOfViralLoad(pmtctVisit.getResultOfViralLoad());

        pmtctVisitResponseDto.setTimeOfViralLoad(pmtctVisit.getTimeOfViralLoad());
        pmtctVisitResponseDto.setDsd(pmtctVisit.getDsd());

        pmtctVisitResponseDto.setDsdOption(pmtctVisit.getDsdOption());
        pmtctVisitResponseDto.setDsdModel(pmtctVisit.getDsdModel());
        pmtctVisitResponseDto.setMaternalOutcome(pmtctVisit.getMaternalOutcome());
        pmtctVisitResponseDto.setDateOfmeternalOutcome(pmtctVisit.getDateOfMaternalOutcome());
        pmtctVisitResponseDto.setVisitStatus(pmtctVisit.getVisitStatus());
        pmtctVisitResponseDto.setTransferTo(pmtctVisit.getTransferTo());
        pmtctVisitResponseDto.setNextAppointmentDate(pmtctVisit.getNextAppointmentDate());
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            System.out.println("pmtctVisit.getPersonUuid() = "+pmtctVisit.getPersonUuid());
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisit.getPersonUuid(), facilityId, 0);
            if (persons.isPresent()) {
                System.out.println("Doc check me out here 1");
                Person person = persons.get();
                pmtctVisitResponseDto.setHospitalNumber(person.getHospitalNumber());
                pmtctVisitResponseDto.setFullName(this.getFullName(pmtctVisit.getPersonUuid()));
                pmtctVisitResponseDto.setSex(person.getSex());
                pmtctVisitResponseDto.setAge(this.calculateAge(pmtctVisit.getPersonUuid()));
                pmtctVisitResponseDto.setDateOfBirth(person.getDateOfBirth());
                pmtctVisitResponseDto.setPersonUuid(person.getUuid());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        return pmtctVisitResponseDto;
    }

    private String getFullName(String uuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId, 0);

        String fullName = "";
        if (persons.isPresent()) {
            Person person = persons.get();
            String fn = person.getFirstName();
            String sn = person.getSurname();
            String on = person.getOtherName();
            if (fn == null) fn = "";
            if (sn == null) sn = "";
            if (on == null) on = "";
            fullName = sn + ", " + fn + " " + on;
        } else {
            fullName = "";
        }
        return fullName;
    }

    public int calculateAge(String uuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId, 0);

        int age = 0;
        //System.out.println("HostpitalNumber in Age " + uuid);
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
       // System.out.println("Age " + age);
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

    public List<PmtctVisitResponseDto> getVisitByAncNo(String ancNo) {
        List<PmtctVisit> pmtctVisitList = this.pmtctVisitRepository.findByAncNoOrderByDateOfVisitDesc(ancNo);
        List<PmtctVisitResponseDto> PmtctVisitResponseDtoList = new ArrayList<>();
        pmtctVisitList.forEach(pmtctVisit -> PmtctVisitResponseDtoList.add(convertEntitytoRespondDto(pmtctVisit)));
        return PmtctVisitResponseDtoList;
    }

    private PmtctVisit getExistVisit(Long id) {
        return pmtctVisitRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No visit was found with given Id " + id));
    }
    public PmtctVisitResponseDto updatePmtctVisit(Long id, PmtctVisitRequestDto pmtctVisitRequestDto) {
        // PmtctVisit existVisit = getExistVisit(id);
        PmtctVisit pmtctVisit = converRequestDtotoEntity(pmtctVisitRequestDto);
        pmtctVisit.setId(id);
        //pmtctVisit.setArchived(0);
        return convertEntitytoRespondDto(pmtctVisitRepository.save(pmtctVisit));
    }

    public PmtctVisitResponseDto viewPmtctVisit(Long id) {
        PmtctVisit pmtctVisit = getExistVisit(id);
        return convertEntitytoRespondDto(pmtctVisit);
    }

    public void deleteMotherVisit(Long id) {
        PmtctVisit exist = this.getSinglePmtctVisit(id);
        this.pmtctVisitRepository.delete(exist);
    }

}
