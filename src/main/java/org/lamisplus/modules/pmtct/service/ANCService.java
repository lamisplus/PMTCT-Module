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
import org.lamisplus.modules.pmtct.repository.HtsEncounterProxyRepository;
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

    @Autowired
    private HtsEncounterProxyRepository htsEncounterProxyRepository;

    public ANCRequestDto save(ANCRequestDto ancRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(ancRequestDto.getPatient_uuid(), facilityId, 0);
        if (persons.isPresent()) {
            Person person = persons.get();

            // Check for existing ANC to prevent duplicates
            Optional<ANC> existingAnc = this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(
                    person.getUuid(), ancRequestDto.getPmtctCycleUuid(),false);

            ANC anc;
            boolean isExistingAnc = existingAnc.isPresent();
            if (isExistingAnc) {
                anc = existingAnc.get();
                anc.setLastModifiedBy(user.getUserName());
                anc.setLastModifiedDate(LocalDateTime.now());
            } else {
                anc = new ANC();
                anc.setUuid(UUID.randomUUID().toString());
                anc.setPatientUuid(person.getUuid());
                anc.setArchived(false);
                anc.setFacilityId(person.getFacilityId());
                anc.setCreatedDate(LocalDateTime.now());
                anc.setLastModifiedDate(LocalDateTime.now());
                anc.setCreatedBy(user.getUserName());
                anc.setLastModifiedBy(user.getUserName());
            }

            if (isExistingAnc) {
                // For existing records, only update fields that are NOT null to prevent wiping saved data
                if (ancRequestDto.getAncNo() != null) anc.setAncNo(ancRequestDto.getAncNo());
                if (ancRequestDto.getDateOfEnrollment() != null) anc.setDateOfEnrollment(ancRequestDto.getDateOfEnrollment());
                if (ancRequestDto.getGravida() != null) anc.setGravida(ancRequestDto.getGravida());
                if (ancRequestDto.getParity() != null) anc.setParity(ancRequestDto.getParity());
                if (ancRequestDto.getLMP() != null) anc.setLMP(ancRequestDto.getLMP());
                if (ancRequestDto.getGAWeeks() != null) anc.setGAWeeks(ancRequestDto.getGAWeeks());
                if (ancRequestDto.getSourceOfReferral() != null) anc.setSourceOfReferral(ancRequestDto.getSourceOfReferral());
                if (ancRequestDto.getCommunitySetting() != null) anc.setCommunitySetting(ancRequestDto.getCommunitySetting());
                if (ancRequestDto.getPmtctCycleUuid() != null) anc.setPmtctCycleUuid(ancRequestDto.getPmtctCycleUuid());
                if (ancRequestDto.getVitalSigns() != null) anc.setVitalSigns(ancRequestDto.getVitalSigns());
                if (ancRequestDto.getCounselling() != null) anc.setCounselling(ancRequestDto.getCounselling());
                if (ancRequestDto.getSyphilisInfo() != null) anc.setSyphilisInfo(ancRequestDto.getSyphilisInfo());
                if (ancRequestDto.getHepatitisBInfo() != null) anc.setHepatitisBInfo(ancRequestDto.getHepatitisBInfo());
                if (ancRequestDto.getHepatitisCInfo() != null) anc.setHepatitisCInfo(ancRequestDto.getHepatitisCInfo());
                if (ancRequestDto.getUrinalysis() != null) anc.setUrinalysis(ancRequestDto.getUrinalysis());
                if (ancRequestDto.getLabTest() != null) anc.setLabTest(ancRequestDto.getLabTest());
                if (ancRequestDto.getInterventions() != null) anc.setInterventions(ancRequestDto.getInterventions());
                if (ancRequestDto.getOutcomeOfVisit() != null) anc.setOutcomeOfVisit(ancRequestDto.getOutcomeOfVisit());
                if (ancRequestDto.getReferralReason() != null) anc.setReferralReason(ancRequestDto.getReferralReason());
                if (ancRequestDto.getTransportationOut() != null) anc.setTransportationOut(ancRequestDto.getTransportationOut());
            } else {
                anc.setAncNo(ancRequestDto.getAncNo());
                anc.setDateOfEnrollment(ancRequestDto.getDateOfEnrollment());
                anc.setGravida(ancRequestDto.getGravida());
                anc.setParity(ancRequestDto.getParity());
                anc.setLMP(ancRequestDto.getLMP());
                anc.setGAWeeks(ancRequestDto.getGAWeeks());
                anc.setSourceOfReferral(ancRequestDto.getSourceOfReferral());
                anc.setCommunitySetting(ancRequestDto.getCommunitySetting());
                anc.setPmtctCycleUuid(ancRequestDto.getPmtctCycleUuid());
                anc.setVitalSigns(ancRequestDto.getVitalSigns());
                anc.setCounselling(ancRequestDto.getCounselling());
                anc.setSyphilisInfo(ancRequestDto.getSyphilisInfo());
                anc.setHepatitisBInfo(ancRequestDto.getHepatitisBInfo());
                anc.setHepatitisCInfo(ancRequestDto.getHepatitisCInfo());
                anc.setUrinalysis(ancRequestDto.getUrinalysis());
                anc.setLabTest(ancRequestDto.getLabTest());
                anc.setInterventions(ancRequestDto.getInterventions());
                anc.setOutcomeOfVisit(ancRequestDto.getOutcomeOfVisit());
                anc.setReferralReason(ancRequestDto.getReferralReason());
                anc.setTransportationOut(ancRequestDto.getTransportationOut());
            }
            ancRepository.save(anc);

        } else {

            String patientUuid = this.createPerson(ancRequestDto.getPersonDto());
            if (patientUuid != null) {

                // Check for existing ANC to prevent duplicates
                Optional<ANC> existingAnc = this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(
                        patientUuid, ancRequestDto.getPmtctCycleUuid(),false);

                ANC anc;
                if (existingAnc.isPresent()) {
                    anc = existingAnc.get();
                    anc.setLastModifiedBy(user.getUserName());
                    anc.setLastModifiedDate(LocalDateTime.now());
                } else {
                    anc = new ANC();
                    anc.setUuid(UUID.randomUUID().toString());
                    anc.setArchived(false);
                    anc.setCreatedDate(LocalDateTime.now());
                    anc.setLastModifiedDate(LocalDateTime.now());
                    anc.setCreatedBy(user.getUserName());
                    anc.setLastModifiedBy(user.getUserName());
                    anc.setPatientUuid(patientUuid);
                }

                if (existingAnc.isPresent()) {
                    // For existing records, only update fields that are NOT null to prevent wiping saved data
                    if (ancRequestDto.getAncNo() != null) anc.setAncNo(ancRequestDto.getAncNo());
                    if (ancRequestDto.getDateOfEnrollment() != null) anc.setDateOfEnrollment(ancRequestDto.getDateOfEnrollment());
                    if (ancRequestDto.getGravida() != null) anc.setGravida(ancRequestDto.getGravida());
                    if (ancRequestDto.getParity() != null) anc.setParity(ancRequestDto.getParity());
                    if (ancRequestDto.getLMP() != null) anc.setLMP(ancRequestDto.getLMP());
                    if (ancRequestDto.getGAWeeks() != null) anc.setGAWeeks(ancRequestDto.getGAWeeks());
                    if (ancRequestDto.getPmtctCycleUuid() != null) anc.setPmtctCycleUuid(ancRequestDto.getPmtctCycleUuid());
                    if (ancRequestDto.getVitalSigns() != null) anc.setVitalSigns(ancRequestDto.getVitalSigns());
                    if (ancRequestDto.getCounselling() != null) anc.setCounselling(ancRequestDto.getCounselling());
                    if (ancRequestDto.getSyphilisInfo() != null) anc.setSyphilisInfo(ancRequestDto.getSyphilisInfo());
                    if (ancRequestDto.getHepatitisBInfo() != null) anc.setHepatitisBInfo(ancRequestDto.getHepatitisBInfo());
                    if (ancRequestDto.getHepatitisCInfo() != null) anc.setHepatitisCInfo(ancRequestDto.getHepatitisCInfo());
                    if (ancRequestDto.getUrinalysis() != null) anc.setUrinalysis(ancRequestDto.getUrinalysis());
                    if (ancRequestDto.getLabTest() != null) anc.setLabTest(ancRequestDto.getLabTest());
                    if (ancRequestDto.getInterventions() != null) anc.setInterventions(ancRequestDto.getInterventions());
                    if (ancRequestDto.getOutcomeOfVisit() != null) anc.setOutcomeOfVisit(ancRequestDto.getOutcomeOfVisit());
                    if (ancRequestDto.getReferralReason() != null) anc.setReferralReason(ancRequestDto.getReferralReason());
                    if (ancRequestDto.getTransportationOut() != null) anc.setTransportationOut(ancRequestDto.getTransportationOut());
                } else {
                    anc.setAncNo(ancRequestDto.getAncNo());
                    anc.setDateOfEnrollment(ancRequestDto.getDateOfEnrollment());
                    anc.setGravida(ancRequestDto.getGravida());
                    anc.setParity(ancRequestDto.getParity());
                    anc.setLMP(ancRequestDto.getLMP());
                    anc.setGAWeeks(ancRequestDto.getGAWeeks());
                    anc.setPmtctCycleUuid(ancRequestDto.getPmtctCycleUuid());
                    anc.setVitalSigns(ancRequestDto.getVitalSigns());
                    anc.setCounselling(ancRequestDto.getCounselling());
                    anc.setSyphilisInfo(ancRequestDto.getSyphilisInfo());
                    anc.setHepatitisBInfo(ancRequestDto.getHepatitisBInfo());
                    anc.setHepatitisCInfo(ancRequestDto.getHepatitisCInfo());
                    anc.setUrinalysis(ancRequestDto.getUrinalysis());
                    anc.setLabTest(ancRequestDto.getLabTest());
                    anc.setInterventions(ancRequestDto.getInterventions());
                    anc.setOutcomeOfVisit(ancRequestDto.getOutcomeOfVisit());
                    anc.setReferralReason(ancRequestDto.getReferralReason());
                    anc.setTransportationOut(ancRequestDto.getTransportationOut());
                }
                try {
                    Optional<Person> persons1 = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(patientUuid, facilityId, 0);
                    if (persons1.isPresent()) {
                        Person person = persons1.get();
                        anc.setFacilityId(person.getFacilityId());
                    }
                } catch (Exception e) {
                }
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
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(anc.getPatientUuid(), user.getCurrentOrganisationUnitId(), 0);
            Person person = new Person();
            if (persons.isPresent()) {
                person = persons.get();
            }
            ancRespondDtoList.add(convertANCtoANCRespondDto(anc, person));
        });

        return ancRespondDtoList;

    }

    private ANC getExistAnc(String id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No visit was found with given Id " + id));
    }

    public ANCRequestDto viewANCById(String id) {
        ANC anc = this.ancRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ANC.class, "id", "" + id));
        return entityToDto(anc);
    }

    public void  updateGAFromPMTCT(String patientUuid, Integer GaAge)
    {


        Optional <ANC> ancRecord = this.ancRepository.findANCByPatientUuid(patientUuid);
        if(ancRecord.isPresent())
        {
            ANC AncResult = ancRecord.get();
            AncResult.setGAWeeks(GaAge);

            this.ancRepository.save(AncResult);
        }
    }


    public ANCRequestDto updateAnc(String id, ANCRequestDto ancRequestDto) {
        ANC exist = getExistAnc(id);

        ANC anc = convertDtoToEntity(ancRequestDto);
        anc.setUuid(id);
        anc.setFacilityId(exist.getFacilityId());
        anc.setLastModifiedDate(LocalDateTime.now());
        anc.setLastModifiedBy(exist.getLastModifiedBy());
        anc.setArchived(exist.getArchived());
        anc.setStatus(exist.getStatus());
        anc.setCreatedBy(exist.getCreatedBy());
        anc.setCreatedDate(exist.getCreatedDate());
        anc.setUuid(exist.getUuid());
        anc.setPatientUuid(exist.getPatientUuid());
        anc.setAncSetting(ancRequestDto.getAncSetting());
        anc.setPreviouslyKnownHivStatus(ancRequestDto.getPreviouslyKnownHivStatus());
        anc.setCurrentlyOnArt(ancRequestDto.getCurrentlyOnArt());
        anc.setFacilityEnrolledIn(ancRequestDto.getFacilityEnrolledIn());
        anc.setVitalSigns(ancRequestDto.getVitalSigns());
        anc.setCounselling(ancRequestDto.getCounselling());
        anc.setSyphilisInfo(ancRequestDto.getSyphilisInfo());
        anc.setHepatitisBInfo(ancRequestDto.getHepatitisBInfo());
        anc.setHepatitisCInfo(ancRequestDto.getHepatitisCInfo());
        anc.setUrinalysis(ancRequestDto.getUrinalysis());
        anc.setLabTest(ancRequestDto.getLabTest());
        anc.setInterventions(ancRequestDto.getInterventions());
        anc.setOutcomeOfVisit(ancRequestDto.getOutcomeOfVisit());
        anc.setReferralReason(ancRequestDto.getReferralReason());
        anc.setTransportationOut(ancRequestDto.getTransportationOut());

        //check if the patient is on pmtct page

        System.out.println(exist.getPatientUuid());

        boolean  hasPmtctRecord = pmtctEnrollmentRepository.checkPatientOnPMTCT(exist.getPatientUuid());

//        if(hasPmtctRecord){
//            pmtctEnrollmentRepository.updateLmp(ancRequestDto.getLMP(), exist.getPatientUuid());
//            LocalDate PmtctEnrollmentDate = pmtctEnrollmentRepository.getPmtctEnrollmentDate(exist.getPatientUuid());
//
//            //calculate the GA
//             Long gestationalAge =    ChronoUnit.WEEKS.between(ancRequestDto.getLMP(), PmtctEnrollmentDate);
//            // update the gestational age on the pmtct table
//            pmtctEnrollmentRepository.updateTheGA(gestationalAge, exist.getPatientUuid());


        ancRepository.save(anc);
        return ancRequestDto;
    }


    public ANCRespondDto convertANCtoANCRespondDto(ANC anc, Person person) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        ancRespondDto.setAncNo(anc.getAncNo());
        ancRespondDto.setAncUuid(anc.getUuid());
        ancRespondDto.setDateOfEnrollment(anc.getDateOfEnrollment());
        ancRespondDto.setGravida(anc.getGravida());
        ancRespondDto.setParity(anc.getParity());
        ancRespondDto.setLMP(anc.getLMP());
        ancRespondDto.setGAWeeks(anc.getGAWeeks());
        ancRespondDto.setPartnerInformation(anc.getPartnerInformation());
        ancRespondDto.setSource(anc.getSource());
        ancRespondDto.setVitalSigns(anc.getVitalSigns());
        ancRespondDto.setCounselling(anc.getCounselling());
        ancRespondDto.setSyphilisInfo(anc.getSyphilisInfo());
        ancRespondDto.setHepatitisBInfo(anc.getHepatitisBInfo());
        ancRespondDto.setHepatitisCInfo(anc.getHepatitisCInfo());
        ancRespondDto.setUrinalysis(anc.getUrinalysis());
        ancRespondDto.setLabTest(anc.getLabTest());
        ancRespondDto.setInterventions(anc.getInterventions());
        ancRespondDto.setOutcomeOfVisit(anc.getOutcomeOfVisit());
        ancRespondDto.setReferralReason(anc.getReferralReason());
        ancRespondDto.setTransportationOut(anc.getTransportationOut());

        return ancRespondDto;

    }

    @SneakyThrows
    public ANC getSingleAnc(String id) {
        return this.ancRepository.findById(id)
                .orElseThrow(() -> new Exception("ANC NOT FOUND"));

    }

    @SneakyThrows
    public ANC getAncByPatientUuidAndCycleId(String patientUuid, String pmtctCycleUuid) {
        return this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(patientUuid, pmtctCycleUuid,false)
                .orElse(null);
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
                    Optional<ANC> ancs = ancRepository.findANCByPatientUuid(person.getUuid());
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
            persons = pmtctEnrollmentReporsitory.findFemalePersonBySearchParameters(queryParam, currentOrganisationUnitId, paging);
        } else {
            // Integer rec = ancRepository.getTotalAnc();
            //if (rec >= 1) {
            System.out.println("mycurrentOrganisationUnitId " + currentOrganisationUnitId);
            persons = pmtctEnrollmentReporsitory.findFemalePerson(currentOrganisationUnitId, paging);
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
            persons = ancRepository.getActiveOnANC(currentOrganisationUnitId, paging);
        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            //System.out.println("I got here Doc");
            persons = ancRepository.getActiveOnANCBySearchParameters(queryParam, currentOrganisationUnitId, paging);
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
            persons = pmtctEnrollmentReporsitory.getActiveOnPMTCT(currentOrganisationUnitId, paging);
        } else {
            searchValue = searchValue.replaceAll("\\s", "");
            searchValue = searchValue.replaceAll(",", "");
            String queryParam = "%" + searchValue + "%";
            persons = pmtctEnrollmentReporsitory.getActiveOnPMTCTBySearchParameters(queryParam, currentOrganisationUnitId, paging);
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
                Optional<ANC> ancs = ancRepository.findANCByPatientUuidAndArchived(person.getUuid(),false);
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

    public String myRecentAncNo(String patientUuid) {
        String ancNo = "";
        Optional<ANC> ancs = ancRepository.findANCByPatientUuidAndArchived(patientUuid,false);
        if (ancs.isPresent()) {
            ancNo = ancs.get().getAncNo();
        } else {
            ancNo = "";
        }
        return ancNo;
    }

    public boolean activeOnANC(String patientUuid) {
        boolean ancNo = false;
        Optional<ANC> ancs = ancRepository.findANCByPatientUuidAndArchived(patientUuid,false);
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
            if (anc.getArchived() == false) {
                Optional<User> currentUser = userService.getUserWithRoles();
                Long facilityId = 0L;
                if (currentUser.isPresent()) {
                    User user = currentUser.get();
                    facilityId = user.getCurrentOrganisationUnitId();
                }
                Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(anc.getPatientUuid(), facilityId, 0);
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
            if (anc.getArchived() != false) {
                Optional<User> currentUser = userService.getUserWithRoles();
                Long facilityId = 0L;
                if (currentUser.isPresent()) {
                    User user = currentUser.get();
                    facilityId = user.getCurrentOrganisationUnitId();
                }
                Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(anc.getPatientUuid(), facilityId, 0);
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
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(ancEnrollementRequestDto.getPatient_uuid(), user.getCurrentOrganisationUnitId(), 0);
        Person person = new Person();
        ANC anc;
        if (persons.isPresent()) {
            person = persons.get();

            // Check for existing ANC to prevent duplicates
            Optional<ANC> existingAnc = this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(
                    person.getUuid(), ancEnrollementRequestDto.getPmtctCycleUuid(),false);

            if (existingAnc.isPresent()) {
                anc = existingAnc.get();
                anc.setLastModifiedBy(user.getUserName());
                anc.setLastModifiedDate(LocalDateTime.now());
            } else {
                anc = new ANC();
                anc.setCreatedBy(user.getUserName());
                anc.setLastModifiedBy(user.getUserName());
                anc.setCreatedDate(LocalDateTime.now());
                anc.setLastModifiedDate(LocalDateTime.now());
                anc.setUuid(UUID.randomUUID().toString());
                anc.setPatientUuid(person.getUuid());
                anc.setArchived(false);
                anc.setFacilityId(person.getFacilityId());
                anc.setStatus("NV");
                anc.setSource(ancEnrollementRequestDto.getSource());
            }

            anc.setAncNo(ancEnrollementRequestDto.getAncNo());
            anc.setDateOfEnrollment(ancEnrollementRequestDto.getDateOfEnrollment());
            anc.setGravida(ancEnrollementRequestDto.getGravida());
            anc.setParity(ancEnrollementRequestDto.getParity());
            anc.setLMP(ancEnrollementRequestDto.getLMP());
            anc.setGAWeeks(ancEnrollementRequestDto.getGAWeeks());
            anc.setAncAttendance(ancEnrollementRequestDto.getAncAttendance());
            anc.setReferredFromSpokesSite(ancEnrollementRequestDto.getReferredFromSpokesSite());
            anc.setPmtctCycleUuid(ancEnrollementRequestDto.getPmtctCycleUuid());
            anc.setVitalSigns(ancEnrollementRequestDto.getVitalSigns());
            anc.setCounselling(ancEnrollementRequestDto.getCounselling());
            anc.setSyphilisInfo(ancEnrollementRequestDto.getSyphilisInfo());
            anc.setHepatitisBInfo(ancEnrollementRequestDto.getHepatitisBInfo());
            anc.setHepatitisCInfo(ancEnrollementRequestDto.getHepatitisCInfo());
            anc.setUrinalysis(ancEnrollementRequestDto.getUrinalysis());
            anc.setLabTest(ancEnrollementRequestDto.getLabTest());
            anc.setInterventions(ancEnrollementRequestDto.getInterventions());
            anc.setOutcomeOfVisit(ancEnrollementRequestDto.getOutcomeOfVisit());
            anc.setReferralReason(ancEnrollementRequestDto.getReferralReason());
            anc.setTransportationOut(ancEnrollementRequestDto.getTransportationOut());
        } else {
            anc = new ANC();
        }

        ANC savedAnc = ancRepository.save(anc);

        // Update pregnancy cycle status to ACTIVE
        if (ancEnrollementRequestDto.getPmtctCycleUuid() != null) {
            pmtctPregnancyCycleService.updatePmtctStatusToActive(ancEnrollementRequestDto.getPmtctCycleUuid());
        }

        return getANCRespondDtoFromPersonAndAnc(person, savedAnc);
    }

    public ANCRespondDto getANCRespondDtoFromPersonAndAnc(Person persons, ANC anc) {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        ancRespondDto.setAncUuid(anc.getUuid());
        ancRespondDto.setAncNo(anc.getAncNo());
        ancRespondDto.setFullname(this.getFullName(persons.getFirstName(), persons.getOtherName(), persons.getSurname()));
        ancRespondDto.setAncUuid(anc.getUuid());
        ancRespondDto.setAge(this.calculateAge(persons.getDateOfBirth()));
        ancRespondDto.setAddress(persons.getAddress());
        ancRespondDto.setPersonId(persons.getId());
        ancRespondDto.setSex(persons.getSex());
        ancRespondDto.setContactPoint(persons.getContactPoint());
        ancRespondDto.setDateOfEnrollment(anc.getDateOfEnrollment());
        ancRespondDto.setGravida(anc.getGravida());
        ancRespondDto.setParity(anc.getParity());
        ancRespondDto.setLMP(anc.getLMP());
        ancRespondDto.setGAWeeks(anc.getGAWeeks());
        ancRespondDto.setAncSetting(anc.getAncSetting());
        ancRespondDto.setCommunitySetting(anc.getCommunitySetting());
        ancRespondDto.setAncAttendance(anc.getAncAttendance());
        ancRespondDto.setReferredFromSpokesSite(anc.getReferredFromSpokesSite());
        ancRespondDto.setPatient_uuid(persons.getUuid());
        ancRespondDto.setStaticHivStatus(anc.getStaticHivStatus());
        ancRespondDto.setPreviouslyKnownHivStatus(anc.getPreviouslyKnownHivStatus());
        ancRespondDto.setSource(anc.getSource());
        ancRespondDto.setVitalSigns(anc.getVitalSigns());
        ancRespondDto.setCounselling(anc.getCounselling());
        ancRespondDto.setSyphilisInfo(anc.getSyphilisInfo());
        ancRespondDto.setHepatitisBInfo(anc.getHepatitisBInfo());
        ancRespondDto.setHepatitisCInfo(anc.getHepatitisCInfo());
        ancRespondDto.setUrinalysis(anc.getUrinalysis());
        ancRespondDto.setLabTest(anc.getLabTest());
        ancRespondDto.setInterventions(anc.getInterventions());
        ancRespondDto.setOutcomeOfVisit(anc.getOutcomeOfVisit());
        ancRespondDto.setReferralReason(anc.getReferralReason());
        ancRespondDto.setTransportationOut(anc.getTransportationOut());
        return ancRespondDto;
    }

    public ANCRespondDto newANCRegistration(ANCWithPersonRequestDto ancWithPersonRequestDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        String patientUuid = createPerson(ancWithPersonRequestDto.getPersonDto());
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(patientUuid, user.getCurrentOrganisationUnitId(), 0);
        Person person = new Person();

        ANC anc = new ANC();
        if (persons.isPresent()) {
            person = persons.get();

            anc.setAncNo(ancWithPersonRequestDto.getAncNo());
            anc.setDateOfEnrollment(ancWithPersonRequestDto.getDateOfEnrollment());
            anc.setGravida(ancWithPersonRequestDto.getGravida());
            anc.setParity(ancWithPersonRequestDto.getParity());
            anc.setLMP(ancWithPersonRequestDto.getLMP());
            anc.setGAWeeks(ancWithPersonRequestDto.getGAWeeks());
            anc.setCreatedBy(user.getUserName());
            anc.setLastModifiedBy(user.getUserName());
            anc.setCreatedDate(LocalDateTime.now());
            anc.setLastModifiedDate(LocalDateTime.now());
            anc.setUuid(UUID.randomUUID().toString());
            anc.setPatientUuid(person.getUuid());
            anc.setStaticHivStatus(ancWithPersonRequestDto.getStaticHivStatus());
            anc.setArchived(false);
            anc.setFacilityId(person.getFacilityId());
            anc.setAncSetting(ancWithPersonRequestDto.getAncSetting());
            anc.setStatus("NV");
            anc.setPreviouslyKnownHivStatus(ancWithPersonRequestDto.getPreviouslyKnownHivStatus());
            anc.setCurrentlyOnArt(ancWithPersonRequestDto.getCurrentlyOnArt());
            anc.setFacilityEnrolledIn(ancWithPersonRequestDto.getFacilityEnrolledIn());
            anc.setCommunitySetting(ancWithPersonRequestDto.getCommunitySetting());
            anc.setSource(ancWithPersonRequestDto.getSource());
            anc.setStaticHivStatus(ancWithPersonRequestDto.getStaticHivStatus());
            anc.setSourceOfReferral(ancWithPersonRequestDto.getSourceOfReferral());
            anc.setVitalSigns(ancWithPersonRequestDto.getVitalSigns());
            anc.setCounselling(ancWithPersonRequestDto.getCounselling());
            anc.setSyphilisInfo(ancWithPersonRequestDto.getSyphilisInfo());
            anc.setHepatitisBInfo(ancWithPersonRequestDto.getHepatitisBInfo());
            anc.setHepatitisCInfo(ancWithPersonRequestDto.getHepatitisCInfo());
            anc.setUrinalysis(ancWithPersonRequestDto.getUrinalysis());
            anc.setLabTest(ancWithPersonRequestDto.getLabTest());
            anc.setInterventions(ancWithPersonRequestDto.getInterventions());
            anc.setOutcomeOfVisit(ancWithPersonRequestDto.getOutcomeOfVisit());
            anc.setReferralReason(ancWithPersonRequestDto.getReferralReason());
            anc.setTransportationOut(ancWithPersonRequestDto.getTransportationOut());

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
        pmtctWithPersonRespondDto.setPatient_uuid(person.getPatientUuid());
        pmtctWithPersonRespondDto.setId(person.getId());
        pmtctWithPersonRespondDto.setUuid(person.getUuid());
        pmtctWithPersonRespondDto.setAddress(parseJsonString(person.getAddress()));
        pmtctWithPersonRespondDto.setContactPoint(parseJsonString(person.getContactPoint()));
        pmtctWithPersonRespondDto.setHospitalNumber(person.getHospitalNumber());
        pmtctWithPersonRespondDto.setPregnancyCount(person.getPregnancyCount());

        // Get latest pregnancy cycle ID and use it to fetch enrollment data
        Optional<PmtctPregnancyCycle> latestCycle = pmtctPregnancyCycleRepository.findLatestByPatientUuid(person.getPatientUuid());

        if (latestCycle.isPresent()) {
            String cycleUuid = latestCycle.get().getUuid();
            pmtctWithPersonRespondDto.setPmtctCycleUuid(cycleUuid);

            // Use cycle UUID to get enrollment data for the latest pregnancy cycle
            try {
                Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(cycleUuid,false);

                if (enrollment.isPresent()) {
                    PMTCTEnrollment enrollmentData = enrollment.get();
                    // Set all enrollment-related data from the latest cycle enrollment
                    pmtctWithPersonRespondDto.setPmtctEnrollmentDate(enrollmentData.getPmtctEnrollmentDate());
                    pmtctWithPersonRespondDto.setArtStartDate(enrollmentData.getArtStartDate());
                    pmtctWithPersonRespondDto.setArtStartTime(enrollmentData.getArtStartTime());
                    pmtctWithPersonRespondDto.setEntryPoint(enrollmentData.getEntryPoint());
                    pmtctWithPersonRespondDto.setTbStatus(enrollmentData.getTbStatus());
                    pmtctWithPersonRespondDto.setPmtctRegStatus(true);
                    pmtctWithPersonRespondDto.setHivStatus(enrollmentData.getHivStatus());

                    // Get ANC data for the latest cycle — source ancNo from ANC (authoritative source)
                    Optional<ANC> ancs = ancRepository.findANCByPatientUuidAndCycleIdAndArchived(person.getPatientUuid(), cycleUuid,false);
                    if(ancs.isPresent()) {
                        ANC anc = ancs.get();
                        pmtctWithPersonRespondDto.setAncNo(anc.getAncNo());
                        pmtctWithPersonRespondDto.setGravida(anc.getGravida());
                        pmtctWithPersonRespondDto.setGAWeeks(anc.getGAWeeks());
                    }
                } else {
                    // No enrollment found for the latest cycle
                    pmtctWithPersonRespondDto.setPmtctRegStatus(false);
                }
            } catch (Exception e) {
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
        ancRespondDto.setFullname(this.getFullName(person.getFirstName(), person.getOtherName(), person.getSurname()));
        ancRespondDto.setHospitalNumber(person.getHospitalNumber());
        ancRespondDto.setPatient_uuid(person.getPatientUuid());
        ancRespondDto.setPersonId(person.getPersonId());
        ancRespondDto.setAddress(parseJsonString(person.getAddress()));
        ancRespondDto.setContactPoint(parseJsonString(person.getContactPoint()));
        ancRespondDto.setSex(person.getSex());
        ancRespondDto.setDateOfBirth(person.getDateOfBirth());
        ancRespondDto.setAge(this.calculateAge(person.getDateOfBirth()));
        ancRespondDto.setPregnancyCount(person.getPregnancyCount());

        // Set ANC-specific fields directly from the query result (latest ANC record for latest pmtctCycleUuid)
        ancRespondDto.setId(person.getPersonId());
        ancRespondDto.setAncNo(person.getAncNo());
        ancRespondDto.setAncUuid(person.getAncUuid());
        ancRespondDto.setAncSetting(person.getAncSetting());
        ancRespondDto.setCommunitySetting(person.getCommunitySetting());
        ancRespondDto.setCurrentlyOnArt(person.getCurrentlyOnArt());
        ancRespondDto.setDateOfEnrollment(person.getDateOfEnrollment());
        ancRespondDto.setGAWeeks(person.getGaweeks());
        ancRespondDto.setGravida(person.getGravida());
        ancRespondDto.setLMP(person.getLmp());
        ancRespondDto.setParity(person.getParity());
        ancRespondDto.setPreviouslyKnownHivStatus(person.getPreviouslyKnownHivStatus());
        ancRespondDto.setReferredSyphilisTreatment(person.getReferredSyphilisTreatment());
        ancRespondDto.setStaticHivStatus(person.getStaticHivStatus());
        ancRespondDto.setArtStartDate(person.getArtStartDate());

        // Set pmtctCycleUuid from the query result
        String pmtctCycleUuid = person.getPmtctCycleUuid();
        ancRespondDto.setPmtctCycleUuid(pmtctCycleUuid);

        // Check if person has a valid pmtctCycleUuid (means they have an active ANC enrollment)
        if (pmtctCycleUuid != null) {
            try {
                // Get enrollment data for additional fields not in the ANC query
                Optional<PMTCTEnrollment> enrollment = pmtctEnrollmentReporsitory.findByPmtctCycleIdAndArchived(pmtctCycleUuid,false);

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
                        Optional<Delivery> deliveryOpt = this.deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(person.getPatientUuid(), pmtctCycleUuid);
                        deliveryStatus = deliveryOpt.isPresent();
                    } catch (Exception e) { }
                    ancRespondDto.setDeliveryStatus(deliveryStatus);

                    // Get PMTCT enrollment details for the latest cycle
                    try {
                        PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto = this.pmtctEnrollmentService.getSinglePmtctEnrollmentByPatientUuid(person.getPatientUuid());
                        ancRespondDto.setPmtctEnrollmentRespondDto(pmtctEnrollmentRespondDto);
                    } catch (Exception e) { }
                } else {
                    // No enrollment found for the latest cycle
                    ancRespondDto.setPmtctRegStatus(false);
                }
            } catch (Exception e) {
                ancRespondDto.setPmtctRegStatus(false);
            }

            // Get dynamic HIV status
            String dynamicHivStatus = "Unknown";
            try {
                dynamicHivStatus = this.getDynamicHivStatus(person.getPatientUuid());
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
        // Resolve ancNo to patientUuid via ANC, then check enrollment by patientUuid
        Optional<ANC> ancOpt = ancRepository.getByAncNo(ancNo);
        if (ancOpt.isPresent()) {
            return activeOnPMTCTByPatientUuid(ancOpt.get().getPatientUuid());
        }
        return false;
    }

//    public boolean activeOnPMTCTByPatientUuid(String patientUuid) {
//        boolean active = false;
//        Optional<PMTCTEnrollment> pmtctEnrollment = pmtctEnrollmentReporsitory.getByPatientUuid(patientUuid);//.findANCByPatientUuidAndArchived(patientUuid,false);
//        if (pmtctEnrollment.isPresent()) {
//            active = true;
//        } else {
//            active = false;
//        }
//        return active;
//    }

    public boolean activeOnPMTCTByPatientUuid(String patientUuid) {
        List<PMTCTEnrollment> pmtctEnrollments = pmtctEnrollmentReporsitory.getAllByPatientUuid(patientUuid);
        return pmtctEnrollments.stream().findFirst().isPresent();
    }

    private ANC getExistingANC(String id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ANC.class, "id", "" + id));
    }

    public void graduateFromANC(ANC anc, String visitStatus) {
        ANC existingAnc = this.getExistingANC(anc.getId());
        existingAnc.setDateOfEnrollment(anc.getDateOfEnrollment());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setSourceOfReferral(anc.getSourceOfReferral());
        existingAnc.setCommunitySetting(anc.getCommunitySetting());
        existingAnc.setPatientUuid(anc.getPatientUuid());
        // existingAnc.setArchived(true); // Removed: This was auto-archiving ANC records when graduating
        existingAnc.setStatus(visitStatus);
        existingAnc.setStaticHivStatus(anc.getStaticHivStatus());

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
        existingAnc.setDateOfEnrollment(anc.getDateOfEnrollment());
        existingAnc.setGravida(anc.getGravida());
        existingAnc.setParity(anc.getParity());
        existingAnc.setLMP(anc.getLMP());
        existingAnc.setGAWeeks(anc.getGAWeeks());
        existingAnc.setSourceOfReferral(anc.getSourceOfReferral());
        existingAnc.setCommunitySetting(anc.getCommunitySetting());
        existingAnc.setPatientUuid(anc.getPatientUuid());
        existingAnc.setArchived(false);
        existingAnc.setStatus(visitStatus);
        existingAnc.setPreviouslyKnownHivStatus(anc.getPreviouslyKnownHivStatus());
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

    /**
     * Gets existing partners as an ArrayNode. Handles backward compatibility
     * where partnerInformation may be a single object or null.
     */
    private ArrayNode getPartnersArray(ANC anc) {
        ArrayNode partnersArray = mapper.createArrayNode();
        JsonNode existing = anc.getPartnerInformation();
        if (existing != null && !existing.isNull()) {
            if (existing.isArray()) {
                partnersArray = (ArrayNode) existing;
            } else if (existing.isObject()) {
                // backward compat: single object → wrap in array
                partnersArray.add(existing);
            }
        }
        return partnersArray;
    }

    public PartnerInformation addPartnerToAnc(String ancId, PartnerInformation partnerInformation) {
        ANC anc = this.getExistingANC(ancId);
        ArrayNode partnersArray = getPartnersArray(anc);
        // Assign a unique partnerId
        partnerInformation.setPartnerId(java.util.UUID.randomUUID().toString());
        JsonNode newPartner = mapper.valueToTree(partnerInformation);
        partnersArray.add(newPartner);
        anc.setPartnerInformation(partnersArray);
        ancRepository.save(anc);
        return partnerInformation;
    }

    public PartnerInformation updatePartnerInAnc(String ancId, String partnerId, PartnerInformation partnerInformation) {
        ANC anc = this.getExistingANC(ancId);
        ArrayNode partnersArray = getPartnersArray(anc);
        int index = findPartnerIndex(partnersArray, partnerId);
        if (index == -1) {
            throw new EntityNotFoundException(PartnerInformation.class, "partnerId", partnerId);
        }
        partnerInformation.setPartnerId(partnerId);
        JsonNode updatedPartner = mapper.valueToTree(partnerInformation);
        partnersArray.set(index, updatedPartner);
        anc.setPartnerInformation(partnersArray);
        ancRepository.save(anc);
        return partnerInformation;
    }

    private int findPartnerIndex(ArrayNode partnersArray, String partnerId) {
        for (int i = 0; i < partnersArray.size(); i++) {
            JsonNode node = partnersArray.get(i);
            if (node.has("partnerId") && partnerId.equals(node.get("partnerId").asText())) {
                return i;
            }
        }
        return -1;
    }

    public PartnerInformation updateAncWithPartnerInfo(String id, PartnerInformation partnerInformation) {
        // kept for backward compat - delegates to addPartnerToAnc
        return addPartnerToAnc(id, partnerInformation);
    }

    public boolean isFemaleAndOnArt(String patientUuid) {
        try {
            return ancRepository.isFemaleAndOnArt(patientUuid);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isFemaleAndHtsPositive(String patientUuid) {
        try {
            return ancRepository.isFemaleAndHtsPositive(patientUuid);
        } catch (Exception e) {
            return false;
        }
    }

    String getDynamicHivStatus(String patientUuid) {
        List<String> allStatuses = new ArrayList<>();

        // 1. Check hiv_enrollment table - if exists, patient is positive
        Optional<String> hivEnrollmentUuid = ancRepository.findInHivEnrollmentByUuid(patientUuid);
        if (hivEnrollmentUuid.isPresent()) {
            allStatuses.add("Positive");
        }

        // 2. Check hts_client table for hiv_test_result
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            if (currentUser.isPresent()) {
                Optional<HtsClientProjection> htsOptional = ancRepository
                        .getHtsRecordByPersonsUuidAAndFacilityId(patientUuid, currentUser.get()
                                .getCurrentOrganisationUnitId());
                if (htsOptional.isPresent() && htsOptional.get().getHivTestResult() != null) {
                    allStatuses.add(htsOptional.get().getHivTestResult());
                }
            }
        } catch (Exception e) { }

        // 3. Check pmtct_anc table for static_hiv_status
        try {
            Optional<String> ancStaticHivStatus = ancRepository.findStaticHivStatusByPatientUuid(patientUuid);
            if (ancStaticHivStatus.isPresent() && ancStaticHivStatus.get() != null) {
                allStatuses.add(ancStaticHivStatus.get());
            }
        } catch (Exception e) { }

        // 4. Check pmtct_enrollment table for hiv_status
        try {
            Optional<String> pmtctEnrollmentHivStatus = pmtctEnrollmentRepository.findHivStatusByPatientUuid(patientUuid);
            if (pmtctEnrollmentHivStatus.isPresent() && pmtctEnrollmentHivStatus.get() != null) {
                allStatuses.add(pmtctEnrollmentHivStatus.get());
            }
        } catch (Exception e) { }

        // 5. Check hts_encounter table for PMTCT HTS records
        try {
            Optional<String> newHtsResult = htsEncounterProxyRepository.findLatestFinalResult(patientUuid);
            if (newHtsResult.isPresent() && newHtsResult.get() != null) {
                allStatuses.add(newHtsResult.get());
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

    /**
     * Returns the latest HTS client record with both result and date for a given patient.
     * Used by the frontend to compare HTS encounter date with ANC enrollment date.
     */
    public java.util.Map<String, Object> getHtsStatusWithDate(String patientUuid) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("result", "");
        result.put("dateVisit", null);

        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            if (currentUser.isPresent()) {
                // Check hts_encounter table first (PMTCT HTS records)
                Optional<HtsEncounterProxy> encounterOptional = htsEncounterProxyRepository
                        .findLatestByPatientUuid(patientUuid);
                if (encounterOptional.isPresent()) {
                    HtsEncounterProxy encounter = encounterOptional.get();
                    JsonNode obs = encounter.getObservation();
                    String hivResult = "";
                    if (obs != null) {
                        // Use finalHivTestResult, falling back to confirmatoryHivTest
                        if (obs.has("finalHivTestResult") && !obs.get("finalHivTestResult").asText("").isEmpty()) {
                            hivResult = obs.get("finalHivTestResult").asText("");
                        } else if (obs.has("confirmatoryHivTest")) {
                            hivResult = obs.get("confirmatoryHivTest").asText("");
                        }
                    }
                    result.put("result", hivResult);
                    result.put("dateVisit", encounter.getDateOfVisit());
                } else {
                    // Fallback: check hts_client table (HTS module records)
                    Optional<HtsClientProjection> htsOptional = ancRepository
                            .getHtsRecordByPersonsUuidAAndFacilityId(patientUuid, currentUser.get()
                                    .getCurrentOrganisationUnitId());
                    if (htsOptional.isPresent()) {
                        HtsClientProjection hts = htsOptional.get();
                        result.put("result", hts.getHivTestResult() != null ? hts.getHivTestResult() : "");
                        result.put("dateVisit", hts.getDateVisit());
                    }
                }
            }
        } catch (Exception e) {
            // Silently fail - best effort
        }

        return result;
    }

    boolean getDeliveryStatus(String ancNo) {
        // Resolve ancNo to patientUuid via ANC, then check delivery by patientUuid
        Optional<ANC> ancOpt = ancRepository.getByAncNo(ancNo);
        if (ancOpt.isPresent()) {
            try {
                Optional<Delivery> delivery = this.deliveryRepository.findDeliveryByPatientUuid(ancOpt.get().getPatientUuid());
                return delivery.isPresent();
            } catch (Exception e) {}
        }
        return false;
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

    public LocalDate getLMPFromPMTCT(String patientUuid, String pmtctCycleUuid) {
        // Try PMTCT enrollment first
        Optional<PMTCTEnrollment> pmtct = this.pmtctEnrollmentReporsitory.getByPatientUuidAndPmtctCycleId(patientUuid, pmtctCycleUuid);
        if(pmtct.isPresent() && pmtct.get().getLmp() != null) {
            return pmtct.get().getLmp();
        }

        // Fallback: check ANC record for this cycle
        Optional<ANC> anc = this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(patientUuid, pmtctCycleUuid,false);
        if(anc.isPresent() && anc.get().getLMP() != null) {
            return anc.get().getLMP();
        }

        // No LMP found — return null so callers can handle gracefully
        return null;
    }

    public int calculateGA2(String hospitalNumber, LocalDate visitDate) {
        LocalDate dob = getDOB(hospitalNumber);
        int ga = (int) ChronoUnit.MONTHS.between(dob, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }

    public LocalDate getDOB(String hospitalNumber) {
        LocalDate DOB = LocalDate.now();
        Optional<Infant> infants = this.infantRepository.findInfantByInfantHospitalNumber(hospitalNumber);
        if (infants.isPresent())
            DOB = infants.get().getDateOfDelivery();
        return DOB;
    }
//
//    public ANCRespondDto getANCDetailsByANCNo(String ancNo){
//        Optional<ANC> anc = ancRepository.getByAncNo(ancNo);
//        ANCRespondDto ancRespondDto = new ANCRespondDto()
//        if(anc.isPresent()){
//            String puuid = anc.get().getPatientUuid();
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

    public void deleteANC(String id) {
        ANC existingANC = this.getSingleAnc(id);
        existingANC.setArchived(true);
        ancRepository.save(existingANC);
    }

    public void deletePartnerFromAnc(String ancId, String partnerId) {
        ANC anc = this.getExistingANC(ancId);
        ArrayNode partnersArray = getPartnersArray(anc);
        int index = findPartnerIndex(partnersArray, partnerId);
        if (index == -1) {
            throw new EntityNotFoundException(PartnerInformation.class, "partnerId", partnerId);
        }
        partnersArray.remove(index);
        anc.setPartnerInformation(partnersArray);
        ancRepository.save(anc);
    }

    public void deletePartnerInfo(String id) {
        // kept for backward compat - deletes all partners
        ANC anc = this.getExistingANC(id);
        anc.setPartnerInformation(mapper.createArrayNode());
        ancRepository.save(anc);
    }

    public int calculateGaFromPmtct(String patientUuid, LocalDate visitDate, String pmtctCycleUuid) {
        LocalDate lmp = getLMPFromPMTCT(patientUuid, pmtctCycleUuid);
        if (lmp == null) return 0;
        int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
        if (ga < 0) ga = 0;
        return ga;
    }

    public boolean isInfantRisk(String patientUuid, String pmtctCycleUuid) {
        List<InfantPCRAlert> highRiskInfants = getHighRiskInfantDetails(patientUuid, pmtctCycleUuid);
        return !highRiskInfants.isEmpty();
    }

    public List<InfantPCRAlert> getHighRiskInfantDetails(String patientUuid, String pmtctCycleUuid) {
        List<InfantPCRAlert> highRiskInfants = new ArrayList<>();

        // Validate pmtctCycleUuid
        if (pmtctCycleUuid == null) {
            return highRiskInfants;
        }

        // Get all infants for this mother and cycle
        List<Infant> infants = infantRepository.getAllInfantByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);

        if (infants == null || infants.isEmpty()) {
            return highRiskInfants;
        }

        // Check high-risk criteria
        List<String> highRiskReasons = new ArrayList<>();

        // Mother enrolled on ART after 36 weeks gestation or postpartum or at L&D
        String motherTimeOfART = pmtctEnrollmentRepository.getMotherARTInitial(patientUuid, pmtctCycleUuid);
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
        String rupOfMembrane = pmtctEnrollmentRepository.checkRuptureMembraneAt4hrs(patientUuid, pmtctCycleUuid);
        if (rupOfMembrane != null && "ROM_DELIVERY_INTERVAL_<4HRS".equals(rupOfMembrane)) {
            highRiskReasons.add("Rupture of Membrane < 4 hours before delivery");
        }

        // NVP + AZT selected as ARV prophylaxis for infant
        String nvpAndAZT = pmtctEnrollmentRepository.getNVPandAZT(patientUuid, pmtctCycleUuid);
        if (nvpAndAZT != null && "INFANT_ARV_PROPHYLAXIS_TYPE_NVP_+_AZT_".equals(nvpAndAZT)) {
            highRiskReasons.add("NVP+AZT selected as ARV prophylaxis");
        }

        // If there are high-risk reasons, add all infants to the list
        if (!highRiskReasons.isEmpty()) {
            for (Infant infant : infants) {
                InfantPCRAlert alert = new InfantPCRAlert();
                alert.setInfantHospitalNo(infant.getInfantHospitalNumber());
                alert.setDeliveryDate(infant.getDateOfDelivery());

                // Build alert message from reasons
                String alertMessage = String.join(", ", highRiskReasons);
                alert.setAlertMessage(alertMessage);

                highRiskInfants.add(alert);
            }
        }

        return highRiskInfants;
    }

    public ANCEnrollmentCheckDto checkANCEnrollmentByPatientUuid(String patientUuid, String pmtctCycleUuid) {
        ANCEnrollmentCheckDto response = new ANCEnrollmentCheckDto();

        // Get the ANC record for this patient and cycle
        Optional<ANC> ancOptional = ancRepository.findANCByPatientUuidAndCycleIdAndArchived(patientUuid, pmtctCycleUuid,false);

        if (ancOptional.isPresent()) {
            ANC anc = ancOptional.get();
            response.setHasAncEnrollment(true);
            response.setDateOfEnrollment(anc.getDateOfEnrollment());
            response.setLmp(anc.getLMP());
            response.setAncNo(anc.getAncNo());
        } else {
            response.setHasAncEnrollment(false);
            response.setDateOfEnrollment(null);
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

        // Key PMTCT Indicators - Pregnancy Cycles
        Long totalPregnancyCycles = pmtctEnrollmentRepository.getTotalPregnancyCycles(facilityId);
        if (totalPregnancyCycles == null) totalPregnancyCycles = 0L;

        Long activePregnancyCycles = pmtctEnrollmentRepository.getActivePregnancyCycles(facilityId);
        if (activePregnancyCycles == null) activePregnancyCycles = 0L;

        Long closedPregnancyCycles = pmtctEnrollmentRepository.getClosedPregnancyCycles(facilityId);
        if (closedPregnancyCycles == null) closedPregnancyCycles = 0L;

        // Key PMTCT Indicators - Visits
        Long totalANCVisits = pmtctEnrollmentRepository.getTotalANCVisits(facilityId);
        if (totalANCVisits == null) totalANCVisits = 0L;

        Long totalMotherVisits = pmtctEnrollmentRepository.getTotalMotherVisits(facilityId);
        if (totalMotherVisits == null) totalMotherVisits = 0L;

        // Infant Information Summary
        Long totalInfantsRegistered = pmtctEnrollmentRepository.getTotalInfantsRegistered(facilityId);
        if (totalInfantsRegistered == null) totalInfantsRegistered = 0L;

        Long infantsAlive = pmtctEnrollmentRepository.getInfantsAlive(facilityId);
        if (infantsAlive == null) infantsAlive = 0L;

        Long infantsOnARV = pmtctEnrollmentRepository.getInfantsOnARV(facilityId);
        if (infantsOnARV == null) infantsOnARV = 0L;

        Long infantsWithPCRTest = pmtctEnrollmentRepository.getInfantsWithPCRTest(facilityId);
        if (infantsWithPCRTest == null) infantsWithPCRTest = 0L;

        Long infantsPCRPositive = pmtctEnrollmentRepository.getInfantsPCRPositive(facilityId);
        if (infantsPCRPositive == null) infantsPCRPositive = 0L;

        Long infantsPCRNegative = pmtctEnrollmentRepository.getInfantsPCRNegative(facilityId);
        if (infantsPCRNegative == null) infantsPCRNegative = 0L;

        Long infantsWithRapidTest = pmtctEnrollmentRepository.getInfantsWithRapidTest(facilityId);
        if (infantsWithRapidTest == null) infantsWithRapidTest = 0L;

        Long infantsDeceased = pmtctEnrollmentRepository.getInfantsDeceased(facilityId);
        if (infantsDeceased == null) infantsDeceased = 0L;

        return PMTCTStatisticsDto.builder()
                .totalPatients(totalPatients)
                .ancPatients(ancPatients)
                .pmtctPatients(pmtctPatients)
                // Key PMTCT Indicators
                .totalPregnancyCycles(totalPregnancyCycles)
                .activePregnancyCycles(activePregnancyCycles)
                .closedPregnancyCycles(closedPregnancyCycles)
                .totalANCVisits(totalANCVisits)
                .totalMotherVisits(totalMotherVisits)
                // Infant Information Summary
                .totalInfantsRegistered(totalInfantsRegistered)
                .infantsAlive(infantsAlive)
                .infantsOnARV(infantsOnARV)
                .infantsWithPCRTest(infantsWithPCRTest)
                .infantsPCRPositive(infantsPCRPositive)
                .infantsPCRNegative(infantsPCRNegative)
                .infantsWithRapidTest(infantsWithRapidTest)
                .infantsDeceased(infantsDeceased)
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

