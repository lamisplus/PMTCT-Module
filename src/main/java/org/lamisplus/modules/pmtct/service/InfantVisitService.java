package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
public class InfantVisitService
{
    private final InfantVisitRepository infantVisitRepository;
    private final InfantRepository infantRepository;
    private  final InfantPCRTestRepository infantPCRTestRepository;
    private final InfantArvRepository infantArvRepository;
    private final DeliveryRepository deliveryRepository;
private final InfantRapidTestRepository infantRapidTestRepository;


    private InfantMotherArtRepository infantMotherArtRepository;

    public InfantVisitResponseDto save(InfantVisitRequestDto infantVisitRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(infantVisitRequestDto));
    }

    public InfantPCRTest save(InfantPCRTestDto infantPCRTest) {
        return converRequestDtotoEntity(infantPCRTest);
    }


    public InfantArv save(InfantArvDto infantArvDto) {
        return converRequestDtotoEntity(infantArvDto);
    }


    public InfantRapidAntiBodyTest save(InfantRapidAntiBodyTestDto infantRapidDto) {
        return converRequestDtotoEntity(infantRapidDto);
    }


    public InfantRapidAntiBodyTest converRequestDtotoEntity(InfantRapidAntiBodyTestDto infantRapidDto) {
        InfantRapidAntiBodyTest infantRapid  = new InfantRapidAntiBodyTest();
        infantRapid.setRapidTestType(infantRapidDto.getRapidTestType());
        infantRapid.setAncNumber(infantRapidDto.getAgeAtTest());
        infantRapid.setDateOfTest(infantRapidDto.getDateOfTest());
        infantRapid.setResult(infantRapidDto.getResult());
        infantRapid.setUuid(UUID.randomUUID().toString());
        infantRapid.setUniqueUuid(infantRapidDto.getUniqueUuid());

        return this.infantRapidTestRepository.save(infantRapid);
    }


    public InfantArv converRequestDtotoEntity(InfantArvDto infantArvDto) {
        InfantArv infantArv = new InfantArv();
        infantArv.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        infantArv.setAncNumber(infantArvDto.getAncNumber());
        //infantArv.setUuid(UUID.randomUUID().toString());
        infantArv.setUuid(infantArvDto.getUuid());
        infantArv.setVisitDate(infantArvDto.getVisitDate());
        infantArv.setInfantArvType(infantArvDto.getInfantArvType());
        infantArv.setInfantArvTime(infantArvDto.getInfantArvTime());
        infantArv.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        infantArv.setTimingOfAvrAfter72Hours(infantArvDto.getTimingOfAvrAfter72Hours());
        infantArv.setTimingOfAvrWithin72Hours(infantArvDto.getTimingOfAvrWithin72Hours());
        infantArv.setUniqueUuid(infantArvDto.getUniqueUuid());
        infantArv.setDateOfCtx(infantArvDto.getDateOfCtx());
        infantArv.setAgeAtCtx(infantArvDto.getAgeAtCtx());
        infantArv.setDateOfArv(infantArvDto.getDateOfArv());
        return this.infantArvRepository.save(infantArv);
    }
    public InfantPCRTest converRequestDtotoEntity(InfantPCRTestDto infantPCRTestDto) {
        InfantPCRTest infantPCRTest = new InfantPCRTest();
        infantPCRTest.setInfantHospitalNumber(infantPCRTestDto.getInfantHospitalNumber());
        infantPCRTest.setAgeAtTest(infantPCRTestDto.getAgeAtTest());
        infantPCRTest.setTestType(infantPCRTestDto.getTestType());
        infantPCRTest.setAncNumber(infantPCRTestDto.getAncNumber());
        infantPCRTest.setResults(infantPCRTestDto.getResults());
        //infantPCRTest.setUuid(UUID.randomUUID().toString());
        infantPCRTest.setUuid(infantPCRTestDto.getUuid());
        infantPCRTest.setVisitDate(infantPCRTestDto.getVisitDate());
        infantPCRTest.setDateResultReceivedAtFacility(infantPCRTestDto.getDateResultReceivedAtFacility());
        infantPCRTest.setDateResultReceivedByCaregiver(infantPCRTestDto.getDateResultReceivedByCaregiver());
        infantPCRTest.setDateSampleCollected(infantPCRTestDto.getDateSampleCollected());
        infantPCRTest.setDateSampleSent(infantPCRTestDto.getDateSampleSent());
        infantPCRTest.setUniqueUuid(infantPCRTestDto.getUniqueUuid());

        return this.infantPCRTestRepository.save(infantPCRTest);
    }
    public InfantVisit converRequestDtotoEntity(InfantVisitRequestDto infantVisitRequestDto) {
        InfantVisit infantVisit = new InfantVisit();

        infantVisit.setVisitDate(infantVisitRequestDto.getVisitDate());
        infantVisit.setInfantHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
        infantVisit.setAncNumber(infantVisitRequestDto.getAncNumber());
        infantVisit.setBodyWeight(infantVisitRequestDto.getBodyWeight());
        infantVisit.setVisitStatus(infantVisitRequestDto.getVisitStatus());
        infantVisit.setCtxStatus(infantVisitRequestDto.getCtxStatus());
        infantVisit.setBreastFeeding(infantVisitRequestDto.getBreastFeeding());
        infantVisit.setMotherPersonUuid(infantVisitRequestDto.getPersonUuid());
        try{
            Optional<Infant> infants = infantRepository.getInfantByHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
            if(infants.isPresent()){
                Infant infant = infants.get();
                LocalDate nad = this.calculateNAD(infantVisitRequestDto.getVisitDate());

                infant.setDefaultDays(this.defaultDate(infant.getLastVisitDate(), infantVisitRequestDto.getVisitDate()));
                infant.setLastVisitDate(infantVisitRequestDto.getVisitDate());
                infant.setNextAppointmentDate(nad);
                infantRepository.save(infant);

            }
        }catch(Exception e) {}

        //infantVisit.setAgeAtCtx(infantVisitRequestDto.getAgeAtCtx());
        infantVisit.setUuid(UUID.randomUUID().toString());
        infantVisit.setUniqueUuid(infantVisitRequestDto.getUniqueUuid());

        return this.infantVisitRepository.save(infantVisit);
       // return this.infantVisitRepository.save(infantVisit);
    }


    public InfantVisitResponseDto convertEntitytoRespondDto(InfantVisit infantVisit) {
        InfantVisitResponseDto infantVisitResponseDto = new InfantVisitResponseDto();
        infantVisitResponseDto.setFullname(this.getFullName(infantVisit.getInfantHospitalNumber()));
        infantVisitResponseDto.setAge(calculateAge(infantVisit.getInfantHospitalNumber()));
       //infantVisitResponseDto.setAgeAtCtx(infantVisit.getAgeAtCtx());
        infantVisitResponseDto.setAncNumber(infantVisit.getAncNumber());
        infantVisitResponseDto.setBodyWeight(infantVisit.getBodyWeight());
        infantVisitResponseDto.setBreastFeeding(infantVisit.getBreastFeeding());
        infantVisitResponseDto.setCtxStatus(infantVisit.getCtxStatus());
        infantVisitResponseDto.setId(infantVisit.getId());
        infantVisitResponseDto.setInfantHospitalNumber(infantVisit.getInfantHospitalNumber());
        infantVisitResponseDto.setUuid(infantVisit.getUuid());
        infantVisitResponseDto.setVisitDate(infantVisit.getVisitDate());
        infantVisitResponseDto.setVisitStatus(infantVisit.getVisitStatus());
        infantVisitResponseDto.setUniqueUuid(infantVisit.getUniqueUuid());


        return infantVisitResponseDto;
    }

    private String getFullName(String infantHospitalNumber) {
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(infantHospitalNumber);

        String fullName = "";
        if (infants.isPresent()) {
            Infant infant = infants.get();
            String fn = infant.getFirstName();
            String sn = infant.getSurname();
            String mn = infant.getMiddleName();
            if (fn == null) fn = "";
            if (sn == null) sn = "";
            if (mn == null) mn = "";
            fullName = fn + ", " + mn + " " + sn;
        } else {
            fullName = "";
        }
        return fullName;
    }

    public int calculateAge(String infantHospitalNumber) {
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(infantHospitalNumber);

        int age = 0;
        //System.out.println("HostpitalNumber in Age " + uuid);
        if (infants.isPresent()) {
            Infant infant = infants.get();
            LocalDate dob = infant.getDateOfDelivery();
            LocalDate curDate = LocalDate.now();
            if (dob != null && curDate != null) {
                //Period period = Period.between(dob, curDate);
                age = (int) ChronoUnit.MONTHS.between(dob, curDate);
                //age = (period.getYears()*12)+ period.getMonths();
            } else {
                age = 0;
            }
        }
        //System.out.println("Age " + age);
        return age;
    }


    public InfantVisitRequestDto convertEntitytoRequestDto(InfantVisit infantVisit) {
        InfantVisitRequestDto infantVisitResponseDto = new InfantVisitRequestDto();
        //infantVisitResponseDto.setFullname(this.getFullName(infantVisit.getInfantHospitalNumber()));
        //infantVisitResponseDto.setAge(calculateAge(infantVisit.getInfantHospitalNumber()));
        //infantVisitResponseDto.setAgeAtCtx(infantVisit.getAgeAtCtx());
        infantVisitResponseDto.setAncNumber(infantVisit.getAncNumber());
        infantVisitResponseDto.setBodyWeight(infantVisit.getBodyWeight());
        infantVisitResponseDto.setBreastFeeding(infantVisit.getBreastFeeding());
        infantVisitResponseDto.setCtxStatus(infantVisit.getCtxStatus());
        infantVisitResponseDto.setId(infantVisit.getId());
        infantVisitResponseDto.setInfantHospitalNumber(infantVisit.getInfantHospitalNumber());
        infantVisitResponseDto.setUuid(infantVisit.getUuid());
        infantVisitResponseDto.setVisitDate(infantVisit.getVisitDate());
        infantVisitResponseDto.setVisitStatus(infantVisit.getVisitStatus());
        infantVisitResponseDto.setUniqueUuid(infantVisit.getUniqueUuid());

        return infantVisitResponseDto;
    }

    public List<InfantVisit> getInfantVisitByHospitalNumber(String hospitalNumber) {
        return infantVisitRepository.findInfantVisitsByInfantHospitalNumber(hospitalNumber);
    }

    @SneakyThrows
    public InfantPCRTest getSingleInfantPCRTest(Long id) {
        return this.infantPCRTestRepository.findById(id)
                .orElseThrow(() -> new Exception("InfantPCRTest NOT FOUND"));
    }

    public List<InfantPCRTest> getInfantPCRTestByHospitalNumber(String hospitalNumber) {
        return infantPCRTestRepository.findByInfantHospitalNumber(hospitalNumber);
    }

    @SneakyThrows
    public InfantArv getSingleInfantArv(Long id) {
        return this.infantArvRepository.findById(id)
                .orElseThrow(() -> new Exception("InfantArv NOT FOUND"));
    }

    public List<InfantArv> getInfantArvByHospitalNumber(String hospitalNumber) {
        return infantArvRepository.findByInfantHospitalNumber(hospitalNumber);
    }

    public InfantMotherArt save(InfantMotherArtDto infantMotherArtDto) {
        return converRequestDtotoEntity(infantMotherArtDto);
    }
    public InfantMotherArt converRequestDtotoEntity(InfantMotherArtDto infantMotherArtDto) {
        InfantMotherArt infantMotherArt = new InfantMotherArt();
        infantMotherArt.setAncNumber(infantMotherArtDto.getAncNumber());
        infantMotherArt.setUuid(UUID.randomUUID().toString());
        infantMotherArt.setVisitDate(infantMotherArtDto.getVisitDate());
        infantMotherArt.setMotherArtInitiationTime(infantMotherArtDto.getMotherArtInitiationTime());
        infantMotherArt.setRegimenTypeId(infantMotherArtDto.getRegimenTypeId());
        infantMotherArt.setRegimenId(infantMotherArtDto.getRegimenId());
        infantMotherArt.setUniqueUuid(infantMotherArtDto.getUniqueUuid());
        return this.infantMotherArtRepository.save(infantMotherArt);
    }

    @SneakyThrows
    public InfantMotherArt getSingleInfantMotherArt(Long id) {
        return this.infantMotherArtRepository.findById(id)
                .orElseThrow(() -> new Exception("InfantMotherArt NOT FOUND"));
    }

    public List<InfantMotherArt> getInfantMotherArtByANCNumber(String ancNo) {
        return infantMotherArtRepository.findByAncNumber(ancNo);
    }

    public  boolean infantMotherArtDetailsCaptured(String ancNo)
    {
        List<InfantMotherArt> infantMotherArtList = this.getInfantMotherArtByANCNumber(ancNo);
        return (!infantMotherArtList.isEmpty());
    }

    public  boolean infantArvAdministered (String hospitalNumber)
    {
        List<InfantArv> infantArvList = this.getInfantArvByHospitalNumber(hospitalNumber);
        return (!infantArvList.isEmpty());
    }
    private String generateUUID(){
        return UUID.randomUUID().toString();
    }

    public InfantVisitationConsolidatedDto saveConsolidation (InfantVisitationConsolidatedDto infantVisitationConsolidatedDto, InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto)
    {
        infantVisitationConsolidatedDto.getInfantVisitRequestDto().setUniqueUuid(UUID.randomUUID().toString());

        InfantVisitResponseDto infantVisitResponseDto =  this.save(infantVisitationConsolidatedDto.getInfantVisitRequestDto());
        System.out.println("test case" + " " + infantVisitResponseDto.getUniqueUuid());


        if ((infantVisitationConsolidatedDto.getInfantMotherArtDto().getMotherArtInitiationTime()!= null))
        {
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());

            this.save(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        }

        if ((infantVisitationConsolidatedDto.getInfantArvDto().getInfantArvType() != null)) {
            infantVisitationConsolidatedDto.getInfantArvDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
            infantVisitationConsolidatedDto.getInfantArvDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantArvDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantArvDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());

            this.save(infantVisitationConsolidatedDto.getInfantArvDto());
        }

        if ((infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType() != null) ){
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());

            this.save(infantVisitationConsolidatedDto.getInfantPCRTestDto());
        }

        if(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getResult() != null){
//            InfantRapidAntiBodyTest infantRapidAntiBodyTest = convertDtoToEntity(infantRapidAntiBodyTestDto);
            infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
            infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setAncNumber(infantVisitResponseDto.getAncNumber());
//            infantVisitationConsolidatedDto.setInfantRapidAntiBodyTestDto(infantRapidAntiBodyTestDto);

            this.save(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto());

        }

        return InfantVisitationConsolidatedDto.builder()
                .infantVisitRequestDto(convertEntitytoRequestDto(infantVisitResponseDto,infantVisitationConsolidatedDto.getInfantVisitRequestDto().getPersonUuid()))
                .build();
    }



    public InfantRapidAntiBodyTest convertDtoToEntity(InfantRapidAntiBodyTestDto dto) {
        InfantRapidAntiBodyTest entity = new InfantRapidAntiBodyTest();
        entity.setRapidTestType(dto.getRapidTestType());
        entity.setAncNumber(dto.getAncNumber());
        entity.setAgeAtTest(dto.getAgeAtTest());
        entity.setDateOfTest(dto.getDateOfTest());
        entity.setResult(dto.getResult());
        return entity;
    }

    public InfantVisitRequestDto convertEntitytoRequestDto(InfantVisitResponseDto infantVisitResponseDto, String personUuid) {
        InfantVisitRequestDto infantVisitResponseDto1 = new InfantVisitRequestDto();
        infantVisitResponseDto1.setId(infantVisitResponseDto.getId());
        infantVisitResponseDto1.setVisitDate(infantVisitResponseDto.getVisitDate());
        infantVisitResponseDto1.setAncNumber(infantVisitResponseDto.getAncNumber());
        infantVisitResponseDto1.setBodyWeight(infantVisitResponseDto.getBodyWeight());
        infantVisitResponseDto1.setVisitStatus(infantVisitResponseDto.getVisitStatus());
       // infantVisitResponseDto1.setCtxStatus(infantVisitResponseDto.getCtxStatus());
        infantVisitResponseDto1.setBreastFeeding(infantVisitResponseDto.getBreastFeeding());
        infantVisitResponseDto1.setUuid(infantVisitResponseDto.getUuid());
        infantVisitResponseDto1.setInfantOutcomeAt18Months(infantVisitResponseDto.getInfantOutcomeAt18Months());
        infantVisitResponseDto1.setPersonUuid(personUuid);

        return infantVisitResponseDto1;
    }

    public FormFilterResponseDto getFormFilter(String hospitalNumber){
        FormFilterResponseDto filterResponseDto = new FormFilterResponseDto();
        filterResponseDto.setInfantArv(this.infantArvAdministered(hospitalNumber));
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(hospitalNumber);
//        List<Infant> infants = this.infantRepository.findInfantsByHospitalNumber(hospitalNumber);
//        log.info("list of infant: {}", infants);
//        if(!(infants.isEmpty())) {
//            Infant infant = infants.get(1);
//            filterResponseDto.setMotherArt(this.infantMotherArtDetailsCaptured(infant.getAncNo()));
//
//        } else {
//            filterResponseDto.setMotherArt(Boolean.FALSE);
//        }

        //Optional<Delivery> deliveryOptional = this.deliveryRepository.findDeliveryByHospitalNumber(hospitalNumber);
        if (infants.isPresent()){
            filterResponseDto.setMotherArt(this.infantMotherArtDetailsCaptured(infants.get().getAncNo()));
        } else {
            filterResponseDto.setMotherArt(Boolean.FALSE);
        }

        int infantAge = this.calculateAge(hospitalNumber);
        if(infantAge>= 18) {
            filterResponseDto.setOutCome(Boolean.TRUE);
        } else {
            filterResponseDto.setOutCome(Boolean.FALSE);
        }
        return filterResponseDto;
    }

