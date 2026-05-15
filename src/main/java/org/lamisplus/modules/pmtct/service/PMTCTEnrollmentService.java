package org.lamisplus.modules.pmtct.service;

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
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.domain.dto.HTSPatient;
import org.lamisplus.modules.pmtct.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.*;


@Service
@RequiredArgsConstructor
public class PMTCTEnrollmentService {
    private static final Logger log = LoggerFactory.getLogger(PMTCTEnrollmentService.class);
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
 @Autowired
  private  ANCRepository ancRepository;
  private final PersonRepository personRepository;
  private final UserService userService;

  private final PersonService personService;
  private final OrganisationUnitRepository organisationUnitRepository;
  private final ApplicationCodesetRepository applicationCodesetRepository;
  private final InfantVisitService infantVisitService;
  private final CurrentUserOrganizationService currentUserOrganizationService;

  private final InfantVisitRepository infantVisitRepository;
private final InfantPCRTestRepository   infantPCRTestRepository;
  private final InfantRepository infantRepository;
  private final PmtctPregnancyCycleRepository pmtctPregnancyCycleRepository;

  @Autowired
  private  DeliveryService   deliveryService;

@Autowired
private ANCService ancService;

@Autowired
private DeliveryRepository deliveryRepository;

    public PMTCTEnrollmentRespondDto save(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
      //System.out.println(pmtctEnrollmentRequestDto);
     return convertEntitytoRespondDto(convertEntitytoRespondDto(pmtctEnrollmentRequestDto));
  }

