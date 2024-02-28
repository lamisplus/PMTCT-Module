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
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.ApplicationCodeSet;
import org.lamisplus.modules.base.domain.entities.OrganisationUnit;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.domain.repositories.OrganisationUnitRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.ANCRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.InfantMotherArtDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTEnrollmentRespondDto;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.domain.entity.enums.PmtctType;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PMTCTEnrollmentService {
  private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
  private final ANCRepository ancRepository;
  private final PersonRepository personRepository;
  private final UserService userService;
  private final PersonService personService;
  private final OrganisationUnitRepository organisationUnitRepository;
  private final ApplicationCodesetRepository applicationCodesetRepository;
  private final InfantVisitService infantVisitService;

    public PMTCTEnrollmentRespondDto save(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
      //System.out.println(pmtctEnrollmentRequestDto);
     return convertEntitytoRespondDto(convertEntitytoRespondDto(pmtctEnrollmentRequestDto));
  }

    public PMTCTEnrollment convertEntitytoRespondDto(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));

        String personUuid = pmtctEnrollmentRequestDto.getPersonUuid();
        Person person;

        if (personUuid != null) {
            person = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(personUuid, user.getCurrentOrganisationUnitId(), 0)
                    .orElseThrow(() -> new RuntimeException("Person not found"));
        } else if (pmtctEnrollmentRequestDto.getPersonDto() != null) {
            String person1 = createPerson(pmtctEnrollmentRequestDto.getPersonDto());
            person = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(person1, user.getCurrentOrganisationUnitId(), 0)
                    .orElseThrow(() -> new RuntimeException("Person not found"));
        } else {
            throw new IllegalArgumentException("Neither personUuid nor personDto provided");
        }

        PMTCTEnrollment pmtctEnrollment = new PMTCTEnrollment();
        pmtctEnrollment.setHospitalNumber(person.getHospitalNumber());
        pmtctEnrollment.setPmtctType(pmtctEnrollmentRequestDto.getPmtctType());
//      System.out.println("got to the type parameter");
//      System.out.println(pmtctEnrollmentRequestDto.getPmtctType());
//      System.out.println(pmtctEnrollment.getPmtctType());
        pmtctEnrollment.setPersonUuid(person.getUuid());
        pmtctEnrollment.setHivStatus(pmtctEnrollmentRequestDto.getHivStatus());
        pmtctEnrollment.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
        pmtctEnrollment.setLmp(pmtctEnrollmentRequestDto.getLmp());
        pmtctEnrollment.setGravida(pmtctEnrollmentRequestDto.getGravida());
        pmtctEnrollment.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());

        if (pmtctEnrollmentRequestDto.getPmtctType() == "ANC") {
            pmtctEnrollment.setAncNo(pmtctEnrollmentRequestDto.getAncNo());
        }
        pmtctEnrollment.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
        pmtctEnrollment.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
        pmtctEnrollment.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
        pmtctEnrollment.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
        pmtctEnrollment.setUuid(UUID.randomUUID().toString());
        pmtctEnrollment.setArchived(0L);
        ANC anc = this.ancRepository.findByAncNoAndArchived(pmtctEnrollmentRequestDto.getAncNo(), Long.valueOf(0L));
        if (anc != null) {
            pmtctEnrollment.setGAWeeks(anc.getGAWeeks());
            pmtctEnrollment.setHospitalNumber(anc.getHospitalNumber());
            pmtctEnrollment.setFacilityId(anc.getFacilityId());
            pmtctEnrollment.setCreatedBy(anc.getCreatedBy());
            pmtctEnrollment.setLastModifiedBy(anc.getLastModifiedBy());
        }
        pmtctEnrollment.setMotherArtInitiationTime(pmtctEnrollmentRequestDto.getMotherArtInitiationTime());
        pmtctEnrollment.setRegimenTypeId(pmtctEnrollmentRequestDto.getRegimenTypeId());
        pmtctEnrollment.setRegimenId(pmtctEnrollmentRequestDto.getRegimenId());
