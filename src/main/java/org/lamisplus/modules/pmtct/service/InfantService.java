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
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
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
        infant.setDateOfDelivery(infantDto.getDateOfDelivery());
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
        infantRepository.save(infant);
        return infant;
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
        //personMetaDataDto.setRecords(ancResponseDtos);
        personMetaDataDto.setRecords(infants.getContent());
        return personMetaDataDto;
        //return checkedInPeople;
    }
}