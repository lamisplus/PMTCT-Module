package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PmtctVisitService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final PmtctVisitRepository pmtctVisitRepository;

    private final ANCService ancService;
    private final UserService userService;
    ObjectMapper mapper = new ObjectMapper();
    private final PmtctPregnancyCycleService pmtctPregnancyCycleService;

    public PmtctVisitResponseDto save(PmtctVisitRequestDto pmtctVisitRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(pmtctVisitRequestDto));
    }

    public LocalDate nextAppointmentDate(LocalDate lmd){
        LocalDate date = lmd;
        date = date.plusMonths(1);
        return date;
    }

    public PmtctVisit converRequestDtotoEntity(PmtctVisitRequestDto pmtctVisitRequestDto) {
        // Block new visit creation if MIP Card cycle is closed
        if (pmtctVisitRequestDto.getPmtctCycleUuid() != null &&
            pmtctPregnancyCycleService.isCycleClosed(pmtctVisitRequestDto.getPmtctCycleUuid())) {
            throw new RuntimeException("This MIP Card has been closed. No further visit records can be created.");
        }

        PmtctVisit pmtctVisit = new PmtctVisit();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();

        pmtctVisit.setFacilityId(facilityId);
        pmtctVisit.setCurrentStatus(pmtctVisitRequestDto.getCurrentStatus());
        pmtctVisit.setWeight(pmtctVisitRequestDto.getWeight());
        pmtctVisit.setSfhLength(pmtctVisitRequestDto.getSfhLength());
        pmtctVisit.setCurrentArtStatus(pmtctVisitRequestDto.getCurrentArtStatus());
        pmtctVisit.setMothersArtRegimen(pmtctVisitRequestDto.getMothersArtRegimen());
        pmtctVisit.setRegimenLineId(pmtctVisitRequestDto.getRegimenLineId());
        pmtctVisit.setCurrentHbvStatus(pmtctVisitRequestDto.getCurrentHbvStatus());
        pmtctVisit.setNameOfHbvDrug(pmtctVisitRequestDto.getNameOfHbvDrug());
        pmtctVisit.setCurrentSyphilisStatus(pmtctVisitRequestDto.getCurrentSyphilisStatus());
        pmtctVisit.setNameOfSyphilisDrug(pmtctVisitRequestDto.getNameOfSyphilisDrug());
        pmtctVisit.setDateOfInitialVisit(pmtctVisitRequestDto.getDateOfInitialVisit());
        pmtctVisit.setDateOfVisit(pmtctVisitRequestDto.getDateOfVisit());
        pmtctVisit.setUuid(UUID.randomUUID().toString());
        pmtctVisit.setEntryPoint(pmtctVisitRequestDto.getEntryPoint());
        pmtctVisit.setCreatedBy(user.getUserName());
        pmtctVisit.setLastModifiedBy(user.getUserName());
        pmtctVisit.setFpCounseling(pmtctVisitRequestDto.getFpCounseling());
        pmtctVisit.setFpMethod(pmtctVisitRequestDto.getFpMethod());
        pmtctVisit.setDateOfViralLoad(pmtctVisitRequestDto.getDateOfViralLoad());
        pmtctVisit.setDateOfVlResultReceived(pmtctVisitRequestDto.getDateOfVlResultReceived());
        pmtctVisit.setGaOfViralLoad(pmtctVisitRequestDto.getGaOfViralLoad());
        pmtctVisit.setResultOfViralLoad(pmtctVisitRequestDto.getResultOfViralLoad());
        if(pmtctVisitRequestDto.getGaOfViralLoad()!=null) {
            int ga = pmtctVisitRequestDto.getGaOfViralLoad();
            String tVL = "Other Time";
            if ((ga >= 32) && (ga <= 36)) tVL = "Between 32 and 36";
            pmtctVisit.setTimeOfViralLoad(tVL);
        }
        pmtctVisit.setInfantFeedingPractice(pmtctVisitRequestDto.getInfantFeedingPractice());
        pmtctVisit.setInfantOnCtx(pmtctVisitRequestDto.getInfantOnCtx());
        pmtctVisit.setReferredToTreatment(pmtctVisitRequestDto.getReferredToTreatment());
        pmtctVisit.setDsd(pmtctVisitRequestDto.getDsd());
        pmtctVisit.setDsdOption(pmtctVisitRequestDto.getDsdOption());
        pmtctVisit.setDsdModel(pmtctVisitRequestDto.getDsdModel());
        pmtctVisit.setPmtctCycleUuid(pmtctVisitRequestDto.getPmtctCycleUuid());
        pmtctVisit.setMaternalOutcome(pmtctVisitRequestDto.getMaternalOutcome());
        pmtctVisit.setDateOfMaternalOutcome(pmtctVisitRequestDto.getDateOfMaternalOutcome());
        pmtctVisit.setVisitStatus(pmtctVisitRequestDto.getVisitStatus());
        pmtctVisit.setNextAppointmentDate(
            pmtctVisitRequestDto.getNextAppointmentDate() != null
                ? pmtctVisitRequestDto.getNextAppointmentDate()
                : nextAppointmentDate(pmtctVisitRequestDto.getDateOfVisit())
        );
        pmtctVisit.setArchived(0L);
        pmtctVisit.setSignature(pmtctVisitRequestDto.getSignature());
        pmtctVisit.setSource(pmtctVisitRequestDto.getSource());
        pmtctVisit.setHepatitisCTestResult(pmtctVisitRequestDto.getHepatitisCTestResult());
        pmtctVisit.setReferredForHcv(pmtctVisitRequestDto.getReferredForHcv());
        pmtctVisit.setOutcomeOfVisit(pmtctVisitRequestDto.getOutcomeOfVisit());
        // Map shared fields (vital signs, counselling, lab tests, interventions)
        pmtctVisit.setVisitType(pmtctVisitRequestDto.getVisitType());
        pmtctVisit.setHeight(pmtctVisitRequestDto.getHeight());
        pmtctVisit.setSystolic(pmtctVisitRequestDto.getSystolic());
        pmtctVisit.setDiastolic(pmtctVisitRequestDto.getDiastolic());
        pmtctVisit.setGaWeeks(pmtctVisitRequestDto.getGaWeeks());
        pmtctVisit.setNumberOfAncVisits(pmtctVisitRequestDto.getNumberOfAncVisits());
        pmtctVisit.setAncAttendance(pmtctVisitRequestDto.getAncAttendance());
        pmtctVisit.setCounsellingHts(pmtctVisitRequestDto.getCounsellingHts());
        pmtctVisit.setCounsellingFgm(pmtctVisitRequestDto.getCounsellingFgm());
        pmtctVisit.setCounsellingFp(pmtctVisitRequestDto.getCounsellingFp());
        pmtctVisit.setCounsellingMaternalNutrition(pmtctVisitRequestDto.getCounsellingMaternalNutrition());
        pmtctVisit.setCounsellingEarlyBf(pmtctVisitRequestDto.getCounsellingEarlyBf());
        pmtctVisit.setCounsellingExclusiveBf(pmtctVisitRequestDto.getCounsellingExclusiveBf());
        pmtctVisit.setHbPcv(pmtctVisitRequestDto.getHbPcv());
        pmtctVisit.setBloodSugarGdm(pmtctVisitRequestDto.getBloodSugarGdm());
        pmtctVisit.setUrinalysisSugar(pmtctVisitRequestDto.getUrinalysisSugar());
        pmtctVisit.setUrinalysisProteins(pmtctVisitRequestDto.getUrinalysisProteins());
        pmtctVisit.setLlinGiven(pmtctVisitRequestDto.getLlinGiven());
        pmtctVisit.setIptDose(pmtctVisitRequestDto.getIptDose());
        pmtctVisit.setHematinicsGiven(pmtctVisitRequestDto.getHematinicsGiven());
        pmtctVisit.setTdImmunization(pmtctVisitRequestDto.getTdImmunization());
        pmtctVisit.setAssociatedProblems(pmtctVisitRequestDto.getAssociatedProblems());
        pmtctVisit.setReferralReason(pmtctVisitRequestDto.getReferralReason());
        pmtctVisit.setTransportationOut(pmtctVisitRequestDto.getTransportationOut());
        String visitStatus = pmtctVisitRequestDto.getVisitStatus();
        try {
            System.out.println("facilityId = "+facilityId);
            System.out.println("pmtctVisitRequestDto.getPatientUuid() = "+pmtctVisitRequestDto.getPatientUuid());
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisitRequestDto.getPatientUuid(), facilityId, 0);
            if (persons.isPresent()) {
                Person person = persons.get();
                pmtctVisit.setPatientUuid(pmtctVisitRequestDto.getPatientUuid());
                //System.out.println("visitStatus = " + visitStatus);
                if (visitStatus != null) {
                    // Use cycle-filtered lookup to avoid modifying ANC from a different pregnancy cycle
                    String cycleUuid = pmtctVisitRequestDto.getPmtctCycleUuid();
                    Optional<ANC> ancs = (cycleUuid != null)
                            ? ancRepository.findANCByPatientUuidAndCycleIdAndArchived(pmtctVisitRequestDto.getPatientUuid(), cycleUuid, 0L)
                            : ancRepository.findANCByPatientUuid(pmtctVisitRequestDto.getPatientUuid());
                    if(ancs.isPresent()) {
                        ANC anc = ancs.get();
                        if (visitStatus.contains("_IN")) {
                            ancService.updateANC(anc, visitStatus, pmtctVisitRequestDto.getDateOfVisit());
                        } else {
                            ancService.graduateFromANC(anc, visitStatus);
                        }
                    }
                }
            }
        } catch (Exception e) { e.printStackTrace(); }

        PmtctVisit savedVisit = this.pmtctVisitRepository.save(pmtctVisit);

        // Update maternal_outcome and visit_status in pregnancy cycle if provided
        if (savedVisit.getPmtctCycleUuid() != null &&
            (savedVisit.getMaternalOutcome() != null || savedVisit.getVisitStatus() != null)) {
            pmtctPregnancyCycleService.updateMaternalOutcome(
                savedVisit.getPmtctCycleUuid(),
                savedVisit.getMaternalOutcome(),
                savedVisit.getVisitStatus()
            );
        }

        return savedVisit;
    }

    public PmtctVisit convertRequestDtoToEntityUpdate(String id,PmtctVisitRequestDto pmtctVisitRequestDto,PmtctVisit existingVisit) {
        PmtctVisit pmtctVisit = new PmtctVisit();
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = currentUser.get();

        pmtctVisit.setUuid(id);
        pmtctVisit.setFacilityId(existingVisit.getFacilityId());
        pmtctVisit.setCurrentStatus(pmtctVisitRequestDto.getCurrentStatus());
        pmtctVisit.setWeight(pmtctVisitRequestDto.getWeight());
        pmtctVisit.setSfhLength(pmtctVisitRequestDto.getSfhLength());
        pmtctVisit.setCurrentArtStatus(pmtctVisitRequestDto.getCurrentArtStatus());
        pmtctVisit.setMothersArtRegimen(pmtctVisitRequestDto.getMothersArtRegimen());
        pmtctVisit.setRegimenLineId(pmtctVisitRequestDto.getRegimenLineId());
        pmtctVisit.setCurrentHbvStatus(pmtctVisitRequestDto.getCurrentHbvStatus());
        pmtctVisit.setNameOfHbvDrug(pmtctVisitRequestDto.getNameOfHbvDrug());
        pmtctVisit.setCurrentSyphilisStatus(pmtctVisitRequestDto.getCurrentSyphilisStatus());
        pmtctVisit.setNameOfSyphilisDrug(pmtctVisitRequestDto.getNameOfSyphilisDrug());
        pmtctVisit.setDateOfInitialVisit(pmtctVisitRequestDto.getDateOfInitialVisit());
        pmtctVisit.setDateOfVisit(pmtctVisitRequestDto.getDateOfVisit());
        pmtctVisit.setUuid(existingVisit.getUuid());
        pmtctVisit.setPatientUuid(existingVisit.getPatientUuid());
        pmtctVisit.setEntryPoint(pmtctVisitRequestDto.getEntryPoint());
        pmtctVisit.setCreatedBy(existingVisit.getCreatedBy());
        pmtctVisit.setCreatedDate(existingVisit.getCreatedDate());
        pmtctVisit.setLastModifiedBy(user.getUserName());
        pmtctVisit.setFpCounseling(pmtctVisitRequestDto.getFpCounseling());
        pmtctVisit.setFpMethod(pmtctVisitRequestDto.getFpMethod());
        pmtctVisit.setDateOfViralLoad(pmtctVisitRequestDto.getDateOfViralLoad());
        pmtctVisit.setDateOfVlResultReceived(pmtctVisitRequestDto.getDateOfVlResultReceived());
        pmtctVisit.setGaOfViralLoad(pmtctVisitRequestDto.getGaOfViralLoad());
        pmtctVisit.setResultOfViralLoad(pmtctVisitRequestDto.getResultOfViralLoad());
        if(pmtctVisitRequestDto.getGaOfViralLoad()!=null) {
            int ga = pmtctVisitRequestDto.getGaOfViralLoad();
            String tVL = "Other Time";
            if ((ga >= 32) && (ga <= 36)) tVL = "Between 32 and 36";
            pmtctVisit.setTimeOfViralLoad(tVL);
        }
        pmtctVisit.setInfantFeedingPractice(pmtctVisitRequestDto.getInfantFeedingPractice());
        pmtctVisit.setInfantOnCtx(pmtctVisitRequestDto.getInfantOnCtx());
        pmtctVisit.setReferredToTreatment(pmtctVisitRequestDto.getReferredToTreatment());
        pmtctVisit.setDsd(pmtctVisitRequestDto.getDsd());
        pmtctVisit.setDsdOption(pmtctVisitRequestDto.getDsdOption());
        pmtctVisit.setDsdModel(pmtctVisitRequestDto.getDsdModel());
        pmtctVisit.setPmtctCycleUuid(pmtctVisitRequestDto.getPmtctCycleUuid());
        pmtctVisit.setMaternalOutcome(pmtctVisitRequestDto.getMaternalOutcome());
        pmtctVisit.setDateOfMaternalOutcome(pmtctVisitRequestDto.getDateOfMaternalOutcome());
        pmtctVisit.setVisitStatus(pmtctVisitRequestDto.getVisitStatus());
        pmtctVisit.setNextAppointmentDate(
            pmtctVisitRequestDto.getNextAppointmentDate() != null
                ? pmtctVisitRequestDto.getNextAppointmentDate()
                : nextAppointmentDate(pmtctVisitRequestDto.getDateOfVisit())
        );
        pmtctVisit.setSignature(pmtctVisitRequestDto.getSignature());
        pmtctVisit.setSource(pmtctVisitRequestDto.getSource());
        pmtctVisit.setHepatitisCTestResult(pmtctVisitRequestDto.getHepatitisCTestResult());
        pmtctVisit.setReferredForHcv(pmtctVisitRequestDto.getReferredForHcv());
        pmtctVisit.setOutcomeOfVisit(pmtctVisitRequestDto.getOutcomeOfVisit());
        pmtctVisit.setVisitType(pmtctVisitRequestDto.getVisitType());
        pmtctVisit.setHeight(pmtctVisitRequestDto.getHeight());
        pmtctVisit.setSystolic(pmtctVisitRequestDto.getSystolic());
        pmtctVisit.setDiastolic(pmtctVisitRequestDto.getDiastolic());
        pmtctVisit.setGaWeeks(pmtctVisitRequestDto.getGaWeeks());
        pmtctVisit.setNumberOfAncVisits(pmtctVisitRequestDto.getNumberOfAncVisits());
        pmtctVisit.setAncAttendance(pmtctVisitRequestDto.getAncAttendance());
        pmtctVisit.setCounsellingHts(pmtctVisitRequestDto.getCounsellingHts());
        pmtctVisit.setCounsellingFgm(pmtctVisitRequestDto.getCounsellingFgm());
        pmtctVisit.setCounsellingFp(pmtctVisitRequestDto.getCounsellingFp());
        pmtctVisit.setCounsellingMaternalNutrition(pmtctVisitRequestDto.getCounsellingMaternalNutrition());
        pmtctVisit.setCounsellingEarlyBf(pmtctVisitRequestDto.getCounsellingEarlyBf());
        pmtctVisit.setCounsellingExclusiveBf(pmtctVisitRequestDto.getCounsellingExclusiveBf());
        pmtctVisit.setHbPcv(pmtctVisitRequestDto.getHbPcv());
        pmtctVisit.setBloodSugarGdm(pmtctVisitRequestDto.getBloodSugarGdm());
        pmtctVisit.setUrinalysisSugar(pmtctVisitRequestDto.getUrinalysisSugar());
        pmtctVisit.setUrinalysisProteins(pmtctVisitRequestDto.getUrinalysisProteins());
        pmtctVisit.setLlinGiven(pmtctVisitRequestDto.getLlinGiven());
        pmtctVisit.setIptDose(pmtctVisitRequestDto.getIptDose());
        pmtctVisit.setHematinicsGiven(pmtctVisitRequestDto.getHematinicsGiven());
        pmtctVisit.setTdImmunization(pmtctVisitRequestDto.getTdImmunization());
        pmtctVisit.setAssociatedProblems(pmtctVisitRequestDto.getAssociatedProblems());
        pmtctVisit.setReferralReason(pmtctVisitRequestDto.getReferralReason());
        pmtctVisit.setTransportationOut(pmtctVisitRequestDto.getTransportationOut());
        pmtctVisit.setArchived(existingVisit.getArchived() != null ? existingVisit.getArchived() : 0L);
        String visitStatus = pmtctVisitRequestDto.getVisitStatus();
        try {
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            System.out.println("pmtctVisitRequestDto.getPatientUuid() = "+pmtctVisitRequestDto.getPatientUuid());
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisitRequestDto.getPatientUuid(), facilityId, 0);
            if (persons.isPresent()) {
                Person person = persons.get();
                pmtctVisit.setPatientUuid(pmtctVisitRequestDto.getPatientUuid());
                //System.out.println("visitStatus = " + visitStatus);
                if (visitStatus != null) {
                    // Use cycle-filtered lookup to avoid modifying ANC from a different pregnancy cycle
                    String cycleUuid = pmtctVisitRequestDto.getPmtctCycleUuid();
                    Optional<ANC> ancs = (cycleUuid != null)
                            ? ancRepository.findANCByPatientUuidAndCycleIdAndArchived(pmtctVisitRequestDto.getPatientUuid(), cycleUuid, 0L)
                            : ancRepository.findANCByPatientUuid(pmtctVisitRequestDto.getPatientUuid());
                    if(ancs.isPresent()) {
                        ANC anc = ancs.get();
                        if (visitStatus.contains("_IN")) {
                            ancService.updateANC(anc, visitStatus, pmtctVisitRequestDto.getDateOfVisit());
                        } else {
                            ancService.graduateFromANC(anc, visitStatus);
                        }
                    }
                }
            }
        } catch (Exception e) { e.printStackTrace(); }

        PmtctVisit savedVisit = this.pmtctVisitRepository.save(pmtctVisit);

        // Update maternal_outcome and visit_status in pregnancy cycle if provided
        if (savedVisit.getPmtctCycleUuid() != null &&
            (savedVisit.getMaternalOutcome() != null || savedVisit.getVisitStatus() != null)) {
            pmtctPregnancyCycleService.updateMaternalOutcome(
                savedVisit.getPmtctCycleUuid(),
                savedVisit.getMaternalOutcome(),
                savedVisit.getVisitStatus()
            );
        }

        return savedVisit;
    }


    public PmtctVisitResponseDto convertEntitytoRespondDto(PmtctVisit pmtctVisit) {
        PmtctVisitResponseDto pmtctVisitResponseDto = new PmtctVisitResponseDto();
        pmtctVisitResponseDto.setId(pmtctVisit.getId());
        pmtctVisitResponseDto.setCurrentStatus(pmtctVisit.getCurrentStatus());
        pmtctVisitResponseDto.setWeight(pmtctVisit.getWeight());
        pmtctVisitResponseDto.setSfhLength(pmtctVisit.getSfhLength());
        pmtctVisitResponseDto.setCurrentArtStatus(pmtctVisit.getCurrentArtStatus());
        pmtctVisitResponseDto.setMothersArtRegimen(pmtctVisit.getMothersArtRegimen());
        pmtctVisitResponseDto.setRegimenLineId(pmtctVisit.getRegimenLineId());
        pmtctVisitResponseDto.setCurrentHbvStatus(pmtctVisit.getCurrentHbvStatus());
        pmtctVisitResponseDto.setNameOfHbvDrug(pmtctVisit.getNameOfHbvDrug());
        pmtctVisitResponseDto.setCurrentSyphilisStatus(pmtctVisit.getCurrentSyphilisStatus());
        pmtctVisitResponseDto.setNameOfSyphilisDrug(pmtctVisit.getNameOfSyphilisDrug());
        pmtctVisitResponseDto.setDateOfInitialVisit(pmtctVisit.getDateOfInitialVisit());
        pmtctVisitResponseDto.setDateOfVisit(pmtctVisit.getDateOfVisit());
        pmtctVisitResponseDto.setEntryPoint(pmtctVisit.getEntryPoint());
        pmtctVisitResponseDto.setFpCounseling(pmtctVisit.getFpCounseling());
        pmtctVisitResponseDto.setFpMethod(pmtctVisit.getFpMethod());
        pmtctVisitResponseDto.setDateOfViralLoad(pmtctVisit.getDateOfViralLoad());
        pmtctVisitResponseDto.setDateOfVlResultReceived(pmtctVisit.getDateOfVlResultReceived());
        pmtctVisitResponseDto.setGaOfViralLoad(pmtctVisit.getGaOfViralLoad());
        pmtctVisitResponseDto.setResultOfViralLoad(pmtctVisit.getResultOfViralLoad());

        pmtctVisitResponseDto.setTimeOfViralLoad(pmtctVisit.getTimeOfViralLoad());
        pmtctVisitResponseDto.setInfantFeedingPractice(pmtctVisit.getInfantFeedingPractice());
        pmtctVisitResponseDto.setInfantOnCtx(pmtctVisit.getInfantOnCtx());
        pmtctVisitResponseDto.setReferredToTreatment(pmtctVisit.getReferredToTreatment());
        pmtctVisitResponseDto.setDsd(pmtctVisit.getDsd());

        pmtctVisitResponseDto.setDsdOption(pmtctVisit.getDsdOption());
        pmtctVisitResponseDto.setDsdModel(pmtctVisit.getDsdModel());
        pmtctVisitResponseDto.setMaternalOutcome(pmtctVisit.getMaternalOutcome());
        pmtctVisitResponseDto.setDateOfMaternalOutcome(pmtctVisit.getDateOfMaternalOutcome());
        pmtctVisitResponseDto.setVisitStatus(pmtctVisit.getVisitStatus());
        pmtctVisitResponseDto.setNextAppointmentDate(pmtctVisit.getNextAppointmentDate());
        pmtctVisitResponseDto.setPmtctCycleUuid(pmtctVisit.getPmtctCycleUuid());
        pmtctVisitResponseDto.setSignature(pmtctVisit.getSignature());
        pmtctVisitResponseDto.setSource(pmtctVisit.getSource());
        pmtctVisitResponseDto.setHepatitisCTestResult(pmtctVisit.getHepatitisCTestResult());
        pmtctVisitResponseDto.setReferredForHcv(pmtctVisit.getReferredForHcv());
        pmtctVisitResponseDto.setOutcomeOfVisit(pmtctVisit.getOutcomeOfVisit());
        pmtctVisitResponseDto.setVisitType(pmtctVisit.getVisitType());
        pmtctVisitResponseDto.setHeight(pmtctVisit.getHeight());
        pmtctVisitResponseDto.setSystolic(pmtctVisit.getSystolic());
        pmtctVisitResponseDto.setDiastolic(pmtctVisit.getDiastolic());
        pmtctVisitResponseDto.setGaWeeks(pmtctVisit.getGaWeeks());
        pmtctVisitResponseDto.setNumberOfAncVisits(pmtctVisit.getNumberOfAncVisits());
        pmtctVisitResponseDto.setAncAttendance(pmtctVisit.getAncAttendance());
        pmtctVisitResponseDto.setCounsellingHts(pmtctVisit.getCounsellingHts());
        pmtctVisitResponseDto.setCounsellingFgm(pmtctVisit.getCounsellingFgm());
        pmtctVisitResponseDto.setCounsellingFp(pmtctVisit.getCounsellingFp());
        pmtctVisitResponseDto.setCounsellingMaternalNutrition(pmtctVisit.getCounsellingMaternalNutrition());
        pmtctVisitResponseDto.setCounsellingEarlyBf(pmtctVisit.getCounsellingEarlyBf());
        pmtctVisitResponseDto.setCounsellingExclusiveBf(pmtctVisit.getCounsellingExclusiveBf());
        pmtctVisitResponseDto.setHbPcv(pmtctVisit.getHbPcv());
        pmtctVisitResponseDto.setBloodSugarGdm(pmtctVisit.getBloodSugarGdm());
        pmtctVisitResponseDto.setUrinalysisSugar(pmtctVisit.getUrinalysisSugar());
        pmtctVisitResponseDto.setUrinalysisProteins(pmtctVisit.getUrinalysisProteins());
        pmtctVisitResponseDto.setLlinGiven(pmtctVisit.getLlinGiven());
        pmtctVisitResponseDto.setIptDose(pmtctVisit.getIptDose());
        pmtctVisitResponseDto.setHematinicsGiven(pmtctVisit.getHematinicsGiven());
        pmtctVisitResponseDto.setTdImmunization(pmtctVisit.getTdImmunization());
        pmtctVisitResponseDto.setAssociatedProblems(pmtctVisit.getAssociatedProblems());
        pmtctVisitResponseDto.setReferralReason(pmtctVisit.getReferralReason());
        pmtctVisitResponseDto.setTransportationOut(pmtctVisit.getTransportationOut());
        try {
            Optional<User> currentUser = this.userService.getUserWithRoles();
            User user = (User) currentUser.get();
            Long facilityId = user.getCurrentOrganisationUnitId();
            System.out.println("facilityId = "+facilityId);
            System.out.println("pmtctVisit.getPatientUuid() = "+pmtctVisit.getPatientUuid());
            Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(pmtctVisit.getPatientUuid(), facilityId, 0);
            if (persons.isPresent()) {
                System.out.println("Doc check me out here 1");
                Person person = persons.get();
                pmtctVisitResponseDto.setFullName(this.getFullName(pmtctVisit.getPatientUuid()));
                pmtctVisitResponseDto.setSex(person.getSex());
                pmtctVisitResponseDto.setAge(this.calculateAge(pmtctVisit.getPatientUuid()));
                pmtctVisitResponseDto.setDateOfBirth(person.getDateOfBirth());
                pmtctVisitResponseDto.setPatientUuid(person.getUuid());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }


        return pmtctVisitResponseDto;
    }

    private String getFullName(String uuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId, 0);

        String fullName = "";
        if (persons.isPresent()) {
            Person person = persons.get();
            String fn = person.getFirstName();
            String sn = person.getSurname();
            String on = person.getOtherName();
            if (fn == null) fn = "";
            if (sn == null) sn = "";
            if (on == null) on = "";
            fullName = sn + ", " + fn + " " + on;
        } else {
            fullName = "";
        }
        return fullName;
    }

    public int calculateAge(String uuid) {
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = user.getCurrentOrganisationUnitId();
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId, 0);

        int age = 0;
        //System.out.println("HostpitalNumber in Age " + uuid);
        if (persons.isPresent()) {
            Person person = persons.get();
            LocalDate dob = person.getDateOfBirth();
            LocalDate curDate = LocalDate.now();
            if (dob != null && curDate != null) {
                age = Period.between(dob, curDate).getYears();
            } else {
                age = 0;
            }
        }
       // System.out.println("Age " + age);
        return age;
    }
    public List<PmtctVisitResponseDto> getAllPmtctVisits() {
        List<PmtctVisit> pmtctVisitList = this.pmtctVisitRepository.findAll();
        List<PmtctVisitResponseDto> PmtctVisitResponseDtoList = new ArrayList<>();
        pmtctVisitList.forEach(pmtctVisit -> PmtctVisitResponseDtoList.add(convertEntitytoRespondDto(pmtctVisit)));
        return PmtctVisitResponseDtoList;
    }
    @SneakyThrows
    public PmtctVisit getSinglePmtctVisit(String id) {
        return this.pmtctVisitRepository.findById(id)
                .orElseThrow(() -> new Exception("ANC NOT FOUND"));
    }

    public List<PmtctVisitResponseDto> getVisitByAncNo(String ancNo) {
        // Look up ANC by ancNo to get patientUuid, then find visits by patientUuid
        Optional<ANC> ancOpt = ancRepository.getByAncNo(ancNo);
        if (!ancOpt.isPresent()) {
            return new ArrayList<>();
        }
        String patientUuid = ancOpt.get().getPatientUuid();
        List<PmtctVisit> pmtctVisitList = this.pmtctVisitRepository.getANCVisitsByPatientUuid(patientUuid, java.time.LocalDate.of(9999, 12, 31));
        List<PmtctVisitResponseDto> PmtctVisitResponseDtoList = new ArrayList<>();
        pmtctVisitList.forEach(pmtctVisit -> PmtctVisitResponseDtoList.add(convertEntitytoRespondDto(pmtctVisit)));
        return PmtctVisitResponseDtoList;
    }

    private PmtctVisit getExistVisit(String id) {
        return pmtctVisitRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(VisitService.class, "errorMessage", "No visit was found with given Id " + id));
    }
    public PmtctVisitResponseDto updatePmtctVisit(String id, PmtctVisitRequestDto pmtctVisitRequestDto) {
        PmtctVisit existVisit = getExistVisit(id);
        PmtctVisit pmtctVisit = convertRequestDtoToEntityUpdate( id, pmtctVisitRequestDto,existVisit);
        //pmtctVisit.setId(id);
        //pmtctVisit.setArchived(0);
       // return convertEntitytoRespondDto(pmtctVisitRepository.save(pmtctVisit));
        return convertEntitytoRespondDto(pmtctVisit);
    }

    public PmtctVisitResponseDto viewPmtctVisit(String id) {
        PmtctVisit pmtctVisit = getExistVisit(id);
        return convertEntitytoRespondDto(pmtctVisit);
    }


    public void deleteMotherVisit(String id) {
        PmtctVisit exist = this.getSinglePmtctVisit(id);
        exist.setArchived(1L);
        this.pmtctVisitRepository.save(exist);
    }


    public  String  getLatestMaternalOutcome(String patientUuid, String pmtctCycleUuid) {
        return pmtctVisitRepository.findLatestMaternalOutcomeByCycle(patientUuid, pmtctCycleUuid).orElse("");
    }

    public String getLatestArtRegimenFromPharmacy(String patientUuid) {
        return pmtctVisitRepository.findLatestArtRegimenFromPharmacy(patientUuid).orElse("");
    }

    public boolean isViralLoadUnsuppressed(String patientUuid) {
        Optional<Long> vlResult = pmtctVisitRepository.findLatestViralLoadResult(patientUuid);
        return vlResult.isPresent() && vlResult.get() >= 1000;
    }
}