//    @SneakyThrows
//    public InfantVisit  getSingleInfantVisit(Long id) {
//        return this.infantVisitRepository.findById(id)
//                .orElseThrow(() -> new Exception("InfantVisit NOT FOUND"));
//    }

    public InfantMotherArtDto  converRequestDtotoEntity( InfantMotherArt infantMotherArtDto) {
        InfantMotherArtDto infantMotherArt = new InfantMotherArtDto();
        infantMotherArt.setAncNumber(infantMotherArtDto.getAncNumber());
        infantMotherArt.setUuid(infantMotherArtDto.getUuid());
        infantMotherArt.setId(infantMotherArtDto.getId());
        infantMotherArt.setVisitDate(infantMotherArtDto.getVisitDate());
        infantMotherArt.setMotherArtInitiationTime(infantMotherArtDto.getMotherArtInitiationTime());
        infantMotherArt.setRegimenTypeId(infantMotherArtDto.getRegimenTypeId());
        infantMotherArt.setRegimenId(infantMotherArtDto.getRegimenId());
        infantMotherArt.setUniqueUuid(infantMotherArtDto.getUniqueUuid());
        return infantMotherArt;
    }

    @SneakyThrows
    public InfantVisitationConsolidatedDto  getSingleInfantVisit(Long id) {

        Optional<InfantVisit> infantVisitOptional = infantVisitRepository.findById(id);
        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = new InfantVisitationConsolidatedDto();

        if (infantVisitOptional.isPresent()){
            InfantVisit infantVisit = infantVisitOptional.get();
            infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));

            if (infantVisit.getUuid() != null && StringUtils.hasText(infantVisit.getUuid())) {

                getInfantMotherArtAndInfantArvAndInfantPCRTestByUniqueUuid(infantVisit, infantVisitationConsolidatedDto);
            } else {
                getInfantMotherArtAndInfantArvAndInfantPCRTestByInfantHospitalNumberAndVisitDateAndAncNumber(infantVisitationConsolidatedDto, infantVisit);
            }
        }

        return infantVisitationConsolidatedDto;
    }

    private void getInfantMotherArtAndInfantArvAndInfantPCRTestByUniqueUuid(InfantVisit infantVisit, InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {

        String uniqueUuid = infantVisit.getUniqueUuid();

        Optional<InfantMotherArt> infantMotherArtOptional = this.infantMotherArtRepository.findByUniqueUuid(uniqueUuid);

        if (infantMotherArtOptional.isPresent()) {
            InfantMotherArt infantMotherArt = infantMotherArtOptional.get();
            infantVisitationConsolidatedDto.setInfantMotherArtDto(converRequestDtotoEntity(infantMotherArt));
        }

        Optional<InfantArv> infantArvOptional = this.infantArvRepository.findByUniqueUuid(uniqueUuid);
        if (infantArvOptional.isPresent()) {
            InfantArv infantArv = infantArvOptional.get();
            infantVisitationConsolidatedDto.setInfantArvDto(convertInfantArvEntityToInfantArvDto(infantArv));
        }

        Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findByUniqueUuid(uniqueUuid);
        if (infantPCRTestOptional.isPresent()) {
            InfantPCRTest infantPCRTest = infantPCRTestOptional.get();
            infantVisitationConsolidatedDto.setInfantPCRTestDto(convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTest));
        }
        Optional<InfantRapidAntiBodyTest>  infantRapidTestOptional = this.infantRapidTestRepository.findByUniqueUuid(uniqueUuid);
        if (infantRapidTestOptional.isPresent()) {
            InfantRapidAntiBodyTest infantRapidTest = infantRapidTestOptional.get();
            infantVisitationConsolidatedDto.setInfantRapidAntiBodyTestDto(convertInfantRapidTestEntityToInfantRapidestDto(infantRapidTest));
        }
    }

    private void getInfantMotherArtAndInfantArvAndInfantPCRTestByInfantHospitalNumberAndVisitDateAndAncNumber(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto, InfantVisit infantVisit) {

        String ancNumber = infantVisit.getAncNumber();
        String infantHospitalNumber = infantVisit.getInfantHospitalNumber();
        LocalDate visitDate = infantVisit.getVisitDate();

        infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));

        Optional<InfantMotherArt> infantMotherArtOptional = this.infantMotherArtRepository.findByAncNumberAndVisitDate(ancNumber, visitDate);
        if (infantMotherArtOptional.isPresent()) {
            InfantMotherArt infantMotherArt = infantMotherArtOptional.get();
            infantVisitationConsolidatedDto.setInfantMotherArtDto(converRequestDtotoEntity(infantMotherArt));
        }

        Optional<InfantArv> infantArvOptional = this.infantArvRepository.getByInfantHospitalNumberAndVisitDate(infantHospitalNumber, visitDate);
        if (infantArvOptional.isPresent()) {
            InfantArv infantArv = infantArvOptional.get();
            infantVisitationConsolidatedDto.setInfantArvDto(convertInfantArvEntityToInfantArvDto(infantArv));
        }

        Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findByInfantHospitalNumberAndVisitDate(infantHospitalNumber, visitDate);
        if (infantPCRTestOptional.isPresent()) {
            InfantPCRTest infantPCRTest = infantPCRTestOptional.get();
            infantVisitationConsolidatedDto.setInfantPCRTestDto(convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTest));
        }

    }

    public InfantArvDto getInfantArvByInfantHospitalNumber(String hospitalNumber) {
        InfantArvDto infantArvDto = null;
        Optional<InfantArvDto> infantArvOptional = this.infantArvRepository.getTopByInfantHospitalNumber(hospitalNumber);
        if (infantArvOptional.isPresent()) {
            infantArvDto = infantArvOptional.get();
        }
        return infantArvDto;
    }

    public InfantArvDto getInfantArvByUUID(String personUuid) {
        InfantArvDto infantArvDto = null;
        Optional<InfantArvDto> infantArvDtoOptional = Optional.ofNullable(convertInfantArvEntityToInfantArvDto(infantArvRepository.getTopByUuid(personUuid)));
        if (infantArvDtoOptional.isPresent()) {
            infantArvDto = infantArvDtoOptional.get();
        }
        return infantArvDto;
    }

    public InfantPCRTestDto getInfantPCRTestByInfantHospitalNumber(String hospitalNumber) {
        InfantPCRTestDto infantPCRTestDto = null;
        Optional<InfantPCRTestDto> infantPCRTestOptional = this.infantPCRTestRepository.findTopByInfantHospitalNumber(hospitalNumber);
        if (infantPCRTestOptional.isPresent()) {
            infantPCRTestDto = infantPCRTestOptional.get();
        }
        return infantPCRTestDto;
    }

    public InfantPCRTestDto getInfantPCRTestByUUID(String personUuid) {
        InfantPCRTestDto infantPCRTestDto = null;
        Optional<InfantPCRTestDto> infantPCRTestOptional = Optional.ofNullable(convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTestRepository.getTopByUuid(personUuid)));
        if (infantPCRTestOptional.isPresent()) {
            infantPCRTestDto = infantPCRTestOptional.get();
        }
        return infantPCRTestDto;
    }

    public InfantArvDto convertInfantArvEntityToInfantArvDto(InfantArv infantArv) {
        InfantArvDto infantArvDto = new InfantArvDto();
        infantArvDto.setInfantHospitalNumber(infantArv.getInfantHospitalNumber());
        infantArvDto.setAncNumber(infantArv.getAncNumber());
        infantArvDto.setUuid(infantArv.getUuid());
        infantArvDto.setId(infantArv.getId());
        infantArvDto.setVisitDate(infantArv.getVisitDate());
        infantArvDto.setInfantArvType(infantArv.getInfantArvType());
        infantArvDto.setInfantArvTime(infantArv.getInfantArvTime());
        infantArvDto.setArvDeliveryPoint(infantArv.getArvDeliveryPoint());
        infantArvDto.setAgeAtCtx(infantArv.getAgeAtCtx());
        infantArvDto.setTimingOfAvrAfter72Hours(infantArv.getTimingOfAvrAfter72Hours());
        infantArvDto.setTimingOfAvrWithin72Hours(infantArv.getTimingOfAvrWithin72Hours());
        infantArvDto.setUniqueUuid(infantArv.getUniqueUuid());
        infantArvDto.setDateOfCtx(infantArv.getDateOfCtx());
        infantArvDto.setAgeAtCtx(infantArv.getAgeAtCtx());
        infantArvDto.setDateOfArv(infantArv.getDateOfArv());
        return infantArvDto;
    }



    public InfantPCRTestDto convertInfantPCRTestEntityToInfantPCRTestDto(InfantPCRTest infantPCRTestDto) {
        InfantPCRTestDto infantPCRTest = new InfantPCRTestDto();
        infantPCRTest.setInfantHospitalNumber(infantPCRTestDto.getInfantHospitalNumber());
        infantPCRTest.setAgeAtTest(infantPCRTestDto.getAgeAtTest());
        infantPCRTest.setTestType(infantPCRTestDto.getTestType());
        infantPCRTest.setAncNumber(infantPCRTestDto.getAncNumber());
        infantPCRTest.setResults(infantPCRTestDto.getResults());
        infantPCRTest.setUuid(infantPCRTestDto.getUuid());
        infantPCRTest.setId(infantPCRTestDto.getId());
        infantPCRTest.setVisitDate(infantPCRTestDto.getVisitDate());
        infantPCRTest.setDateResultReceivedAtFacility(infantPCRTestDto.getDateResultReceivedAtFacility());
        infantPCRTest.setDateResultReceivedByCaregiver(infantPCRTestDto.getDateResultReceivedByCaregiver());
        infantPCRTest.setDateSampleCollected(infantPCRTestDto.getDateSampleCollected());
        infantPCRTest.setDateSampleSent(infantPCRTestDto.getDateSampleSent());
        infantPCRTest.setUniqueUuid(infantPCRTestDto.getUniqueUuid());
        return infantPCRTest;
    }

    public InfantRapidAntiBodyTestDto convertInfantRapidTestEntityToInfantRapidestDto(InfantRapidAntiBodyTest infantRapidAntiBodyTest) {
        InfantRapidAntiBodyTestDto infantDTO = new InfantRapidAntiBodyTestDto();
        infantDTO.setId(infantRapidAntiBodyTest.getId());
        infantDTO.setRapidTestType(infantRapidAntiBodyTest.getRapidTestType());
        infantDTO.setAncNumber(infantRapidAntiBodyTest.getAncNumber());
        infantDTO.setAgeAtTest(infantRapidAntiBodyTest.getAgeAtTest());
        infantDTO.setDateOfTest(infantRapidAntiBodyTest.getDateOfTest());
        infantDTO.setResult(infantRapidAntiBodyTest.getResult());
        infantDTO.setUniqueUuid(infantRapidAntiBodyTest.getUniqueUuid());
        return infantDTO;
    }


    public InfantVisitationConsolidatedDto updateInfantVisit(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {

        if (infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId() != null) {
            //System.out.println("CODE WORKING....");
        InfantVisit infantVisit=  this.updateInfantVisit(infantVisitationConsolidatedDto.getInfantVisitRequestDto());
        }
        if(infantVisitationConsolidatedDto.getInfantArvDto().getId() != null) this.updateInfantArv(infantVisitationConsolidatedDto.getInfantArvDto(),buildInfant(infantVisitationConsolidatedDto.getInfantVisitRequestDto()));
        if(infantVisitationConsolidatedDto.getInfantMotherArtDto().getId() != null) this.updateInfantMotherArt(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        if(infantVisitationConsolidatedDto.getInfantPCRTestDto().getId() != null) this.updateInfantPCRTest(infantVisitationConsolidatedDto.getInfantPCRTestDto(),buildInfant(infantVisitationConsolidatedDto.getInfantVisitRequestDto()));
        if(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getId() != null) this.updateInfantRapidTest(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto(),buildInfant(infantVisitationConsolidatedDto.getInfantVisitRequestDto()));

        return  infantVisitationConsolidatedDto;
    }

    private Infant buildInfant(InfantVisitRequestDto infantVisitRequestDto){
        Infant infant = new Infant();
        infant.setMotherPersonUuid(infantVisitRequestDto.getPersonUuid());
        return infant;
    }
    public InfantPCRTest updateInfantPCRTest(InfantPCRTestDto dto,Infant infant){
        InfantPCRTest exist = infantPCRTestRepository
                .findById(dto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantPCRTest.class,"InfantPCRTest not found "));
        exist.setVisitDate(dto.getVisitDate());
        exist.setAgeAtTest(dto.getAgeAtTest());
        exist.setTestType(dto.getTestType());
        exist.setDateSampleCollected(dto.getDateSampleCollected());
        exist.setDateSampleSent(dto.getDateSampleSent());
        exist.setDateResultReceivedAtFacility(dto.getDateResultReceivedAtFacility());
        exist.setDateResultReceivedByCaregiver(dto.getDateResultReceivedByCaregiver());
        exist.setResults(dto.getResults());
//        exist.setUuid(infant.getMotherPersonUuid());
        exist.setUniqueUuid(dto.getUniqueUuid());

       return this.infantPCRTestRepository.save(exist);
    }



    public InfantRapidAntiBodyTest updateInfantRapidTest(InfantRapidAntiBodyTestDto dto,Infant infant){
        InfantRapidAntiBodyTest exist = infantRapidTestRepository.findByUniqueUuid(dto.getUniqueUuid()).orElseThrow(() -> new EntityNotFoundException(InfantPCRTest.class,"Infant Rapid test not found "));
        exist.setRapidTestType(dto.getRapidTestType());
        exist.setAncNumber(dto.getAncNumber());
        exist.setAgeAtTest(dto.getAgeAtTest());
        exist.setDateOfTest(dto.getDateOfTest());
        exist.setResult(dto.getResult());
        exist.setUniqueUuid(dto.getUniqueUuid());

        return this.infantRapidTestRepository.save(exist);
    }

    public InfantVisit updateInfantVisit(InfantVisitRequestDto infantVisitRequestDto) {
       // InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantVisit.class, "InfantVisit_NOT_FOUND_MESSAGE" ));
        InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getId()).get();
        if (exist == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Infant found with id " + infantVisitRequestDto.getId());
        }
        exist.setVisitDate(infantVisitRequestDto.getVisitDate());
        exist.setBodyWeight(infantVisitRequestDto.getBodyWeight());
        exist.setVisitStatus(infantVisitRequestDto.getVisitStatus());
        exist.setUuid(infantVisitRequestDto.getUuid());
        exist.setUniqueUuid(infantVisitRequestDto.getUniqueUuid());
         exist.setCtxStatus(infantVisitRequestDto.getCtxStatus());
        exist.setBreastFeeding(infantVisitRequestDto.getBreastFeeding());
//        System.out.println("=================EXIST==========================");



        Optional<Infant> infants = infantRepository.getInfantByHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
        if (infants.isPresent()) {
            Infant infant = infants.get();
            LocalDate nad = this.calculateNAD(infantVisitRequestDto.getVisitDate());

            infant.setDefaultDays(this.defaultDate(infant.getLastVisitDate(), infantVisitRequestDto.getVisitDate()));
            infant.setLastVisitDate(infantVisitRequestDto.getVisitDate());
            infant.setNextAppointmentDate(nad);
            infantRepository.save(infant);
        }
        this.infantVisitRepository.save(exist);
        return exist;
    }

    public InfantArv updateInfantArv(InfantArvDto infantArvDto,Infant infant){
        InfantArv exist = infantArvRepository
                .findById(infantArvDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantArv.class,"InfantArv not found "));
        exist.setVisitDate(infantArvDto.getVisitDate());
        exist.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        exist.setInfantArvType(infantArvDto.getInfantArvType());
        exist.setInfantArvTime(infantArvDto.getInfantArvTime());
        exist.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        exist.setAgeAtCtx(infantArvDto.getAgeAtCtx());
        exist.setTimingOfAvrAfter72Hours(infantArvDto.getTimingOfAvrAfter72Hours());
        exist.setTimingOfAvrWithin72Hours(infantArvDto.getTimingOfAvrWithin72Hours());
