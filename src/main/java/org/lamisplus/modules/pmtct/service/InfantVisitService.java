package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
    private final DeliveryRepository deliveryRepository;
    private final UserService userService;
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;

    public InfantVisitResponseDto save(InfantVisitRequestDto infantVisitRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(infantVisitRequestDto));
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
        infantVisit.setMotherPatientUuid(infantVisitRequestDto.getPatientUuid());
        infantVisit.setFacilityId(facilityId);
        infantVisit.setCreatedBy(user.getUserName());
        infantVisit.setLastModifiedBy(user.getUserName());
        infantVisit.setCreatedDate(java.time.LocalDateTime.now());
        infantVisit.setLastModifiedDate(java.time.LocalDateTime.now());

        try{
            Optional<Infant> infants = infantRepository.getInfantByInfantHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
            if(infants.isPresent()){
                Infant infant = infants.get();
                infant.setLastModifiedDate(java.time.LocalDateTime.now());
                infant.setLastModifiedBy(user.getUserName());
                infantRepository.save(infant);

            }
        }catch(Exception e) {}

        //infantVisit.setAgeAtCtx(infantVisitRequestDto.getAgeAtCtx());
        infantVisit.setUuid(UUID.randomUUID().toString());
        infantVisit.setUniqueUuid(infantVisitRequestDto.getUniqueUuid());
        infantVisit.setPmtctCycleUuid(infantVisitRequestDto.getPmtctCycleUuid());
        infantVisit.setArchived(0L);
        infantVisit.setSource(infantVisitRequestDto.getSource());

        return this.infantVisitRepository.save(infantVisit);
       // return this.infantVisitRepository.save(infantVisit);
    }


    public InfantVisitResponseDto convertEntitytoRespondDto(InfantVisit infantVisit) {
        InfantVisitResponseDto infantVisitResponseDto = new InfantVisitResponseDto();
        infantVisitResponseDto.setFullname(this.getFullName(infantVisit.getInfantHospitalNumber()));
        infantVisitResponseDto.setAge(calculateAge(infantVisit.getInfantHospitalNumber()));
        infantVisitResponseDto.setAncNumber(infantVisit.getAncNumber());
        infantVisitResponseDto.setBodyWeight(infantVisit.getBodyWeight());
        infantVisitResponseDto.setBreastFeeding(infantVisit.getBreastFeeding());
        infantVisitResponseDto.setCtxStatus(infantVisit.getCtxStatus());
        infantVisitResponseDto.setInfantHospitalNumber(infantVisit.getInfantHospitalNumber());
        infantVisitResponseDto.setUuid(infantVisit.getUuid());
        infantVisitResponseDto.setVisitDate(infantVisit.getVisitDate());
        infantVisitResponseDto.setVisitStatus(infantVisit.getVisitStatus());
        infantVisitResponseDto.setUniqueUuid(infantVisit.getUniqueUuid());
        infantVisitResponseDto.setSource(infantVisit.getSource());
        infantVisitResponseDto.setInfantOutcomeAt18Months(infantVisit.getInfantOutcomeAt18Months());
        infantVisitResponseDto.setInfantOutcomeSubOption(infantVisit.getInfantOutcomeSubOption());
        infantVisitResponseDto.setDateLinkedToArtClinic(infantVisit.getDateLinkedToArtClinic());
        infantVisitResponseDto.setArtEnrollmentNo(infantVisit.getArtEnrollmentNo());
        infantVisitResponseDto.setComments(infantVisit.getComments());

        return infantVisitResponseDto;
    }

    private String getFullName(String infantHospitalNumber) {
        Optional<Infant> infants = this.infantRepository.findInfantByInfantHospitalNumber(infantHospitalNumber);

        String fullName = "";
        if (infants.isPresent()) {
            Infant infant = infants.get();
            // Fetch demographics from patient_person via infantPatientUuid
            if (infant.getInfantPatientUuid() != null) {
                Optional<Person> personOpt = personRepository.findByUuid(infant.getInfantPatientUuid());
                if (personOpt.isPresent()) {
                    Person person = personOpt.get();
                    String fn = person.getFirstName();
                    String sn = person.getSurname();
                    String mn = person.getOtherName();
                    if (fn == null) fn = "";
                    if (sn == null) sn = "";
                    if (mn == null) mn = "";
                    fullName = fn + ", " + mn + " " + sn;
                }
            }
        }
        return fullName;
    }

    public int calculateAge(String infantHospitalNumber) {
        Optional<Infant> infants = this.infantRepository.findInfantByInfantHospitalNumber(infantHospitalNumber);

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
        infantVisitResponseDto.setAncNumber(infantVisit.getAncNumber());
        infantVisitResponseDto.setBodyWeight(infantVisit.getBodyWeight());
        infantVisitResponseDto.setBreastFeeding(infantVisit.getBreastFeeding());
        infantVisitResponseDto.setCtxStatus(infantVisit.getCtxStatus());
        infantVisitResponseDto.setInfantHospitalNumber(infantVisit.getInfantHospitalNumber());
        infantVisitResponseDto.setUuid(infantVisit.getUuid());
        infantVisitResponseDto.setVisitDate(infantVisit.getVisitDate());
        infantVisitResponseDto.setVisitStatus(infantVisit.getVisitStatus());
        infantVisitResponseDto.setUniqueUuid(infantVisit.getUniqueUuid());
        infantVisitResponseDto.setPmtctCycleUuid(infantVisit.getPmtctCycleUuid());
        infantVisitResponseDto.setInfantOutcomeAt18Months(infantVisit.getInfantOutcomeAt18Months());
        infantVisitResponseDto.setInfantOutcomeSubOption(infantVisit.getInfantOutcomeSubOption());
        infantVisitResponseDto.setDateLinkedToArtClinic(infantVisit.getDateLinkedToArtClinic());
        infantVisitResponseDto.setArtEnrollmentNo(infantVisit.getArtEnrollmentNo());
        infantVisitResponseDto.setComments(infantVisit.getComments());

        return infantVisitResponseDto;
    }

    public List<InfantVisit> getInfantVisitByHospitalNumber(String hospitalNumber) {
        return infantVisitRepository.findInfantVisitsByInfantHospitalNumber(hospitalNumber);
    }

    public boolean infantMotherArtDetailsCaptured(String ancNo) {
        // Check if any infant visit has mother ART data for this ANC number
        List<InfantVisit> visits = infantVisitRepository.getInfantVisitsByAncNumber(ancNo);
        for (InfantVisit visit : visits) {
            if (visit.getMotherArtData() != null && visit.getMotherArtData().getMotherArtInitiationTime() != null) {
                return true;
            }
        }
        return false;
    }

    public boolean infantArvAdministered(String hospitalNumber) {
        // Check infant registration JSONB
        Optional<Infant> infant = infantRepository.getInfantByInfantHospitalNumber(hospitalNumber);
        if (infant.isPresent() && infant.get().getInfantArvData() != null
                && infant.get().getInfantArvData().getInfantArvType() != null
                && !infant.get().getInfantArvData().getInfantArvType().isEmpty()) {
            return true;
        }
        // Check infant visit JSONB
        List<InfantVisit> visits = infantVisitRepository.findInfantVisitsByInfantHospitalNumber(hospitalNumber);
        for (InfantVisit visit : visits) {
            if (visit.getInfantArvData() != null && visit.getInfantArvData().getInfantArvType() != null
                    && !visit.getInfantArvData().getInfantArvType().isEmpty()) {
                return true;
            }
        }
        return false;
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

        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        String motherPatientUuid = infantVisitationConsolidatedDto.getInfantVisitRequestDto().getPatientUuid();

        InfantVisitRequestDto visitDto = infantVisitationConsolidatedDto.getInfantVisitRequestDto();
        visitDto.setUniqueUuid(UUID.randomUUID().toString());
        visitDto.setSource(infantVisitationConsolidatedDto.getSource());

        // Build InfantVisit entity with all JSONB data embedded
        InfantVisit infantVisit = new InfantVisit();
        infantVisit.setVisitDate(visitDto.getVisitDate());
        infantVisit.setInfantHospitalNumber(visitDto.getInfantHospitalNumber());
        infantVisit.setAncNumber(visitDto.getAncNumber());
        infantVisit.setBodyWeight(visitDto.getBodyWeight());
        infantVisit.setVisitStatus(visitDto.getVisitStatus());
        infantVisit.setCtxStatus(visitDto.getCtxStatus());
        infantVisit.setBreastFeeding(visitDto.getBreastFeeding());
        infantVisit.setMotherPatientUuid(motherPatientUuid);
        infantVisit.setUuid(UUID.randomUUID().toString());
        infantVisit.setUniqueUuid(visitDto.getUniqueUuid());
        infantVisit.setPmtctCycleUuid(visitDto.getPmtctCycleUuid());
        infantVisit.setArchived(0L);
        infantVisit.setSource(visitDto.getSource());
        infantVisit.setFacilityId(facilityId);
        infantVisit.setCreatedBy(user.getUserName());
        infantVisit.setLastModifiedBy(user.getUserName());
        infantVisit.setCreatedDate(java.time.LocalDateTime.now());
        infantVisit.setLastModifiedDate(java.time.LocalDateTime.now());

        // New scalar fields from visitDto
        infantVisit.setInfantOutcomeAt18Months(visitDto.getInfantOutcomeAt18Months());
        infantVisit.setInfantOutcomeSubOption(visitDto.getInfantOutcomeSubOption());
        infantVisit.setDateLinkedToArtClinic(visitDto.getDateLinkedToArtClinic());
        infantVisit.setArtEnrollmentNo(visitDto.getArtEnrollmentNo());
        infantVisit.setComments(visitDto.getComments());

        // Set JSONB: Mother's ART
        if (infantVisitationConsolidatedDto.getInfantMotherArtDto() != null) {
            InfantMotherArtDto motherArtDto = infantVisitationConsolidatedDto.getInfantMotherArtDto();
            String artTime = motherArtDto.getMotherArtInitiationTime();
            boolean hasArtTime = artTime != null && !artTime.isEmpty();
            boolean hasRegimenType = motherArtDto.getRegimenTypeId() != null;
            boolean hasRegimen = motherArtDto.getRegimenId() != null;

            if (hasArtTime || hasRegimenType || hasRegimen) {
                if (!(hasArtTime && hasRegimenType && hasRegimen)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Mother's ART section requires all three fields: Timing of ART Initiation, Original Regimen Line, and Original Regimen");
                }
                infantVisit.setMotherArtData(motherArtDto);
            }
        }

        // Set JSONB: Infant ARV
        if (infantVisitationConsolidatedDto.getInfantArvDto() != null) {
            String arvType = infantVisitationConsolidatedDto.getInfantArvDto().getInfantArvType();
            if (arvType != null && !arvType.isEmpty()) {
                infantVisit.setInfantArvData(infantVisitationConsolidatedDto.getInfantArvDto());
            }
        }

        // Set JSONB: Infant PCR
        if (infantVisitationConsolidatedDto.getInfantPCRTestDto() != null
                && infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType() != null
                && !infantVisitationConsolidatedDto.getInfantPCRTestDto().getTestType().isEmpty()) {
            infantVisit.setInfantPcrData(infantVisitationConsolidatedDto.getInfantPCRTestDto());
        }

        // Set JSONB: Rapid test
        if (infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto() != null) {
            String result = infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto().getResult();
            if (result != null && !result.isEmpty()) {
                infantVisit.setRapidTestData(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto());
            }
        }

        // Set JSONB: HBV Vaccination
        if (infantVisitationConsolidatedDto.getInfantVisitHbvVaccinationDto() != null) {
            infantVisit.setHbvVaccinationData(infantVisitationConsolidatedDto.getInfantVisitHbvVaccinationDto());
        }

        // Single save — all data in one row
        InfantVisit saved = this.infantVisitRepository.save(infantVisit);

        // Touch the infant's lastModified
        try {
            Optional<Infant> infants = infantRepository.getInfantByInfantHospitalNumber(infantHospitalNumber);
            if (infants.isPresent()) {
                Infant infant = infants.get();
                infant.setLastModifiedDate(java.time.LocalDateTime.now());
                infant.setLastModifiedBy(user.getUserName());
                infantRepository.save(infant);
            }
        } catch (Exception e) {
            log.warn("Could not update infant lastModifiedDate", e);
        }

        InfantVisitRequestDto responseVisitDto = convertEntitytoRequestDto(saved);
        responseVisitDto.setPatientUuid(motherPatientUuid);

        return InfantVisitationConsolidatedDto.builder()
                .infantVisitRequestDto(responseVisitDto)
                .infantMotherArtDto(saved.getMotherArtData())
                .infantArvDto(saved.getInfantArvData())
                .infantPCRTestDto(saved.getInfantPcrData())
                .infantRapidAntiBodyTestDto(saved.getRapidTestData())
                .infantVisitHbvVaccinationDto(saved.getHbvVaccinationData())
                .build();
    }

    public InfantVisitRequestDto convertEntitytoRequestDto(InfantVisitResponseDto infantVisitResponseDto, String patientUuid) {
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
        infantVisitResponseDto1.setPatientUuid(patientUuid);

        return infantVisitResponseDto1;
    }

    public FormFilterResponseDto getFormFilter(String hospitalNumber){
        FormFilterResponseDto filterResponseDto = new FormFilterResponseDto();
        filterResponseDto.setInfantArv(this.infantArvAdministered(hospitalNumber));
        Optional<Infant> infants = this.infantRepository.findInfantByInfantHospitalNumber(hospitalNumber);

        if (infants.isPresent()){
            // Source ancNo from ANC via motherPatientUuid (authoritative source)
            String ancNo = null;
            Optional<ANC> ancOpt = ancRepository.findANCByPatientUuidAndArchived(infants.get().getMotherPatientUuid(), 0L);
            if (ancOpt.isPresent()) {
                ancNo = ancOpt.get().getAncNo();
            }
            filterResponseDto.setMotherArt(ancNo != null ? this.infantMotherArtDetailsCaptured(ancNo) : Boolean.FALSE);
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

    @SneakyThrows
    public InfantVisitationConsolidatedDto  getSingleInfantVisit(String id) {

        Optional<InfantVisit> infantVisitOptional = infantVisitRepository.findById(id);
        InfantVisitationConsolidatedDto infantVisitationConsolidatedDto = new InfantVisitationConsolidatedDto();

        if (infantVisitOptional.isPresent()) {
            InfantVisit infantVisit = infantVisitOptional.get();
            infantVisitationConsolidatedDto.setInfantVisitRequestDto(convertEntitytoRequestDto(infantVisit));
            infantVisitationConsolidatedDto.setInfantArvDto(infantVisit.getInfantArvData());
            infantVisitationConsolidatedDto.setInfantPCRTestDto(infantVisit.getInfantPcrData());
            infantVisitationConsolidatedDto.setInfantMotherArtDto(infantVisit.getMotherArtData());
            infantVisitationConsolidatedDto.setInfantRapidAntiBodyTestDto(infantVisit.getRapidTestData());
            infantVisitationConsolidatedDto.setInfantVisitHbvVaccinationDto(infantVisit.getHbvVaccinationData());
        }

        return infantVisitationConsolidatedDto;
    }


    @Transactional
    public InfantVisitationConsolidatedDto updateInfantVisit(InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {

        InfantVisitRequestDto visitDto = infantVisitationConsolidatedDto.getInfantVisitRequestDto();

        if (visitDto.getUuid() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Visit UUID is required for update");
        }

        InfantVisit exist = infantVisitRepository.findById(visitDto.getUuid())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "InfantVisit not found"));

        // Prevent duplicate visit date (exclude current record)
        String hospitalNumber = visitDto.getInfantHospitalNumber();
        LocalDate visitDate = visitDto.getVisitDate();
        if (hospitalNumber != null && visitDate != null
                && this.infantVisitRepository.existsByInfantHospitalNumberAndVisitDateAndIdNot(hospitalNumber, visitDate, visitDto.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An infant visit already exists for this infant on " + visitDate + ". Please select a different date.");
        }

        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        // Update visit scalar fields
        exist.setVisitDate(visitDto.getVisitDate());
        exist.setBodyWeight(visitDto.getBodyWeight());
        exist.setVisitStatus(visitDto.getVisitStatus());
        exist.setCtxStatus(visitDto.getCtxStatus());
        exist.setBreastFeeding(visitDto.getBreastFeeding());
        exist.setLastModifiedBy(user.getUserName());
        exist.setLastModifiedDate(java.time.LocalDateTime.now());
        exist.setInfantOutcomeAt18Months(visitDto.getInfantOutcomeAt18Months());
        exist.setInfantOutcomeSubOption(visitDto.getInfantOutcomeSubOption());
        exist.setDateLinkedToArtClinic(visitDto.getDateLinkedToArtClinic());
        exist.setArtEnrollmentNo(visitDto.getArtEnrollmentNo());
        exist.setComments(visitDto.getComments());

        // Update JSONB columns — overwrite with latest DTO data
        exist.setMotherArtData(infantVisitationConsolidatedDto.getInfantMotherArtDto());
        exist.setInfantArvData(infantVisitationConsolidatedDto.getInfantArvDto());
        exist.setInfantPcrData(infantVisitationConsolidatedDto.getInfantPCRTestDto());
        exist.setRapidTestData(infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto());
        exist.setHbvVaccinationData(infantVisitationConsolidatedDto.getInfantVisitHbvVaccinationDto());

        this.infantVisitRepository.save(exist);

        // Touch the infant's lastModified
        try {
            Optional<Infant> infants = infantRepository.getInfantByInfantHospitalNumber(visitDto.getInfantHospitalNumber());
            if (infants.isPresent()) {
                Infant infant = infants.get();
                infant.setLastModifiedDate(java.time.LocalDateTime.now());
                infant.setLastModifiedBy(user.getUserName());
                infantRepository.save(infant);
            }
        } catch (Exception e) {
            log.warn("Could not update infant lastModifiedDate", e);
        }

        return infantVisitationConsolidatedDto;
    }

    private Infant buildInfant(InfantVisitRequestDto infantVisitRequestDto){
        Infant infant = new Infant();
        infant.setMotherPatientUuid(infantVisitRequestDto.getPatientUuid());
        return infant;
    }

    public InfantVisit updateInfantVisit(InfantVisitRequestDto infantVisitRequestDto) {
       // InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getUuid()).orElseThrow(() -> new EntityNotFoundException(InfantVisit.class, "InfantVisit_NOT_FOUND_MESSAGE" ));
        InfantVisit exist = infantVisitRepository.findById(infantVisitRequestDto.getUuid()).get();
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



        Optional<Infant> infants = infantRepository.getInfantByInfantHospitalNumber(infantVisitRequestDto.getInfantHospitalNumber());
        if (infants.isPresent()) {
            Infant infant = infants.get();
            infant.setLastModifiedDate(java.time.LocalDateTime.now());
            infant.setLastModifiedBy(user.getUserName());
            infantRepository.save(infant);
        }
        this.infantVisitRepository.save(exist);
        return exist;
    }

    public void DeleteInfantVisit(String id) {
        // Soft delete the InfantVisit — JSONB data (ARV, PCR, MotherArt, Rapid) is embedded and archived with it
        Optional<InfantVisit> infantVisitOptional = this.infantVisitRepository.findById(id);
        infantVisitOptional.ifPresent(infantVisit -> {
            infantVisit.setArchived(1L);
            this.infantVisitRepository.save(infantVisit);
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

    public boolean isInfantVisitDateExists(String hospitalNumber, LocalDate visitDate, String excludeId) {
        if (excludeId != null) {
            return infantVisitRepository.existsByInfantHospitalNumberAndVisitDateAndIdNot(hospitalNumber, visitDate, excludeId);
        }
        return infantVisitRepository.existsByInfantHospitalNumberAndVisitDate(hospitalNumber, visitDate);
    }

}
