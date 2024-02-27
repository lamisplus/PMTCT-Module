package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.audit4j.core.util.Log;
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
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.DeliveryRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ANCService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;

    private final InfantRepository infantRepository;
    private final UserService userService;
    private final PersonService personService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;
    private final OrganisationUnitRepository organisationUnitRepository;
    private final EncounterRepository encounterRepository;
    private final PMTCTEnrollmentService pmtctEnrollmentService;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
//    private Logger logger;

    private final DeliveryRepository deliveryRepository;


    public ANCRequestDto save(ANCRequestDto ancRequestDto) {
        String hostpitalNumber = this.getHospitalNumber(ancRequestDto.getPersonDto());
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
            anc.setTestedSyphilis(ancRequestDto.getTestedSyphilis());
            anc.setTestResultSyphilis(ancRequestDto.getTestResultSyphilis());
            anc.setTreatedSyphilis(ancRequestDto.getTreatedSyphilis());
            anc.setSourceOfReferral(ancRequestDto.getSourceOfReferral());
            anc.setReferredSyphilisTreatment(ancRequestDto.getReferredSyphilisTreatment());

            anc.setUuid(UUID.randomUUID().toString());
            anc.setPersonUuid(person.getUuid());
            anc.setHospitalNumber(hostpitalNumber);
            anc.setArchived(0L);
            anc.setFacilityId(person.getFacilityId());
            try{
                LocalDate nad = this.calculateNAD(ancRequestDto.getFirstAncDate());

                anc.setDefaultDays(this.defaultDate(anc.getLastVisitDate(), ancRequestDto.getFirstAncDate()));
                anc.setLastVisitDate(ancRequestDto.getFirstAncDate());
                anc.setNextAppointmentDate(nad);
            }catch(Exception e){}


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
                try {
                    LocalDate eed = this.calculateEDD(ancRequestDto.getLMP());
                    // System.out.println("@ invocation "+ eed);
                    anc.setExpectedDeliveryDate(eed);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                anc.setGAWeeks(ancRequestDto.getGAWeeks());
                anc.setHivDiognosicTime(ancRequestDto.getHivDiognosicTime());
                anc.setUuid(UUID.randomUUID().toString());
                anc.setHospitalNumber(hostpitalNumber);
                anc.setArchived(0L);
                try{
                    LocalDate nad = this.calculateNAD(ancRequestDto.getFirstAncDate());

                    anc.setDefaultDays(this.defaultDate(anc.getLastVisitDate(), ancRequestDto.getFirstAncDate()));
                    anc.setLastVisitDate(ancRequestDto.getFirstAncDate());
                    anc.setNextAppointmentDate(nad);
                }catch(Exception e){}

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
        person.setFullName(personService.getFullName(personDto.getFirstName(), personDto.getOtherName(), personDto.getSurname()));
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

    public ANCRequestDto entityToDto(ANC anc) {
        ANCRequestDto ancRequestDto = new ANCRequestDto();
        BeanUtils.copyProperties(anc, ancRequestDto);
        return ancRequestDto;
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

    private ANC getExistAnc(Long id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No visit was found with given Id " + id));
    }

    public ANCRequestDto viewANCById(Long id) {
        ANC anc = this.ancRepository.getANCById(id);
        return entityToDto(anc);
    }

    public ANCRequestDto updateAnc(Long id, ANCRequestDto ancRequestDto) {
        ANC exist = getExistAnc(id);
        ANC anc = convertDtoToEntity(ancRequestDto);
        anc.setId(id);
        anc.setFacilityId(exist.getFacilityId());
        anc.setHospitalNumber(exist.getHospitalNumber());
        anc.setLastModifiedDate(LocalDateTime.now());
        anc.setLastModifiedBy(exist.getLastModifiedBy());
        anc.setArchived(exist.getArchived());
        anc.setStatus(exist.getStatus());
        anc.setCreatedBy(exist.getCreatedBy());
        anc.setCreatedDate(exist.getCreatedDate());
        anc.setUuid(exist.getUuid());
        anc.setPersonUuid(exist.getPersonUuid());
        try{
            LocalDate nad = this.calculateNAD(ancRequestDto.getFirstAncDate());

            anc.setDefaultDays(this.defaultDate(anc.getLastVisitDate(), ancRequestDto.getFirstAncDate()));
            anc.setLastVisitDate(ancRequestDto.getFirstAncDate());
            anc.setNextAppointmentDate(nad);
        }catch(Exception e){}
        //pmtctVisit.setArchived(0);
        ancRepository.save(anc);
        return ancRequestDto;
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
        ancRespondDto.setTestedSyphilis(anc.getTestedSyphilis());
        ancRespondDto.setTestResultSyphilis(anc.getTestResultSyphilis());
        ancRespondDto.setTreatedSyphilis(anc.getTreatedSyphilis());
        ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
        ancRespondDto.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        ancRespondDto.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        ancRespondDto.setPartnerNotification(anc.getPartnerNotification());
        ancRespondDto.setPartnerInformation(anc.getPartnerInformation());
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
        personList.forEach(person -> {
            int age = this.calculateAge(person.getDateOfBirth());
            String sex = person.getSex();
            if ((age >= 5) && (sex.contains("F")) && (person.getActive())) {
                PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
                pmtctPersonDto.setAge(age);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                pmtctPersonDto.setSurname(person.getSurname());
                pmtctPersonDto.setContactPoint(person.getContactPoint());
                try {
                    Optional<ANC> ancs = ancRepository.findByHospitalNumber(person.getHospitalNumber());
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
        return pmtctPersonDtosList;
    }

//    public PersonMetaDataDto getAllANCPatient(String searchValue, int pageNo, int pageSize) {
//
//    }

    public PersonMetaDataDto getAllPMTCTPerson3(String searchValue, int pageNo, int pageSize) {
        //Integer rec = ancRepository.getTotalAnc();
        //pageSize+= rec;
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        Page<PatientInfo> persons = null;
        if (!((searchValue == null) || (searchValue.equals("*")))) {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = pmtctEnrollmentReporsitory.findFemalePersonBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);
        } else {
            // Integer rec = ancRepository.getTotalAnc();
            //if (rec >= 1) {
            persons = pmtctEnrollmentReporsitory.findFemalePerson(0, currentOrganisationUnitId, paging);
            //} else persons = personRepository.findFemalePerson2(0, currentOrganisationUnitId, paging);
        }

//        List<Person> personList = persons.getContent();
//        ArrayList<PersonResponseDto> personResponseDtos = new ArrayList<>();
//        personList.forEach(person -> {
//            if (!(this.activeOnANC(person.getUuid()))) {
//                PersonResponseDto personResponseDto = getDtoFromPerson(person);
//                personResponseDtos.add(personResponseDto);
//            }
//
//        });

        //PageDTO pageDTO = this.generatePagination(personResponseDtos, pageNo, pageSize);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords(persons.getTotalElements());
        personMetaDataDto.setPageSize(persons.getSize());
        personMetaDataDto.setTotalPages(persons.getTotalPages());
        personMetaDataDto.setCurrentPage(persons.getNumber());
        //personMetaDataDto.setRecords(personResponseDtos);
        personMetaDataDto.setRecords(persons.getContent().stream().map(this::getDtoFromPerson).collect(Collectors.toList()));
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
        Page<PatientPerson> persons = null;
        if ((searchValue == null) || (searchValue.equals("*"))) {
            persons = ancRepository.getActiveOnANC(0, currentOrganisationUnitId, paging);
        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            //System.out.println("I got here Doc");
            persons = ancRepository.getActiveOnANCBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);
        }
        List<PatientPerson> personList = persons.getContent();
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

    public PersonMetaDataDto getActiveOnPMTCT(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        Optional<User> currentUser = this.userService.getUserWithRoles();
        Long currentOrganisationUnitId = 0L;
        if (currentUser.isPresent()) {
            User user = (User) currentUser.get();
            currentOrganisationUnitId = user.getCurrentOrganisationUnitId();

        }
        Page<PatientPerson> persons = null;
        if ((searchValue == null) || (searchValue.equals("*"))) {
            persons = pmtctEnrollmentReporsitory.getActiveOnPMTCT(0, currentOrganisationUnitId, paging);

        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = pmtctEnrollmentReporsitory.getActiveOnPMTCTBySearchParameters(queryParam, 0, currentOrganisationUnitId, paging);
        }
        List<PatientPerson> personList = persons.getContent();
        ArrayList<PMTCTEnrollmentWithPersonRespondDto> pmtctResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            PMTCTEnrollmentWithPersonRespondDto pmtctResponseDto = getPMTCTRespondDtoFromPerson(person);
            pmtctResponseDtos.add(pmtctResponseDto);
        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords(pmtctResponseDtos.size());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(pmtctResponseDtos);
        return personMetaDataDto;
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

                if ((age >= 5) && (sex.contains("F")) && (archive == 0)) {
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

    public PersonResponseDto getDtoFromPerson(PatientInfo person) {
        //Log.info("person {}", person);
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
        personResponseDto.setContactPoint(parseJsonString(person.getContactPoint()));
        personResponseDto.setAddress(parseJsonString(person.getAddress()));
        personResponseDto.setContact(parseJsonString(person.getContact()));
        personResponseDto.setIdentifier(parseJsonString(person.getIdentifier()));
        personResponseDto.setEducation(parseJsonString(person.getEducation()));
        personResponseDto.setEmploymentStatus(parseJsonString(person.getEmploymentStatus()));
        personResponseDto.setMaritalStatus(parseJsonString(person.getMaritalStatus()));
        personResponseDto.setSex(person.getSex());
        personResponseDto.setGender(parseJsonString(person.getGender()));
        personResponseDto.setDeceased(person.getDeceased());
        personResponseDto.setDateOfRegistration(person.getDateOfRegistration());
        personResponseDto.setActive(person.getActive());
        personResponseDto.setDeceasedDateTime(person.getDeceasedDateTime());
        personResponseDto.setOrganization(parseJsonString(person.getOrganization()));
        personResponseDto.setUuid(person.getUuid());
        String hivStatus = "Unknown";
        try {
            hivStatus = this.getDynamicHivStatus(person.getUuid());
        } catch (Exception e) {
        }
        personResponseDto.setDynamicHivStatus(hivStatus);
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
            anc.setAncSetting(ancEnrollementRequestDto.getAncSetting());
            try{
                LocalDate nad = this.calculateNAD(ancEnrollementRequestDto.getFirstAncDate());

                anc.setDefaultDays(this.defaultDate(ancEnrollementRequestDto.getFirstAncDate(), ancEnrollementRequestDto.getFirstAncDate()));
                anc.setLastVisitDate(ancEnrollementRequestDto.getFirstAncDate());
                anc.setNextAppointmentDate(nad);
            }catch(Exception e){}
            anc.setTestedSyphilis(ancEnrollementRequestDto.getTestedSyphilis());
            anc.setTestResultSyphilis(ancEnrollementRequestDto.getTestResultSyphilis());
            anc.setTreatedSyphilis(ancEnrollementRequestDto.getTreatedSyphilis());
            anc.setSourceOfReferral(ancEnrollementRequestDto.getSourceOfReferral());
            anc.setReferredSyphilisTreatment(ancEnrollementRequestDto.getReferredSyphilisTreatment());
            try {
                LocalDate eed = this.calculateEDD(ancEnrollementRequestDto.getLMP());
                anc.setExpectedDeliveryDate(eed);
            } catch (Exception e) {
                e.printStackTrace();
            }
            anc.setStaticHivStatus(ancEnrollementRequestDto.getStaticHivStatus());
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
        ancRespondDto.setAddress(persons.getAddress());
        ancRespondDto.setPersonId(persons.getId());
        ancRespondDto.setSex(persons.getSex());
        ancRespondDto.setContactPoint(persons.getContactPoint());
        ancRespondDto.setFirstAncDate(anc.getFirstAncDate());
        ancRespondDto.setGravida(anc.getGravida());
        ancRespondDto.setParity(anc.getParity());
        ancRespondDto.setLMP(anc.getLMP());
        ancRespondDto.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        ancRespondDto.setGAWeeks(anc.getGAWeeks());
        ancRespondDto.setHivDiognosicTime(anc.getHivDiognosicTime());
        ancRespondDto.setTestedSyphilis(anc.getTestedSyphilis());
        ancRespondDto.setTestResultSyphilis(anc.getTestResultSyphilis());
        ancRespondDto.setTreatedSyphilis(anc.getTreatedSyphilis());
        ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
        ancRespondDto.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());

        ancRespondDto.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        ancRespondDto.setPartnerNotification(anc.getPartnerNotification());
        ancRespondDto.setPerson_uuid(persons.getUuid());
        ancRespondDto.setStaticHivStatus(anc.getStaticHivStatus());
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
            anc.setStaticHivStatus(ancWithPersonRequestDto.getStaticHivStatus());
            anc.setHospitalNumber(person.getHospitalNumber());
            anc.setArchived(0L);
            anc.setFacilityId(person.getFacilityId());
            anc.setStatus("NV");
            try{
                LocalDate nad = this.calculateNAD(ancWithPersonRequestDto.getFirstAncDate());

                anc.setDefaultDays(this.defaultDate(ancWithPersonRequestDto.getFirstAncDate(), ancWithPersonRequestDto.getFirstAncDate()));
                anc.setLastVisitDate(ancWithPersonRequestDto.getFirstAncDate());
                anc.setNextAppointmentDate(nad);
            }catch(Exception e){}
            try {
                LocalDate eed = this.calculateEDD(ancWithPersonRequestDto.getLMP());
                //System.out.println("@ invocation "+ eed);
                anc.setExpectedDeliveryDate(eed);
            } catch (Exception e) {
                e.printStackTrace();
            }
            anc.setStaticHivStatus(ancWithPersonRequestDto.getStaticHivStatus());
            anc.setTestedSyphilis(ancWithPersonRequestDto.getTestedSyphilis());
            anc.setTestResultSyphilis(ancWithPersonRequestDto.getTestResultSyphilis());
            anc.setTreatedSyphilis(ancWithPersonRequestDto.getTreatedSyphilis());
            anc.setSourceOfReferral(ancWithPersonRequestDto.getSourceOfReferral());
            anc.setReferredSyphilisTreatment(ancWithPersonRequestDto.getReferredSyphilisTreatment());

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

    public PMTCTEnrollmentWithPersonRespondDto getPMTCTRespondDtoFromPerson(@NotNull PatientPerson person) {
        PMTCTEnrollmentWithPersonRespondDto pmtctWithPersonRespondDto = new PMTCTEnrollmentWithPersonRespondDto();
        pmtctWithPersonRespondDto.setDateOfBirth(person.getDateOfBirth());
        pmtctWithPersonRespondDto.setAge(this.calculateAge(person.getDateOfBirth()));
        pmtctWithPersonRespondDto.setSex(person.getSex());
        pmtctWithPersonRespondDto.setFullName(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
        pmtctWithPersonRespondDto.setPersonId(person.getPersonId());
        pmtctWithPersonRespondDto.setPerson_uuid(person.getPersonUuid());
        pmtctWithPersonRespondDto.setId(person.getId());
        pmtctWithPersonRespondDto.setUuid(person.getUuid());
        pmtctWithPersonRespondDto.setAddress(parseJsonString(person.getAddress()));
        pmtctWithPersonRespondDto.setContactPoint(parseJsonString(person.getContactPoint()));
        pmtctWithPersonRespondDto.setHospitalNumber(person.getHospitalNumber());
        pmtctWithPersonRespondDto.setHivStatus(person.getHivStatus());
        pmtctWithPersonRespondDto.setArtStartDate(person.getArtStartDate());
        pmtctWithPersonRespondDto.setEntryPoint(person.getEntryPoint());
        pmtctWithPersonRespondDto.setTbStatus(person.getTbStatus());
        pmtctWithPersonRespondDto.setPmtctRegStatus(true);

        Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndArchived(person.getPersonUuid(), 0L);
        if(ancs.isPresent()) {
            ANC anc = ancs.get();
            pmtctWithPersonRespondDto.setAncNo(anc.getAncNo());
            pmtctWithPersonRespondDto.setGravida(anc.getGravida());
            pmtctWithPersonRespondDto.setGAWeeks(anc.getGAWeeks());

        }
        PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = this.pmtctEnrollmentService.getSinglePmtctEnrollmentByPersonUuid(person.getPersonUuid());
        if(pmtctEnrollmentRespondDto != null) {
            pmtctWithPersonRespondDto.setPmtctEnrollmentDate(pmtctEnrollmentRespondDto.getPmtctEnrollmentDate());
//            pmtctWithPersonRespondDto.setEntryPoint(pmtctEnrollmentRespondDto.getEntryPoint());
            pmtctWithPersonRespondDto.setArtStartTime(pmtctEnrollmentRespondDto.getArtStartTime());
//            pmtctWithPersonRespondDto.setTbStatus(pmtctEnrollmentRespondDto.getTbStatus());
//            pmtctWithPersonRespondDto.setHospitalNumber(pmtctEnrollmentRespondDto.getHospitalNumber());
        }
        return pmtctWithPersonRespondDto;
    }

    private JsonNode parseJsonString(String jsonString) {
        try {
            if (jsonString != null) {
                return mapper.readTree(jsonString);
            }
            return null;
        } catch (IOException e) {
            System.err.println("Error parsing JSON string: " + e);
            return null;
        }
    }

    public ANCRespondDto getANCRespondDtoFromPerson(PatientPerson person) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        String ancNo = "";
        String personUuidStr = "";
        Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndArchived(person.getPersonUuid(), 0L);
        if (ancs.isPresent()) {
            ANC anc = ancs.get();
            ancNo = anc.getAncNo();
            personUuidStr = anc.getPersonUuid();
            ancRespondDto.setId(anc.getId());
            ancRespondDto.setAncNo(anc.getAncNo());
            ancRespondDto.setHospitalNumber(anc.getHospitalNumber());
            ancRespondDto.setFullname(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
            ancRespondDto.setAncUuid(anc.getUuid());
            ancRespondDto.setPerson_uuid(person.getPersonUuid());
            ancRespondDto.setPersonId(person.getPersonId());
            ancRespondDto.setAddress(parseJsonString(person.getAddress()));
            ancRespondDto.setContactPoint(parseJsonString(person.getContactPoint()));
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
            ancRespondDto.setTestedSyphilis(anc.getTestedSyphilis());
            ancRespondDto.setTestResultSyphilis(anc.getTestResultSyphilis());
            ancRespondDto.setTreatedSyphilis(anc.getTreatedSyphilis());
            ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
            ancRespondDto.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
            ancRespondDto.setPmtctHtsInfo(anc.getPmtctHtsInfo());
            ancRespondDto.setPartnerNotification(anc.getPartnerNotification());
            ancRespondDto.setStaticHivStatus(anc.getStaticHivStatus());
            ancRespondDto.setHivStatus(anc.getStaticHivStatus());
            ancRespondDto.setArtStartDate(person.getArtStartDate());

            String hivStatus = "Unknown";
            try {
                hivStatus = this.getDynamicHivStatus(anc.getPersonUuid());
            } catch (Exception e) { }
            ancRespondDto.setDynamicHivStatus(hivStatus);

            boolean deliveryStatus = Boolean.FALSE;
            try {
                deliveryStatus = this.getDeliveryStatus(anc.getAncNo());
            } catch (Exception e) { }
            ancRespondDto.setDeliveryStatus(deliveryStatus);

        }


        if (activeOnPMTCT(ancNo) || activeOnPMTCTByPersonUuid(personUuidStr)) {
            PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = this.pmtctEnrollmentService.getSinglePmtctEnrollmentByAncNo(ancNo);
            ancRespondDto.setPmtctRegStatus(true);
            ancRespondDto.setPmtctEnrollmentRespondDto(pmtctEnrollmentRespondDto);
        } else {
            ancRespondDto.setPmtctRegStatus(false);
        }
        return ancRespondDto;
    }

//    String getHivStatus(String uuid) {
//        String status = "Positive";
//        return status;
//    }

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

//    public boolean activeOnPMTCTByPersonUuid(String personUuid) {
//        boolean active = false;
//        Optional<PMTCTEnrollment> pmtctEnrollment = pmtctEnrollmentReporsitory.getByPersonUuid(personUuid);//.findANCByPersonUuidAndArchived(personUuid, 0L);
//        if (pmtctEnrollment.isPresent()) {
//            active = true;
//        } else {
//            active = false;
//        }
//        return active;
//    }

    public boolean activeOnPMTCTByPersonUuid(String personUuid) {
        List<PMTCTEnrollment> pmtctEnrollments = pmtctEnrollmentReporsitory.getAllByPersonUuid(personUuid);
        return pmtctEnrollments.stream().findFirst().isPresent();
    }

    private ANC getExistingANC(Long id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ANC.class, "id", "" + id));
    }

    public void graduateFromANC(ANC anc, String visitStatus) {
        ANC existingAnc = this.getExistingANC(anc.getId());
        existingAnc.setFirstAncDate(anc.getFirstAncDate());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setHivDiognosicTime(anc.getHivDiognosicTime());
        existingAnc.setTestedSyphilis(anc.getTestedSyphilis());
        existingAnc.setTestResultSyphilis(anc.getTestResultSyphilis());
        existingAnc.setTreatedSyphilis(anc.getTreatedSyphilis());
        existingAnc.setSourceOfReferral(anc.getSourceOfReferral());
        existingAnc.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        existingAnc.setArchived(1L);
        existingAnc.setStatus(visitStatus);
        existingAnc.setStaticHivStatus(anc.getStaticHivStatus());

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

    public void updateANC(ANC anc, String visitStatus, LocalDate visitDate) {
        ANC existingAnc = this.getExistingANC(anc.getId());
        existingAnc.setFirstAncDate(anc.getFirstAncDate());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setExpectedDeliveryDate(anc.getExpectedDeliveryDate());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setHivDiognosicTime(anc.getHivDiognosicTime());
        existingAnc.setTestedSyphilis(anc.getTestedSyphilis());
        existingAnc.setTestResultSyphilis(anc.getTestResultSyphilis());
        existingAnc.setTreatedSyphilis(anc.getTreatedSyphilis());
        existingAnc.setSourceOfReferral(anc.getSourceOfReferral());
        existingAnc.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        existingAnc.setArchived(0L);
        existingAnc.setStatus(visitStatus);
        try{
            LocalDate nad = this.calculateNAD(visitDate);

            existingAnc.setDefaultDays(this.defaultDate(existingAnc.getLastVisitDate(), visitDate));
            existingAnc.setLastVisitDate(visitDate);
            existingAnc.setNextAppointmentDate(nad);
        }catch(Exception e){}

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

    public boolean isANCExisting(String ancNO) {

        List<ANC> anc = ancRepository.getANCByAncNo(ancNO);
        boolean reply = false;
        if (anc.isEmpty()) reply = false;
        else reply = true;
        return reply;
    }
    //entityToDto

    public PartnerInformation updateAncWithPartnerInfo(Long id, PartnerInformation partnerInformation) {
        // PmtctVisit existVisit = getExistVisit(id);
        ANC anc = this.getExistingANC(id);
        PartnerInformation partnerInformation2 = partnerInformation;
        if (partnerInformation2 != null) {
            JsonNode partnerInformation2JsonNode = mapper.valueToTree(partnerInformation2);
            anc.setPartnerInformation(partnerInformation2JsonNode);
        }
        ancRepository.save(anc);
        return partnerInformation;
    }


    String getDynamicHivStatus(String personUuid) {
        String hivStatus = "Unknown";
        Optional<String> uuid = ancRepository.findInHivEnrollmentByUuid(personUuid);
        if (uuid.isPresent()) {
            hivStatus = "Positive";
        } else {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            Optional<HtsClientProjection> htsOptional = ancRepository.
                    getHtsRecordByPersonsUuidAAndFacilityId(personUuid, currentUser.get()
                            .getCurrentOrganisationUnitId());
            HtsClientProjection htsClient = htsOptional.get();

            hivStatus = htsClient != null ? htsClient.getHivTestResult() : "Negative";
        }
        return hivStatus;
    }

    boolean getDeliveryStatus(String ancNo) {
        boolean deliveryStatus = Boolean.FALSE;
        Delivery delivery = new Delivery();
        try{
            delivery = this.deliveryRepository.getDeliveryByAncNo(ancNo);

        }catch (Exception e){}

        if(delivery == null) deliveryStatus = Boolean.FALSE;
        else deliveryStatus = Boolean.TRUE;

        return deliveryStatus;
    }

    public LocalDate calculateEDD(LocalDate lmd) {
        LocalDate date = lmd;
        date = date.plusMonths(9);
        date = date.plusDays(7);
        return date;
    }

    public int calculateGA(LocalDate lmd) {
        LocalDate currentDate = LocalDate.now();
        return (int) ChronoUnit.WEEKS.between(lmd, currentDate);
    }

    public PageDTO generatePagination(ArrayList al, Integer pageNo, Integer pagesize) {
        long totalRecords = al.size();
        int pageNumber = pageNo;
        int pageSize = pagesize;
        int totalPages = (int) Math.ceil(totalRecords / pagesize);
        return PageDTO.builder().totalRecords(totalRecords).pageNumber(pageNumber).pageSize(pageSize).totalPages(totalPages).build();
    }

    public int calculateGA(String ancNo, LocalDate visitDate) {
        LocalDate lmp = getLMP(ancNo);
        int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }

    public LocalDate getLMP(String ancNo) {
        LocalDate LMP = LocalDate.now();
        Optional<ANC> anc = this.ancRepository.getByAncNo(ancNo);
        if (anc.isPresent())
            LMP = anc.get().getLMP();
        return LMP;
    }

    public LocalDate getLMPFromPMTCT(String personUuid) {
        LocalDate LMP = LocalDate.now();
        Optional<PMTCTEnrollment> pmtct = this.pmtctEnrollmentReporsitory.getByPersonUuid(personUuid);
        if(pmtct.isPresent() && pmtct.get().getLmp() != null) {
            LMP = pmtct.get().getLmp();
        }
        return LMP;
    }

    public int calculateGA2(String hospitalNumber, LocalDate visitDate) {
        LocalDate dob = getDOB(hospitalNumber);
        int ga = (int) ChronoUnit.MONTHS.between(dob, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }

    public LocalDate getDOB(String hospitalNumber) {
        LocalDate DOB = LocalDate.now();
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(hospitalNumber);
        if (infants.isPresent())
            DOB = infants.get().getDateOfDelivery();
        return DOB;
    }
//
//    public ANCRespondDto getANCDetailsByANCNo(String ancNo){
//        Optional<ANC> anc = ancRepository.getByAncNo(ancNo);
//        ANCRespondDto ancRespondDto = new ANCRespondDto()
//        if(anc.isPresent()){
//            String puuid = anc.get().getPersonUuid();
//            Optional<User> currentUser = this.userService.getUserWithRoles();
//            User user = (User) currentUser.get();
//            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(puuid, user.getCurrentOrganisationUnitId(), 0);
//            if(persons.isPresent()){
//                Person person = persons.get();
//                ancRespondDto = getANCRespondDtoFromPerson(person);
//            }
//
//
//        }
//        return ancRespondDto;
//    }

    public void deleteANC(Long id) {
        ANC existingANC = this.getSingleAnc(id);
        existingANC.setArchived(1L);
        ancRepository.save(existingANC);
    }

    public void deletePartnerInfo(Long id)
    {
        // PmtctVisit existVisit = getExistVisit(id);
        ANC anc = this.getExistingANC(id);
        JsonNode partnerInformation2JsonNode = mapper.valueToTree(null);
        anc.setPartnerInformation(partnerInformation2JsonNode);
        ancRepository.save(anc);
    }

    public int defaultDate (LocalDate day1, LocalDate day2){
        int age = 0;
        if((day1 == null) || (day2 == null)){age = 0;}
        else {
            age = (int) ChronoUnit.MONTHS.between(day1, day2);
            if (age <= 0) age = 0;
        }
        return age;
    }
    public LocalDate calculateNAD(LocalDate lmd) {
        LocalDate date = lmd;
        date = date.plusMonths(1);
        return date;
    }

    public int calculateGaFromPmtct(String personUuid, LocalDate visitDate) {
        LocalDate lmp = getLMPFromPMTCT(personUuid);
        int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }
}

