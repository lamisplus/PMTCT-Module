package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.ObjectUtils;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.InfantVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
import org.lamisplus.modules.pmtct.repository.InfantVisitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.util.CollectionUtils;
import reactor.util.StringUtils;

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
    private final InfantVisitRepository infantVisitRepository;
    private final UserService userService;
    private final PersonService personService;
    private final InfantVisitService infantVisitService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;


    public InfantDtoResponse save(InfantDto infantDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        // Validate infant hospital number is not already in use
        if (infantDto.getInfantHospitalNumber() != null && !infantDto.getInfantHospitalNumber().isEmpty()) {
            // Check pmtct_infant table
            Optional<Infant> existingInfant = infantRepository.getInfantByInfantHospitalNumber(infantDto.getInfantHospitalNumber());
            if (existingInfant.isPresent() && (existingInfant.get().getArchived() == null || existingInfant.get().getArchived() == false)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Hospital number '" + infantDto.getInfantHospitalNumber() + "' already exists in infant records. Please use a unique hospital number.");
            }
            // Check patient_person table
            Optional<Person> existingPerson = personRepository.getPersonByHospitalNumberAndFacilityId(infantDto.getInfantHospitalNumber(), facilityId);
            if (existingPerson.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Hospital number '" + infantDto.getInfantHospitalNumber() + "' already exists in patient records. Please use a unique hospital number.");
            }
        }

        // Create patient_person record for the infant
        Person infantPerson = new Person();
        infantPerson.setUuid(UUID.randomUUID().toString());
        infantPerson.setFirstName(personService.treatNull(infantDto.getFirstName()));
        infantPerson.setOtherName(personService.treatNull(infantDto.getMiddleName()));
        infantPerson.setSurname(personService.treatNull(infantDto.getSurname()));
        infantPerson.setDateOfBirth(infantDto.getDateOfDelivery());
        infantPerson.setDateOfRegistration(LocalDate.now());
        infantPerson.setSex(convertSexCode(infantDto.getSex()));
        infantPerson.setFullName(personService.getFullName(infantDto.getFirstName(), infantDto.getMiddleName(), infantDto.getSurname()));
        infantPerson.setHospitalNumber(infantDto.getInfantHospitalNumber());
        infantPerson.setActive(true);
        infantPerson.setArchived(0);
        infantPerson.setFacilityId(facilityId);
        infantPerson.setIsDateOfBirthEstimated(false);

        // Copy address and contact from the mother's patient_person record
        if (infantDto.getPatientUuid() != null) {
            Optional<Person> motherPerson = personRepository.findByUuid(infantDto.getPatientUuid());
            if (motherPerson.isPresent()) {
                infantPerson.setAddress(motherPerson.get().getAddress());
                infantPerson.setContactPoint(motherPerson.get().getContactPoint());
            }
        }

        personRepository.save(infantPerson);

        Infant infant = new Infant();
        infant.setMotherPatientUuid(infantDto.getPatientUuid());
        infant.setDateOfDelivery(infantDto.getDateOfDelivery());
        infant.setInfantHospitalNumber(infantDto.getInfantHospitalNumber());
        infant.setInfantPatientUuid(infantPerson.getUuid());
        infant.setUuid(UUID.randomUUID().toString());
        infant.setFacilityId(facilityId);
        infant.setCreatedBy(user.getUserName());
        infant.setLastModifiedBy(user.getUserName());
        infant.setCreatedDate(java.time.LocalDateTime.now());
        infant.setLastModifiedDate(java.time.LocalDateTime.now());
        infant.setBodyWeight(infantDto.getBodyWeight());
        infant.setLength(infantDto.getLength());
        infant.setCtxStatus(infantDto.getCtxStatus());

        // Set pmtctCycleUuid - this is now compulsory
        if (infantDto.getPmtctCycleUuid() == null) {
            throw new IllegalArgumentException("pmtctCycleUuid is required for infant registration");
        }
        infant.setPmtctCycleUuid(infantDto.getPmtctCycleUuid());

        infant.setArchived(false);
        infant.setSource(infantDto.getSource());

        // Set JSONB data directly on the entity instead of satellite tables
        if (infantDto.getInfantArvDto() != null
                && infantDto.getInfantArvDto().getInfantArvType() != null
                && !infantDto.getInfantArvDto().getInfantArvType().isEmpty()) {
            infant.setInfantArvData(infantDto.getInfantArvDto());
        }

        if (infantDto.getInfantPCRTestDto() != null
                && infantDto.getInfantPCRTestDto().getTestType() != null
                && !infantDto.getInfantPCRTestDto().getTestType().isEmpty()) {
            infant.setInfantPcrData(infantDto.getInfantPCRTestDto());
        }

        // Set new fields
        infant.setBirthOutcome(infantDto.getBirthOutcome());
        infant.setEntryPoint(infantDto.getEntryPoint());
        infant.setEntryPointOther(infantDto.getEntryPointOther());
        infant.setSyphilisProphylaxis(infantDto.getSyphilisProphylaxis());
        infant.setHbvVaccinations(infantDto.getHbvVaccinations());

        Infant result = infantRepository.save(infant);

        return InfantDtoResponse.builder()
                .infant(result)
                .infantArvDto(result.getInfantArvData())
                .infantPCRTestDto(result.getInfantPcrData())
                .build();
    }

    public int calculateAgeInMonths(LocalDate dob){
        LocalDate toDay = LocalDate.now();
        int ga =  0;
        if (dob == null){}else ga  = (int) ChronoUnit.MONTHS.between(dob, toDay);
        if(ga<0) ga = 0;
        return ga;
    }


    public List<InfantDto> getSingleInfantByPersonUUID(String patientUuid) {

        List<InfantDto> infantDtoList = new ArrayList<>();

        List<Infant> infantList = findAllInfantByMotherPatientUuid(patientUuid);
        for (Infant infant : infantList) {

            if (ObjectUtils.isNotEmpty(infant)) {
                infantDtoList.add(buildInfantDTO(infant, patientUuid));
            }

        }
        return infantDtoList;

    }

    public List<InfantDto> getSingleInfantByPersonUUID(String patientUuid, String pmtctCycleUuid) {

        List<InfantDto> infantDtoList = new ArrayList<>();

        List<Infant> infantList = findAllInfantByMotherPatientUuid(patientUuid, pmtctCycleUuid);
        for (Infant infant : infantList) {

            if (ObjectUtils.isNotEmpty(infant)) {
                infantDtoList.add(buildInfantDTO(infant, patientUuid));
            }

        }
        return infantDtoList;

    }

    public InfantDto buildInfantDTO(Infant infant, String patientUuid){
        // Fetch infant's person record for demographics
        String firstName = "";
        String middleName = "";
        String surname = "";
        String sex = "";
        if (infant.getInfantPatientUuid() != null) {
            Optional<Person> infantPerson = personRepository.findByUuid(infant.getInfantPatientUuid());
            if (infantPerson.isPresent()) {
                firstName = infantPerson.get().getFirstName();
                middleName = infantPerson.get().getOtherName();
                surname = infantPerson.get().getSurname();
                sex = infantPerson.get().getSex();
            }
        }

        InfantArvDto arvDto = infant.getInfantArvData();
        InfantPCRTestDto pcrDto = infant.getInfantPcrData();

        return InfantDto.builder()
                .dateOfDelivery(infant.getDateOfDelivery())
                .firstName(firstName)
                .middleName(middleName)
                .surname(surname)
                .sex(sex)
                .id(infant.getId())
                .infantHospitalNumber(infant.getInfantHospitalNumber())
                .uuid(infant.getUuid())
                .infantPatientUuid(infant.getInfantPatientUuid())
                .patientUuid(infant.getMotherPatientUuid())
                .bodyWeight(infant.getBodyWeight())
                .length(infant.getLength())
                .ctxStatus(infant.getCtxStatus())
                .pmtctCycleUuid(infant.getPmtctCycleUuid())
                .infantArvDto(arvDto)
                .infantPCRTestDto(pcrDto)
                .birthOutcome(infant.getBirthOutcome())
                .entryPoint(infant.getEntryPoint())
                .entryPointOther(infant.getEntryPointOther())
                .syphilisProphylaxis(infant.getSyphilisProphylaxis())
                .hbvVaccinations(infant.getHbvVaccinations())
                .build();
    }


    public List<Infant> findAllInfantByMotherPatientUuid(String patientUuid) {
        List<Infant> infantList = infantRepository.findInfantByMotherPatientUuid(patientUuid);
        if (CollectionUtils.isEmpty(infantList)) {
           return new ArrayList<>();
        }
        return infantList;
    }

    public List<Infant> findAllInfantByMotherPatientUuid(String patientUuid, String pmtctCycleUuid) {
        List<Infant> infantList = infantRepository.getAllInfantByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);
        if (CollectionUtils.isEmpty(infantList)) {
           return new ArrayList<>();
        }
        return infantList;
    }

    public Infant getSingleInfant(String id){
        return this.infantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Infant NOT FOUND"));
    }

    public InfantDto getInfantDtoById(String id) {
        Infant infant = getSingleInfant(id);
        return buildInfantDTO(infant, infant.getMotherPatientUuid());
    }

     public InfantDtoUpdateResponse updateInfant(String id, InfantDto infantDto) {
         Optional<User> currentUser = this.userService.getUserWithRoles();
         User user = (User) currentUser.get();
         Long facilityId = user.getCurrentOrganisationUnitId();

         Optional<Infant> existingInfant = infantRepository.findById(id);

         // Update infant's patient_person demographics
         if (existingInfant.isPresent() && existingInfant.get().getInfantPatientUuid() != null) {
             Optional<Person> infantPersonOpt = personRepository.findByUuid(existingInfant.get().getInfantPatientUuid());
             if (infantPersonOpt.isPresent()) {
                 Person infantPerson = infantPersonOpt.get();
                 infantPerson.setFirstName(personService.treatNull(infantDto.getFirstName()));
                 infantPerson.setOtherName(personService.treatNull(infantDto.getMiddleName()));
                 infantPerson.setSurname(personService.treatNull(infantDto.getSurname()));
                 infantPerson.setSex(convertSexCode(infantDto.getSex()));
                 infantPerson.setFullName(personService.getFullName(infantDto.getFirstName(), infantDto.getMiddleName(), infantDto.getSurname()));
                 infantPerson.setHospitalNumber(infantDto.getInfantHospitalNumber());
                 infantPerson.setDateOfBirth(infantDto.getDateOfDelivery());
                 personRepository.save(infantPerson);
             }
         }

         Infant infant = new Infant();
         infant.setDateOfDelivery(infantDto.getDateOfDelivery());
         infant.setInfantHospitalNumber(infantDto.getInfantHospitalNumber());
         infant.setUuid(id);
         infant.setFacilityId(facilityId);
         // Preserve original created_by, created_date, archived, and infant_patient_uuid from existing record
         if (existingInfant.isPresent()) {
             infant.setCreatedBy(existingInfant.get().getCreatedBy());
             infant.setCreatedDate(existingInfant.get().getCreatedDate());
             infant.setArchived(existingInfant.get().getArchived() != null ? existingInfant.get().getArchived() : false);
             infant.setInfantPatientUuid(existingInfant.get().getInfantPatientUuid());
         } else {
             infant.setArchived(false);
         }
         infant.setLastModifiedBy(user.getUserName());
         infant.setLastModifiedDate(java.time.LocalDateTime.now());
         infant.setBodyWeight(infantDto.getBodyWeight());
         infant.setLength(infantDto.getLength());
         infant.setCtxStatus(infantDto.getCtxStatus());
         infant.setMotherPatientUuid(infantDto.getPatientUuid());

         // Update pmtctCycleUuid if provided, otherwise preserve existing
         if (infantDto.getPmtctCycleUuid() != null) {
             infant.setPmtctCycleUuid(infantDto.getPmtctCycleUuid());
         } else if (existingInfant.isPresent()) {
             infant.setPmtctCycleUuid(existingInfant.get().getPmtctCycleUuid());
         }

         infant.setSource(infantDto.getSource());

         // Set JSONB data directly on the entity
         infant.setInfantArvData(infantDto.getInfantArvDto());
         infant.setInfantPcrData(infantDto.getInfantPCRTestDto());
         infant.setBirthOutcome(infantDto.getBirthOutcome());
         infant.setEntryPoint(infantDto.getEntryPoint());
         infant.setEntryPointOther(infantDto.getEntryPointOther());
         infant.setSyphilisProphylaxis(infantDto.getSyphilisProphylaxis());
         infant.setHbvVaccinations(infantDto.getHbvVaccinations());

         Infant result = infantRepository.save(infant);

        return InfantDtoUpdateResponse.builder()
                .infant(result)
                .infantArvDto(result.getInfantArvData())
                .infantPCRTestDto(result.getInfantPcrData())
                .build();
    }

    public List<Infant> getInfantByAncNo(String ancNo)
    {
        // Look up ANC by ancNo to get patientUuid, then find infants by motherPatientUuid
        Optional<ANC> ancOpt = ancRepository.getByAncNo(ancNo);
        if (ancOpt.isPresent()) {
            return infantRepository.findInfantByMotherPatientUuid(ancOpt.get().getPatientUuid());
        }
        return new ArrayList<>();
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

    public CompletableFuture<Boolean> hospitalNumberExist(String hospitalNumber) {
        // Check pmtct_infant table
        Optional<Infant> infants = this.infantRepository.getInfantByInfantHospitalNumber(hospitalNumber);
        if (infants.isPresent() && (infants.get().getArchived() == null || infants.get().getArchived() == false)) {
            return CompletableFuture.completedFuture(true);
        }
        // Check patient_person table
        Optional<User> currentUser = this.userService.getUserWithRoles();
        if (currentUser.isPresent()) {
            Long facilityId = currentUser.get().getCurrentOrganisationUnitId();
            Optional<Person> existingPerson = personRepository.getPersonByHospitalNumberAndFacilityId(hospitalNumber, facilityId);
            if (existingPerson.isPresent()) {
                return CompletableFuture.completedFuture(true);
            }
        }
        return CompletableFuture.completedFuture(false);
    }

    public void deleteInfant(String id) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Infant exist = this.getSingleInfant(id);

        // Soft delete the Infant record — JSONB data (ARV, PCR) is embedded and archived with it
        exist.setArchived(true);
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        exist.setLastModifiedBy(user.getUserName());
        this.infantRepository.save(exist);

        // Also soft delete the infant's Person record in patient_person
        if (exist.getInfantPatientUuid() != null) {
            Optional<Person> infantPersonOpt = personRepository.findByUuid(exist.getInfantPatientUuid());
            if (infantPersonOpt.isPresent()) {
                Person infantPerson = infantPersonOpt.get();
                infantPerson.setArchived(1);
                infantPerson.setActive(false);
                personRepository.save(infantPerson);
            }
        }

        // Also archive this infant's follow-up visits. Hospital numbers can be reused
        // for a newly-registered infant after this delete, and getLatestPCR/getLatestRapidTest
        // look visits up by hospital number string — leaving these live would attribute this
        // (now-deleted) infant's PCR/rapid-test history to whichever infant reuses the number.
        if (exist.getInfantHospitalNumber() != null && !exist.getInfantHospitalNumber().isEmpty()) {
            List<InfantVisit> visits = infantVisitRepository
                    .getInfantVisitsByInfantHospitalNumberOrdered(exist.getInfantHospitalNumber());
            visits.forEach(visit -> visit.setArchived(true));
            infantVisitRepository.saveAll(visits);
        }
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

    public List<Infant> getInfantWithMotherPatientUuid(String patientUuid) {
        return infantRepository.findInfantByMotherPatientUuid(patientUuid);
    }


    public InfantPCRTestDto getLatestPCR(String infantHospitalNumber, String pmtctCycleUuid) {
        if (infantHospitalNumber == null || infantHospitalNumber.isEmpty()) {
            return new InfantPCRTestDto();
        }
        // 1. Check InfantVisit JSONB (follow-up visits, newest first)
        List<InfantVisit> visits = infantVisitRepository
            .getInfantVisitsByInfantHospitalNumberAndCycleUuid(infantHospitalNumber, pmtctCycleUuid);
        for (InfantVisit visit : visits) {
            if (visit.getInfantPcrData() != null
                    && visit.getInfantPcrData().getTestType() != null
                    && !visit.getInfantPcrData().getTestType().isEmpty()) {
                return visit.getInfantPcrData();
            }
        }
        // 2. Fallback: Infant registration JSONB — archived-aware so a deleted infant's
        // data can't leak into a new infant that reuses the same hospital number.
        Optional<Infant> infant = infantRepository.getInfantByInfantHospitalNumberAndArchived(infantHospitalNumber, false);
        if (infant.isPresent()
                && infant.get().getInfantPcrData() != null
                && infant.get().getInfantPcrData().getTestType() != null
                && !infant.get().getInfantPcrData().getTestType().isEmpty()
                && pmtctCycleUuid.equals(infant.get().getPmtctCycleUuid())) {
            return infant.get().getInfantPcrData();
        }
        return new InfantPCRTestDto();
    }

    public InfantRapidAntiBodyTestDto getLatestRapidTest(String infantHospitalNumber, String motherUuid, String pmtctCycleUuid) {
        if (infantHospitalNumber == null || infantHospitalNumber.isEmpty()) {
            return new InfantRapidAntiBodyTestDto();
        }
        List<InfantVisit> visits = infantVisitRepository
            .getInfantVisitsByInfantHospitalNumberAndCycleUuid(infantHospitalNumber, pmtctCycleUuid);
        for (InfantVisit visit : visits) {
            if (visit.getRapidTestData() != null
                    && visit.getRapidTestData().getResult() != null
                    && !visit.getRapidTestData().getResult().isEmpty()) {
                return visit.getRapidTestData();
            }
        }
        return new InfantRapidAntiBodyTestDto();
    }


    public boolean firstPcrExist(String infantHospitalNumber) {
        // Check infant registration JSONB
        Optional<Infant> infant = infantRepository.getInfantByInfantHospitalNumber(infantHospitalNumber);
        if (infant.isPresent() && infant.get().getInfantPcrData() != null
                && infant.get().getInfantPcrData().getTestType() != null
                && !infant.get().getInfantPcrData().getTestType().isEmpty()) {
            return true;
        }
        // Check infant visit JSONB
        List<InfantVisit> visits = infantVisitRepository
            .getInfantVisitsByInfantHospitalNumberOrdered(infantHospitalNumber);
        for (InfantVisit visit : visits) {
            if (visit.getInfantPcrData() != null
                    && visit.getInfantPcrData().getTestType() != null
                    && !visit.getInfantPcrData().getTestType().isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private String convertSexCode(String sexCode) {
        if (sexCode == null) return null;
        if (sexCode.contains("FEMALE")) return "Female";
        if (sexCode.contains("MALE")) return "Male";
        return sexCode;
    }
}
