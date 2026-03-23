package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Period;
import java.time.temporal.ChronoUnit;

@Service
//@AllArgsConstructor


@RequiredArgsConstructor

public class ANCService {
    @Autowired
    private  ANCRepository ancRepository;
    private final PersonRepository personRepository;

    private final InfantRepository infantRepository;
    private final UserService userService;
    private final PersonService personService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;
    private final OrganisationUnitRepository organisationUnitRepository;
    private final EncounterRepository encounterRepository;
    private final VisitService visitService;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentRepository;

    @Autowired
    private  PMTCTEnrollmentService pmtctEnrollmentService;

    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
//    private Logger logger;

    private final DeliveryRepository deliveryRepository;

    @Autowired
    private PmtctPregnancyCycleService pmtctPregnancyCycleService;

    @Autowired
    private PmtctPregnancyCycleRepository pmtctPregnancyCycleRepository;

    @Autowired
    private PmtctHtsRepository pmtctHtsRepository;

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
            anc.setCommunitySetting(ancRequestDto.getCommunitySetting());
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

    public void  updateGAFromPMTCT(String personUuid, Integer GaAge)
    {


        Optional <ANC> ancRecord = this.ancRepository.findANCByPersonUuid(personUuid);
        if(ancRecord.isPresent())
        {
            ANC AncResult = ancRecord.get();
            AncResult.setGAWeeks(GaAge);

            this.ancRepository.save(AncResult);
        }
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
        anc.setAncSetting(ancRequestDto.getAncSetting());
        anc.setPreviouslyKnownHivStatus(ancRequestDto.getPreviouslyKnownHivStatus());
        anc.setCurrentlyOnArt(ancRequestDto.getCurrentlyOnArt());
        anc.setDateOfHepatitisB(ancRequestDto.getDateOfHepatitisB());
        anc.setHepatitisB(ancRequestDto.getHepatitisB());
        anc.setTestedHepatitisB(ancRequestDto.getTestedHepatitisB());
        anc.setTreatedHepatitisB(ancRequestDto.getTreatedHepatitisB());
        anc.setReferredHepatitisB(ancRequestDto.getReferredHepatitisB());
        anc.setDateOfHepatitisC(ancRequestDto.getDateOfHepatitisC());
        anc.setHepatitisC(ancRequestDto.getHepatitisC());
        anc.setTestedHepatitisC(ancRequestDto.getTestedHepatitisC());
        anc.setTreatedHepatitisC(ancRequestDto.getTreatedHepatitisC());
        anc.setReferredHepatitisC(ancRequestDto.getReferredHepatitisC());
        anc.setFacilityEnrolledIn(ancRequestDto.getFacilityEnrolledIn());

        //check if the patient is on pmtct page

        System.out.println(exist.getPersonUuid());

        boolean  hasPmtctRecord = pmtctEnrollmentRepository.checkPatientOnPMTCT(exist.getPersonUuid());

//        if(hasPmtctRecord){
//            pmtctEnrollmentRepository.updateLmp(ancRequestDto.getLMP(), exist.getPersonUuid());
//            LocalDate PmtctEnrollmentDate = pmtctEnrollmentRepository.getPmtctEnrollmentDate(exist.getPersonUuid());
//
//            //calculate the GA
//             Long gestationalAge =    ChronoUnit.WEEKS.between(ancRequestDto.getLMP(), PmtctEnrollmentDate);
//            // update the gestational age on the pmtct table
//            pmtctEnrollmentRepository.updateTheGA(gestationalAge, exist.getPersonUuid());


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
        ancRespondDto.setTreatedSyphilis(anc.getTreatedSyphilis());
        //ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
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
            System.out.println("mycurrentOrganisationUnitId " + currentOrganisationUnitId);
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
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("personId").descending());
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
        System.out.println(persons);
        List<PatientPerson> personList = persons.getContent();
        ArrayList<ANCRespondDto> ancResponseDtos = new ArrayList<>();
        personList.forEach(person -> {
            ANCRespondDto ancResponseDto = getANCRespondDtoFromPerson(person);
            ancResponseDtos.add(ancResponseDto);
        });

