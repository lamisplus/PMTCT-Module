package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
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
                Period period = Period.between(dob, curDate);
                age = (period.getYears()*12)+ period.getMonths();
            } else {
                age = 0;
            }
        }
        // System.out.println("Age " + age);
        return age;
    }

    @SneakyThrows
    public InfantVisit getSingleInfantVisit(Long id) {
        return this.infantVisitRepository.findById(id)
                .orElseThrow(() -> new Exception("InfantVisit NOT FOUND"));
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
        infantMotherArt.setMotherArtRegimen(infantMotherArtDto.getMotherArtRegimen());
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
        if (!(infantVisitationConsolidatedDto.getInfantPCRTestDto().getAncNumber().equalsIgnoreCase("string")))
        {
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantMotherArtDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());

            this.save(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        }
        if (!(infantVisitationConsolidatedDto.getInfantArvDto().getAncNumber().equalsIgnoreCase("string"))) {
            infantVisitationConsolidatedDto.getInfantArvDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantArvDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantArvDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());
            this.save(infantVisitationConsolidatedDto.getInfantArvDto());
        }
        if (!(infantVisitationConsolidatedDto.getInfantPCRTestDto().getAncNumber().equalsIgnoreCase("string"))){
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());

            this.save(infantVisitationConsolidatedDto.getInfantPCRTestDto());
        }
        return infantVisitationConsolidatedDto;
    }
}