//     else { throw new RuntimeException("YET TO REGISTER FOR ANC"); }

        return (PMTCTEnrollment) this.pmtctEnrollmentReporsitory.save(pmtctEnrollment);
    }

    public String createPerson(PersonDto personDto) {
        Person person = this.getPersonFromDto(personDto);
        this.getCurrentFacility(person);
        person.setUuid(UUID.randomUUID().toString());
        person.setFullName(personService.getFullName(personDto.getFirstName(), personDto.getOtherName(), personDto.getSurname()));
        this.personRepository.save(person);
        return person.getUuid();
    }

    private void getCurrentFacility(Person person) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            Long currentOrganisationUnitId = user.getCurrentOrganisationUnitId();
            person.setFacilityId(currentOrganisationUnitId);
        }

    }

    private String getHospitalNumber(PersonDto personDto) {
        List<IdentifierDto> identifier = personDto.getIdentifier();
        if (!identifier.isEmpty()) {
            IdentifierDto identifierDto = identifier.get(0);
            String type = identifierDto.getType();
            if (type.equals("HospitalNumber")) {
                String hospitalNumber = identifierDto.getValue();
                return hospitalNumber;
            }
        }
        return null;
    }

    private ApplicationCodeDto getAppCodeSet(Long id) {
        ApplicationCodeSet applicationCodeSet = (ApplicationCodeSet) this.applicationCodesetRepository.getOne(id);
        return new ApplicationCodeDto(applicationCodeSet.getId(), applicationCodeSet.getDisplay());
    }

    private OrgUnitDto getOrgUnit(Long id) {
        OrganisationUnit organizationUnit = (OrganisationUnit) this.organisationUnitRepository.getOne(id);
        return new OrgUnitDto(organizationUnit.getId(), organizationUnit.getName());
    }

    @NotNull
    private Person getPersonFromDto(PersonDto personDto) {
        Long sexId = personDto.getSexId();
        Long genderId = personDto.getGenderId();
        Long maritalStatusId = personDto.getMaritalStatusId();
        Long educationalId = personDto.getEducationId();
        Long employmentStatusId = personDto.getEmploymentStatusId();
        Long organizationId = personDto.getOrganizationId();
        List<ContactPointDto> contactPointDtos = personDto.getContactPoint();
        List<ContactDto> contact = personDto.getContact();
        List<IdentifierDto> identifier = personDto.getIdentifier();
        List<AddressDto> address = personDto.getAddress();
        ObjectMapper mapper = new ObjectMapper();
        Person person = new Person();
        String hospitalNumber = this.getHospitalNumber(personDto);
        person.setHospitalNumber(hospitalNumber);
        person.setFirstName(personDto.getFirstName());
        person.setSurname(personDto.getSurname());
        person.setOtherName(personDto.getOtherName());
        person.setDateOfBirth(personDto.getDateOfBirth());
        person.setDateOfRegistration(personDto.getDateOfRegistration());
        person.setActive(personDto.getActive());
        person.setFacilityId(personDto.getFacilityId());
        person.setArchived(0);
        person.setDeceasedDateTime(personDto.getDeceasedDateTime());
        person.setDeceased(personDto.getDeceased());
        person.setNinNumber(personDto.getNinNumber());
        person.setEmrId(personDto.getEmrId());
        boolean isDateOfBirthEstimated = personDto.getIsDateOfBirthEstimated() != null;
        person.setIsDateOfBirthEstimated(isDateOfBirthEstimated);
        ApplicationCodeDto employmentStatusDto;
        JsonNode addressesDtoJsonNode;
        if (genderId != null) {
            employmentStatusDto = this.getAppCodeSet(genderId);
            addressesDtoJsonNode = mapper.valueToTree(employmentStatusDto);
            person.setGender(addressesDtoJsonNode);
        }

        if (sexId != null) {
            employmentStatusDto = this.getAppCodeSet(sexId);
            person.setSex(employmentStatusDto.getDisplay());
        }

        if (maritalStatusId != null) {
            employmentStatusDto = this.getAppCodeSet(maritalStatusId);
            addressesDtoJsonNode = mapper.valueToTree(employmentStatusDto);
            person.setMaritalStatus(addressesDtoJsonNode);
        }

        if (educationalId != null) {
            employmentStatusDto = this.getAppCodeSet(educationalId);
            addressesDtoJsonNode = mapper.valueToTree(employmentStatusDto);
            person.setEducation(addressesDtoJsonNode);
        }

        if (employmentStatusId != null) {
            employmentStatusDto = this.getAppCodeSet(employmentStatusId);
            addressesDtoJsonNode = mapper.valueToTree(employmentStatusDto);
            person.setEmploymentStatus(addressesDtoJsonNode);
        }

        if (organizationId != null) {
            OrgUnitDto organisationUnitDto = this.getOrgUnit(organizationId);
            addressesDtoJsonNode = mapper.valueToTree(organisationUnitDto);
            person.setOrganization(addressesDtoJsonNode);
        }

        ArrayNode addressesDtoArrayNode;
        if (contactPointDtos != null && !contactPointDtos.isEmpty()) {
            addressesDtoArrayNode = (ArrayNode) mapper.valueToTree(contactPointDtos);
            addressesDtoJsonNode = mapper.createObjectNode().set("contactPoint", addressesDtoArrayNode);
            person.setContactPoint(addressesDtoJsonNode);
        }

        if (contact != null && !contact.isEmpty()) {
            addressesDtoArrayNode = (ArrayNode) mapper.valueToTree(contact);
            addressesDtoJsonNode = mapper.createObjectNode().set("contact", addressesDtoArrayNode);
            person.setContact(addressesDtoJsonNode);
        }

        if (identifier != null && !identifier.isEmpty()) {
            addressesDtoArrayNode = (ArrayNode) mapper.valueToTree(identifier);
            addressesDtoJsonNode = mapper.createObjectNode().set("identifier", addressesDtoArrayNode);
            person.setIdentifier(addressesDtoJsonNode);
        }

        if (address != null && !address.isEmpty()) {
            addressesDtoArrayNode = (ArrayNode) mapper.valueToTree(address);
            addressesDtoJsonNode = mapper.createObjectNode().set("address", addressesDtoArrayNode);
            person.setAddress(addressesDtoJsonNode);
        }

        return person;
    }
  public PMTCTEnrollmentRespondDto convertEntitytoRespondDto(PMTCTEnrollment pmtctEnrollment) {
       PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = new PMTCTEnrollmentRespondDto();
       if(pmtctEnrollment != null) {
           pmtctEnrollmentRespondDto.setId(pmtctEnrollment.getId());
           pmtctEnrollmentRespondDto.setHivStatus(pmtctEnrollment.getHivStatus());
           pmtctEnrollmentRespondDto.setLmp(pmtctEnrollment.getLmp());
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
           pmtctEnrollmentRespondDto.setPmtctRegStatus(true);
           pmtctEnrollmentRespondDto.setPersonUuid(pmtctEnrollment.getPersonUuid());
           pmtctEnrollmentRespondDto.setMotherArtInitiationTime(pmtctEnrollment.getMotherArtInitiationTime());
           pmtctEnrollmentRespondDto.setRegimenTypeId(pmtctEnrollment.getRegimenTypeId());
           pmtctEnrollmentRespondDto.setRegimenId(pmtctEnrollment.getRegimenId());
           PMTCTEnrollment pmtct = this.pmtctEnrollmentReporsitory.findByPersonUuidAndArchived(pmtctEnrollment.getPersonUuid(), Long.valueOf(0L));
           if(pmtct != null) {
               pmtctEnrollmentRespondDto.setHospitalNumber(pmtct.getHospitalNumber());
               pmtctEnrollmentRespondDto.setFullName(getFullName(pmtct.getPersonUuid()));
               pmtctEnrollmentRespondDto.setAge(calculateAge(pmtct.getPersonUuid()));
           }
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
    public PMTCTEnrollmentRespondDto getSinglePmtctEnrollmentByPersonUuid(String id) {
        return convertEntitytoRespondDto(this.pmtctEnrollmentReporsitory.findPMTCTEnrollmentByPersonUuid(id));

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
            pmtctEnrollment1.setHivStatus(pmtctEnrollmentRequestDto.getHivStatus());
            pmtctEnrollment1.setPmtctType(pmtctEnrollmentRequestDto.getPmtctType());
            pmtctEnrollment1.setMotherArtInitiationTime(pmtctEnrollmentRequestDto.getMotherArtInitiationTime());
            pmtctEnrollment1.setRegimenTypeId(pmtctEnrollmentRequestDto.getRegimenTypeId());
            pmtctEnrollment1.setRegimenId(pmtctEnrollmentRequestDto.getRegimenId());
            this.pmtctEnrollmentReporsitory.save(pmtctEnrollment1);
        }
        return pmtctEnrollmentRequestDto;
    }

    public  PMTCTEnrollmentRespondDto  viewPMTCTEnrollmentById(Long id) {
       return convertEntitytoRespondDto(pmtctEnrollmentReporsitory.findById(id).orElseThrow(()-> new EntityNotFoundException(PMTCTEnrollment.class, "Id", id+ "") ));
    }

    public void deletePMTCT(Long id) {
        PMTCTEnrollment existingPMTCTEnrollment = this.getSinglePmtctEnrollment(id);
        this.pmtctEnrollmentReporsitory.delete(existingPMTCTEnrollment);
    }

}
