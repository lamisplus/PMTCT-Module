package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.ObjectUtils;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
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
private final   InfantRapidTestRepository rapidTestRepository;


    public InfantDtoResponse save(InfantDto infantDto) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Infant infant = new Infant();
        infant.setMotherPersonUuid(infantDto.getPersonUuid());
        infant.setDateOfDelivery(infantDto.getDateOfDelivery());
        try{
            infant.setNin(calculateAgeInMonths(infantDto.getDateOfDelivery())+"");
        }catch (Exception e){}
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
        infant.setLastVisitDate(infantDto.getDateOfDelivery());
        infant.setNextAppointmentDate(this.calculateNAD(infantDto.getDateOfDelivery()));
        infant.setDefaultDays(0);
        infant.setBodyWeight(infantDto.getBodyWeight());
        infant.setCtxStatus(infantDto.getCtxStatus());
        Infant result = infantRepository.save(infant);

        //save InfantArv
        InfantArv infantArv =  saveInfantArv(infantDto.getInfantArvDto(),result);

        //save InfantPCRTest
        InfantPCRTest infantPCRTest = saveInfantPCRTest(infantDto.getInfantPCRTestDto(),result);

        return InfantDtoResponse.builder()
                .infant(result)
                .infantArv(infantArv)
                .infantPCRTest(infantPCRTest)
                .build();
    }

    private InfantArv saveInfantArv(InfantArvDto infantArvDto, Infant infant) {

//        System.out.println("infantArvDto " + infantArvDto);
//        if (ObjectUtils.isNotEmpty(infantArvDto) && StringUtils.hasText(infantArvDto.getInfantArvType())) {
            infantArvDto.setId(infant.getId());
            infantArvDto.setVisitDate(LocalDate.now());
            infantArvDto.setUuid(infant.getMotherPersonUuid());
            infantArvDto.setInfantHospitalNumber(infant.getHospitalNumber());
            infantArvDto.setAncNumber(infant.getAncNo());
//        }
        return infantVisitService.save(infantArvDto);
    }

    private InfantPCRTest saveInfantPCRTest(InfantPCRTestDto infantPCRTestDto, Infant infant) {
//        if (ObjectUtils.isNotEmpty(infantPCRTestDto) && StringUtils.hasText(infantPCRTestDto.getTestType())) {
            infantPCRTestDto.setId(infant.getId());
            infantPCRTestDto.setInfantHospitalNumber(infant.getHospitalNumber());
            infantPCRTestDto.setAncNumber(infant.getAncNo());
            infantPCRTestDto.setUuid(infant.getMotherPersonUuid());
            infantPCRTestDto.setVisitDate(LocalDate.now());
//        }
        return infantVisitService.save(infantPCRTestDto);
    }

    public int calculateAgeInMonths(LocalDate dob){
        LocalDate toDay = LocalDate.now();
        int ga =  0;
        if (dob == null){}else ga  = (int) ChronoUnit.MONTHS.between(dob, toDay);
        if(ga<0) ga = 0;
        return ga;
    }


    public List<InfantDto> getSingleInfantByPersonUUID(String personUuid) {

        List<InfantDto> infantDtoList = new ArrayList<>();

        List<Infant> infantList = findAllInfantByMotherPersonUuid(personUuid);
        for (Infant infant : infantList) {

            if (ObjectUtils.isNotEmpty(infant)) {
                infantDtoList.add(buildInfantDTO(infant, personUuid));
            }

        }
        return infantDtoList;

    }

    public InfantDto buildInfantDTO(Infant infant, String personUuid){
        return InfantDto.builder()
                .dateOfDelivery(infant.getDateOfDelivery())
                .firstName(infant.getFirstName())
                .middleName(infant.getMiddleName())
                .surname(infant.getSurname())
                .sex(infant.getSex())
                .nin(infant.getNin())
                .id(infant.getId())
                .hospitalNumber(infant.getHospitalNumber())
                .uuid(infant.getUuid())
                .ancNo(infant.getAncNo())
                .ancNo(infant.getInfantOutcomeAt18_months())
                .personUuid(infant.getMotherPersonUuid())
                .bodyWeight(infant.getBodyWeight())
                .ctxStatus(infant.getCtxStatus())
                .infantArvDto(infantVisitService.getInfantArvByUUID(personUuid))
                .infantPCRTestDto(infantVisitService.getInfantPCRTestByUUID(personUuid))
                .build();
    }


    public List<Infant> findAllInfantByMotherPersonUuid(String personUuid) {
        List<Infant> infantList = infantRepository.findInfantByMotherPersonUuid(personUuid);
        if (CollectionUtils.isEmpty(infantList)) {
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No record found for Infant.");
        }
        return infantList;
    }

    @SneakyThrows
    public Infant getSingleInfant(Long id){
        return this.infantRepository.findById(id)
                .orElseThrow(() -> new Exception("Infant NOT FOUND"));
    }

     public InfantDtoUpdateResponse updateInfant(Long id, InfantDto infantDto) {
         Optional<User> currentUser = this.userService.getUserWithRoles();
         User user = (User) currentUser.get();
         Long facilityId = user.getCurrentOrganisationUnitId();
         Infant infant = new Infant();
         infant.setDateOfDelivery(infantDto.getDateOfDelivery());
         try{
             infant.setNin(calculateAgeInMonths(infantDto.getDateOfDelivery())+"");
         }catch (Exception e){}
         infant.setFirstName(personService.treatNull(infantDto.getFirstName()));
         infant.setMiddleName(personService.treatNull(infantDto.getMiddleName()));
         infant.setSurname(personService.treatNull(infantDto.getSurname()));
         infant.setSex(infantDto.getSex());
         infant.setAncNo(infantDto.getAncNo());
         infant.setHospitalNumber(infantDto.getHospitalNumber());
         infant.setUuid(infantDto.getUuid());
         infant.setFacilityId(facilityId);
         infant.setCreatedBy(user.getUserName());
         infant.setLastModifiedBy(user.getUserName());
         infant.setId(id);
         infant.setLastVisitDate(infantDto.getDateOfDelivery());
         infant.setNextAppointmentDate(this.calculateNAD(infantDto.getDateOfDelivery()));
         infant.setDefaultDays(0);
         infant.setBodyWeight(infantDto.getBodyWeight());
         infant.setCtxStatus(infantDto.getCtxStatus());
         infant.setMotherPersonUuid(infantDto.getPersonUuid());

         Infant result =  infantRepository.save(infant);

         //update InfantArvDto
        InfantArv infantArv = updateInfantArvDto(infantDto,result);

         //update InfantPCRTest
         InfantPCRTest infantPCRTest = updateInfantPCRTest(infantDto,result);

        return InfantDtoUpdateResponse.builder()
                .infant(result)
                .infantArv(infantArv)
                .infantPCRTest(infantPCRTest)
                .build();
    }

    private InfantArv updateInfantArvDto(InfantDto infantDto, Infant infant) {
        InfantArv infantArv = null;
        if (infantDto.getInfantArvDto().getId() != null) {
            infantArv = infantVisitService.updateInfantArv(infantDto.getInfantArvDto(),infant);
        }
        return infantArv;
    }

    private InfantPCRTest updateInfantPCRTest(InfantDto infantDto,Infant infant) {
        InfantPCRTest infantPCRTest = null;
        if (infantDto.getInfantPCRTestDto().getId() != null) {
            infantPCRTest = infantVisitService.updateInfantPCRTest(infantDto.getInfantPCRTestDto(),infant);
        }
        return infantPCRTest;
    }

    public List<Infant> getInfantByAncNo(String ancNo)
    {
        return infantRepository.findInfantByAncNo(ancNo);
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
    public void updateInfant(String hospitalNo, String outCome) {
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(hospitalNo);
        if (infants.isPresent()){
            Infant infant = infants.get();
            infant.setInfantOutcomeAt18_months(outCome);
            infantRepository.save(infant);
        }
    }

    public CompletableFuture<Boolean> hospitalNumberExist(String hospitalNumber) {
        Optional<Infant> infants = this.infantRepository.getInfantByHospitalNumber(hospitalNumber);
        if (infants.isPresent()) {
            System.out.println("True");
            return CompletableFuture.completedFuture(true);
        }
        else{
            System.out.println("False");
            return CompletableFuture.completedFuture(false);
        }
    }

    public void deleteInfant(Long id) {
        Infant exist = this.getSingleInfant(id);
        this.infantRepository.delete(exist);

        //delete InfantARV
        infantVisitService.deleteInfantArv(id);

        //delete InfantPCR
        infantVisitService.deleteInfantPCRTestDt(id);
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

    public List<Infant> getInfantWithMotherPersonUuid(String personUuid) {
        return infantRepository.findInfantByMotherPersonUuid(personUuid);
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
        return infantPCRTestDto;

    }
    public InfantPCRTestDto getLatestPCR(String infantHospitalNumber) {
        if (!infantHospitalNumber.isEmpty()) {
            return convertInfanTPCREntityToDTO( infantPCRTestRepository.getLastPCR(infantHospitalNumber));
        } else {
            return new InfantPCRTestDto();

        }
    }

    public InfantRapidAntiBodyTestDto getLatestRapidTest(String infantHospitalNumber, String motherUuid) {

        String lastVisitId = String.valueOf(rapidTestRepository.getLastInfantVisit(infantHospitalNumber, motherUuid));

        if(!lastVisitId.isEmpty()){
        InfantRapidAntiBodyTest result= rapidTestRepository.getLastInfantRapid(lastVisitId);

                InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto = new InfantRapidAntiBodyTestDto();
                infantRapidAntiBodyTestDto.setId(result.getId());
                infantRapidAntiBodyTestDto.setRapidTestType(result.getRapidTestType());
            infantRapidAntiBodyTestDto.setAncNumber(result.getAncNumber());
            infantRapidAntiBodyTestDto.setAgeAtTest(result.getAgeAtTest());

    infantRapidAntiBodyTestDto.setDateOfTest(result.getDateOfTest());
            infantRapidAntiBodyTestDto.setResult(result.getResult());
            infantRapidAntiBodyTestDto.setUniqueUuid(result.getUniqueUuid());
            infantRapidAntiBodyTestDto.setUuid(result.getUuid());
            return infantRapidAntiBodyTestDto;
        }else{
            return new InfantRapidAntiBodyTestDto();

        }
    }


//    public InfantPCRTestDto getAllPCR(String infantHospitalNumber) {
//        if (!infantHospitalNumber.isEmpty()) {
//            return convertInfanTPCREntityToDTO( infantPCRTestRepository.getLastPCR(infantHospitalNumber));
//        } else {
//            return new InfantPCRTestDto();
//
//        }
//    }
}