package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
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
    private final InfantMotherArtRepository infantMotherArtRepository;
    private final UserService userService;

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
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantRapid.setRapidTestType(infantRapidDto.getRapidTestType());
        infantRapid.setAncNumber(infantRapidDto.getAncNumber());
        infantRapid.setAgeAtTest(infantRapidDto.getAgeAtTest());
        infantRapid.setDateOfTest(infantRapidDto.getDateOfTest());
        infantRapid.setResult(infantRapidDto.getResult());
        infantRapid.setUuid(UUID.randomUUID().toString());
        infantRapid.setUniqueUuid(infantRapidDto.getUniqueUuid());
        infantRapid.setPmtctCycleId(infantRapidDto.getPmtctCycleId());
        infantRapid.setMotherPersonUuid(infantRapidDto.getMotherPersonUuid());
        infantRapid.setArchived(0L);
        infantRapid.setFacilityId(facilityId);
        infantRapid.setCreatedBy(user.getUserName());
        infantRapid.setLastModifiedBy(user.getUserName());
        infantRapid.setCreatedDate(java.time.LocalDateTime.now());
        infantRapid.setLastModifiedDate(java.time.LocalDateTime.now());

        return this.infantRapidTestRepository.save(infantRapid);
    }

    public InfantRapidAntiBodyTest converRequestDtotoEntity(InfantRapidAntiBodyTestDto infantRapidDto, String motherPersonUuid) {
        InfantRapidAntiBodyTest infantRapid  = new InfantRapidAntiBodyTest();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantRapid.setRapidTestType(infantRapidDto.getRapidTestType());
        infantRapid.setAncNumber(infantRapidDto.getAncNumber());
        infantRapid.setAgeAtTest(infantRapidDto.getAgeAtTest());
        infantRapid.setDateOfTest(infantRapidDto.getDateOfTest());
        infantRapid.setResult(infantRapidDto.getResult());
        infantRapid.setUuid(UUID.randomUUID().toString());
        infantRapid.setUniqueUuid(infantRapidDto.getUniqueUuid());
        infantRapid.setPmtctCycleId(infantRapidDto.getPmtctCycleId());
        infantRapid.setMotherPersonUuid(motherPersonUuid);
        infantRapid.setArchived(0L);
        infantRapid.setFacilityId(facilityId);
        infantRapid.setCreatedBy(user.getUserName());
        infantRapid.setLastModifiedBy(user.getUserName());
        infantRapid.setCreatedDate(java.time.LocalDateTime.now());
        infantRapid.setLastModifiedDate(java.time.LocalDateTime.now());
        infantRapid.setSource(infantRapidDto.getSource());

        return this.infantRapidTestRepository.save(infantRapid);
    }


    public InfantArv converRequestDtotoEntity(InfantArvDto infantArvDto) {
        InfantArv infantArv = new InfantArv();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

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
        infantArv.setOtherProphylaxisType(infantArvDto.getOtherProphylaxisType());
        infantArv.setPmtctCycleId(infantArvDto.getPmtctCycleId());
        infantArv.setMotherPersonUuid(infantArvDto.getMotherPersonUuid());
        infantArv.setArchived(0L);
        infantArv.setFacilityId(facilityId);
        infantArv.setCreatedBy(user.getUserName());
        infantArv.setLastModifiedBy(user.getUserName());
        infantArv.setCreatedDate(java.time.LocalDateTime.now());
        infantArv.setLastModifiedDate(java.time.LocalDateTime.now());

        return this.infantArvRepository.save(infantArv);
    }

    public InfantArv converRequestDtotoEntity(InfantArvDto infantArvDto, String motherPersonUuid) {
        InfantArv infantArv = new InfantArv();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantArv.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        infantArv.setAncNumber(infantArvDto.getAncNumber());
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
        infantArv.setOtherProphylaxisType(infantArvDto.getOtherProphylaxisType());
        infantArv.setPmtctCycleId(infantArvDto.getPmtctCycleId());
        infantArv.setMotherPersonUuid(motherPersonUuid);
        infantArv.setArchived(0L);
        infantArv.setFacilityId(facilityId);
        infantArv.setCreatedBy(user.getUserName());
        infantArv.setLastModifiedBy(user.getUserName());
        infantArv.setCreatedDate(java.time.LocalDateTime.now());
        infantArv.setLastModifiedDate(java.time.LocalDateTime.now());
        infantArv.setSource(infantArvDto.getSource());

        return this.infantArvRepository.save(infantArv);
    }
    public InfantPCRTest converRequestDtotoEntity(InfantPCRTestDto infantPCRTestDto) {
        // Check for duplicate test type per infant
        if (infantPCRTestDto.getInfantHospitalNumber() != null && infantPCRTestDto.getTestType() != null) {
            boolean exists = infantPCRTestRepository.existsByInfantHospitalNumberAndTestType(
                    infantPCRTestDto.getInfantHospitalNumber(), infantPCRTestDto.getTestType());
            if (exists) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A PCR test of this type has already been documented for this infant");
            }
        }

        InfantPCRTest infantPCRTest = new InfantPCRTest();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

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
        infantPCRTest.setPmtctCycleId(infantPCRTestDto.getPmtctCycleId());
        infantPCRTest.setMotherPersonUuid(infantPCRTestDto.getMotherPersonUuid());
        infantPCRTest.setArchived(0L);
        infantPCRTest.setFacilityId(facilityId);
        infantPCRTest.setCreatedBy(user.getUserName());
        infantPCRTest.setLastModifiedBy(user.getUserName());
        infantPCRTest.setCreatedDate(java.time.LocalDateTime.now());
        infantPCRTest.setLastModifiedDate(java.time.LocalDateTime.now());
        infantPCRTest.setSource(infantPCRTestDto.getSource());

        return this.infantPCRTestRepository.save(infantPCRTest);
    }

    public InfantPCRTest converRequestDtotoEntity(InfantPCRTestDto infantPCRTestDto, String motherPersonUuid) {
        // Check for duplicate test type per infant
        if (infantPCRTestDto.getInfantHospitalNumber() != null && infantPCRTestDto.getTestType() != null) {
            boolean exists = infantPCRTestRepository.existsByInfantHospitalNumberAndTestType(
                    infantPCRTestDto.getInfantHospitalNumber(), infantPCRTestDto.getTestType());
            if (exists) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A PCR test of this type has already been documented for this infant");
            }
        }

        InfantPCRTest infantPCRTest = new InfantPCRTest();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantPCRTest.setInfantHospitalNumber(infantPCRTestDto.getInfantHospitalNumber());
        infantPCRTest.setAgeAtTest(infantPCRTestDto.getAgeAtTest());
        infantPCRTest.setTestType(infantPCRTestDto.getTestType());
        infantPCRTest.setAncNumber(infantPCRTestDto.getAncNumber());
        infantPCRTest.setResults(infantPCRTestDto.getResults());
        infantPCRTest.setUuid(infantPCRTestDto.getUuid());
        infantPCRTest.setVisitDate(infantPCRTestDto.getVisitDate());
        infantPCRTest.setDateResultReceivedAtFacility(infantPCRTestDto.getDateResultReceivedAtFacility());
        infantPCRTest.setDateResultReceivedByCaregiver(infantPCRTestDto.getDateResultReceivedByCaregiver());
        infantPCRTest.setDateSampleCollected(infantPCRTestDto.getDateSampleCollected());
        infantPCRTest.setDateSampleSent(infantPCRTestDto.getDateSampleSent());
        infantPCRTest.setUniqueUuid(infantPCRTestDto.getUniqueUuid());
        infantPCRTest.setPmtctCycleId(infantPCRTestDto.getPmtctCycleId());
        infantPCRTest.setMotherPersonUuid(motherPersonUuid);
        infantPCRTest.setArchived(0L);
        infantPCRTest.setFacilityId(facilityId);
        infantPCRTest.setCreatedBy(user.getUserName());
        infantPCRTest.setLastModifiedBy(user.getUserName());
        infantPCRTest.setCreatedDate(java.time.LocalDateTime.now());
        infantPCRTest.setLastModifiedDate(java.time.LocalDateTime.now());
        infantPCRTest.setSource(infantPCRTestDto.getSource());

        return this.infantPCRTestRepository.save(infantPCRTest);
    }
    public InfantVisit converRequestDtotoEntity(InfantVisitRequestDto infantVisitRequestDto) {
        InfantVisit infantVisit = new InfantVisit();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantVisit.setVisitDate(infantVisitRequestDto.getVisitDate());
        infantVisit.setInfantHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
        infantVisit.setAncNumber(infantVisitRequestDto.getAncNumber());
        infantVisit.setBodyWeight(infantVisitRequestDto.getBodyWeight());
        infantVisit.setVisitStatus(infantVisitRequestDto.getVisitStatus());
        infantVisit.setCtxStatus(infantVisitRequestDto.getCtxStatus());
        infantVisit.setBreastFeeding(infantVisitRequestDto.getBreastFeeding());
        infantVisit.setMotherPersonUuid(infantVisitRequestDto.getPersonUuid());
        infantVisit.setFacilityId(facilityId);
        infantVisit.setCreatedBy(user.getUserName());
        infantVisit.setLastModifiedBy(user.getUserName());
        infantVisit.setCreatedDate(java.time.LocalDateTime.now());
        infantVisit.setLastModifiedDate(java.time.LocalDateTime.now());

        try{
            Optional<Infant> infants = infantRepository.getInfantByHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
            if(infants.isPresent()){
                Infant infant = infants.get();
                LocalDate nad = this.calculateNAD(infantVisitRequestDto.getVisitDate());

                infant.setDefaultDays(this.defaultDate(infant.getLastVisitDate(), infantVisitRequestDto.getVisitDate()));
                infant.setLastVisitDate(infantVisitRequestDto.getVisitDate());
                infant.setNextAppointmentDate(nad);
                infant.setLastModifiedDate(java.time.LocalDateTime.now());
                infant.setLastModifiedBy(user.getUserName());
                infantRepository.save(infant);

            }
        }catch(Exception e) {}

        //infantVisit.setAgeAtCtx(infantVisitRequestDto.getAgeAtCtx());
        infantVisit.setUuid(UUID.randomUUID().toString());
        infantVisit.setUniqueUuid(infantVisitRequestDto.getUniqueUuid());
        infantVisit.setPmtctCycleId(infantVisitRequestDto.getPmtctCycleId());
        infantVisit.setArchived(0L);
        infantVisit.setSource(infantVisitRequestDto.getSource());

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
        infantVisitResponseDto.setPmtctCycleId(infantVisit.getPmtctCycleId());

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
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantMotherArt.setAncNumber(infantMotherArtDto.getAncNumber());
        infantMotherArt.setUuid(UUID.randomUUID().toString());
        infantMotherArt.setVisitDate(infantMotherArtDto.getVisitDate());
        infantMotherArt.setMotherArtInitiationTime(infantMotherArtDto.getMotherArtInitiationTime());
        infantMotherArt.setRegimenTypeId(infantMotherArtDto.getRegimenTypeId());
        infantMotherArt.setRegimenId(infantMotherArtDto.getRegimenId());
        infantMotherArt.setUniqueUuid(infantMotherArtDto.getUniqueUuid());
        infantMotherArt.setPmtctCycleId(infantMotherArtDto.getPmtctCycleId());
        infantMotherArt.setMotherPersonUuid(infantMotherArtDto.getMotherPersonUuid());
        infantMotherArt.setArchived(0L);
        infantMotherArt.setFacilityId(facilityId);
        infantMotherArt.setCreatedBy(user.getUserName());
        infantMotherArt.setLastModifiedBy(user.getUserName());
        infantMotherArt.setCreatedDate(java.time.LocalDateTime.now());
        infantMotherArt.setLastModifiedDate(java.time.LocalDateTime.now());
        return this.infantMotherArtRepository.save(infantMotherArt);
    }

    public InfantMotherArt converRequestDtotoEntity(InfantMotherArtDto infantMotherArtDto, String motherPersonUuid) {
        InfantMotherArt infantMotherArt = new InfantMotherArt();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        infantMotherArt.setAncNumber(infantMotherArtDto.getAncNumber());
        infantMotherArt.setUuid(UUID.randomUUID().toString());
        infantMotherArt.setVisitDate(infantMotherArtDto.getVisitDate());
        infantMotherArt.setMotherArtInitiationTime(infantMotherArtDto.getMotherArtInitiationTime());
        infantMotherArt.setRegimenTypeId(infantMotherArtDto.getRegimenTypeId());
        infantMotherArt.setRegimenId(infantMotherArtDto.getRegimenId());
        infantMotherArt.setUniqueUuid(infantMotherArtDto.getUniqueUuid());
        infantMotherArt.setPmtctCycleId(infantMotherArtDto.getPmtctCycleId());
        infantMotherArt.setMotherPersonUuid(motherPersonUuid);
        infantMotherArt.setArchived(0L);
        infantMotherArt.setFacilityId(facilityId);
        infantMotherArt.setCreatedBy(user.getUserName());
        infantMotherArt.setLastModifiedBy(user.getUserName());
        infantMotherArt.setCreatedDate(java.time.LocalDateTime.now());
        infantMotherArt.setLastModifiedDate(java.time.LocalDateTime.now());
        infantMotherArt.setSource(infantMotherArtDto.getSource());
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

    @Transactional
    public InfantVisitationConsolidatedDto saveConsolidation (InfantVisitationConsolidatedDto infantVisitationConsolidatedDto, InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto)
    {
        // Prevent duplicate visit date for the same infant
        String infantHospitalNumber = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber();
        LocalDate visitDate = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate();
        if (infantHospitalNumber != null && visitDate != null
                && this.infantVisitRepository.existsByInfantHospitalNumberAndVisitDate(infantHospitalNumber, visitDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An infant visit already exists for this infant on " + visitDate + ". Please select a different date.");
        }

        infantVisitationConsolidatedDto.getInfantVisitRequestDto().setUniqueUuid(UUID.randomUUID().toString());
        infantVisitationConsolidatedDto.getInfantVisitRequestDto().setSource(infantVisitationConsolidatedDto.getSource());

        InfantVisitResponseDto infantVisitResponseDto =  this.save(infantVisitationConsolidatedDto.getInfantVisitRequestDto());
        String motherPersonUuid = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getPersonUuid();
        System.out.println("test case" + " " + motherPersonUuid);


        // Mother's ART: save only if all 3 required fields are present
        if (infantVisitationConsolidatedDto.getInfantMotherArtDto() != null) {
            String artTime = infantVisitationConsolidatedDto.getInfantMotherArtDto().getMotherArtInitiationTime();
            Long regimenTypeId = infantVisitationConsolidatedDto.getInfantMotherArtDto().getRegimenTypeId();
            Long regimenId = infantVisitationConsolidatedDto.getInfantMotherArtDto().getRegimenId();

            boolean hasArtTime = artTime != null && !artTime.isEmpty();
            boolean hasRegimenType = regimenTypeId != null;
            boolean hasRegimen = regimenId != null;

            if (hasArtTime || hasRegimenType || hasRegimen) {
                if (!(hasArtTime && hasRegimenType && hasRegimen)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Mother's ART section requires all three fields: Timing of ART Initiation, Original Regimen Line, and Original Regimen");
                }
                infantVisitationConsolidatedDto.getInfantMotherArtDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
                infantVisitationConsolidatedDto.getInfantMotherArtDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
                infantVisitationConsolidatedDto.getInfantMotherArtDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
                infantVisitationConsolidatedDto.getInfantMotherArtDto().setMotherPersonUuid(motherPersonUuid);
                infantVisitationConsolidatedDto.getInfantMotherArtDto().setSource(infantVisitationConsolidatedDto.getSource());

                this.converRequestDtotoEntity(infantVisitationConsolidatedDto.getInfantMotherArtDto(), motherPersonUuid);
            }
        }

        // Infant ARV: save only if infantArvType is present and not empty
        if (infantVisitationConsolidatedDto.getInfantArvDto() != null) {
            String arvType = infantVisitationConsolidatedDto.getInfantArvDto().getInfantArvType();
            if (arvType != null && !arvType.isEmpty()) {
                infantVisitationConsolidatedDto.getInfantArvDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
                infantVisitationConsolidatedDto.getInfantArvDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
                infantVisitationConsolidatedDto.getInfantArvDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
                infantVisitationConsolidatedDto.getInfantArvDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());
                infantVisitationConsolidatedDto.getInfantArvDto().setMotherPersonUuid(motherPersonUuid);
                infantVisitationConsolidatedDto.getInfantArvDto().setSource(infantVisitationConsolidatedDto.getSource());

                this.converRequestDtotoEntity(infantVisitationConsolidatedDto.getInfantArvDto(), motherPersonUuid);
            }
        }

        // Infant PCR: save only if testType is present and not empty
        if (infantVisitationConsolidatedDto.getInfantPCRTestDto() != null
                && infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType() != null
                && !infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType().isEmpty()) {
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setAncNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getAncNumber());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setVisitDate(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getVisitDate());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setInfantHospitalNumber(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber());
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setMotherPersonUuid(motherPersonUuid);
            infantVisitationConsolidatedDto.getInfantPCRTestDto().setSource(infantVisitationConsolidatedDto.getSource());

            this.converRequestDtotoEntity(infantVisitationConsolidatedDto.getInfantPCRTestDto(), motherPersonUuid);
        }

        // Rapid test: save only if result is present and not empty
        if (infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto() != null) {
            String result = infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getResult();
            if (result != null && !result.isEmpty()) {
                infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setUniqueUuid(infantVisitResponseDto.getUniqueUuid());
                infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setAncNumber(infantVisitResponseDto.getAncNumber());
                infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setMotherPersonUuid(motherPersonUuid);
                infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().setSource(infantVisitationConsolidatedDto.getSource());

                this.converRequestDtotoEntity(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto(), motherPersonUuid);
            }
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
        infantMotherArt.setPmtctCycleId(infantMotherArtDto.getPmtctCycleId());
        infantMotherArt.setMotherPersonUuid(infantMotherArtDto.getMotherPersonUuid());
        return infantMotherArt;
    }

    @SneakyThrows
    public InfantVisitationConsolidatedDto  getSingleInfantVisit(Long id) {

        Optional<InfantVisit> infantVisitOptional = infantVisitRepository.findById(id);
        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = new InfantVisitationConsolidatedDto();

        if (infantVisitOptional.isPresent()){
            InfantVisit infantVisit = infantVisitOptional.get();
            infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));

            if (infantVisit.getUniqueUuid() != null && StringUtils.hasText(infantVisit.getUniqueUuid())) {
                getInfantMotherArtAndInfantArvAndInfantPCRTestByUniqueUuid(infantVisit, infantVisitationConsolidatedDto);
            } else {
                getInfantMotherArtAndInfantArvAndInfantPCRTestByInfantHospitalNumberAndVisitDateAndAncNumber(infantVisitationConsolidatedDto, infantVisit);
            }
        }

        return infantVisitationConsolidatedDto;
    }

    private void getInfantMotherArtAndInfantArvAndInfantPCRTestByUniqueUuid(InfantVisit infantVisit, InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {

        String uniqueUuid = infantVisit.getUniqueUuid();
        String infantHospitalNumber = infantVisit.getInfantHospitalNumber();
        LocalDate visitDate = infantVisit.getVisitDate();
        String ancNumber = infantVisit.getAncNumber();
        String motherPersonUuid = infantVisit.getMotherPersonUuid();

        // Mother's ART: use anc_number if available, else fallback to unique_uuid + visit_date only
        InfantMotherArt infantMotherArt;
        if (ancNumber != null && StringUtils.hasText(ancNumber)) {
            infantMotherArt = this.infantMotherArtRepository.getByUniqueUuidAndAncNumberAndVisitDate(uniqueUuid, ancNumber, visitDate);
        } else {
            infantMotherArt = this.infantMotherArtRepository.getByUniqueUuidAndVisitDate(uniqueUuid, visitDate);
        }
        if (infantMotherArt != null) {
            infantVisitationConsolidatedDto.setInfantMotherArtDto(converRequestDtotoEntity(infantMotherArt));
        }

        // ARV: unique_uuid + infant_hospital_number + visit_date
        InfantArv infantArv = this.infantArvRepository.getByUniqueUuidAndHospitalNumberAndVisitDate(uniqueUuid, infantHospitalNumber, visitDate);
        if (infantArv != null) {
            infantVisitationConsolidatedDto.setInfantArvDto(convertInfantArvEntityToInfantArvDto(infantArv));
        }

        // PCR: unique_uuid + infant_hospital_number + visit_date
        InfantPCRTest infantPCRTest = this.infantPCRTestRepository.getByUniqueUuidAndHospitalNumberAndVisitDate(uniqueUuid, infantHospitalNumber, visitDate);
        if (infantPCRTest != null) {
            infantVisitationConsolidatedDto.setInfantPCRTestDto(convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTest));
        }

        // Rapid Test: unique_uuid + mother_person_uuid (no infant_hospital_number or visit_date on this table)
        InfantRapidAntiBodyTest infantRapidTest = this.infantRapidTestRepository.getByUniqueUuidAndMotherPersonUuid(uniqueUuid, motherPersonUuid);
        if (infantRapidTest != null) {
            infantVisitationConsolidatedDto.setInfantRapidAntiBodyTestDto(convertInfantRapidTestEntityToInfantRapidestDto(infantRapidTest));
        }
    }

    private void getInfantMotherArtAndInfantArvAndInfantPCRTestByInfantHospitalNumberAndVisitDateAndAncNumber(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto, InfantVisit infantVisit) {

        String ancNumber = infantVisit.getAncNumber();
        String infantHospitalNumber = infantVisit.getInfantHospitalNumber();
        LocalDate visitDate = infantVisit.getVisitDate();
        String motherPersonUuid = infantVisit.getMotherPersonUuid();

        infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));

        // Mother's ART: use ancNumber if available, else fallback to motherPersonUuid + visitDate
        InfantMotherArt infantMotherArt;
        if (ancNumber != null && StringUtils.hasText(ancNumber)) {
            infantMotherArt = this.infantMotherArtRepository.getLatestByAncNumberAndVisitDate(ancNumber, visitDate);
        } else {
            infantMotherArt = this.infantMotherArtRepository.getLatestByMotherPersonUuidAndVisitDate(motherPersonUuid, visitDate);
        }
        if (infantMotherArt != null) {
            infantVisitationConsolidatedDto.setInfantMotherArtDto(converRequestDtotoEntity(infantMotherArt));
        }

        // ARV: by hospitalNumber + visitDate, return latest if multiple
        InfantArv infantArv = this.infantArvRepository.getLatestByHospitalNumberAndVisitDate(infantHospitalNumber, visitDate);
        if (infantArv != null) {
            infantVisitationConsolidatedDto.setInfantArvDto(convertInfantArvEntityToInfantArvDto(infantArv));
        }

        // PCR: by hospitalNumber + visitDate, return latest if multiple
        InfantPCRTest infantPCRTest = this.infantPCRTestRepository.getLatestInfantPCRInfo(infantHospitalNumber, visitDate);
        if (infantPCRTest != null) {
            infantVisitationConsolidatedDto.setInfantPCRTestDto(convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTest));
        }

        // Rapid test: by motherPersonUuid + visitDate, return latest if multiple
        if (motherPersonUuid != null && visitDate != null) {
            InfantRapidAntiBodyTest infantRapidTest = this.infantRapidTestRepository.getLatestByMotherPersonUuidAndDateOfTest(motherPersonUuid, visitDate);
            if (infantRapidTest != null) {
                infantVisitationConsolidatedDto.setInfantRapidAntiBodyTestDto(convertInfantRapidTestEntityToInfantRapidestDto(infantRapidTest));
            }
        }

    }

    public InfantArvDto getInfantArvByInfantHospitalNumber(String hospitalNumber) {
        InfantArvDto infantArvDto = null;
        List<InfantArv> infantArvList = this.infantArvRepository.findByInfantHospitalNumber(hospitalNumber);
        if (!infantArvList.isEmpty()) {
            infantArvDto = convertInfantArvEntityToInfantArvDto(infantArvList.get(0));
        }
        return infantArvDto;
    }

    public InfantArvDto getInfantArvByUUID(String personUuid) {
        InfantArvDto infantArvDto = null;
        InfantArv infantArvEntity = infantArvRepository.getTopByUuid(personUuid);

        // Add null check before conversion
        if (infantArvEntity != null) {
            infantArvDto = convertInfantArvEntityToInfantArvDto(infantArvEntity);
        }

        return infantArvDto;
    }

    /**
     * Get ARV for infant registration context.
     * Uses mother_person_uuid = uuid column in arv table + infant_hospital_number, returns latest if multiple.
     */
    public InfantArvDto getInfantArvForRegistration(String motherPersonUuid, String hospitalNumber, LocalDate dateOfDelivery) {
        InfantArvDto infantArvDto = null;
        InfantArv infantArvEntity = this.infantArvRepository.getLatestByUuidAndHospitalNumberAndVisitDate(motherPersonUuid, hospitalNumber, dateOfDelivery);
        if (infantArvEntity != null) {
            infantArvDto = convertInfantArvEntityToInfantArvDto(infantArvEntity);
        }
        return infantArvDto;
    }

    public InfantPCRTestDto getInfantPCRTestByInfantHospitalNumber(String hospitalNumber) {
        InfantPCRTestDto infantPCRTestDto = null;
        InfantPCRTest infantPCRTestEntity = this.infantPCRTestRepository.findByInfantHospitalNumberAndTestType(
                hospitalNumber, "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT");
        if (infantPCRTestEntity != null) {
            infantPCRTestDto = convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTestEntity);
        }
        return infantPCRTestDto;
    }

    /**
     * Get PCR for infant registration context.
     * Uses date_of_delivery + hospital_number + first PCR test type, returns latest if multiple.
     */
    public InfantPCRTestDto getInfantPCRTestForRegistration(String hospitalNumber, LocalDate dateOfDelivery) {
        InfantPCRTestDto infantPCRTestDto = null;
        InfantPCRTest infantPCRTestEntity = this.infantPCRTestRepository.getLatestByHospitalNumberAndVisitDateAndTestType(
                hospitalNumber, dateOfDelivery, "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT");
        if (infantPCRTestEntity != null) {
            infantPCRTestDto = convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTestEntity);
        }
        return infantPCRTestDto;
    }

    public InfantPCRTestDto getInfantPCRTestByUUID(String personUuid) {
        InfantPCRTestDto infantPCRTestDto = null;
        InfantPCRTest infantPCRTestEntity = infantPCRTestRepository.getTopByUuid(personUuid);

        // Add null check before conversion
        if (infantPCRTestEntity != null) {
            infantPCRTestDto = convertInfantPCRTestEntityToInfantPCRTestDto(infantPCRTestEntity);
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
        infantArvDto.setOtherProphylaxisType(infantArv.getOtherProphylaxisType());
        infantArvDto.setPmtctCycleId(infantArv.getPmtctCycleId());
        infantArvDto.setMotherPersonUuid(infantArv.getMotherPersonUuid());
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
        infantPCRTest.setPmtctCycleId(infantPCRTestDto.getPmtctCycleId());
        infantPCRTest.setMotherPersonUuid(infantPCRTestDto.getMotherPersonUuid());
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
        infantDTO.setPmtctCycleId(infantRapidAntiBodyTest.getPmtctCycleId());
        infantDTO.setMotherPersonUuid(infantRapidAntiBodyTest.getMotherPersonUuid());
        return infantDTO;
    }


    @Transactional
    public InfantVisitationConsolidatedDto updateInfantVisit(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {

        InfantVisitRequestDto visitDto = infantVisitationConsolidatedDto.getInfantVisitRequestDto();

        if (visitDto.getId() != null) {
            this.updateInfantVisit(visitDto);
        }

        // Mother's ART
        if (infantVisitationConsolidatedDto.getInfantMotherArtDto() != null) {
            InfantMotherArtDto motherArtDto = infantVisitationConsolidatedDto.getInfantMotherArtDto();
            if (motherArtDto.getId() != null) {
                this.updateInfantMotherArt(motherArtDto);
            } else {
                // New record added during update
                String artTime = motherArtDto.getMotherArtInitiationTime();
                if (artTime != null && !artTime.isEmpty() && motherArtDto.getRegimenTypeId() != null && motherArtDto.getRegimenId() != null) {
                    motherArtDto.setAncNumber(visitDto.getAncNumber());
                    motherArtDto.setVisitDate(visitDto.getVisitDate());
                    motherArtDto.setUniqueUuid(visitDto.getUniqueUuid());
                    if (motherArtDto.getMotherPersonUuid() == null) {
                        motherArtDto.setMotherPersonUuid(visitDto.getPersonUuid());
                    }
                    motherArtDto.setSource(infantVisitationConsolidatedDto.getSource());
                    this.converRequestDtotoEntity(motherArtDto, motherArtDto.getMotherPersonUuid());
                }
            }
        }

        // ARV
        if (infantVisitationConsolidatedDto.getInfantArvDto() != null) {
            InfantArvDto arvDto = infantVisitationConsolidatedDto.getInfantArvDto();
            if (arvDto.getId() != null) {
                this.updateInfantArv(arvDto, buildInfant(visitDto));
            } else {
                // New record added during update
                String arvType = arvDto.getInfantArvType();
                if (arvType != null && !arvType.isEmpty()) {
                    arvDto.setUniqueUuid(visitDto.getUniqueUuid());
                    arvDto.setAncNumber(visitDto.getAncNumber());
                    arvDto.setVisitDate(visitDto.getVisitDate());
                    arvDto.setInfantHospitalNumber(visitDto.getInfantHospitalNumber());
                    if (arvDto.getMotherPersonUuid() == null) {
                        arvDto.setMotherPersonUuid(visitDto.getPersonUuid());
                    }
                    arvDto.setSource(infantVisitationConsolidatedDto.getSource());
                    this.converRequestDtotoEntity(arvDto, arvDto.getMotherPersonUuid());
                }
            }
        }

        // PCR
        if (infantVisitationConsolidatedDto.getInfantPCRTestDto() != null) {
            InfantPCRTestDto pcrDto = infantVisitationConsolidatedDto.getInfantPCRTestDto();
            if (pcrDto.getId() != null) {
                this.updateInfantPCRTest(pcrDto, buildInfant(visitDto));
            } else {
                // New record added during update
                if (pcrDto.getTestType() != null && !pcrDto.getTestType().isEmpty()) {
                    pcrDto.setUniqueUuid(visitDto.getUniqueUuid());
                    pcrDto.setAncNumber(visitDto.getAncNumber());
                    pcrDto.setVisitDate(visitDto.getVisitDate());
                    pcrDto.setInfantHospitalNumber(visitDto.getInfantHospitalNumber());
                    if (pcrDto.getMotherPersonUuid() == null) {
                        pcrDto.setMotherPersonUuid(visitDto.getPersonUuid());
                    }
                    pcrDto.setSource(infantVisitationConsolidatedDto.getSource());
                    this.converRequestDtotoEntity(pcrDto, pcrDto.getMotherPersonUuid());
                }
            }
        }

        // Rapid Test
        if (infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto() != null) {
            InfantRapidAntiBodyTestDto rapidDto = infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto();
            if (rapidDto.getId() != null) {
                this.updateInfantRapidTest(rapidDto, buildInfant(visitDto));
            } else {
                // New record added during update
                String result = rapidDto.getResult();
                if (result != null && !result.isEmpty()) {
                    rapidDto.setUniqueUuid(visitDto.getUniqueUuid());
                    rapidDto.setAncNumber(visitDto.getAncNumber());
                    if (rapidDto.getMotherPersonUuid() == null) {
                        rapidDto.setMotherPersonUuid(visitDto.getPersonUuid());
                    }
                    rapidDto.setSource(infantVisitationConsolidatedDto.getSource());
                    this.converRequestDtotoEntity(rapidDto, rapidDto.getMotherPersonUuid());
                }
            }
        }

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
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        exist.setVisitDate(dto.getVisitDate());
        exist.setAgeAtTest(dto.getAgeAtTest());
        exist.setTestType(dto.getTestType());
        exist.setDateSampleCollected(dto.getDateSampleCollected());
        exist.setDateSampleSent(dto.getDateSampleSent());
        exist.setDateResultReceivedAtFacility(dto.getDateResultReceivedAtFacility());
        exist.setDateResultReceivedByCaregiver(dto.getDateResultReceivedByCaregiver());
        exist.setResults(dto.getResults());
        exist.setUniqueUuid(dto.getUniqueUuid());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        // Set pmtctCycleId from DTO if provided
        if (dto.getPmtctCycleId() != null) {
            exist.setPmtctCycleId(dto.getPmtctCycleId());
        }
        // Set mother_person_uuid from DTO or infant
        if (dto.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(dto.getMotherPersonUuid());
        } else if (infant.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(infant.getMotherPersonUuid());
        }
        if (dto.getSource() != null) {
            exist.setSource(dto.getSource());
        }

       return this.infantPCRTestRepository.save(exist);
    }



    public InfantRapidAntiBodyTest updateInfantRapidTest(InfantRapidAntiBodyTestDto dto,Infant infant){
        InfantRapidAntiBodyTest exist = infantRapidTestRepository.findByUniqueUuid(dto.getUniqueUuid()).orElseThrow(() -> new EntityNotFoundException(InfantPCRTest.class,"Infant Rapid test not found "));
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        exist.setRapidTestType(dto.getRapidTestType());
        exist.setAncNumber(dto.getAncNumber());
        exist.setAgeAtTest(dto.getAgeAtTest());
        exist.setDateOfTest(dto.getDateOfTest());
        exist.setResult(dto.getResult());
        exist.setUniqueUuid(dto.getUniqueUuid());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        // Set pmtctCycleId from DTO if provided
        if (dto.getPmtctCycleId() != null) {
            exist.setPmtctCycleId(dto.getPmtctCycleId());
        }
        // Set mother_person_uuid from DTO or infant
        if (dto.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(dto.getMotherPersonUuid());
        } else if (infant.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(infant.getMotherPersonUuid());
        }
        if (dto.getSource() != null) {
            exist.setSource(dto.getSource());
        }

        return this.infantRapidTestRepository.save(exist);
    }

    public InfantVisit updateInfantVisit(InfantVisitRequestDto infantVisitRequestDto) {
       // InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantVisit.class, "InfantVisit_NOT_FOUND_MESSAGE" ));
        InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getId()).get();
        if (exist == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Infant found with id " + infantVisitRequestDto.getId());
        }

        // Prevent duplicate visit date (exclude current record)
        String hospitalNumber = infantVisitRequestDto.getInfantHospitalNumber();
        LocalDate visitDate = infantVisitRequestDto.getVisitDate();
        if (hospitalNumber != null && visitDate != null
                && this.infantVisitRepository.existsByInfantHospitalNumberAndVisitDateAndIdNot(hospitalNumber, visitDate, infantVisitRequestDto.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An infant visit already exists for this infant on " + visitDate + ". Please select a different date.");
        }

        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        exist.setVisitDate(infantVisitRequestDto.getVisitDate());
        exist.setBodyWeight(infantVisitRequestDto.getBodyWeight());
        exist.setVisitStatus(infantVisitRequestDto.getVisitStatus());
        exist.setUuid(infantVisitRequestDto.getUuid());
        exist.setUniqueUuid(infantVisitRequestDto.getUniqueUuid());
         exist.setCtxStatus(infantVisitRequestDto.getCtxStatus());
        exist.setBreastFeeding(infantVisitRequestDto.getBreastFeeding());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        if (infantVisitRequestDto.getSource() != null) {
            exist.setSource(infantVisitRequestDto.getSource());
        }
//        System.out.println("=================EXIST==========================");



        Optional<Infant> infants = infantRepository.getInfantByHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
        if (infants.isPresent()) {
            Infant infant = infants.get();
            LocalDate nad = this.calculateNAD(infantVisitRequestDto.getVisitDate());

            infant.setDefaultDays(this.defaultDate(infant.getLastVisitDate(), infantVisitRequestDto.getVisitDate()));
            infant.setLastVisitDate(infantVisitRequestDto.getVisitDate());
            infant.setNextAppointmentDate(nad);
            infant.setLastModifiedDate(java.time.LocalDateTime.now());
            infant.setLastModifiedBy(user.getUserName());
            infantRepository.save(infant);
        }
        this.infantVisitRepository.save(exist);
        return exist;
    }

    public InfantArv updateInfantArv(InfantArvDto infantArvDto,Infant infant){
        InfantArv exist = infantArvRepository
                .findById(infantArvDto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantArv.class,"InfantArv not found "));
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        exist.setVisitDate(infantArvDto.getVisitDate());
        exist.setInfantHospitalNumber(infantArvDto.getInfantHospitalNumber());
        exist.setInfantArvType(infantArvDto.getInfantArvType());
        exist.setInfantArvTime(infantArvDto.getInfantArvTime());
        exist.setArvDeliveryPoint(infantArvDto.getArvDeliveryPoint());
        exist.setAgeAtCtx(infantArvDto.getAgeAtCtx());
        exist.setTimingOfAvrAfter72Hours(infantArvDto.getTimingOfAvrAfter72Hours());
        exist.setTimingOfAvrWithin72Hours(infantArvDto.getTimingOfAvrWithin72Hours());
        exist.setUniqueUuid(infantArvDto.getUniqueUuid());
        exist.setDateOfCtx(infantArvDto.getDateOfCtx());
        exist.setDateOfArv(infantArvDto.getDateOfArv());
        exist.setOtherProphylaxisType(infantArvDto.getOtherProphylaxisType());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        // Set pmtctCycleId from DTO if provided
        if (infantArvDto.getPmtctCycleId() != null) {
            exist.setPmtctCycleId(infantArvDto.getPmtctCycleId());
        }
        // Set mother_person_uuid from DTO or infant
        if (infantArvDto.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(infantArvDto.getMotherPersonUuid());
        } else if (infant.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(infant.getMotherPersonUuid());
        }
        if (infantArvDto.getSource() != null) {
            exist.setSource(infantArvDto.getSource());
        }

       return  this.infantArvRepository.save(exist);
    }


    public void updateInfantMotherArt(InfantMotherArtDto dto){
        InfantMotherArt exist = infantMotherArtRepository
                .findById(dto.getId()).orElseThrow(() -> new EntityNotFoundException(InfantMotherArt.class,"InfantMotherArt not found "));
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        exist.setVisitDate(dto.getVisitDate());
        exist.setMotherArtInitiationTime(dto.getMotherArtInitiationTime());
        exist.setRegimenTypeId(dto.getRegimenTypeId());
        exist.setRegimenId(dto.getRegimenId());
        exist.setUniqueUuid(dto.getUniqueUuid());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        // Set pmtctCycleId from DTO if provided
        if (dto.getPmtctCycleId() != null) {
            exist.setPmtctCycleId(dto.getPmtctCycleId());
        }
        // Set mother_person_uuid from DTO if provided
        if (dto.getMotherPersonUuid() != null) {
            exist.setMotherPersonUuid(dto.getMotherPersonUuid());
        }
        if (dto.getSource() != null) {
            exist.setSource(dto.getSource());
        }
        this.infantMotherArtRepository.save(exist);
    }

    public void DeleteInfantVisit(Long id) {
        // Use getSingleInfantVisit to find records using the same logic as view/update
        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = getSingleInfantVisit(id);

        // Soft delete the InfantVisit itself
        if (infantVisitationConsolidatedDto.getInfantVisitRequestDto() != null
                && infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId() != null) {
            Optional<InfantVisit> infantVisitOptional = this.infantVisitRepository.findById(
                    infantVisitationConsolidatedDto.getInfantVisitRequestDto().getId());
            infantVisitOptional.ifPresent(infantVisit -> {
                infantVisit.setArchived(1L);
                this.infantVisitRepository.save(infantVisit);
            });
        }

        // Soft delete InfantArv — use the ID found by getSingleInfantVisit (same as view)
        if (infantVisitationConsolidatedDto.getInfantArvDto() != null
                && infantVisitationConsolidatedDto.getInfantArvDto().getId() != null) {
            Optional<InfantArv> infantArvOptional = this.infantArvRepository.findById(
                    infantVisitationConsolidatedDto.getInfantArvDto().getId());
            infantArvOptional.ifPresent(infantArv -> {
                infantArv.setArchived(1L);
                this.infantArvRepository.save(infantArv);
            });
        }

        // Soft delete InfantMotherArt — use the ID found by getSingleInfantVisit (same as view)
        if (infantVisitationConsolidatedDto.getInfantMotherArtDto() != null
                && infantVisitationConsolidatedDto.getInfantMotherArtDto().getId() != null) {
            Optional<InfantMotherArt> infantMotherArtOptional = this.infantMotherArtRepository.findById(
                    infantVisitationConsolidatedDto.getInfantMotherArtDto().getId());
            infantMotherArtOptional.ifPresent(infantMotherArt -> {
                infantMotherArt.setArchived(1L);
                this.infantMotherArtRepository.save(infantMotherArt);
            });
        }

        // Soft delete InfantPCRTest — use the ID found by getSingleInfantVisit (same as view)
        if (infantVisitationConsolidatedDto.getInfantPCRTestDto() != null
                && infantVisitationConsolidatedDto.getInfantPCRTestDto().getId() != null) {
            Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findById(
                    infantVisitationConsolidatedDto.getInfantPCRTestDto().getId());
            infantPCRTestOptional.ifPresent(infantPCRTest -> {
                infantPCRTest.setArchived(1L);
                this.infantPCRTestRepository.save(infantPCRTest);
            });
        }

        // Soft delete InfantRapidTest — use the ID found by getSingleInfantVisit (same as view)
        if (infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto() != null
                && infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getId() != null) {
            Optional<InfantRapidAntiBodyTest> infantRapidOptional = this.infantRapidTestRepository.findById(
                    infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getId());
            infantRapidOptional.ifPresent(infantRapidTest -> {
                infantRapidTest.setArchived(1L);
                this.infantRapidTestRepository.save(infantRapidTest);
            });
        }
    }

    public void deleteInfantArv(Long id){
        Optional<InfantArv> infantArvOptional = this.infantArvRepository.findById(id);
        infantArvOptional.ifPresent(infantArv -> {
            infantArv.setArchived(1L);
            infantArvRepository.save(infantArv);
        });
    }

    public void deleteInfantPCRTestDt(Long id){
        Optional<InfantPCRTest> infantPCRTestOptional = this.infantPCRTestRepository.findById(id);
        infantPCRTestOptional.ifPresent(infantPCRTest -> {
            infantPCRTest.setArchived(1L);
            infantPCRTestRepository.save(infantPCRTest);
        });
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

    public boolean isInfantVisitDateExists(String hospitalNumber, LocalDate visitDate, Long excludeId) {
        if (excludeId != null) {
            return infantVisitRepository.existsByInfantHospitalNumberAndVisitDateAndIdNot(hospitalNumber, visitDate, excludeId);
        }
        return infantVisitRepository.existsByInfantHospitalNumberAndVisitDate(hospitalNumber, visitDate);
    }

}