    public PMTCTEnrollment convertEntitytoRespondDto(PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));

        String patientUuid = pmtctEnrollmentRequestDto.getPatientUuid();
        Person person;

        if (patientUuid != null) {
            person = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(patientUuid, user.getCurrentOrganisationUnitId(), 0)
                    .orElseThrow(() -> new RuntimeException("Person not found"));
        } else if (pmtctEnrollmentRequestDto.getPersonDto() != null) {
            String person1 = createPerson(pmtctEnrollmentRequestDto.getPersonDto());
            person = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(person1, user.getCurrentOrganisationUnitId(), 0)
                    .orElseThrow(() -> new RuntimeException("Person not found"));
        } else {
            throw new IllegalArgumentException("Neither patientUuid nor personDto provided");
        }

        // Set pmtctCycleUuid - this is now compulsory
        if (pmtctEnrollmentRequestDto.getPmtctCycleUuid() == null) {
            throw new IllegalArgumentException("pmtctCycleUuid is required for PMTCT enrollment");
        }

        // Check if an enrollment already exists for this person + cycle to prevent duplicates
        Optional<PMTCTEnrollment> existingEnrollment = this.pmtctEnrollmentReporsitory
                .getByPatientUuidAndPmtctCycleId(person.getUuid(), pmtctEnrollmentRequestDto.getPmtctCycleUuid());

        PMTCTEnrollment pmtctEnrollment;
        boolean isExisting = existingEnrollment.isPresent();
        if (isExisting) {
            // Update the existing enrollment instead of creating a duplicate
            pmtctEnrollment = existingEnrollment.get();
            pmtctEnrollment.setLastModifiedBy(user.getUserName());
            pmtctEnrollment.setLastModifiedDate(java.time.LocalDateTime.now());
        } else {
            // Create new enrollment
            pmtctEnrollment = new PMTCTEnrollment();
            pmtctEnrollment.setPatientUuid(person.getUuid());
            pmtctEnrollment.setUuid(UUID.randomUUID().toString());
            pmtctEnrollment.setArchived(0L);
            pmtctEnrollment.setFacilityId(user.getCurrentOrganisationUnitId());
            pmtctEnrollment.setCreatedBy(user.getUserName());
            pmtctEnrollment.setCreatedDate(java.time.LocalDateTime.now());
            pmtctEnrollment.setLastModifiedBy(user.getUserName());
            pmtctEnrollment.setLastModifiedDate(java.time.LocalDateTime.now());
            pmtctEnrollment.setPmtctCycleUuid(pmtctEnrollmentRequestDto.getPmtctCycleUuid());
            pmtctEnrollment.setSource(pmtctEnrollmentRequestDto.getSource());
        }

        if (isExisting) {
            // For existing records, only update fields that are NOT null in the request
            // to prevent wiping previously saved data
            if (pmtctEnrollmentRequestDto.getHivStatus() != null) pmtctEnrollment.setHivStatus(pmtctEnrollmentRequestDto.getHivStatus());
            if (pmtctEnrollmentRequestDto.getPmtctEnrollmentDate() != null) pmtctEnrollment.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
            if (pmtctEnrollmentRequestDto.getLmp() != null) pmtctEnrollment.setLmp(pmtctEnrollmentRequestDto.getLmp());
            if (pmtctEnrollmentRequestDto.getGravida() != null) pmtctEnrollment.setGravida(pmtctEnrollmentRequestDto.getGravida());
            if (pmtctEnrollmentRequestDto.getGAWeeks() != null) pmtctEnrollment.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());
            if (pmtctEnrollmentRequestDto.getDateOfDelivery() != null) pmtctEnrollment.setDateOfDelivery(pmtctEnrollmentRequestDto.getDateOfDelivery());
            if (pmtctEnrollmentRequestDto.getExpectedDeliveryDate() != null) pmtctEnrollment.setExpectedDeliveryDate(pmtctEnrollmentRequestDto.getExpectedDeliveryDate());
            if (pmtctEnrollmentRequestDto.getModeOfDelivery() != null) pmtctEnrollment.setModeOfDelivery(pmtctEnrollmentRequestDto.getModeOfDelivery());
            if (pmtctEnrollmentRequestDto.getModeOfDeliveryOther() != null) pmtctEnrollment.setModeOfDeliveryOther(pmtctEnrollmentRequestDto.getModeOfDeliveryOther());
            if (pmtctEnrollmentRequestDto.getEntryPoint() != null) pmtctEnrollment.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
            if (pmtctEnrollmentRequestDto.getArtStartDate() != null) pmtctEnrollment.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
            if (pmtctEnrollmentRequestDto.getArtStartTime() != null) pmtctEnrollment.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
            if (pmtctEnrollmentRequestDto.getTbStatus() != null) pmtctEnrollment.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
            if (pmtctEnrollmentRequestDto.getTimeOfHivDiagnosis() != null) pmtctEnrollment.setTimeOfHivDiagnosis(pmtctEnrollmentRequestDto.getTimeOfHivDiagnosis());
            if (pmtctEnrollmentRequestDto.getRegimenTypeId() != null) pmtctEnrollment.setRegimenTypeId(pmtctEnrollmentRequestDto.getRegimenTypeId());
            if (pmtctEnrollmentRequestDto.getRegimenId() != null) pmtctEnrollment.setRegimenId(pmtctEnrollmentRequestDto.getRegimenId());
            if (pmtctEnrollmentRequestDto.getUrinalysis() != null) pmtctEnrollment.setUrinalysis(pmtctEnrollmentRequestDto.getUrinalysis());
            if (pmtctEnrollmentRequestDto.getHbvDetails() != null) pmtctEnrollment.setHbvDetails(pmtctEnrollmentRequestDto.getHbvDetails());
            if (pmtctEnrollmentRequestDto.getSyphilisDetails() != null) pmtctEnrollment.setSyphilisDetails(pmtctEnrollmentRequestDto.getSyphilisDetails());
        } else {
            // For new records, set all fields (including nulls)
            pmtctEnrollment.setHivStatus(pmtctEnrollmentRequestDto.getHivStatus());
            pmtctEnrollment.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
            pmtctEnrollment.setLmp(pmtctEnrollmentRequestDto.getLmp());
            pmtctEnrollment.setGravida(pmtctEnrollmentRequestDto.getGravida());
            pmtctEnrollment.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());
            pmtctEnrollment.setDateOfDelivery(pmtctEnrollmentRequestDto.getDateOfDelivery());
            pmtctEnrollment.setExpectedDeliveryDate(pmtctEnrollmentRequestDto.getExpectedDeliveryDate());
            pmtctEnrollment.setModeOfDelivery(pmtctEnrollmentRequestDto.getModeOfDelivery());
            pmtctEnrollment.setModeOfDeliveryOther(pmtctEnrollmentRequestDto.getModeOfDeliveryOther());
            pmtctEnrollment.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
            pmtctEnrollment.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
            pmtctEnrollment.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
            pmtctEnrollment.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
            pmtctEnrollment.setTimeOfHivDiagnosis(pmtctEnrollmentRequestDto.getTimeOfHivDiagnosis());
            pmtctEnrollment.setRegimenTypeId(pmtctEnrollmentRequestDto.getRegimenTypeId());
            pmtctEnrollment.setRegimenId(pmtctEnrollmentRequestDto.getRegimenId());
            pmtctEnrollment.setUrinalysis(pmtctEnrollmentRequestDto.getUrinalysis());
            pmtctEnrollment.setHbvDetails(pmtctEnrollmentRequestDto.getHbvDetails());
            pmtctEnrollment.setSyphilisDetails(pmtctEnrollmentRequestDto.getSyphilisDetails());
        }

        PMTCTEnrollment savedEnrollment = (PMTCTEnrollment) this.pmtctEnrollmentReporsitory.save(pmtctEnrollment);

        // Update pregnancy cycle status to ACTIVE
        Optional<PmtctPregnancyCycle> pregnancyCycleOptional = this.pmtctPregnancyCycleRepository.findById(pmtctEnrollmentRequestDto.getPmtctCycleUuid());
        if (pregnancyCycleOptional.isPresent()) {
            PmtctPregnancyCycle pregnancyCycle = pregnancyCycleOptional.get();
            pregnancyCycle.setPmtctStatus("ACTIVE");
            this.pmtctPregnancyCycleRepository.save(pregnancyCycle);
        }

        return savedEnrollment;
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

    public List <PatientArtData> getArtDate (String PatientUuid, Long FacilityId) {
        List<PatientArtData> getStartDate = pmtctEnrollmentReporsitory.getArtDate(PatientUuid, currentUserOrganizationService.getCurrentUserOrganization());
        return getStartDate;
    }

    public List <SingleResultProjectionDTO> getVlResult (String PatientUuid, String dateResultReceived) {
        LocalDate date = LocalDate.parse(dateResultReceived);
        List<SingleResultProjectionDTO> getResult = pmtctEnrollmentReporsitory.findByPatientUuidAndDateResultReceived(PatientUuid, date.atStartOfDay(), currentUserOrganizationService.getCurrentUserOrganization());
        return getResult;
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
           // id field is no longer the primary key; uuid is the PK now
           // pmtctEnrollmentRespondDto.setId(pmtctEnrollment.getId());
           pmtctEnrollmentRespondDto.setHivStatus(pmtctEnrollment.getHivStatus());
           pmtctEnrollmentRespondDto.setLmp(pmtctEnrollment.getLmp());
           pmtctEnrollmentRespondDto.setGAWeeks(pmtctEnrollment.getGAWeeks());
           pmtctEnrollmentRespondDto.setPmtctEnrollmentDate(pmtctEnrollment.getPmtctEnrollmentDate());
           pmtctEnrollmentRespondDto.setTbStatus(pmtctEnrollment.getTbStatus());
           pmtctEnrollmentRespondDto.setUuid(pmtctEnrollment.getUuid());
           pmtctEnrollmentRespondDto.setEntryPoint(pmtctEnrollment.getEntryPoint());
           pmtctEnrollmentRespondDto.setGravida(pmtctEnrollment.getGravida());
           pmtctEnrollmentRespondDto.setArtStartDate(pmtctEnrollment.getArtStartDate());
           pmtctEnrollmentRespondDto.setArtStartTime(pmtctEnrollment.getArtStartTime());
           pmtctEnrollmentRespondDto.setPmtctRegStatus(true);
           pmtctEnrollmentRespondDto.setPatientUuid(pmtctEnrollment.getPatientUuid());
           pmtctEnrollmentRespondDto.setRegimenTypeId(pmtctEnrollment.getRegimenTypeId());
           pmtctEnrollmentRespondDto.setRegimenId(pmtctEnrollment.getRegimenId());
           pmtctEnrollmentRespondDto.setUrinalysis(pmtctEnrollment.getUrinalysis());
           pmtctEnrollmentRespondDto.setHbvDetails(pmtctEnrollment.getHbvDetails());
           pmtctEnrollmentRespondDto.setSyphilisDetails(pmtctEnrollment.getSyphilisDetails());
           pmtctEnrollmentRespondDto.setTimeOfHivDiagnosis(pmtctEnrollment.getTimeOfHivDiagnosis());
           pmtctEnrollmentRespondDto.setDateOfDelivery(pmtctEnrollment.getDateOfDelivery());
           pmtctEnrollmentRespondDto.setExpectedDeliveryDate(pmtctEnrollment.getExpectedDeliveryDate());
           pmtctEnrollmentRespondDto.setModeOfDelivery(pmtctEnrollment.getModeOfDelivery());
           pmtctEnrollmentRespondDto.setModeOfDeliveryOther(pmtctEnrollment.getModeOfDeliveryOther());
           pmtctEnrollmentRespondDto.setPmtctCycleUuid(pmtctEnrollment.getPmtctCycleUuid());
           pmtctEnrollmentRespondDto.setSource(pmtctEnrollment.getSource());



           // Look up ANC by patientUuid to get ancNo, and Person for hospitalNumber
           Optional<ANC> ancOpt = this.ancRepository.findANCByPatientUuidAndArchived(pmtctEnrollment.getPatientUuid(), 0L);
           if (ancOpt.isPresent()) {
               ANC anc = ancOpt.get();
               pmtctEnrollmentRespondDto.setAncNo(anc.getAncNo());
           }
           pmtctEnrollmentRespondDto.setFullName(getFullName(pmtctEnrollment.getPatientUuid()));
           pmtctEnrollmentRespondDto.setAge(calculateAge(pmtctEnrollment.getPatientUuid()));
           Optional<User> currentUser = this.userService.getUserWithRoles();
           if (currentUser.isPresent()) {
               Long facilityId = currentUser.get().getCurrentOrganisationUnitId();
               Optional<Person> personOpt = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctEnrollment.getPatientUuid(), facilityId, 0);
               if (personOpt.isPresent()) {
                   pmtctEnrollmentRespondDto.setHospitalNumber(personOpt.get().getHospitalNumber());
               }
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
    public PMTCTEnrollment getSinglePmtctEnrollment(String id) {
        return this.pmtctEnrollmentReporsitory.findById(id)
                .orElseThrow(() -> new Exception("PMTCTEnrollment NOT FOUND"));
    }

    @SneakyThrows
    public PMTCTEnrollmentRespondDto getSinglePmtctEnrollmentByPatientUuid(String id) {
        Optional<PMTCTEnrollment> enrollment = this.pmtctEnrollmentReporsitory.findLatestPMTCTEnrollmentByPatientUuid(id);
        return enrollment.map(this::convertEntitytoRespondDto).orElse(null);
    }
    @SneakyThrows
    public PMTCTEnrollmentRespondDto getSinglePmtctEnrollmentByAncNo(String ancNo) {
        Optional<ANC> ancOpt = this.ancRepository.getByAncNo(ancNo);
        if (ancOpt.isPresent()) {
            Optional<PMTCTEnrollment> enrollment = this.pmtctEnrollmentReporsitory
                    .findLatestPMTCTEnrollmentByPatientUuid(ancOpt.get().getPatientUuid());
            if (enrollment.isPresent()) {
                return convertEntitytoRespondDto(enrollment.get());
            }
        }
        return null;
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

    public void  updateDateOfDeliveryFromDelivery(String patientUuid, LocalDate deliveryDate, Integer ga)
    {
        Optional <PMTCTEnrollment> pmtctEnrollment = this.pmtctEnrollmentReporsitory.findLatestPMTCTEnrollmentByPatientUuid(patientUuid);
        if(pmtctEnrollment.isPresent())
        {
            PMTCTEnrollment pmtctEnrollment1 = pmtctEnrollment.get();
            pmtctEnrollment1.setDateOfDelivery(deliveryDate);
            pmtctEnrollment1.setGAWeeks(ga);

            this.pmtctEnrollmentReporsitory.save(pmtctEnrollment1);
        }
    }

    public PMTCTEnrollmentRequestDto updatePMTCTEnrollment(String id, PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto)
    {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));

        Optional <PMTCTEnrollment> pmtctEnrollment = this.pmtctEnrollmentReporsitory.findById(id);
        if(pmtctEnrollment.isPresent())
        {
            PMTCTEnrollment pmtctEnrollment1 = pmtctEnrollment.get();
            // Only update fields that are NOT null to prevent wiping saved data
            if (pmtctEnrollmentRequestDto.getArtStartDate() != null) pmtctEnrollment1.setArtStartDate(pmtctEnrollmentRequestDto.getArtStartDate());
            if (pmtctEnrollmentRequestDto.getArtStartTime() != null) pmtctEnrollment1.setArtStartTime(pmtctEnrollmentRequestDto.getArtStartTime());
            if (pmtctEnrollmentRequestDto.getEntryPoint() != null) pmtctEnrollment1.setEntryPoint(pmtctEnrollmentRequestDto.getEntryPoint());
            if (pmtctEnrollmentRequestDto.getGAWeeks() != null) pmtctEnrollment1.setGAWeeks(pmtctEnrollmentRequestDto.getGAWeeks());
            if (pmtctEnrollmentRequestDto.getGravida() != null) pmtctEnrollment1.setGravida(pmtctEnrollmentRequestDto.getGravida());
            if (pmtctEnrollmentRequestDto.getPmtctEnrollmentDate() != null) pmtctEnrollment1.setPmtctEnrollmentDate(pmtctEnrollmentRequestDto.getPmtctEnrollmentDate());
            if (pmtctEnrollmentRequestDto.getTbStatus() != null) pmtctEnrollment1.setTbStatus(pmtctEnrollmentRequestDto.getTbStatus());
            if (pmtctEnrollmentRequestDto.getHivStatus() != null) pmtctEnrollment1.setHivStatus(pmtctEnrollmentRequestDto.getHivStatus());
            if (pmtctEnrollmentRequestDto.getLmp() != null) pmtctEnrollment1.setLmp(pmtctEnrollmentRequestDto.getLmp());
            if (pmtctEnrollmentRequestDto.getRegimenTypeId() != null) pmtctEnrollment1.setRegimenTypeId(pmtctEnrollmentRequestDto.getRegimenTypeId());
            if (pmtctEnrollmentRequestDto.getRegimenId() != null) pmtctEnrollment1.setRegimenId(pmtctEnrollmentRequestDto.getRegimenId());
            if (pmtctEnrollmentRequestDto.getDateOfDelivery() != null) pmtctEnrollment1.setDateOfDelivery(pmtctEnrollmentRequestDto.getDateOfDelivery());
            if (pmtctEnrollmentRequestDto.getExpectedDeliveryDate() != null) pmtctEnrollment1.setExpectedDeliveryDate(pmtctEnrollmentRequestDto.getExpectedDeliveryDate());
            if (pmtctEnrollmentRequestDto.getModeOfDelivery() != null) pmtctEnrollment1.setModeOfDelivery(pmtctEnrollmentRequestDto.getModeOfDelivery());
            if (pmtctEnrollmentRequestDto.getModeOfDeliveryOther() != null) pmtctEnrollment1.setModeOfDeliveryOther(pmtctEnrollmentRequestDto.getModeOfDeliveryOther());
            if (pmtctEnrollmentRequestDto.getUrinalysis() != null) pmtctEnrollment1.setUrinalysis(pmtctEnrollmentRequestDto.getUrinalysis());
            if (pmtctEnrollmentRequestDto.getHbvDetails() != null) pmtctEnrollment1.setHbvDetails(pmtctEnrollmentRequestDto.getHbvDetails());
            if (pmtctEnrollmentRequestDto.getSyphilisDetails() != null) pmtctEnrollment1.setSyphilisDetails(pmtctEnrollmentRequestDto.getSyphilisDetails());
            if (pmtctEnrollmentRequestDto.getTimeOfHivDiagnosis() != null) pmtctEnrollment1.setTimeOfHivDiagnosis(pmtctEnrollmentRequestDto.getTimeOfHivDiagnosis());

            // Update lastModifiedBy with current user
            pmtctEnrollment1.setLastModifiedBy(user.getUserName());
            pmtctEnrollment1.setLastModifiedDate(java.time.LocalDateTime.now());

            // Update pmtctCycleUuid if provided
            if (pmtctEnrollmentRequestDto.getPmtctCycleUuid() != null) {
                pmtctEnrollment1.setPmtctCycleUuid(pmtctEnrollmentRequestDto.getPmtctCycleUuid());

                // Update pregnancy cycle status to ACTIVE
                Optional<PmtctPregnancyCycle> pregnancyCycleOptional = this.pmtctPregnancyCycleRepository.findById(pmtctEnrollmentRequestDto.getPmtctCycleUuid());
                if (pregnancyCycleOptional.isPresent()) {
                    PmtctPregnancyCycle pregnancyCycle = pregnancyCycleOptional.get();
                    pregnancyCycle.setPmtctStatus("ACTIVE");
                    this.pmtctPregnancyCycleRepository.save(pregnancyCycle);
                }
            }

//            check if the patient has LD record and update the GA
            String pmtctCycleUuid = pmtctEnrollment1.getPmtctCycleUuid();
            Optional <Delivery> deliverys = this.deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(pmtctEnrollmentRequestDto.getPatientUuid(), pmtctCycleUuid);

            if(deliverys.isPresent() && pmtctEnrollmentRequestDto.getDateOfDelivery() != null){

                deliveryService.updateDateOfDeliveryFromPMTCT(pmtctEnrollmentRequestDto.getPatientUuid(), pmtctCycleUuid, pmtctEnrollmentRequestDto.getDateOfDelivery().toString(), pmtctEnrollmentRequestDto.getGAWeeks());

            }
            this.pmtctEnrollmentReporsitory.save(pmtctEnrollment1);
        }
        return pmtctEnrollmentRequestDto;
    }

    public  PMTCTEnrollmentRespondDto  viewPMTCTEnrollmentById(String id) {
       return convertEntitytoRespondDto(pmtctEnrollmentReporsitory.findById(id).orElseThrow(()-> new EntityNotFoundException(PMTCTEnrollment.class, "Id", id+ "") ));
    }

    public void deletePMTCT(String id) {
        PMTCTEnrollment existingPMTCTEnrollment = this.getSinglePmtctEnrollment(id);
        existingPMTCTEnrollment.setArchived(1L);
        this.pmtctEnrollmentReporsitory.save(existingPMTCTEnrollment);
    }
    public String getDeliveryDate(String patientUuid, String pmtctCycleUuid) {
      // First check pmtct_enrollment for date_of_delivery
      String deliveryDate =  pmtctEnrollmentReporsitory.getDateOfDelivery(patientUuid, pmtctCycleUuid);

        if(deliveryDate != null && !deliveryDate.isEmpty()){
         return deliveryDate;
        }

        // Fallback: check delivery table for this patient + cycle
        try {
            Optional<Delivery> delivery = deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(patientUuid, pmtctCycleUuid);
            if (delivery.isPresent() && delivery.get().getDateOfDelivery() != null) {
                return delivery.get().getDateOfDelivery().toString();
            }
        } catch (Exception e) {
            // ignore
        }

        return "";
    }

    public LocalDate getInitialVisitDate(String patientUuid, String pmtctCycleUuid) {
        return pmtctEnrollmentReporsitory.getInitialVisitDate(patientUuid, pmtctCycleUuid);
    }

    public String getHIVStatus(String hospitalNumber, String patientUuid) {
        if (!hospitalNumber.isEmpty()) {
            return pmtctEnrollmentReporsitory.getHtsClientHivStatus(hospitalNumber, patientUuid);
        } else {
            return "";
        }


    }


