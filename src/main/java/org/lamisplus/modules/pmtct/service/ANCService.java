package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.base.domain.entities.ApplicationCodeSet;
import org.lamisplus.modules.base.domain.entities.OrganisationUnit;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.domain.repositories.OrganisationUnitRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.*;
import org.lamisplus.modules.patient.domain.entity.Encounter;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ANCService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final UserService userService;
    private final PersonService personService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;
    private final OrganisationUnitRepository organisationUnitRepository;
    private final EncounterRepository encounterRepository;


    public ANCRequestDto save(ANCRequestDto ancRequestDto) {
        String hostpitalNumber = this.getHospitalNumber(ancRequestDto.getPersonDto());
        System.out.println("hostpitalNumber = " + hostpitalNumber);
        Optional<Person> persons = this.personRepository.getPersonByHospitalNumber(hostpitalNumber);
        if (persons.isPresent()) {
            Person person = persons.get();
            ANC anc = new ANC();
            anc.setAncNo(ancRequestDto.getAncNo());
            anc.setFirstAncDate(ancRequestDto.getFirstAncDate());
            anc.setGravida(ancRequestDto.getGravida());
            anc.setParity(ancRequestDto.getParity());
            anc.setLMP(ancRequestDto.getLMP());
            anc.setExpectedDeliveryDate(ancRequestDto.getExpectedDeliveryDate());
            anc.setGAWeeks(ancRequestDto.getGAWeeks());
            anc.setHivDiognosicTime(ancRequestDto.getHivDiognosicTime());

            anc.setUuid(UUID.randomUUID().toString());
            anc.setPersonUuid(person.getUuid());
            anc.setHospitalNumber(hostpitalNumber);
            anc.setArchived(0L);
            anc.setFacilityId(person.getFacilityId());
            SyphilisInfo syphilisInfo = ancRequestDto.getSyphilisInfo();
            if (syphilisInfo != null) {
                JsonNode syphilisInfoJsonNode = mapper.valueToTree(syphilisInfo);
                anc.setSyphilisInfo(syphilisInfoJsonNode);

            }

            PmtctHtsInfo pmtctHtsInfo = ancRequestDto.getPmtctHtsInfo();
            if (pmtctHtsInfo != null) {
                JsonNode pmtctHtsInfoInfoJsonNode = mapper.valueToTree(pmtctHtsInfo);
                anc.setPmtctHtsInfo(pmtctHtsInfoInfoJsonNode);

            }

            PartnerNotification partnerNotification = ancRequestDto.getPartnerNotification();
            if (partnerNotification != null) {
                JsonNode partnerNotificationInfoJsonNode = mapper.valueToTree(partnerNotification);
                anc.setPartnerNotification(partnerNotificationInfoJsonNode);
            }
            ancRepository.save(anc);

        } else {

            String personUuid = this.createPerson(ancRequestDto.getPersonDto());
            if (personUuid != null) {


                ANC anc = new ANC();
                anc.setAncNo(ancRequestDto.getAncNo());
                anc.setFirstAncDate(ancRequestDto.getFirstAncDate());
                anc.setGravida(ancRequestDto.getGravida());
                anc.setParity(ancRequestDto.getParity());
                anc.setLMP(ancRequestDto.getLMP());
                anc.setExpectedDeliveryDate(ancRequestDto.getExpectedDeliveryDate());
                anc.setGAWeeks(ancRequestDto.getGAWeeks());
                anc.setHivDiognosicTime(ancRequestDto.getHivDiognosicTime());
                anc.setUuid(UUID.randomUUID().toString());
                anc.setHospitalNumber(hostpitalNumber);
                anc.setArchived(0L);

                SyphilisInfo syphilisInfo = ancRequestDto.getSyphilisInfo();
                if (syphilisInfo != null) {
                    JsonNode syphilisInfoJsonNode = mapper.valueToTree(syphilisInfo);
                    anc.setSyphilisInfo(syphilisInfoJsonNode);

                }
                PmtctHtsInfo pmtctHtsInfo = ancRequestDto.getPmtctHtsInfo();
                if (pmtctHtsInfo != null) {
                    JsonNode pmtctHtsInfoInfoJsonNode = mapper.valueToTree(pmtctHtsInfo);
                    anc.setPmtctHtsInfo(pmtctHtsInfoInfoJsonNode);

                }
                PartnerNotification partnerNotification = ancRequestDto.getPartnerNotification();
                if (partnerNotification != null) {
                    JsonNode partnerNotificationInfoJsonNode = mapper.valueToTree(partnerNotification);
                    anc.setPartnerNotification(partnerNotificationInfoJsonNode);
                }
                try {
                    Optional<Person> persons1 = this.personRepository.getPersonByHospitalNumber(hostpitalNumber);
                    if (persons1.isPresent()) {
                        Person person = persons1.get();
                        anc.setFacilityId(person.getFacilityId());
                    }
                } catch (Exception e) {
                }
                anc.setPersonUuid(personUuid);
                ancRepository.save(anc);
            }

        }

        return ancRequestDto;
    }

    public String createPerson(PersonDto personDto) {
        Person person = this.getPersonFromDto(personDto);
        this.getCurrentFacility(person);
        person.setUuid(UUID.randomUUID().toString());
        this.personRepository.save(person);
        return person.getUuid();
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

    public ANC convertDtoToEntity(ANCRequestDto ancdto) {
        ANC anc = new ANC();
        BeanUtils.copyProperties(ancdto, anc);
        return anc;
    }

    public ANCRespondDto convertEntityToDto(ANC anc) {
        ANCRespondDto ancdto = new ANCRespondDto();
        BeanUtils.copyProperties(anc, ancdto);
        return ancdto;
    }


    public List<ANCRespondDto> getAllAnc() {
        List<ANC> ancList = this.ancRepository.findAll();
        List<ANCRespondDto> ancRespondDtoList = new ArrayList<>();
        ancList.forEach(anc -> {
            Optional<Person> persons = this.personRepository.getPersonByHospitalNumber(anc.getHospitalNumber());
            Person person = new Person();
            if (persons.isPresent()) {
                person = persons.get();
            }
            ancRespondDtoList.add(convertANCtoANCRespondDto(anc, person));
        });

        return ancRespondDtoList;

    }

    public ANCRespondDto convertANCtoANCRespondDto(ANC anc, Person person) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        ancRespondDto.setAncNo(anc.getAncNo());
        ancRespondDto.setId(anc.getId());
        ancRespondDto.setFirstAncDate(anc.getFirstAncDate());
        ancRespondDto.setGravida(anc.getGravida());
        ancRespondDto.setParity(anc.getParity());
        ancRespondDto.setLMP(anc.getLMP());
        ancRespondDto.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        ancRespondDto.setGAWeeks(anc.getGAWeeks());
        ancRespondDto.setHivDiognosicTime(anc.getHivDiognosicTime());
        ancRespondDto.setSyphilisInfo(anc.getSyphilisInfo());
        ancRespondDto.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        ancRespondDto.setPartnerNotification(anc.getPartnerNotification());
        ancRespondDto.setPersonDto(getDtoFromPerson(person));


        return ancRespondDto;

    }

    @SneakyThrows
    public ANC getSingleAnc(Long id) {
        return this.ancRepository.findById(id)
                .orElseThrow(() -> new Exception("ANC NOT FOUND"));

    }

    public int calculateAge(LocalDate dob) {
        LocalDate curDate = LocalDate.now();
        if ((dob != null) && (curDate != null)) {
            return Period.between(dob, curDate).getYears();
        } else {
            return 0;
        }
    }

    public List<PMTCTPersonDto> getAllPMTCTPerson() {
        List<Person> personList = this.personRepository.findAll();
        List<PMTCTPersonDto> pmtctPersonDtosList = new ArrayList<>();
        personList.forEach(person -> {
            int age = this.calculateAge(person.getDateOfBirth());
            String sex = person.getSex();
            Integer archive = person.getArchived();

            if ((age >= 10) && (sex.contains("F")) && (archive == 0)) {
                PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
                pmtctPersonDto.setAge(age);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                pmtctPersonDto.setSurname(person.getSurname());
                pmtctPersonDto.setContactPoint(person.getContactPoint());
                Optional<ANC> ancs = ancRepository.findByHospitalNumberAndArchived(person.getHospitalNumber(), 0L);
                if (ancs.isPresent()) {
                    pmtctPersonDto.setAncRegstrationStatus(Boolean.TRUE);
                } else {
                    pmtctPersonDto.setAncRegstrationStatus(Boolean.FALSE);
                }
                pmtctPersonDtosList.add(pmtctPersonDto);
            }
        });
        return pmtctPersonDtosList;
    }

    public PMTCTPersonDto getPMTCTPersonByHospitalNumber(String hospitalNumber) {
        Optional<Person> persons = this.personRepository.getPersonByHospitalNumber(hospitalNumber);
        PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
        if (persons.isPresent()) {
            Person person = persons.get();
            int age = this.calculateAge(person.getDateOfBirth());
            String sex = person.getSex();
            Integer archive = person.getArchived();

            if ((age >= 10) && (sex.contains("F")) && (archive == 0)) {
                pmtctPersonDto.setAge(age);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                pmtctPersonDto.setSurname(person.getSurname());
                pmtctPersonDto.setContactPoint(person.getContactPoint());

            }
        }
        return pmtctPersonDto;
    }

    public PersonResponseDto getDtoFromPerson(Person person) {
        List<Encounter> encounterList = this.encounterRepository.findByPersonAndStatus(person, "PENDING");
        PersonResponseDto personResponseDto = new PersonResponseDto();

        encounterList.forEach(encounter -> {
            personResponseDto.setVisitId(encounter.getVisit().getId());
            personResponseDto.setCheckInDate(encounter.getVisit().getVisitStartDate());
            personResponseDto.setEncounterDate(encounter.getEncounterDate());
        });

        personResponseDto.setId(person.getId());
        personResponseDto.setNinNumber(person.getNinNumber());
        personResponseDto.setEmrId(person.getEmrId());
        personResponseDto.setFacilityId(person.getFacilityId());
        personResponseDto.setIsDateOfBirthEstimated(person.getIsDateOfBirthEstimated());
        personResponseDto.setDateOfBirth(person.getDateOfBirth());
        personResponseDto.setFirstName(person.getFirstName());
        personResponseDto.setSurname(person.getSurname());
        personResponseDto.setOtherName(person.getOtherName());
        personResponseDto.setContactPoint(person.getContactPoint());
        personResponseDto.setAddress(person.getAddress());
        personResponseDto.setContact(person.getContact());
        personResponseDto.setIdentifier(person.getIdentifier());
        personResponseDto.setEducation(person.getEducation());
        personResponseDto.setEmploymentStatus(person.getEmploymentStatus());
        personResponseDto.setMaritalStatus(person.getMaritalStatus());
        personResponseDto.setSex(person.getSex());
        personResponseDto.setGender(person.getGender());
        personResponseDto.setDeceased(person.getDeceased());
        personResponseDto.setDateOfRegistration(person.getDateOfRegistration());
        personResponseDto.setActive(person.getActive());
        personResponseDto.setDeceasedDateTime(person.getDeceasedDateTime());
        personResponseDto.setOrganization(person.getOrganization());
        //personResponseDto.setBiometricStatus(getPatientBiometricStatus(person.getUuid()));


        return personResponseDto;
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

    private void getCurrentFacility(Person person) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            Long currentOrganisationUnitId = user.getCurrentOrganisationUnitId();
            person.setFacilityId(currentOrganisationUnitId);
        }

    }

    private ApplicationCodeDto getAppCodeSet(Long id) {
        ApplicationCodeSet applicationCodeSet = (ApplicationCodeSet) this.applicationCodesetRepository.getOne(id);
        return new ApplicationCodeDto(applicationCodeSet.getId(), applicationCodeSet.getDisplay());
    }

    private OrgUnitDto getOrgUnit(Long id) {
        OrganisationUnit organizationUnit = (OrganisationUnit) this.organisationUnitRepository.getOne(id);
        return new OrgUnitDto(organizationUnit.getId(), organizationUnit.getName());
    }

    public List<ANCRespondDto> getActiveAnc() {
        List<ANC> ancList = this.ancRepository.findAll();
        List<ANCRespondDto> ancRespondDtoList = new ArrayList<>();
        ancList.forEach(anc -> {
            if(anc.getArchived() == 0L) {
                Optional<User> currentUser = userService.getUserWithRoles();
                Long facilityId = 0L;
                if (currentUser.isPresent()) {
                    User user = currentUser.get();
                    facilityId = user.getCurrentOrganisationUnitId();
                }
                Optional<Person> persons = this.personRepository.getPersonByHospitalNumberAndFacilityId(anc.getHospitalNumber(), facilityId);
                Person person = new Person();
                if (persons.isPresent()) {
                    person = persons.get();
                }
                ancRespondDtoList.add(convertANCtoANCRespondDto(anc, person));
            }
        });

        return ancRespondDtoList;

    }

    public List<ANCRespondDto> getNonActiveAnc() {
        List<ANC> ancList = this.ancRepository.findAll();
        List<ANCRespondDto> ancRespondDtoList = new ArrayList<>();
        ancList.forEach(anc -> {
            if(anc.getArchived() != 0L) {
                Optional<User> currentUser = userService.getUserWithRoles();
                Long facilityId = 0L;
                if (currentUser.isPresent()) {
                    User user = currentUser.get();
                    facilityId = user.getCurrentOrganisationUnitId();
                }
                Optional<Person> persons = this.personRepository.getPersonByHospitalNumberAndFacilityId(anc.getHospitalNumber(), facilityId);
                Person person = new Person();
                if (persons.isPresent()) {
                    person = persons.get();
                }
                ancRespondDtoList.add(convertANCtoANCRespondDto(anc, person));
            }
        });

        return ancRespondDtoList;

    }



}
