package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class InfantVisitService
{
    private final InfantVisitRepository infantVisitRepository;
    private final InfantRepository infantRepository;
    private  final InfantPCRTestRepository infantPCRTestRepository;
    private final InfantArvRepository infantArvRepository;

    private final DeliveryRepository deliveryRepository;

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

    public InfantArv converRequestDtotoEntity(InfantArvDto infantArvDto) {
        InfantArv infantArv = new InfantArv();
        infantArv.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        infantArv.setAncNumber(infantArvDto.getAncNumber());
        infantArv.setUuid(UUID.randomUUID().toString());
        infantArv.setVisitDate(infantArvDto.getVisitDate());
        infantArv.setInfantArvType(infantArvDto.getInfantArvType());
        infantArv.setInfantArvTime(infantArvDto.getInfantArvTime());
        infantArv.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        infantArv.setAgeAtCtx(infantArvDto.getAgeAtCtx());

        return this.infantArvRepository.save(infantArv);
    }
    public InfantPCRTest converRequestDtotoEntity(InfantPCRTestDto infantPCRTestDto) {
        InfantPCRTest infantPCRTest = new InfantPCRTest();
        infantPCRTest.setInfantHospitalNumber(infantPCRTestDto.getInfantHospitalNumber());
        infantPCRTest.setAgeAtTest(infantPCRTestDto.getAgeAtTest());
        infantPCRTest.setTestType(infantPCRTestDto.getTestType());
        infantPCRTest.setAncNumber(infantPCRTestDto.getAncNumber());
        infantPCRTest.setResults(infantPCRTestDto.getResults());
        infantPCRTest.setUuid(UUID.randomUUID().toString());
        infantPCRTest.setVisitDate(infantPCRTestDto.getVisitDate());
        infantPCRTest.setDateResultReceivedAtFacility(infantPCRTestDto.getDateResultReceivedAtFacility());
        infantPCRTest.setDateResultReceivedByCaregiver(infantPCRTestDto.getDateResultReceivedByCaregiver());
        infantPCRTest.setDateSampleCollected(infantPCRTestDto.getDateSampleCollected());
        infantPCRTest.setDateSampleSent(infantPCRTestDto.getDateSampleSent());
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

        return this.infantVisitRepository.save(infantVisit);
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

    public InfantVisitationConsolidatedDto saveConsolidation (InfantVisitationConsolidatedDto infantVisitationConsolidatedDto)
    {
        this.save(infantVisitationConsolidatedDto.getInfantVisitRequestDto());
        if ((infantVisitationConsolidatedDto.getInfantMotherArtDto().getMotherArtInitiationTime()!= null))
        {
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());

            this.save(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        }
        if ((infantVisitationConsolidatedDto.getInfantArvDto().getInfantArvType() != null)) {
            infantVisitationConsolidatedDto.getInfantArvDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantArvDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantArvDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());
            this.save(infantVisitationConsolidatedDto.getInfantArvDto());
        }
        if ((infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType() != null)){
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());

            this.save(infantVisitationConsolidatedDto.getInfantPCRTestDto());
        }
        return infantVisitationConsolidatedDto;
    }

    public FormFilterResponseDto getFormFilter(String hospitalNumber){
        FormFilterResponseDto filterResponseDto = new FormFilterResponseDto();
        filterResponseDto.setInfantArv(this.infantArvAdministered(hospitalNumber));
        Optional<Infant> infants = this.infantRepository.findInfantByHospitalNumber(hospitalNumber);

        //Optional<Delivery> deliveryOptional = this.deliveryRepository.findDeliveryByHospitalNumber(hospitalNumber);
        if (infants.isPresent()){
            filterResponseDto.setMotherArt(this.infantMotherArtDetailsCaptured(infants.get().getAncNo()));
        }
        else filterResponseDto.setMotherArt(Boolean.FALSE);
        int infantAge = this.calculateAge(hospitalNumber);
        if(infantAge>= 18) filterResponseDto.setOutCome(Boolean.TRUE);
        else filterResponseDto.setOutCome(Boolean.FALSE);
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
        return infantMotherArt;
    }

    @SneakyThrows
    public InfantVisitationConsolidatedDto  getSingleInfantVisit(Long id) {
        Optional<InfantVisit> infantVisitOptional = infantVisitRepository.findById(id);
        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = new InfantVisitationConsolidatedDto();
        if (infantVisitOptional.isPresent()){
            InfantVisit infantVisit = infantVisitOptional.get();
            infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));
            Optional<InfantMotherArt> infantMotherArtOptional = this.infantMotherArtRepository.findByAncNumberAndVisitDate(infantVisit.getAncNumber(), infantVisit.getVisitDate());
            if(infantMotherArtOptional.isPresent()) {
                InfantMotherArt infantMotherArt = infantMotherArtOptional.get();
                infantVisitationConsolidatedDto.setInfantMotherArtDto(converRequestDtotoEntity(infantMotherArt));
            }

            Optional<InfantArv> infantArvOptional = this.infantArvRepository.getByInfantHospitalNumberAndVisitDate(infantVisit.getInfantHospitalNumber(), infantVisit.getVisitDate());
            if(infantArvOptional.isPresent()) {
                InfantArv infantArv = infantArvOptional.get();
                infantVisitationConsolidatedDto.setInfantArvDto(converRequestDtotoEntity(infantArv));
            }

            Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findByInfantHospitalNumberAndVisitDate(infantVisit.getInfantHospitalNumber(), infantVisit.getVisitDate());
            if(infantPCRTestOptional.isPresent()) {
                InfantPCRTest infantPCRTest = infantPCRTestOptional.get();
                infantVisitationConsolidatedDto.setInfantPCRTestDto(converRequestDtotoEntity(infantPCRTest));
            }
        }
        return infantVisitationConsolidatedDto;
    }

    public InfantArvDto  converRequestDtotoEntity(InfantArv infantArvDto) {
    InfantArvDto infantArv = new InfantArvDto();
        infantArv.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        infantArv.setAncNumber(infantArvDto.getAncNumber());
        infantArv.setUuid(infantArvDto.getUuid());
        infantArv.setId(infantArvDto.getId());
        infantArv.setVisitDate(infantArvDto.getVisitDate());
        infantArv.setInfantArvType(infantArvDto.getInfantArvType());
        infantArv.setInfantArvTime(infantArvDto.getInfantArvTime());
        infantArv.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        infantArv.setAgeAtCtx(infantArvDto.getAgeAtCtx());

        return infantArv;
    }

    public InfantPCRTestDto converRequestDtotoEntity(InfantPCRTest infantPCRTestDto) {
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
        return infantPCRTest;
    }

    public InfantVisitationConsolidatedDto updateInfantVisit(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {
        System.out.println(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId());
        System.out.println(infantVisitationConsolidatedDto.getInfantArvDto().getId());
        //saveConsolidation(infantVisitationConsolidatedDto)
        System.out.println(infantVisitationConsolidatedDto.getInfantMotherArtDto().getId());
        System.out.println(infantVisitationConsolidatedDto.getInfantPCRTestDto().getId());
        if(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId() != null) this.updateInfantVisit(infantVisitationConsolidatedDto.getInfantVisitRequestDto());
        if(infantVisitationConsolidatedDto.getInfantArvDto().getId() != null) this.updateInfantArv(infantVisitationConsolidatedDto.getInfantArvDto());
        if(infantVisitationConsolidatedDto.getInfantMotherArtDto().getId() != null) this.updateInfantMotherArt(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        if(infantVisitationConsolidatedDto.getInfantPCRTestDto().getId() != null) this.updateInfantPCRTest(infantVisitationConsolidatedDto.getInfantPCRTestDto());

        return  infantVisitationConsolidatedDto;
    }
    public void updateInfantPCRTest(InfantPCRTestDto dto){
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

        this.infantPCRTestRepository.save(exist);
    }



    public void updateInfantVisit(InfantVisitRequestDto infantVisitRequestDto) {
        InfantVisit exist = infantVisitRepository
                .findById(infantVisitRequestDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantVisit.class, "InfantVisit_NOT_FOUND_MESSAGE" ));
        exist.setVisitDate(infantVisitRequestDto.getVisitDate());
        exist.setBodyWeight(infantVisitRequestDto.getBodyWeight());
        exist.setVisitStatus(infantVisitRequestDto.getVisitStatus());
        exist.setCtxStatus(infantVisitRequestDto.getCtxStatus());
        exist.setBreastFeeding(infantVisitRequestDto.getBreastFeeding());
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
       this.infantVisitRepository.save(exist);

    }

    public void updateInfantArv(InfantArvDto infantArvDto){
        InfantArv exist = infantArvRepository
                .findById(infantArvDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantArv.class,"InfantArv not found "));
        exist.setVisitDate(infantArvDto.getVisitDate());
        exist.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        exist.setInfantArvType(infantArvDto.getInfantArvType());
        exist.setInfantArvTime(infantArvDto.getInfantArvTime());
        exist.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        exist.setAgeAtCtx(infantArvDto.getAgeAtCtx());
        this.infantArvRepository.save(exist);
    }


    public void updateInfantMotherArt(InfantMotherArtDto dto){
        InfantMotherArt exist = infantMotherArtRepository
                .findById(dto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantMotherArt.class,"InfantMotherArt not found "));
        exist.setVisitDate(dto.getVisitDate());
        exist.setMotherArtInitiationTime(dto.getMotherArtInitiationTime());
        exist.setRegimenTypeId(dto.getRegimenTypeId());
        exist.setRegimenId(dto.getRegimenId());
        this.infantMotherArtRepository.save(exist);
    }

    public void DeleteInfantVisit(Long id) {
        // PmtctVisit existVisit = getExistVisit(id);
         InfantVisitationConsolidatedDto infantVisitationConsolidatedDto =getSingleInfantVisit(id);
        if(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId() != null){
            Optional<InfantVisit> infantVisitOptional = this.infantVisitRepository.findById(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId());
            if(infantVisitOptional.isPresent()) infantVisitRepository.delete(infantVisitOptional.get());
        }
        if(infantVisitationConsolidatedDto.getInfantArvDto().getId() != null){
            Optional<InfantArv> infantArvOptional = this.infantArvRepository.findById(infantVisitationConsolidatedDto.getInfantArvDto().getId());;
            if(infantArvOptional.isPresent()) infantArvRepository.delete(infantArvOptional.get());
        }
        if(infantVisitationConsolidatedDto.getInfantMotherArtDto().getId() != null) {
            Optional<InfantMotherArt> infantMotherArtOptional = this.infantMotherArtRepository.findById(infantVisitationConsolidatedDto.getInfantMotherArtDto().getId());
            if(infantMotherArtOptional.isPresent()) infantMotherArtRepository.delete(infantMotherArtOptional.get());
        }
        if(infantVisitationConsolidatedDto.getInfantPCRTestDto().getId() != null) {
            Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findById(infantVisitationConsolidatedDto.getInfantPCRTestDto().getId());
            if(infantPCRTestOptional.isPresent()) infantPCRTestRepository.delete(infantPCRTestOptional.get());
        }

        //return infantVisitationConsolidatedDto;
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
