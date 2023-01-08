package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
}