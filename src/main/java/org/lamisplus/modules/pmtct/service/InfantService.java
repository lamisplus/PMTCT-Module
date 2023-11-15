package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PageDTO;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@AllArgsConstructor
public class InfantService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final InfantRepository infantRepository;
    private final UserService userService;
    private final PersonService personService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;

    public Infant save(InfantDto infantDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Infant infant = new Infant();
        infant.setMotherPersonUuid(infantDto.getPersonUuid());
        infant.setDateOfDelivery(infantDto.getDateOfDelivery());
        try{
            infant.setNin(calculateAgeInMonths(infantDto.getDateOfDelivery())+"");
        }catch (Exception e){}
        infant.setFirstName(personService.treatNull(infantDto.getFirstName()));
        infant.setMiddleName(personService.treatNull(infantDto.getMiddleName()));
        infant.setSurname(personService.treatNull(infantDto.getSurname()));
        infant.setSex(infantDto.getSex());
        infant.setAncNo(infantDto.getAncNo());
        infant.setHospitalNumber(infantDto.getHospitalNumber());
        infant.setUuid(UUID.randomUUID().toString());
        infant.setFacilityId(facilityId);
        infant.setCreatedBy(user.getUserName());
        infant.setLastModifiedBy(user.getUserName());
        infant.setLastVisitDate(infantDto.getDateOfDelivery());
        infant.setNextAppointmentDate(this.calculateNAD(infantDto.getDateOfDelivery()));
        infant.setDefaultDays(0);
        infantRepository.save(infant);
        return infant;
    }

    public int calculateAgeInMonths(LocalDate dob){
        LocalDate toDay = LocalDate.now();
        int ga =  0;
        if (dob == null){}else ga  = (int) ChronoUnit.MONTHS.between(dob, toDay);
        if(ga<0) ga = 0;
        return ga;
    }

    @SneakyThrows
    public Infant getSingleInfant(Long id) {
        return this.infantRepository.findById(id)
                .orElseThrow(() -> new Exception("Infant NOT FOUND"));
    }

     public Infant updateInfant(Long id, InfantDto infantDto) {
         Optional<User> currentUser = this.userService.getUserWithRoles();
         User user = (User) currentUser.get();
         Long facilityId = user.getCurrentOrganisationUnitId();
         Infant infant = new Infant();
         infant.setDateOfDelivery(infantDto.getDateOfDelivery());
         try{
             infant.setNin(calculateAgeInMonths(infantDto.getDateOfDelivery())+"");
         }catch (Exception e){}
         infant.setFirstName(personService.treatNull(infantDto.getFirstName()));
         infant.setMiddleName(personService.treatNull(infantDto.getMiddleName()));
         infant.setSurname(personService.treatNull(infantDto.getSurname()));
         infant.setSex(infantDto.getSex());
         infant.setAncNo(infantDto.getAncNo());
         infant.setHospitalNumber(infantDto.getHospitalNumber());
         infant.setUuid(UUID.randomUUID().toString());
         infant.setFacilityId(facilityId);
         infant.setCreatedBy(user.getUserName());
         infant.setLastModifiedBy(user.getUserName());
         infant.setId(id);
         infant.setLastVisitDate(infantDto.getDateOfDelivery());
         infant.setNextAppointmentDate(this.calculateNAD(infantDto.getDateOfDelivery()));
         infant.setDefaultDays(0);
        return infantRepository.save(infant);
    }

    public List<Infant> getInfantByAncNo(String ancNo)
    {
        return infantRepository.findInfantByAncNo(ancNo);
    }

    public List<Infant> getAllInfant()
    {
        return infantRepository.findAll();
    }

    public PersonMetaDataDto getAllInfants(int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        Page<Infant> infants =  infantRepository.getInfant(currentOrganisationUnitId, paging);


        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords(infants.getTotalElements());
        personMetaDataDto.setPageSize(paging.getPageSize());
        personMetaDataDto.setTotalPages(infants.getTotalPages());
        personMetaDataDto.setCurrentPage(infants.getNumber());

        personMetaDataDto.setRecords(infants.getContent());
        return personMetaDataDto;
    }
    public void updateInfant(String hospitalNo, String outCome) {
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(hospitalNo);
        if (infants.isPresent()){
            Infant infant = infants.get();
            infant.setInfantOutcomeAt18_months(outCome);
            infantRepository.save(infant);
        }
    }

    public CompletableFuture<Boolean> hospitalNumberExist(String hospitalNumber) {
        Optional<Infant> infants = this.infantRepository.getInfantByHospitalNumber(hospitalNumber);
        if (infants.isPresent()) {
            System.out.println("True");
            return CompletableFuture.completedFuture(true);
        }
        else{
            System.out.println("False");
            return CompletableFuture.completedFuture(false);
        }
    }

    public void deleteInfant(Long id) {
        Infant exist = this.getSingleInfant(id);
        this.infantRepository.delete(exist);
    }


    public int defaultDate (LocalDate day1, LocalDate day2){
        int  age = (int) ChronoUnit.MONTHS.between(day1, day2);
        if (age <= 0) age = 0;
        return age;
    }

    public LocalDate calculateNAD(LocalDate lmd) {
        LocalDate date = lmd;
        date = date.plusMonths(1);
        return date;
    }

    public List<Infant> getInfantWithMotherPersonUuid(String personUuid) {
        return infantRepository.findInfantByMotherPersonUuid(personUuid);
    }
}