//    public boolean checkPatientOnPMTCT(String patientUuid) {
//         PMTCTEnrollment person= pmtctEnrollmentReporsitory.findBypatientuuid(patientUuid);
//        if (person != null) {
//            if (person.hivStatus != null && person.hivStatus != null) {
//                if (person.artStartDate != null) {
//                    DeliveryResponseDto ddto = pmtctEnrollmentReporsitory.findDeliveryByPatientUuid(patientUuid);
//                    if ("Yes".equals(ddto.artStartedLdWard)) {
//
//                    }
//                }
//            }
//            return false;
//        }

    public boolean checkPatientOnPMTCT(String patientUuid, String pmtctCycleUuid) {
        Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.getByPatientUuidAndPmtctCycleId(patientUuid, pmtctCycleUuid);
        return enrollment.isPresent();
    }



//        return pmtctEnrollmentReporsitory.checkPatientOnPMTCT(patientUuid);





//    public boolean checkPatientOnPMTCT(String patientUuid) {
//        return  pmtctEnrollmentReporsitory.checkPatientOnPMTCT(patientUuid);
//
//    }

//    RegisterPatientResponseDTO
    public  RegisterPatientResponseDTO checkPatientOnHTS(String clientCode) {
        String res_Uuid = pmtctEnrollmentReporsitory.checkPatientOnHts(clientCode);
       RegisterPatientResponseDTO htsClientResponse = new RegisterPatientResponseDTO();

        if (res_Uuid == null || res_Uuid.isEmpty()) {
            htsClientResponse.setMessage("User does not have HTS record !");
            htsClientResponse.setStatus(false);
            return htsClientResponse;
        }

        String res_status = pmtctEnrollmentReporsitory.checkresultOnHts(clientCode);
        String res_testing = pmtctEnrollmentReporsitory.checkSettingOnHts(clientCode);
       boolean personOnPMTCT = pmtctEnrollmentReporsitory.checkPatientOnPMTCT(res_Uuid);
        boolean personOnANC = pmtctEnrollmentReporsitory.checkPatientOnANC(res_Uuid);


        if (!personOnPMTCT && !personOnANC  ) {
           String patientPersonOptional = pmtctEnrollmentReporsitory.findPatientName(res_Uuid);
            String patientPersonHospital = pmtctEnrollmentReporsitory.findPatientHos(res_Uuid);
            String patientPersonDob = pmtctEnrollmentReporsitory.findPatientDOB(res_Uuid);
            if (!patientPersonOptional.isEmpty()) {
                htsClientResponse.setFullname(patientPersonOptional);
                htsClientResponse.setGender("Female");
                htsClientResponse.setDateOfBirth(patientPersonDob);
                htsClientResponse.setPatientUuid(res_Uuid);
                htsClientResponse.setHivResult(res_status);
                htsClientResponse.setTestingSetting(res_testing);
                htsClientResponse.setHospitalNumber(patientPersonHospital);
                htsClientResponse.setMessage("user found");
                htsClientResponse.setStatus(true);
                return     htsClientResponse;

            }else {

            htsClientResponse.setMessage("User not found on Patient record!");
            htsClientResponse.setStatus(false);
//
            return htsClientResponse;
        }
            }

        else {
            if(personOnPMTCT){
                htsClientResponse.setMessage("User already has PMTCT record");

            }else if(personOnANC){
                htsClientResponse.setMessage("User already has ANC record");


            }else{
                htsClientResponse.setMessage("User does not have HTS record !");

            }
            htsClientResponse.setStatus(false);

            return htsClientResponse;
        }
    }

    public PMTCTValidationDto getPMTCTValidationDates(String patientUuid) {
        PMTCTValidationDto validationDto = new PMTCTValidationDto();

        // Get the latest PMTCT enrollment date
        try {
            LocalDate latestEnrollmentDate = pmtctEnrollmentReporsitory.getLatestPmtctEnrollmentDate(patientUuid);
            if (latestEnrollmentDate != null) {
                validationDto.setHasPreviousEnrollment(true);
                validationDto.setPreviousEnrollmentDate(latestEnrollmentDate);
            } else {
                validationDto.setHasPreviousEnrollment(false);
                validationDto.setPreviousEnrollmentDate(null);
            }
        } catch (Exception e) {
            validationDto.setHasPreviousEnrollment(false);
            validationDto.setPreviousEnrollmentDate(null);
        }

        // Get the latest delivery date
        try {
            LocalDate latestDeliveryDate = deliveryRepository.getLatestDeliveryDate(patientUuid);
            if (latestDeliveryDate != null) {
                validationDto.setHasPreviousDelivery(true);
                validationDto.setPreviousDeliveryDate(latestDeliveryDate);
            } else {
                validationDto.setHasPreviousDelivery(false);
                validationDto.setPreviousDeliveryDate(null);
            }
        } catch (Exception e) {
            validationDto.setHasPreviousDelivery(false);
            validationDto.setPreviousDeliveryDate(null);
        }

        return validationDto;
    }

    public List<InfantPCRAlert>  checkHEIPrompt(String patientUuid) {
        // Get all infants for the patient
        List<Infant> allInfant = infantRepository.getAllInfantByPatientUuid(patientUuid);


        // Check if infants exist
        if (allInfant == null || allInfant.isEmpty()) {
            return Collections.emptyList();
        }

        List<InfantPCRAlert>  infantsResult = new ArrayList<>();
        // Process each infant
        for (Infant infant : allInfant) {
            try {
                InfantPCRAlert infantRes = new InfantPCRAlert();

                InfantPCRAlert infantResult = processInfant(infant, infantRes);
                if (infantResult != null) {
                    infantsResult.add(infantResult);
                }
            } catch (Exception e) {
                // Log error but continue processing other infants
                System.err.println("Error processing infant: " + infant.getInfantHospitalNumber() + " - " + e.getMessage());
            }
        }


        return infantsResult;
    }

    public List<InfantPCRAlert>  checkHEIPrompt(String patientUuid, String pmtctCycleUuid) {
        // Get all infants for the patient by cycle
        List<Infant> allInfant = infantRepository.getAllInfantByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);


        // Check if infants exist
        if (allInfant == null || allInfant.isEmpty()) {
            return Collections.emptyList();
        }

        List<InfantPCRAlert>  infantsResult = new ArrayList<>();
        // Process each infant
        for (Infant infant : allInfant) {
            try {
                InfantPCRAlert infantRes = new InfantPCRAlert();

                InfantPCRAlert infantResult = processInfant(infant, infantRes);
                if (infantResult != null) {
                    infantsResult.add(infantResult);
                }
            } catch (Exception e) {
                // Log error but continue processing other infants
                System.err.println("Error processing infant: " + infant.getInfantHospitalNumber() + " - " + e.getMessage());
            }
        }


        return infantsResult;
    }

    private InfantPCRAlert  processInfant(Infant infant, InfantPCRAlert infantRes ) {
        // Get delivery date and hospital number
        LocalDate deliveryDate = infant.getDateOfDelivery();
        String infantHospitalNo = infant.getInfantHospitalNumber();

        infantRes.setInfantHospitalNo(infantHospitalNo);
        infantRes.setDeliveryDate(deliveryDate);

        // Validate required fields
        if (deliveryDate == null || infantHospitalNo == null || infantHospitalNo.isEmpty()) {
            infantRes.setAlertMessage("No delivery date or hospital number provided");

            return infantRes;
        }

        // Get latest visit date for this infant
        LocalDate visitDate = infantVisitRepository.getLatestInfantVisitDate(infantHospitalNo);
        infantRes.setLastVisitDate(visitDate != null ? visitDate : deliveryDate);
        // If no visit date, use delivery date for age calculation (supports retrospective entry)
        if (visitDate == null) {
            visitDate = deliveryDate;
        }

        // Get latest PCR info (most recent PCR test regardless of visit date)
        InfantPCRTest lastPCR = infantPCRTestRepository.getLastPCR(infantHospitalNo);

        // Calculate age between delivery date and last visit date (supports retrospective entry)
        long ageInWeeks = ChronoUnit.WEEKS.between(deliveryDate, visitDate);
        long ageInMonths = ChronoUnit.MONTHS.between(deliveryDate, visitDate);
        long ageInHours = ChronoUnit.HOURS.between(deliveryDate.atStartOfDay(), visitDate.atStartOfDay());

        // Determine expected PCR based on age and last PCR type (compliance check)
        InfantPCRAlert result = determineExpectedPCR(ageInWeeks, ageInMonths, ageInHours, lastPCR, infantRes);

        // Counter-check: if child already has the expected PCR record type, remove the alert
        return counterCheckPCRRecord(result, infantHospitalNo);
    }

    private InfantPCRAlert determineExpectedPCR(long ageInWeeks, long ageInMonths, long ageInHours, InfantPCRTest lastPCR, InfantPCRAlert  infantRes) {
        System.out.println(infantRes.getInfantHospitalNo() + " " + "ageInWeeks: " + ageInWeeks + " ageInMonths " + ageInMonths +  " ageInHours " + ageInHours);

        // PCR test type constants
        final String PCR_1ST = "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT";
        final String PCR_2ND = "INFANT_TESTING_PCR_2ND_PCR_12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED";
        final String PCR_3RD = "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE";
        final String PCR_4TH = "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)";


        if (lastPCR != null ) {
            infantRes.setLastPCRTest(lastPCR);
            String lastPCRTestType = lastPCR.getTestType();

            // If infant has previous PCR tests

            // Check for 4th PCR (after 52 weeks / ~12 months)
            if (ageInWeeks > 52 && !PCR_4TH.equals(lastPCRTestType)) {
                infantRes.setAlertMessage( "Infant due for 4th PCR");
            }else if (ageInMonths > 9 && !PCR_3RD.equals(lastPCRTestType)) {
                infantRes.setAlertMessage("Infant due for 3rd PCR");
            }else if (ageInWeeks > 6 && !PCR_2ND.equals(lastPCRTestType)) {
                infantRes.setAlertMessage("Infant due for 2nd PCR");
            }else if (ageInHours > 72 && !PCR_1ST.equals(lastPCRTestType)) {
                infantRes.setAlertMessage("Infant due for 1st PCR");
            }
                return infantRes;
        } else {
            // If infant has no previous PCR tests

            // Check for 4th PCR (after 52 weeks)
            if (ageInWeeks > 52) {
                infantRes.setAlertMessage("Infant due for 4th PCR");

            }else if (ageInMonths > 9) {
                infantRes.setAlertMessage("Infant due for 3rd PCR");
            }else if (ageInWeeks > 6) {
                infantRes.setAlertMessage("Infant due for 2nd PCR");
            }else if (ageInHours > 72) {
                infantRes.setAlertMessage("Infant due for 1st PCR");
            }
            return infantRes; // No alert needed

        }

    }

    /**
     * Counter-checks if the child already has a PCR record of the expected type.
     * Unlike determineExpectedPCR which checks both age and last PCR type,
     * this method only checks if the PCR record type exists at all.
     * If the child has the record, the alert is removed.
     */
    private InfantPCRAlert counterCheckPCRRecord(InfantPCRAlert infantRes, String infantHospitalNo) {
        // If no alert message was set, no need to counter-check
        if (infantRes.getAlertMessage() == null || infantRes.getAlertMessage().isEmpty()) {
            return infantRes;
        }

        // Get all PCR records for this infant
        List<InfantPCRTest> allPCRTests = infantPCRTestRepository.findByInfantHospitalNumber(infantHospitalNo);

        if (allPCRTests == null || allPCRTests.isEmpty()) {
            return infantRes; // No records exist, keep the alert
        }

        // PCR test type constants
        final String PCR_1ST = "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT";
        final String PCR_2ND = "INFANT_TESTING_PCR_2ND_PCR_12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED";
        final String PCR_3RD = "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE";
        final String PCR_4TH = "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)";

        // Determine which PCR type the alert is about
        String alertMessage = infantRes.getAlertMessage();
        String expectedPCRType = null;

        if (alertMessage.contains("1st PCR")) {
            expectedPCRType = PCR_1ST;
        } else if (alertMessage.contains("2nd PCR")) {
            expectedPCRType = PCR_2ND;
        } else if (alertMessage.contains("3rd PCR")) {
            expectedPCRType = PCR_3RD;
        } else if (alertMessage.contains("4th PCR")) {
            expectedPCRType = PCR_4TH;
        }

        if (expectedPCRType != null) {
            // Check if any existing PCR record matches the expected type
            for (InfantPCRTest pcrTest : allPCRTests) {
                if (expectedPCRType.equals(pcrTest.getTestType())) {
                    // Child already has this PCR record, remove the alert
                    infantRes.setAlertMessage(null);
                    break;
                }
            }
        }

        return infantRes;
    }



}