//        exist.setUuid(infant.getMotherPersonUuid());
        exist.setUniqueUuid(infantArvDto.getUniqueUuid());
        exist.setDateOfCtx(infantArvDto.getDateOfCtx());
        exist.setDateOfArv(infantArvDto.getDateOfArv());
       return  this.infantArvRepository.save(exist);
    }


    public void updateInfantMotherArt(InfantMotherArtDto dto){
        InfantMotherArt exist = infantMotherArtRepository
                .findById(dto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantMotherArt.class,"InfantMotherArt not found "));
        exist.setVisitDate(dto.getVisitDate());
        exist.setMotherArtInitiationTime(dto.getMotherArtInitiationTime());
        exist.setRegimenTypeId(dto.getRegimenTypeId());
        exist.setRegimenId(dto.getRegimenId());
        exist.setUniqueUuid(dto.getUniqueUuid());
        this.infantMotherArtRepository.save(exist);
    }

    public void DeleteInfantVisit(Long id) {
        // PmtctVisit existVisit = getExistVisit(id);

        String infantHospitalNumber, ancNumber;
        LocalDate visitDate;

        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = getSingleInfantVisit(id);
        infantHospitalNumber = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber();
        visitDate = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate();
        ancNumber = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber();

        if (infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId() != null) {
            Optional<InfantVisit> infantVisitOptional = this.infantVisitRepository.findById(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId());
            infantVisitOptional.ifPresent(this.infantVisitRepository::delete);
        }

        // Handling DELETE for InfantArv
        Optional<InfantArv> infantArvOptional;
        if (infantVisitationConsolidatedDto.getInfantArvDto() != null && infantVisitationConsolidatedDto.getInfantArvDto().getUniqueUuid() != null && StringUtils.hasText(infantVisitationConsolidatedDto.getInfantArvDto().getUniqueUuid())) {
            infantArvOptional = this.infantArvRepository.findByUniqueUuid(infantVisitationConsolidatedDto.getInfantArvDto().getUniqueUuid());
        } else {
            infantArvOptional = this.infantArvRepository.getByInfantHospitalNumberAndVisitDate(infantHospitalNumber, visitDate);
        }
        infantArvOptional.ifPresent(this.infantArvRepository::delete);


        // Handling DELETE for InfantMotherArt
        Optional<InfantMotherArt> infantMotherArtOptional;
        if (infantVisitationConsolidatedDto.getInfantMotherArtDto() != null && infantVisitationConsolidatedDto.getInfantMotherArtDto().getUniqueUuid() != null && StringUtils.hasText(infantVisitationConsolidatedDto.getInfantMotherArtDto().getUniqueUuid())) {
            infantMotherArtOptional = this.infantMotherArtRepository.findByUniqueUuid(infantVisitationConsolidatedDto.getInfantMotherArtDto().getUniqueUuid());
        } else {
            infantMotherArtOptional = this.infantMotherArtRepository.findByAncNumberAndVisitDate(ancNumber, visitDate);
        }
        infantMotherArtOptional.ifPresent(this.infantMotherArtRepository::delete);


        // Handling DELETE for InfantPCRTest
        Optional<InfantPCRTest> infantPCRTestOptional;
        if (infantVisitationConsolidatedDto.getInfantPCRTestDto() != null && infantVisitationConsolidatedDto.getInfantPCRTestDto().getUniqueUuid() != null && StringUtils.hasText(infantVisitationConsolidatedDto.getInfantPCRTestDto().getUniqueUuid())) {
            infantPCRTestOptional = this.infantPCRTestRepository.findByUniqueUuid(infantVisitationConsolidatedDto.getInfantPCRTestDto().getUniqueUuid());
        } else {
            infantPCRTestOptional = this.infantPCRTestRepository.findByInfantHospitalNumberAndVisitDate(infantHospitalNumber, visitDate);
        }
        infantPCRTestOptional.ifPresent(this.infantPCRTestRepository::delete);



        // Handling DELETE for InfantRapidTest
        Optional<InfantRapidAntiBodyTest> infantRapidOptional;
        if (infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto() != null && infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getUniqueUuid() != null && StringUtils.hasText(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getUniqueUuid())) {
            infantRapidOptional = this.infantRapidTestRepository.findByUniqueUuid(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getUniqueUuid());
        } else {
            infantRapidOptional = this.infantRapidTestRepository.findById(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getId());
        }
        infantRapidOptional.ifPresent(this.infantRapidTestRepository::delete);
    }

    public void deleteInfantArv(Long id){
        Optional<InfantArv> infantArvOptional = this.infantArvRepository.findById(id);
        infantArvOptional.ifPresent(infantArvRepository::delete);
    }

    public void deleteInfantPCRTestDt(Long id){
        Optional<InfantPCRTest> infantArvOptional = this.infantPCRTestRepository.findById(id);
        infantArvOptional.ifPresent(infantPCRTestRepository::delete);
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


}