        PageDTO pageDTO = personService.generatePagination(persons);
        PersonMetaDataDto personMetaDataDto = new PersonMetaDataDto();
        personMetaDataDto.setTotalRecords((int) persons.getTotalElements());
        personMetaDataDto.setPageSize(pageDTO.getPageSize());
        personMetaDataDto.setTotalPages(pageDTO.getTotalPages());
        personMetaDataDto.setCurrentPage(pageDTO.getPageNumber());
        personMetaDataDto.setRecords(ancResponseDtos);
        //personMetaDataDto.setRecords(persons.getContent().stream().map(this::getDtoFromPerson).collect(Collectors.toList()));
        return personMetaDataDto;
        //return checkedInPeople;
    }

    public PersonMetaDataDto getActiveOnPMTCT(String searchValue, int pageNo, int pageSize) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("personId").descending());
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
        personMetaDataDto.setTotalRecords((int) persons.getTotalElements());
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

    public PMTCTPersonResponseDto getDtoFromPerson(PatientInfo person) {
        //Log.info("person {}", person);
        PMTCTPersonResponseDto personResponseDto = new PMTCTPersonResponseDto();
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
        personResponseDto.setPregnancyCount(person.getPregnancyCount());
        personResponseDto.setHasExistingEnrollment(person.getHasExistingEnrollment());
        personResponseDto.setMaternalOutcome(person.getMaternalOutcome());
        personResponseDto.setVisitStatus(person.getVisitStatus());
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
            System.out.println("person found " + person);
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
            anc.setPreviouslyKnownHivStatus(ancEnrollementRequestDto.getPreviouslyKnownHivStatus());
            anc.setCurrentlyOnArt(ancEnrollementRequestDto.getCurrentlyOnArt());
            anc.setDateOfHepatitisB(ancEnrollementRequestDto.getDateOfHepatitisB());
            anc.setHepatitisB(ancEnrollementRequestDto.getHepatitisB());
            anc.setTestedHepatitisB(ancEnrollementRequestDto.getTestedHepatitisB());
            anc.setTreatedHepatitisB(ancEnrollementRequestDto.getTreatedHepatitisB());
            anc.setReferredHepatitisB(ancEnrollementRequestDto.getReferredHepatitisB());
            anc.setDateOfHepatitisC(ancEnrollementRequestDto.getDateOfHepatitisC());
            anc.setHepatitisC(ancEnrollementRequestDto.getHepatitisC());
            anc.setTestedHepatitisC(ancEnrollementRequestDto.getTestedHepatitisC());
            anc.setTreatedHepatitisC(ancEnrollementRequestDto.getTreatedHepatitisC());
            anc.setReferredHepatitisC(ancEnrollementRequestDto.getReferredHepatitisC());
            anc.setFacilityEnrolledIn(ancEnrollementRequestDto.getFacilityEnrolledIn());
            anc.setCommunitySetting(ancEnrollementRequestDto.getCommunitySetting());
            anc.setPmtctCycleId(ancEnrollementRequestDto.getPmtctCycleId());
            anc.setSource(ancEnrollementRequestDto.getSource());

            try{
                LocalDate nad = this.calculateNAD(ancEnrollementRequestDto.getFirstAncDate());

                anc.setDefaultDays(this.defaultDate(ancEnrollementRequestDto.getFirstAncDate(), ancEnrollementRequestDto.getFirstAncDate()));
                anc.setLastVisitDate(ancEnrollementRequestDto.getFirstAncDate());
                anc.setNextAppointmentDate(nad);
            }catch(Exception e){}
            anc.setTestedSyphilis(ancEnrollementRequestDto.getTestedSyphilis());
            anc.setTestResultSyphilis(ancEnrollementRequestDto.getTestResultSyphilis());
            anc.setTreatedSyphilis(ancEnrollementRequestDto.getTreatedSyphilis());
            //anc.setSourceOfReferral(ancEnrollementRequestDto.getSourceOfReferral());
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

        ANC savedAnc = ancRepository.save(anc);

        // Update pregnancy cycle status to ACTIVE
        if (ancEnrollementRequestDto.getPmtctCycleId() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(ancEnrollementRequestDto.getPmtctCycleId());
        }

        return getANCRespondDtoFromPersonAndAnc(person, savedAnc);
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
        ancRespondDto.setTreatedSyphilis(anc.getTreatedSyphilis());
        //ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
        ancRespondDto.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        ancRespondDto.setAncSetting(anc.getAncSetting());
        ancRespondDto.setCommunitySetting(anc.getCommunitySetting());

        ancRespondDto.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        ancRespondDto.setPartnerNotification(anc.getPartnerNotification());
        ancRespondDto.setPerson_uuid(persons.getUuid());
        ancRespondDto.setStaticHivStatus(anc.getStaticHivStatus());
        ancRespondDto.setPreviouslyKnownHivStatus(anc.getPreviouslyKnownHivStatus());
        return ancRespondDto;
    }

    public ANCRespondDto newANCRegistration(ANCWithPersonRequestDto ancWithPersonRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        String personUuid = createPerson(ancWithPersonRequestDto.getPersonDto());
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(personUuid, user.getCurrentOrganisationUnitId(), 0);
        Person person = new Person();
        System.out.println("created person " + persons.get());

        ANC anc = new ANC();
        if (persons.isPresent()) {
            person = persons.get();
            System.out.println("new person " + person);

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
            anc.setAncSetting(ancWithPersonRequestDto.getAncSetting());
            anc.setStatus("NV");
            anc.setPreviouslyKnownHivStatus(ancWithPersonRequestDto.getPreviouslyKnownHivStatus());
            anc.setCurrentlyOnArt(ancWithPersonRequestDto.getCurrentlyOnArt());
            anc.setDateOfHepatitisB(ancWithPersonRequestDto.getDateOfHepatitisB());
            anc.setHepatitisB(ancWithPersonRequestDto.getHepatitisB());
            anc.setTestedHepatitisB(ancWithPersonRequestDto.getTestedHepatitisB());
            anc.setTreatedHepatitisB(ancWithPersonRequestDto.getTreatedHepatitisB());
            anc.setReferredHepatitisB(ancWithPersonRequestDto.getReferredHepatitisB());
            anc.setDateOfHepatitisC(ancWithPersonRequestDto.getDateOfHepatitisC());
            anc.setHepatitisC(ancWithPersonRequestDto.getHepatitisC());
            anc.setTestedHepatitisC(ancWithPersonRequestDto.getTestedHepatitisC());
            anc.setTreatedHepatitisB(ancWithPersonRequestDto.getTreatedHepatitisB());
            anc.setReferredHepatitisC(ancWithPersonRequestDto.getReferredHepatitisC());
            anc.setFacilityEnrolledIn(ancWithPersonRequestDto.getFacilityEnrolledIn());
            anc.setCommunitySetting(ancWithPersonRequestDto.getCommunitySetting());
            anc.setSource(ancWithPersonRequestDto.getSource());
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
            anc.setCommunitySetting(ancWithPersonRequestDto.getCommunitySetting());

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
        // Set basic person information
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
        pmtctWithPersonRespondDto.setPregnancyCount(person.getPregnancyCount());

        // Get latest pregnancy cycle ID and use it to fetch enrollment data
        Optional<PmtctPregnancyCycle> latestCycle = pmtctPregnancyCycleRepository.findLatestByPersonUuid(person.getPersonUuid());

        if (latestCycle.isPresent()) {
            Long cycleId = latestCycle.get().getId();
            pmtctWithPersonRespondDto.setPmtctCycleId(cycleId);

            // Use cycle ID to get enrollment data for the latest pregnancy cycle
            Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(cycleId, 0L);

            if (enrollment.isPresent()) {
                PMTCTEnrollment enrollmentData = enrollment.get();
                // Set all enrollment-related data from the latest cycle enrollment
                pmtctWithPersonRespondDto.setPmtctEnrollmentDate(enrollmentData.getPmtctEnrollmentDate());
                pmtctWithPersonRespondDto.setAncNo(enrollmentData.getAncNo());
                pmtctWithPersonRespondDto.setArtStartDate(enrollmentData.getArtStartDate());
                pmtctWithPersonRespondDto.setArtStartTime(enrollmentData.getArtStartTime());
                pmtctWithPersonRespondDto.setEntryPoint(enrollmentData.getEntryPoint());
                pmtctWithPersonRespondDto.setTbStatus(enrollmentData.getTbStatus());
                pmtctWithPersonRespondDto.setPmtctRegStatus(true);
                pmtctWithPersonRespondDto.setHivStatus(enrollmentData.getHivStatus());

                // Get ANC data for the latest cycle using person_uuid and pmtct_cycle_id
                Optional<ANC> ancs = ancRepository.findANCByPersonUuidAndCycleIdAndArchived(person.getPersonUuid(), cycleId, 0L);
                if(ancs.isPresent()) {
                    ANC anc = ancs.get();
                    pmtctWithPersonRespondDto.setGravida(anc.getGravida());
                    pmtctWithPersonRespondDto.setGAWeeks(anc.getGAWeeks());
                } else {
                    // Fallback: If no ANC found by cycle ID, try by ancNo if available
                    if (enrollmentData.getAncNo() != null) {
                        Optional<ANC> ancsByAncNo = ancRepository.getByAncNoAndArchived(enrollmentData.getAncNo(), 0L);
                        if(ancsByAncNo.isPresent()) {
                            ANC anc = ancsByAncNo.get();
                            pmtctWithPersonRespondDto.setGravida(anc.getGravida());
                            pmtctWithPersonRespondDto.setGAWeeks(anc.getGAWeeks());
                        }
                    }
                }
            } else {
                // No enrollment found for the latest cycle
                pmtctWithPersonRespondDto.setPmtctRegStatus(false);
            }
        } else {
            // No pregnancy cycle found - set pmtctRegStatus to false
            pmtctWithPersonRespondDto.setPmtctRegStatus(false);
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

        // Set basic person information
        ancRespondDto.setHospitalNumber(person.getHospitalNumber());
        ancRespondDto.setFullname(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
        ancRespondDto.setPerson_uuid(person.getPersonUuid());
        ancRespondDto.setPersonId(person.getPersonId());
        ancRespondDto.setAddress(parseJsonString(person.getAddress()));
        ancRespondDto.setContactPoint(parseJsonString(person.getContactPoint()));
        ancRespondDto.setSex(person.getSex());
        ancRespondDto.setDateOfBirth(person.getDateOfBirth());
        ancRespondDto.setAge(this.calculateAge(person.getDateOfBirth()));
        ancRespondDto.setPregnancyCount(person.getPregnancyCount());

        // Set ANC-specific fields directly from the query result (latest ANC record for latest pmtctCycleId)
        ancRespondDto.setId(person.getPersonId());
        ancRespondDto.setAncNo(person.getAncNo());
        ancRespondDto.setAncUuid(person.getAncUuid());
        ancRespondDto.setAncSetting(person.getAncSetting());
        ancRespondDto.setCommunitySetting(person.getCommunitySetting());
        ancRespondDto.setCurrentlyOnArt(person.getCurrentlyOnArt());
        ancRespondDto.setFirstAncDate(person.getFirstAncDate());
        ancRespondDto.setGAWeeks(person.getGaweeks());
        ancRespondDto.setGravida(person.getGravida());
        ancRespondDto.setLMP(person.getLmp());
        ancRespondDto.setParity(person.getParity());
        ancRespondDto.setPreviouslyKnownHivStatus(person.getPreviouslyKnownHivStatus());
        ancRespondDto.setReferredSyphilisTreatment(person.getReferredSyphilisTreatment());
        ancRespondDto.setStaticHivStatus(person.getStaticHivStatus());
        ancRespondDto.setArtStartDate(person.getArtStartDate());

        // Set pmtctCycleId from the query result
        Long pmtctCycleId = person.getPmtctCycleId();
        ancRespondDto.setPmtctCycleId(pmtctCycleId);

        // Check if person has a valid pmtctCycleId (means they have an active ANC enrollment)
        if (pmtctCycleId != null) {
            // Get enrollment data for additional fields not in the ANC query
            Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(pmtctCycleId, 0L);

            if (enrollment.isPresent()) {
                PMTCTEnrollment enrollmentData = enrollment.get();

                // Set enrollment-related data
                ancRespondDto.setEntryPoint(enrollmentData.getEntryPoint());
                ancRespondDto.setTbStatus(enrollmentData.getTbStatus());
                ancRespondDto.setHivStatus(enrollmentData.getHivStatus());
                ancRespondDto.setPmtctRegStatus(true);

                // Get delivery status for the latest cycle
                boolean deliveryStatus = Boolean.FALSE;
                try {
                    deliveryStatus = this.getDeliveryStatus(person.getAncNo());
                } catch (Exception e) { }
                ancRespondDto.setDeliveryStatus(deliveryStatus);

                // Get PMTCT enrollment details for the latest cycle
                PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = this.pmtctEnrollmentService.getSinglePmtctEnrollmentByAncNo(person.getAncNo());
                ancRespondDto.setPmtctEnrollmentRespondDto(pmtctEnrollmentRespondDto);
            } else {
                // No enrollment found for the latest cycle
                ancRespondDto.setPmtctRegStatus(false);
            }

            // Get dynamic HIV status
            String dynamicHivStatus = "Unknown";
            try {
                dynamicHivStatus = this.getDynamicHivStatus(person.getPersonUuid());
            } catch (Exception e) { }
            ancRespondDto.setDynamicHivStatus(dynamicHivStatus);
        } else {
            // No pregnancy cycle found
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
        existingAnc.setCommunitySetting(anc.getCommunitySetting());
        existingAnc.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        // existingAnc.setArchived(1L); // Removed: This was auto-archiving ANC records when graduating
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
        existingAnc.setCommunitySetting(anc.getCommunitySetting());
        existingAnc.setReferredSyphilisTreatment(anc.getReferredSyphilisTreatment());
        existingAnc.setPmtctHtsInfo(anc.getPmtctHtsInfo());
        existingAnc.setPartnerNotification(anc.getPartnerNotification());
        existingAnc.setPersonUuid(anc.getPersonUuid());
        existingAnc.setArchived(0L);
        existingAnc.setStatus(visitStatus);
        existingAnc.setPreviouslyKnownHivStatus(anc.getPreviouslyKnownHivStatus());
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

      return ancRepository.existsByAnc(ancNO);

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
        List<String> allStatuses = new ArrayList<>();

        // 1. Check hiv_enrollment table - if exists, patient is positive
        Optional<String> hivEnrollmentUuid = ancRepository.findInHivEnrollmentByUuid(personUuid);
        if (hivEnrollmentUuid.isPresent()) {
            allStatuses.add("Positive");
        }

        // 2. Check hts_client table for hiv_test_result
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            if (currentUser.isPresent()) {
                Optional<HtsClientProjection> htsOptional = ancRepository
                        .getHtsRecordByPersonsUuidAAndFacilityId(personUuid, currentUser.get()
                                .getCurrentOrganisationUnitId());
                if (htsOptional.isPresent() && htsOptional.get().getHivTestResult() != null) {
                    allStatuses.add(htsOptional.get().getHivTestResult());
                }
            }
        } catch (Exception e) { }

        // 3. Check pmtct_anc table for static_hiv_status
        try {
            Optional<String> ancStaticHivStatus = ancRepository.findStaticHivStatusByPersonUuid(personUuid);
            if (ancStaticHivStatus.isPresent() && ancStaticHivStatus.get() != null) {
                allStatuses.add(ancStaticHivStatus.get());
            }
        } catch (Exception e) { }

        // 4. Check pmtct_enrollment table for hiv_status
        try {
            Optional<String> pmtctEnrollmentHivStatus = pmtctEnrollmentRepository.findHivStatusByPersonUuid(personUuid);
            if (pmtctEnrollmentHivStatus.isPresent() && pmtctEnrollmentHivStatus.get() != null) {
                allStatuses.add(pmtctEnrollmentHivStatus.get());
            }
        } catch (Exception e) { }

        // 5. Check pmtct_hts table for maternal retesting results
        try {
            Optional<String> pmtctHtsResult = pmtctHtsRepository.findLatestFinalResult(personUuid);
            if (pmtctHtsResult.isPresent() && pmtctHtsResult.get() != null) {
                allStatuses.add(pmtctHtsResult.get());
            }
        } catch (Exception e) { }

        // Determine final HIV status based on all collected statuses
        // If any status is positive/reactive, return "Positive"
        boolean hasPositive = allStatuses.stream()
                .filter(status -> status != null && !status.isEmpty())
                .map(String::toLowerCase)
                .anyMatch(status -> {
                    // Exclude non-reactive first
                    if (status.contains("non-reactive") || status.contains("non reactive")) {
                        return false;
                    }
                    return status.contains("positive") || status.contains("reactive");
                });

        if (hasPositive) {
            return "Positive";
        }

        // If no positive but has negative/non-reactive, return "Negative"
        boolean hasNegative = allStatuses.stream()
                .filter(status -> status != null && !status.isEmpty())
                .map(String::toLowerCase)
                .anyMatch(status -> status.contains("negative") || status.contains("non-reactive") || status.contains("non reactive"));

        if (hasNegative) {
            return "Negative";
        }

        // If no records found in any table, return "Unknown"
        return "Unknown";
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

    public LocalDate getLMPFromPMTCT(String personUuid, Long pmtctCycleId) {
        LocalDate LMP = LocalDate.now();

        // Get enrollment for the specific cycle
        Optional<PMTCTEnrollment> pmtct = this.pmtctEnrollmentReporsitory.getByPersonUuidAndPmtctCycleId(personUuid, pmtctCycleId);

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

    public int calculateGaFromPmtct(String personUuid, LocalDate visitDate, Long pmtctCycleId) {
        LocalDate lmp = getLMPFromPMTCT(personUuid, pmtctCycleId);
        int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }

    public boolean isInfantRisk(String personUuid, Long pmtctCycleId) {
        List<InfantPCRAlert> highRiskInfants = getHighRiskInfantDetails(personUuid, pmtctCycleId);
        return !highRiskInfants.isEmpty();
    }

    public List<InfantPCRAlert> getHighRiskInfantDetails(String personUuid, Long pmtctCycleId) {
        List<InfantPCRAlert> highRiskInfants = new ArrayList<>();

        // Validate pmtctCycleId
        if (pmtctCycleId == null) {
            return highRiskInfants;
        }

        // Get all infants for this mother and cycle
        List<Infant> infants = infantRepository.getAllInfantByPersonUuidAndCycleId(personUuid, pmtctCycleId);

        if (infants == null || infants.isEmpty()) {
            return highRiskInfants;
        }

        // Check high-risk criteria
        List<String> highRiskReasons = new ArrayList<>();

        // Mother enrolled on ART after 36 weeks gestation or postpartum or at L&D
        String motherTimeOfART = pmtctEnrollmentRepository.getMotherARTInitial(personUuid, pmtctCycleId);
        if (motherTimeOfART != null) {
            if ("TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD".equals(motherTimeOfART)) {
                highRiskReasons.add("Mother enrolled on ART after 36 weeks gestation");
            }
            if ("TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)".equals(motherTimeOfART)) {
                highRiskReasons.add("Mother initiated ART post-partum");
            }
            if ("TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D".equals(motherTimeOfART)) {
                highRiskReasons.add("Mother initiated ART at Labour & Delivery");
            }
        }

        // Rupture of membranes < 4hrs before delivery
        String rupOfMembrane = pmtctEnrollmentRepository.checkRuptureMembraneAt4hrs(personUuid, pmtctCycleId);
        if (rupOfMembrane != null && "ROM_DELIVERY_INTERVAL_<4HRS".equals(rupOfMembrane)) {
            highRiskReasons.add("Rupture of Membrane < 4 hours before delivery");
        }

        // NVP + AZT selected as ARV prophylaxis for infant
        String nvpAndAZT = pmtctEnrollmentRepository.getNVPandAZT(personUuid, pmtctCycleId);
        if (nvpAndAZT != null && "INFANT_ARV_PROPHYLAXIS_TYPE_NVP_+_AZT_".equals(nvpAndAZT)) {
            highRiskReasons.add("NVP+AZT selected as ARV prophylaxis");
        }

        // If there are high-risk reasons, add all infants to the list
        if (!highRiskReasons.isEmpty()) {
            for (Infant infant : infants) {
                InfantPCRAlert alert = new InfantPCRAlert();
                alert.setInfantHospitalNo(infant.getHospitalNumber());
                alert.setDeliveryDate(infant.getDateOfDelivery());

                // Build alert message from reasons
                String alertMessage = String.join(", ", highRiskReasons);
                alert.setAlertMessage(alertMessage);

                highRiskInfants.add(alert);
            }
        }

        return highRiskInfants;
    }

    public ANCEnrollmentCheckDto checkANCEnrollmentByPersonUuid(String personUuid) {
        ANCEnrollmentCheckDto response = new ANCEnrollmentCheckDto();

        // Get the latest ANC record for this patient
        Optional<ANC> ancOptional = ancRepository.findLatestANCByPersonUuidAndArchived(personUuid, 0L);

        if (ancOptional.isPresent()) {
            ANC anc = ancOptional.get();
            response.setHasAncEnrollment(true);
            response.setFirstAncDate(anc.getFirstAncDate());
            response.setLmp(anc.getLMP());
            response.setAncNo(anc.getAncNo());
        } else {
            response.setHasAncEnrollment(false);
            response.setFirstAncDate(null);
            response.setLmp(null);
            response.setAncNo(null);
        }

        return response;
    }

    public PMTCTStatisticsDto getPMTCTStatistics() {
        Optional<org.lamisplus.modules.base.domain.entities.User> currentUser = this.userService.getUserWithRoles();
        org.lamisplus.modules.base.domain.entities.User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        // Get total female patients >= 5 years
        Long totalPatients = pmtctEnrollmentRepository.getTotalFemalePatients(facilityId);
        if (totalPatients == null) totalPatients = 0L;

        // Get total ANC patients with enrollment date
        Long ancPatients = pmtctEnrollmentRepository.getTotalANCPatients(facilityId);
        if (ancPatients == null) ancPatients = 0L;

        // Get total PMTCT patients with enrollment date
        Long pmtctPatients = pmtctEnrollmentRepository.getTotalPMTCTPatients(facilityId);
        if (pmtctPatients == null) pmtctPatients = 0L;

        // Get PMTCT Viral Load numerator and denominator
        Long vlNumerator = pmtctEnrollmentRepository.getPMTCTViralLoadNumerator(facilityId);
        if (vlNumerator == null) vlNumerator = 0L;

        Long vlDenominator = pmtctEnrollmentRepository.getPMTCTViralLoadDenominator(facilityId);
        if (vlDenominator == null) vlDenominator = 0L;

        // Calculate VL uptake percentage
        Double vlPercentage = 0.0;
        if (vlDenominator > 0) {
            vlPercentage = (vlNumerator.doubleValue() / vlDenominator.doubleValue()) * 100;
            vlPercentage = Math.round(vlPercentage * 100.0) / 100.0;
        }

        // Get Viral Suppression numerator (VL < 1000)
        Long suppressionNumerator = pmtctEnrollmentRepository.getViralSuppressionNumerator(facilityId);
        if (suppressionNumerator == null) suppressionNumerator = 0L;

        // Viral Suppression denominator is the same as VL uptake numerator (patients with VL result)
        Long suppressionDenominator = vlNumerator;

        // Calculate Viral Suppression percentage
        Double suppressionPercentage = 0.0;
        if (suppressionDenominator > 0) {
            suppressionPercentage = (suppressionNumerator.doubleValue() / suppressionDenominator.doubleValue()) * 100;
            suppressionPercentage = Math.round(suppressionPercentage * 100.0) / 100.0;
        }

        // Get Unsuppressed counts by quarters
        Long unsuppressedQ1 = pmtctEnrollmentRepository.getUnsuppressedQ1(facilityId);
        if (unsuppressedQ1 == null) unsuppressedQ1 = 0L;

        Long unsuppressedQ2 = pmtctEnrollmentRepository.getUnsuppressedQ2(facilityId);
        if (unsuppressedQ2 == null) unsuppressedQ2 = 0L;

        Long unsuppressedQ3 = pmtctEnrollmentRepository.getUnsuppressedQ3(facilityId);
        if (unsuppressedQ3 == null) unsuppressedQ3 = 0L;

        Long unsuppressedQ4 = pmtctEnrollmentRepository.getUnsuppressedQ4(facilityId);
        if (unsuppressedQ4 == null) unsuppressedQ4 = 0L;

        Long unsuppressedTotal = pmtctEnrollmentRepository.getUnsuppressedTotal(facilityId);
        if (unsuppressedTotal == null) unsuppressedTotal = 0L;

        // PMTCT Exit Tracked - Mothers (from pmtct_pregnancy_cycle.maternal_outcome)
        Long pmtctExitActiveInCohort = pmtctEnrollmentRepository.getPmtctExitActiveInCohort(facilityId);
        if (pmtctExitActiveInCohort == null) pmtctExitActiveInCohort = 0L;

        Long pmtctExitTransferredOut = pmtctEnrollmentRepository.getPmtctExitTransferredOut(facilityId);
        if (pmtctExitTransferredOut == null) pmtctExitTransferredOut = 0L;

        Long pmtctExitTransferredToAnotherPMTCT = pmtctEnrollmentRepository.getPmtctExitTransferredToAnotherPMTCT(facilityId);
        if (pmtctExitTransferredToAnotherPMTCT == null) pmtctExitTransferredToAnotherPMTCT = 0L;

        Long pmtctExitTransitionedToART = pmtctEnrollmentRepository.getPmtctExitTransitionedToART(facilityId);
        if (pmtctExitTransitionedToART == null) pmtctExitTransitionedToART = 0L;

        Long pmtctExitLostToFollowUp = pmtctEnrollmentRepository.getPmtctExitLostToFollowUp(facilityId);
        if (pmtctExitLostToFollowUp == null) pmtctExitLostToFollowUp = 0L;

        Long pmtctExitDead = pmtctEnrollmentRepository.getPmtctExitDead(facilityId);
        if (pmtctExitDead == null) pmtctExitDead = 0L;

        Long pmtctExitDenominator = pmtctEnrollmentRepository.getPmtctExitDenominator(facilityId);
        if (pmtctExitDenominator == null) pmtctExitDenominator = 0L;

        // Mothers LTFU
        Long mothersLTFUNumerator = pmtctEnrollmentRepository.getMothersLTFUNumerator(facilityId);
        if (mothersLTFUNumerator == null) mothersLTFUNumerator = 0L;

        Long mothersLTFUDenominator = pmtctEnrollmentRepository.getMothersLTFUDenominator(facilityId);
        if (mothersLTFUDenominator == null) mothersLTFUDenominator = 0L;

        Double mothersLTFUPercentage = 0.0;
        if (mothersLTFUDenominator > 0) {
            mothersLTFUPercentage = (mothersLTFUNumerator.doubleValue() / mothersLTFUDenominator.doubleValue()) * 100;
            mothersLTFUPercentage = Math.round(mothersLTFUPercentage * 100.0) / 100.0;
        }

        // Deliveries Recorded by quarters
        Long deliveriesQ1 = pmtctEnrollmentRepository.getDeliveriesQ1(facilityId);
        if (deliveriesQ1 == null) deliveriesQ1 = 0L;

        Long deliveriesQ2 = pmtctEnrollmentRepository.getDeliveriesQ2(facilityId);
        if (deliveriesQ2 == null) deliveriesQ2 = 0L;

        Long deliveriesQ3 = pmtctEnrollmentRepository.getDeliveriesQ3(facilityId);
        if (deliveriesQ3 == null) deliveriesQ3 = 0L;

        Long deliveriesQ4 = pmtctEnrollmentRepository.getDeliveriesQ4(facilityId);
        if (deliveriesQ4 == null) deliveriesQ4 = 0L;

        Long deliveriesTotal = pmtctEnrollmentRepository.getDeliveriesTotal(facilityId);
        if (deliveriesTotal == null) deliveriesTotal = 0L;

        // HEI Linked by quarters
        Long heiLinkedQ1 = pmtctEnrollmentRepository.getHEILinkedQ1(facilityId);
        if (heiLinkedQ1 == null) heiLinkedQ1 = 0L;

        Long heiLinkedQ2 = pmtctEnrollmentRepository.getHEILinkedQ2(facilityId);
        if (heiLinkedQ2 == null) heiLinkedQ2 = 0L;

        Long heiLinkedQ3 = pmtctEnrollmentRepository.getHEILinkedQ3(facilityId);
        if (heiLinkedQ3 == null) heiLinkedQ3 = 0L;

        Long heiLinkedQ4 = pmtctEnrollmentRepository.getHEILinkedQ4(facilityId);
        if (heiLinkedQ4 == null) heiLinkedQ4 = 0L;

        Long heiLinkedTotal = pmtctEnrollmentRepository.getHEILinkedTotal(facilityId);
        if (heiLinkedTotal == null) heiLinkedTotal = 0L;

        // Infant Testing Statistics
        Long infantTested = pmtctEnrollmentRepository.getInfantTested(facilityId);
        if (infantTested == null) infantTested = 0L;

        Long infantPositive = pmtctEnrollmentRepository.getInfantPositive(facilityId);
        if (infantPositive == null) infantPositive = 0L;

        Long infantNegative = pmtctEnrollmentRepository.getInfantNegative(facilityId);
        if (infantNegative == null) infantNegative = 0L;

        // PMTCT Exit Tracked - Infants (Infant Outcome at 18 months)
        Long infantExitHivPositive = pmtctEnrollmentRepository.getInfantExitHivPositive(facilityId);
        if (infantExitHivPositive == null) infantExitHivPositive = 0L;

        Long infantExitHivNegative = pmtctEnrollmentRepository.getInfantExitHivNegative(facilityId);
        if (infantExitHivNegative == null) infantExitHivNegative = 0L;

        Long infantExitHivUnknown = pmtctEnrollmentRepository.getInfantExitHivUnknown(facilityId);
        if (infantExitHivUnknown == null) infantExitHivUnknown = 0L;

        Long infantExitDenominator = pmtctEnrollmentRepository.getInfantExitDenominator(facilityId);
        if (infantExitDenominator == null) infantExitDenominator = 0L;

        return PMTCTStatisticsDto.builder()
                .totalPatients(totalPatients)
                .ancPatients(ancPatients)
                .pmtctPatients(pmtctPatients)
                .pmtctViralLoadNumerator(vlNumerator)
                .pmtctViralLoadDenominator(vlDenominator)
                .pmtctViralLoadUptakePercentage(vlPercentage)
                .viralSuppressionNumerator(suppressionNumerator)
                .viralSuppressionDenominator(suppressionDenominator)
                .viralSuppressionPercentage(suppressionPercentage)
                .unsuppressedQ1(unsuppressedQ1)
                .unsuppressedQ2(unsuppressedQ2)
                .unsuppressedQ3(unsuppressedQ3)
                .unsuppressedQ4(unsuppressedQ4)
                .unsuppressedTotal(unsuppressedTotal)
                // PMTCT Exit Tracked
                .pmtctExitActiveInCohort(pmtctExitActiveInCohort)
                .pmtctExitTransferredOut(pmtctExitTransferredOut)
                .pmtctExitTransferredToAnotherPMTCT(pmtctExitTransferredToAnotherPMTCT)
                .pmtctExitTransitionedToART(pmtctExitTransitionedToART)
                .pmtctExitLostToFollowUp(pmtctExitLostToFollowUp)
                .pmtctExitDead(pmtctExitDead)
                .pmtctExitDenominator(pmtctExitDenominator)
                // Mothers LTFU
                .mothersLTFUNumerator(mothersLTFUNumerator)
                .mothersLTFUDenominator(mothersLTFUDenominator)
                .mothersLTFUPercentage(mothersLTFUPercentage)
                // Deliveries Recorded
                .deliveriesQ1(deliveriesQ1)
                .deliveriesQ2(deliveriesQ2)
                .deliveriesQ3(deliveriesQ3)
                .deliveriesQ4(deliveriesQ4)
                .deliveriesTotal(deliveriesTotal)
                // HEI Linked
                .heiLinkedQ1(heiLinkedQ1)
                .heiLinkedQ2(heiLinkedQ2)
                .heiLinkedQ3(heiLinkedQ3)
                .heiLinkedQ4(heiLinkedQ4)
                .heiLinkedTotal(heiLinkedTotal)
                // Infant Testing Statistics
                .infantTested(infantTested)
                .infantPositiveNumerator(infantPositive)
                .infantPositiveDenominator(infantTested)
                .infantNegativeNumerator(infantNegative)
                .infantNegativeDenominator(infantTested)
                // PMTCT Exit Tracked - Infants
                .infantExitHivPositive(infantExitHivPositive)
                .infantExitHivNegative(infantExitHivNegative)
                .infantExitHivUnknown(infantExitHivUnknown)
                .infantExitDenominator(infantExitDenominator)
                .build();
    }
}

