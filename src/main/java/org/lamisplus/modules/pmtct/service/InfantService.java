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
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;
import org.lamisplus.modules.pmtct.domain.entity.InfantRapidAntiBodyTest;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.InfantPCRTestRepository;
import org.lamisplus.modules.pmtct.repository.InfantRapidTestRepository;
import org.lamisplus.modules.pmtct.repository.InfantRepository;
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
    private final InfantPCRTestRepository infantPCRTestRepository;
    private final UserService userService;
    private final PersonService personService;
    private final InfantVisitService infantVisitService;
    private ObjectMapper mapper = new ObjectMapper();
    private final ApplicationCodesetRepository applicationCodesetRepository;
    private final InfantRapidTestRepository rapidTestRepository;


    public InfantDtoResponse save(InfantDto infantDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        // Validate infant hospital number is not already in use
        if (infantDto.getInfantHospitalNumber() != null && !infantDto.getInfantHospitalNumber().isEmpty()) {
            // Check pmtct_infant table
            Optional<Infant> existingInfant = infantRepository.getInfantByInfantHospitalNumber(infantDto.getInfantHospitalNumber());
            if (existingInfant.isPresent() && (existingInfant.get().getArchived() == null || existingInfant.get().getArchived() == 0L)) {
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

        infant.setArchived(0L);
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

        // Read from JSONB columns; fall back to satellite tables for pre-migration data
        InfantArvDto arvDto = infant.getInfantArvData();
        if (arvDto == null) {
            arvDto = infantVisitService.getInfantArvForRegistration(
                    infant.getMotherPatientUuid(), infant.getInfantHospitalNumber(), infant.getDateOfDelivery());
        }

        InfantPCRTestDto pcrDto = infant.getInfantPcrData();
        if (pcrDto == null) {
            pcrDto = infantVisitService.getInfantPCRTestForRegistration(
                    infant.getInfantHospitalNumber(), infant.getDateOfDelivery());
        }

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
             infant.setArchived(existingInfant.get().getArchived() != null ? existingInfant.get().getArchived() : 0L);
             infant.setInfantPatientUuid(existingInfant.get().getInfantPatientUuid());
         } else {
             infant.setArchived(0L);
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
        if (infants.isPresent() && (infants.get().getArchived() == null || infants.get().getArchived() == 0L)) {
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
        exist.setArchived(1L);
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


    public InfantPCRTestDto convertInfanTPCREntityToDTO(InfantPCRTest infantPCREntity) {
        InfantPCRTestDto infantPCRTestDto = new InfantPCRTestDto();
        infantPCRTestDto.setId(infantPCREntity.getId());
        infantPCRTestDto.setVisitDate(infantPCREntity.getVisitDate());
        infantPCRTestDto.setInfantHospitalNumber(infantPCREntity.getInfantHospitalNumber());
        infantPCRTestDto.setAncNumber(infantPCREntity.getAncNumber());
        infantPCRTestDto.setAgeAtTest(infantPCREntity.getAgeAtTest());
        infantPCRTestDto.setTestType(infantPCREntity.getTestType());
        infantPCRTestDto.setDateSampleCollected(infantPCREntity.getDateSampleCollected());
        infantPCRTestDto.setDateSampleSent(infantPCREntity.getDateSampleSent());
        infantPCRTestDto.setDateResultReceivedAtFacility(infantPCREntity.getDateResultReceivedAtFacility());
        infantPCRTestDto.setDateResultReceivedByCaregiver(infantPCREntity.getDateResultReceivedByCaregiver());
        infantPCRTestDto.setResults(infantPCREntity.getResults());
        infantPCRTestDto.setUuid(infantPCREntity.getUuid());
        infantPCRTestDto.setUniqueUuid(infantPCREntity.getUniqueUuid());
        infantPCRTestDto.setPmtctCycleUuid(infantPCREntity.getPmtctCycleUuid());
        return infantPCRTestDto;

    }
    public InfantPCRTestDto getLatestPCR(String infantHospitalNumber, String pmtctCycleUuid) {
        if (!infantHospitalNumber.isEmpty()) {
            InfantPCRTest pcrTest = infantPCRTestRepository.getLastPCRByCycle(infantHospitalNumber, pmtctCycleUuid);
            if (pcrTest != null) {
                return convertInfanTPCREntityToDTO(pcrTest);
            }
        }
        return new InfantPCRTestDto();
    }

    public InfantRapidAntiBodyTestDto getLatestRapidTest(String infantHospitalNumber, String motherUuid, String pmtctCycleUuid) {

        String lastVisitId = String.valueOf(rapidTestRepository.getLastInfantVisitByCycle(infantHospitalNumber, motherUuid, pmtctCycleUuid));

        if(!lastVisitId.isEmpty() && !lastVisitId.equals("null")){
        InfantRapidAntiBodyTest result= rapidTestRepository.getLastInfantRapid(lastVisitId);

            if(result != null){
                InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto = new InfantRapidAntiBodyTestDto();
                infantRapidAntiBodyTestDto.setId(result.getUuid());
                infantRapidAntiBodyTestDto.setRapidTestType(result.getRapidTestType());
            infantRapidAntiBodyTestDto.setAncNumber(result.getAncNumber());
            infantRapidAntiBodyTestDto.setAgeAtTest(result.getAgeAtTest());
            infantRapidAntiBodyTestDto.setDateOfTest(result.getDateOfTest());
            infantRapidAntiBodyTestDto.setResult(result.getResult());
            infantRapidAntiBodyTestDto.setUniqueUuid(result.getUniqueUuid());
            infantRapidAntiBodyTestDto.setUuid(result.getUuid());
            infantRapidAntiBodyTestDto.setPmtctCycleUuid(result.getPmtctCycleUuid());

            return infantRapidAntiBodyTestDto;
            }
        }
        return new InfantRapidAntiBodyTestDto();
    }


    public boolean firstPcrExist(String infantHospitalNumber) {
      return  infantPCRTestRepository.checkPcrExist(infantHospitalNumber);
    }

    private String convertSexCode(String sexCode) {
        if (sexCode == null) return null;
        if (sexCode.contains("FEMALE")) return "Female";
        if (sexCode.contains("MALE")) return "Male";
        return sexCode;
    }
}
