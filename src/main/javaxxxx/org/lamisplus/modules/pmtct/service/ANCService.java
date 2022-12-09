package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.hibernate.annotations.Type;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
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
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.springframework.beans.BeanUtils;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.persistence.Column;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ANCService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final UserService userService;
    private final PersonService personService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;
    private final OrganisationUnitRepository organisationUnitRepository;
    private final EncounterRepository encounterRepository;
    private final PMTCTEnrollmentService pmtctEnrollmentService;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;


    public ANCRequestDto save(ANCRequestDto ancRequestDto) {
        String hostpitalNumber = this.getHospitalNumber(ancRequestDto.getPersonDto());
        System.out.println("ancRequestDto.getPerson_uuid() = " + ancRequestDto.getPerson_uuid());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = 0L;
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(ancRequestDto.getPerson_uuid(), facilityId, 0);
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
                    Optional<Person> persons1 = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(hostpitalNumber, facilityId, 0);
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
        person.setFullName(personService.getFullName(personDto.getFirstName(), personDto.getSurname()));
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
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = 0L;
        ancList.forEach(anc -> {
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(anc.getPersonUuid(), user.getCurrentOrganisationUnitId(), 0);
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
        //ancRespondDto.setPersonDto(getDtoFromPerson(person));


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

    public List<PMTCTPersonDto> getAllPMTCTPerson2() {
        List<Person> personList = this.personRepository.findAll();
        List<PMTCTPersonDto> pmtctPersonDtosList = new ArrayList<>();
        System.out.println("How many person are in DB " + personList.size());
        personList.forEach(person -> {
            int age = this.calculateAge(person.getDateOfBirth());
            System.out.println("1 " + age);
            String sex = person.getSex();
            if ((age >= 10) && (sex.contains("F")) && (person.getActive())) {
                PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
                pmtctPersonDto.setAge(age);
                System.out.println(1);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                System.out.println(2);
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                System.out.println("3 " + person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                System.out.println(4);
                pmtctPersonDto.setSurname(person.getSurname());
                System.out.println("5a " + person.getHospitalNumber());
                pmtctPersonDto.setContactPoint(person.getContactPoint());
                try {
                    //System.out.println("Before Oyibo");
                    Optional<ANC> ancs = ancRepository.findByHospitalNumber(person.getHospitalNumber());
                    //System.out.println("After Oyibo");
                    if (ancs.isPresent()) {
                        pmtctPersonDto.setAncRegstrationStatus(Boolean.TRUE);
                    } else {
                        pmtctPersonDto.setAncRegstrationStatus(Boolean.FALSE);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
                pmtctPersonDtosList.add(pmtctPersonDto);
            }
        });
        System.out.println("I actually got here");
        return pmtctPersonDtosList;
    }

    public PersonMetaDataDto getAllPMTCTPerson3(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        Page<Person> persons = null;
        if (!((searchValue == null) || (searchValue.equals("*")))) {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = personRepository.findFemalePersonBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);
            System.out.println("searchValue = " + searchValue);
        } else {
            Integer rec = ancRepository.getTotalAnc();
            if (rec >= 1) {
                persons = personRepository.findFemalePerson(0, currentOrganisationUnitId, paging);
            } else persons = personRepository.findFemalePerson2(0, currentOrganisationUnitId, paging);
            System.out.println("persons Size2 = " + persons.getTotalElements());

        }

        List<Person> personList = persons.getContent();
        ArrayList<PersonResponseDto> personResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            if (!(this.activeOnANC(person.getUuid()))) {
                PersonResponseDto personResponseDto = getDtoFromPerson(person);
                personResponseDtos.add(personResponseDto);
            }

        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords(personResponseDtos.size());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(personResponseDtos);
        //personMetaDataDto.setRecords(persons.getContent().stream().map(this::getDtoFromPerson).collect(Collectors.toList()));
        return personMetaDataDto;
        //return checkedInPeople;
    }

    public PersonMetaDataDto getActiveOnANC(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        Page<Person> persons = null;
        if (!((searchValue == null) || (searchValue.equals("*")))) {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = personRepository.getActiveOnANCBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);

        } else {
            persons = personRepository.getActiveOnANC(0, currentOrganisationUnitId, paging);
        }
        List<Person> personList = persons.getContent();
        ArrayList<ANCRespondDto> ancResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            ANCRespondDto ancResponseDto = getANCRespondDtoFromPerson(person);
            ancResponseDtos.add(ancResponseDto);
        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords(ancResponseDtos.size());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(ancResponseDtos);
        //personMetaDataDto.setRecords(persons.getContent().stream().map(this::getDtoFromPerson).collect(Collectors.toList()));
        return personMetaDataDto;
        //return checkedInPeople;
    }

    public PMTCTPersonDto getPMTCTPersonByHospitalNumber(String hospitalNumber) {
        List<Person> persons = this.personRepository.getPersonByHospitalNumber(hospitalNumber);
        PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
        persons.forEach(person -> {
            if (person.getArchived() == 0) {
                //Person person = persons.get();
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
                Optional<ANC> ancs = ancRepository.findByHospitalNumberAndArchived(person.getHospitalNumber(), 0L);
                if (ancs.isPresent()) {
                    pmtctPersonDto.setAncRegstrationStatus(Boolean.TRUE);
                } else {
                    pmtctPersonDto.setAncRegstrationStatus(Boolean.FALSE);
                }
            }
        });
        return pmtctPersonDto;
    }

    public PersonResponseDto getDtoFromPerson(Person person) {
        PersonResponseDto personResponseDto = new PersonResponseDto();
        personResponseDto.setId(person.getId());
        personResponseDto.setNinNumber(person.getNinNumber());
        personResponseDto.setEmrId(person.getEmrId());
        personResponseDto.setFacilityId(person.getFacilityId());
        personResponseDto.setIsDateOfBirthEstimated(person.getIsDateOfBirthEstimated());
        personResponseDto.setDateOfBirth(person.getDateOfBirth());
        personResponseDto.setFirstName("");
        personResponseDto.setSurname(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
        personResponseDto.setOtherName("");
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
        personResponseDto.setUuid(person.getUuid());
        //personResponseDto.setAncNo(this.myRecentAncNo(person.getUuid()));
        //personResponseDto.setBiometricStatus(getPatientBiometricStatus(person.getUuid()));


        return personResponseDto;
    }

    public String myRecentAncNo(String personUuid) {
        String ancNo = "";
        Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndArchived(personUuid, 0L);
        if (ancs.isPresent()) {
            ancNo = ancs.get().getAncNo();
        } else {
            ancNo = "";
        }
        return ancNo;
    }

    public boolean activeOnANC(String personUuid) {
        boolean ancNo = false;
        Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndArchived(personUuid, 0L);
        if (ancs.isPresent()) {
            ancNo = true;
        } else {
            ancNo = false;
        }
        return ancNo;
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
            if (anc.getArchived() == 0L) {
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
            if (anc.getArchived() != 0L) {
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

    private String getFullName(String fn, String on, String sn) {
        String fullName = "";
        if (fn == null) fn = "";
        if (sn == null) sn = "";
        if (on == null) on = "";
        fullName = fn + " " + on + " " + sn;
        return fullName;
    }

    public ANCRespondDto ANCEnrollement(ANCEnrollementRequestDto ancEnrollementRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(ancEnrollementRequestDto.getPerson_uuid(), user.getCurrentOrganisationUnitId(), 0);
        Person person = new Person();
        ANC anc = new ANC();
        if (persons.isPresent()) {
            person = persons.get();
            anc.setAncNo(ancEnrollementRequestDto.getAncNo());
            anc.setFirstAncDate(ancEnrollementRequestDto.getFirstAncDate());
            anc.setGravida(ancEnrollementRequestDto.getGravida());
            anc.setParity(ancEnrollementRequestDto.getParity());
            anc.setLMP(ancEnrollementRequestDto.getLMP());
            anc.setExpectedDeliveryDate(ancEnrollementRequestDto.getExpectedDeliveryDate());
            anc.setGAWeeks(ancEnrollementRequestDto.getGAWeeks());
            anc.setHivDiognosicTime(ancEnrollementRequestDto.getHivDiognosicTime());
            anc.setCreatedBy(user.getUserName());
            anc.setLastModifiedBy(user.getUserName());
            anc.setUuid(UUID.randomUUID().toString());
            anc.setPersonUuid(person.getUuid());
            anc.setHospitalNumber(person.getHospitalNumber());
            anc.setArchived(0L);
            anc.setFacilityId(person.getFacilityId());
            anc.setStatus("NV");
            SyphilisInfo syphilisInfo = ancEnrollementRequestDto.getSyphilisInfo();
            if (syphilisInfo != null) {
                JsonNode syphilisInfoJsonNode = mapper.valueToTree(syphilisInfo);
                anc.setSyphilisInfo(syphilisInfoJsonNode);

            }

            PmtctHtsInfo pmtctHtsInfo = ancEnrollementRequestDto.getPmtctHtsInfo();
            if (pmtctHtsInfo != null) {
                JsonNode pmtctHtsInfoInfoJsonNode = mapper.valueToTree(pmtctHtsInfo);
                anc.setPmtctHtsInfo(pmtctHtsInfoInfoJsonNode);

            }

            PartnerNotification partnerNotification = ancEnrollementRequestDto.getPartnerNotification();
            if (partnerNotification != null) {
                JsonNode partnerNotificationInfoJsonNode = mapper.valueToTree(partnerNotification);
                anc.setPartnerNotification(partnerNotificationInfoJsonNode);
            }
        }
        return getANCRespondDtoFromPersonAndAnc(person, ancRepository.save(anc));
    }

    public ANCRespondDto getANCRespondDtoFromPersonAndAnc(Person persons, ANC anc) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        ancRespondDto.setId(anc.getId());
        ancRespondDto.setHospitalNumber(anc.getHospitalNumber());
        ancRespondDto.setAncNo(anc.getAncNo());
        ancRespondDto.setFullname(this.getFullName(persons.getFirstName(), persons.getOtherName(), persons.getSurname()));
        ancRespondDto.setAncUuid(anc.getUuid());
        ancRespondDto.setAge(this.calculateAge(persons.getDateOfBirth()));
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
        ancRespondDto.setPerson_uuid(persons.getUuid());
        return ancRespondDto;
    }

    public ANCRespondDto newANCRegistration(ANCWithPersonRequestDto ancWithPersonRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        String personUuid = createPerson(ancWithPersonRequestDto.getPersonDto());
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(personUuid, user.getCurrentOrganisationUnitId(), 0);
        Person person = new Person();
        ANC anc = new ANC();
        if (persons.isPresent()) {
            person = persons.get();
            anc.setAncNo(ancWithPersonRequestDto.getAncNo());
            anc.setFirstAncDate(ancWithPersonRequestDto.getFirstAncDate());
            anc.setGravida(ancWithPersonRequestDto.getGravida());
            anc.setParity(ancWithPersonRequestDto.getParity());
            anc.setLMP(ancWithPersonRequestDto.getLMP());
            anc.setExpectedDeliveryDate(ancWithPersonRequestDto.getExpectedDeliveryDate());
            anc.setGAWeeks(ancWithPersonRequestDto.getGAWeeks());
            anc.setHivDiognosicTime(ancWithPersonRequestDto.getHivDiognosicTime());
            anc.setCreatedBy(user.getUserName());
            anc.setLastModifiedBy(user.getUserName());
            anc.setUuid(UUID.randomUUID().toString());
            anc.setPersonUuid(person.getUuid());
            anc.setHospitalNumber(person.getHospitalNumber());
            anc.setArchived(0L);
            anc.setFacilityId(person.getFacilityId());
            anc.setStatus("NV");
            SyphilisInfo syphilisInfo = ancWithPersonRequestDto.getSyphilisInfo();
            if (syphilisInfo != null) {
                JsonNode syphilisInfoJsonNode = mapper.valueToTree(syphilisInfo);
                anc.setSyphilisInfo(syphilisInfoJsonNode);

            }

            PmtctHtsInfo pmtctHtsInfo = ancWithPersonRequestDto.getPmtctHtsInfo();
            if (pmtctHtsInfo != null) {
                JsonNode pmtctHtsInfoInfoJsonNode = mapper.valueToTree(pmtctHtsInfo);
                anc.setPmtctHtsInfo(pmtctHtsInfoInfoJsonNode);

            }

            PartnerNotification partnerNotification = ancWithPersonRequestDto.getPartnerNotification();
            if (partnerNotification != null) {
                JsonNode partnerNotificationInfoJsonNode = mapper.valueToTree(partnerNotification);
                anc.setPartnerNotification(partnerNotificationInfoJsonNode);
            }
        }
        return getANCRespondDtoFromPersonAndAnc(person, ancRepository.save(anc));
    }

    public ANCRespondDto getANCRespondDtoFromPerson(Person person) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        String ancNo = "";
        Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndArchived(person.getUuid(), 0L);
        if (ancs.isPresent()) {
            ANC anc = ancs.get();
            ancNo = anc.getAncNo();
            ancRespondDto.setId(anc.getId());
            ancRespondDto.setAncNo(anc.getAncNo());
            ancRespondDto.setHospitalNumber(anc.getHospitalNumber());
            ancRespondDto.setFullname(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
            ancRespondDto.setAncUuid(anc.getUuid());
            ancRespondDto.setPerson_uuid(person.getUuid());
            ancRespondDto.setPersonId(person.getId());
            ancRespondDto.setAddress(person.getAddress());
            ancRespondDto.setContactPoint(person.getContactPoint());
            ancRespondDto.setSex(person.getSex());
            ancRespondDto.setDateOfBirth(person.getDateOfBirth());
            ancRespondDto.setAge(this.calculateAge(person.getDateOfBirth()));
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
        }



        ancRespondDto.setHivStatus(this.getHivStatus(person.getUuid()));
        if (activeOnPMTCT(ancNo)) {
            PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = this.pmtctEnrollmentService.getSinglePmtctEnrollmentByAncNo(ancNo);
            ancRespondDto.setPmtctRegStatus(true);
            ancRespondDto.setPmtctEnrollmentRespondDto(pmtctEnrollmentRespondDto);
        } else {
            ancRespondDto.setPmtctRegStatus(false);
        }
        return ancRespondDto;
    }

    String getHivStatus(String uuid) {
        String status = "Positive";
        return status;
    }

    public boolean activeOnPMTCT(String ancNo) {
        boolean active = false;
        Optional<PMTCTEnrollment> pmtctEnrollment = pmtctEnrollmentReporsitory.getByAncNo(ancNo);//.findANCByPersonUuidAndArchived(personUuid, 0L);
        if (pmtctEnrollment.isPresent()) {
            active = true;
        } else {
            active = false;
        }
        return active;
    }

    private ANC getExistingANC(Long id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ANC.class, "id", "" + id));
    }
    public void graduateFromANC(ANC anc, String visitStatus) {
        System.out.println("Doc I got here ANC No = "+anc.getAncNo());
        ANC existingAnc = this.getExistingANC(anc.getId());
        existingAnc.setFirstAncDate(anc.getFirstAncDate());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setHivDiognosicTime(anc.getHivDiognosicTime());
        existingAnc.setSyphilisInfo(anc.getSyphilisInfo());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        existingAnc.setArchived(1L);
        existingAnc.setStatus(visitStatus);

        existingAnc.setHospitalNumber(anc.getHospitalNumber());
        existingAnc.setUuid(anc.getUuid());
        existingAnc.setAncNo(anc.getAncNo());
        existingAnc.setCreatedBy(anc.getCreatedBy());
        existingAnc.setCreatedBy(anc.getCreatedBy());
        existingAnc.setLastModifiedDate(LocalDateTime.now());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        existingAnc.setLastModifiedBy(user.getUserName());

        existingAnc.setFacilityId(user.getCurrentOrganisationUnitId());
        ancRepository.save(existingAnc);
    }

    public void updateANC(ANC anc, String visitStatus) {
        System.out.println("Doc I got here ANC No1 = "+anc.getAncNo());
        ANC existingAnc = this.getExistingANC(anc.getId());
        existingAnc.setFirstAncDate(anc.getFirstAncDate());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setHivDiognosicTime(anc.getHivDiognosicTime());
        existingAnc.setSyphilisInfo(anc.getSyphilisInfo());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        existingAnc.setArchived(0L);
        existingAnc.setStatus(visitStatus);

        existingAnc.setHospitalNumber(anc.getHospitalNumber());
        existingAnc.setUuid(anc.getUuid());
        existingAnc.setAncNo(anc.getAncNo());
        existingAnc.setCreatedBy(anc.getCreatedBy());
        existingAnc.setCreatedBy(anc.getCreatedBy());
        existingAnc.setLastModifiedDate(LocalDateTime.now());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        existingAnc.setLastModifiedBy(user.getUserName());

        existingAnc.setFacilityId(user.getCurrentOrganisationUnitId());
        ancRepository.save(existingAnc);
    }
}

