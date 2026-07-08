package org.lamisplus.modules.pmtct.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.pmtct.domain.dto.EnrollmentValidationDto;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleResponseDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.HtsClientProjection;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.lamisplus.modules.pmtct.domain.entity.PmtctPregnancyCycle;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.HtsEncounterProxyRepository;
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PmtctPregnancyCycleService {

    private final PmtctPregnancyCycleRepository pregnancyCycleRepository;
    private final UserService userService;
    private final ANCRepository ancRepository;
    private final PmtctHtsRepository pmtctHtsRepository;
    private final HtsEncounterProxyRepository htsEncounterProxyRepository;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentRepository;
    private final PmtctVisitRepository pmtctVisitRepository;

    private String mapEntryPoint(String entryPoint) {
        if (entryPoint == null) {
            return null;
        }

        switch (entryPoint) {
            case "PMTCT_ENTRY_POINT_ANC":
                return "ANC";
            case "PMTCT_ENTRY_POINT_L&D":
                return "L&D";
            case "PMTCT_ENTRY_POINT_POST-PARTUM":
                return "Post-partum";
            default:
                return entryPoint;
        }
    }

    public PmtctPregnancyCycleResponseDto save(PmtctPregnancyCycleRequestDto requestDto) {
        // Check if the patient already has an inactive record created very recently (within 5 minutes)
        // to prevent duplicate cycles from double-clicks, but allow new cycles for new pregnancies
        Optional<PmtctPregnancyCycle> existingInactiveCycle = pregnancyCycleRepository.findInactiveByPatientUuid(requestDto.getPatientUuid());

        if (existingInactiveCycle.isPresent()) {
            PmtctPregnancyCycle existing = existingInactiveCycle.get();
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            if (existing.getCreatedDate() != null && existing.getCreatedDate().isAfter(fiveMinutesAgo)) {
                // Recently created — likely a duplicate request from same session
                return convertToResponseDto(existing);
            }
            // Older inactive cycle from a previous pregnancy — do not reuse
        }

        // No inactive record found, create a new one
        Optional<User> currentUser = userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));
        Long facilityId = user.getCurrentOrganisationUnitId();

        PmtctPregnancyCycle pregnancyCycle = new PmtctPregnancyCycle();
        pregnancyCycle.setPatientUuid(requestDto.getPatientUuid());
        pregnancyCycle.setMaternalOutcome(requestDto.getMaternalOutcome());
        pregnancyCycle.setEntryPoint(mapEntryPoint(requestDto.getEntryPoint()));
        pregnancyCycle.setPregnancyOutcome(requestDto.getPregnancyOutcome());
        pregnancyCycle.setPmtctStatus(requestDto.getPmtctStatus());
        pregnancyCycle.setFacilityId(facilityId);
        pregnancyCycle.setCreatedBy(user.getUserName());
        pregnancyCycle.setCreatedDate(LocalDateTime.now());
        pregnancyCycle.setLastModifiedBy(user.getUserName());
        pregnancyCycle.setLastModifiedDate(LocalDateTime.now());
        pregnancyCycle.setUuid(UUID.randomUUID().toString());
        pregnancyCycle.setArchived(false);
        pregnancyCycle.setIsClosed(false);

        PmtctPregnancyCycle savedCycle = pregnancyCycleRepository.save(pregnancyCycle);

        return convertToResponseDto(savedCycle);
    }

    private PmtctPregnancyCycleResponseDto convertToResponseDto(PmtctPregnancyCycle entity) {
        PmtctPregnancyCycleResponseDto responseDto = new PmtctPregnancyCycleResponseDto();
        BeanUtils.copyProperties(entity, responseDto);
        return responseDto;
    }

    public PmtctPregnancyCycleResponseDto getLatestCycleByPatientUuid(String patientUuid) {
        Optional<PmtctPregnancyCycle> latestCycle = pregnancyCycleRepository.findLatestByPatientUuid(patientUuid);
        return latestCycle.map(this::convertToResponseDto).orElse(null);
    }

    public void updatePmtctStatusToActive(String cycleUuid) {
        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleUuid);
        if (cycleOptional.isPresent()) {
            PmtctPregnancyCycle cycle = cycleOptional.get();
            cycle.setPmtctStatus("ACTIVE");
            cycle.setLastModifiedDate(LocalDateTime.now());

            Optional<User> currentUser = userService.getUserWithRoles();
            currentUser.ifPresent(user -> cycle.setLastModifiedBy(user.getUserName()));

            pregnancyCycleRepository.save(cycle);
        }
    }

    private static final List<String> TERMINAL_OUTCOMES = Arrays.asList(
        "MATERNAL_OUTCOME_TRANSFERRED_OUT",
        "MATERNAL_OUTCOME_DIED",
        "MATERNAL_OUTCOME_DEAD",
        "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP",
        "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP"
    );

    public void updateMaternalOutcome(String cycleUuid, String maternalOutcome, String visitStatus) {
        if (cycleUuid == null) {
            return;
        }

        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleUuid);
        if (cycleOptional.isPresent()) {
            PmtctPregnancyCycle cycle = cycleOptional.get();

            // Update maternal outcome if provided
            if (maternalOutcome != null) {
                cycle.setMaternalOutcome(maternalOutcome);

                // Close or re-open the MIP Card based on outcome (case-insensitive check)
                String normalizedOutcome = maternalOutcome.trim().toUpperCase();
                if (TERMINAL_OUTCOMES.contains(maternalOutcome) || TERMINAL_OUTCOMES.contains(normalizedOutcome)) {
                    cycle.setIsClosed(true);
                } else {
                    cycle.setIsClosed(false);
                }
            }

            // Update visit status if provided
            if (visitStatus != null) {
                cycle.setVisitStatus(visitStatus);
            }

            cycle.setLastModifiedDate(LocalDateTime.now());

            Optional<User> currentUser = userService.getUserWithRoles();
            currentUser.ifPresent(user -> cycle.setLastModifiedBy(user.getUserName()));

            pregnancyCycleRepository.save(cycle);
        }
    }

    public boolean isCycleClosed(String cycleUuid) {
        if (cycleUuid == null) return false;
        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleUuid);
        if (!cycleOptional.isPresent()) return false;

        PmtctPregnancyCycle cycle = cycleOptional.get();
        if (!Boolean.TRUE.equals(cycle.getIsClosed())) return false;

        // Verify the maternal outcome is actually terminal.
        // If is_closed=true but outcome is null/empty or non-terminal (e.g. Alive), auto-correct the flag.
        String outcome = cycle.getMaternalOutcome();
        if (outcome == null || outcome.trim().isEmpty()) {
            cycle.setIsClosed(false);
            pregnancyCycleRepository.save(cycle);
            return false;
        }
        if (!TERMINAL_OUTCOMES.contains(outcome) && !TERMINAL_OUTCOMES.contains(outcome.trim().toUpperCase())) {
            cycle.setIsClosed(false);
            pregnancyCycleRepository.save(cycle);
            return false;
        }

        // Cross-check with the latest visit's maternal outcome.
        // The cycle's maternal_outcome may be stale if a newer visit was saved
        // before the updateMaternalOutcome logic was in place.
        Optional<String> latestVisitOutcome = pmtctVisitRepository.findLatestMaternalOutcomeByCycleUuid(cycleUuid);
        if (latestVisitOutcome.isPresent()) {
            String visitOutcome = latestVisitOutcome.get();
            if (visitOutcome != null && !visitOutcome.isEmpty()
                && !TERMINAL_OUTCOMES.contains(visitOutcome)
                && !TERMINAL_OUTCOMES.contains(visitOutcome.trim().toUpperCase())) {
                // Latest visit has a non-terminal outcome — auto-correct the cycle
                cycle.setIsClosed(false);
                cycle.setMaternalOutcome(visitOutcome);
                pregnancyCycleRepository.save(cycle);
                return false;
            }
        }

        return true;
    }

    public void reopenCycle(String cycleUuid) {
        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleUuid);
        if (cycleOptional.isPresent()) {
            PmtctPregnancyCycle cycle = cycleOptional.get();
            cycle.setIsClosed(false);
            cycle.setLastModifiedDate(LocalDateTime.now());
            Optional<User> currentUser = userService.getUserWithRoles();
            currentUser.ifPresent(user -> cycle.setLastModifiedBy(user.getUserName()));
            pregnancyCycleRepository.save(cycle);
        }
    }

    public List<PmtctPregnancyCycleResponseDto> getAllCyclesByPatientUuid(String patientUuid) {
        List<PmtctPregnancyCycle> cycles = pregnancyCycleRepository.findAllByPatientUuid(patientUuid);
        return cycles.stream()
                .map(this::convertToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Validates if a patient can enroll in a new ANC/PMTCT cycle
     * Checks the last pregnancy cycle's maternal outcome and closure status
     */
    public EnrollmentValidationDto validateEnrollment(String patientUuid) {
        EnrollmentValidationDto validation = new EnrollmentValidationDto();

        // Get the latest pregnancy cycle
        Optional<PmtctPregnancyCycle> latestCycleOptional = pregnancyCycleRepository.findLatestByPatientUuid(patientUuid);

        // If no previous cycle exists, allow enrollment directly
        if (!latestCycleOptional.isPresent()) {
            validation.setCanEnrollDirectly(true);
            validation.setRequiresConfirmation(false);
            validation.setMessage("No previous pregnancy cycle found. Patient can enroll.");
            return validation;
        }

        PmtctPregnancyCycle latestCycle = latestCycleOptional.get();
        validation.setLastCycleId(latestCycle.getId());
        validation.setIsClosed(latestCycle.getIsClosed());
        validation.setLastMaternalOutcome(latestCycle.getMaternalOutcome());

        // List of negative outcomes that allow direct enrollment
        // NOTE: LTFU is intentionally excluded — LTFU requires confirmation before re-enrollment
        List<String> negativeOutcomes = Arrays.asList(
            "MATERNAL_OUTCOME_DEAD",
            "MATERNAL_OUTCOME_TRANSFERRED_OUT",
            "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_(NEW_PREGNANCY)",
            "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_NEW_PREGNANCY",
            "MATERNAL_OUTCOME_TRANSITIONED_TO_ART_CLINIC"
        );

        // LTFU outcomes that require confirmation before re-enrollment
        List<String> ltfuOutcomes = Arrays.asList(
            "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP",
            "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP"
        );

        String maternalOutcome = latestCycle.getMaternalOutcome() != null
            ? latestCycle.getMaternalOutcome().trim().toUpperCase()
            : "";
        Boolean isClosed = latestCycle.getIsClosed() != null ? latestCycle.getIsClosed() : false;

        // LTFU always requires confirmation regardless of cycle closed status
        if (ltfuOutcomes.stream().anyMatch(outcome -> outcome.equalsIgnoreCase(maternalOutcome))) {
            validation.setCanEnrollDirectly(false);
            validation.setRequiresConfirmation(true);
            validation.setMessage("This client was previously Lost to Follow-Up (LTFU). Do you want to document a new enrolment?");
            return validation;
        }

        // Check if cycle is closed
        if (isClosed) {
            // If closed and has negative outcome, allow direct enrollment
            if (negativeOutcomes.stream().anyMatch(outcome -> outcome.equalsIgnoreCase(maternalOutcome))) {
                validation.setCanEnrollDirectly(true);
                validation.setRequiresConfirmation(false);
                validation.setMessage("Previous cycle closed with negative outcome. Patient can enroll in new cycle.");
            } else {
                // If closed but outcome is not negative (e.g., ALIVE), require confirmation
                validation.setCanEnrollDirectly(false);
                validation.setRequiresConfirmation(true);
                validation.setMessage("PMTCT Client still active. Do you want to document another enrolment?");
            }
        } else {
            // Cycle is not closed
            if (negativeOutcomes.stream().anyMatch(outcome -> outcome.equalsIgnoreCase(maternalOutcome))) {
                // Has negative outcome but not closed - allow direct enrollment
                validation.setCanEnrollDirectly(true);
                validation.setRequiresConfirmation(false);
                validation.setMessage("Previous cycle has negative outcome. Patient can enroll in new cycle.");
            } else if ("MATERNAL_OUTCOME_ALIVE".equalsIgnoreCase(maternalOutcome)) {
                // Client is alive and cycle is not closed - require confirmation
                validation.setCanEnrollDirectly(false);
                validation.setRequiresConfirmation(true);
                validation.setMessage("PMTCT Client still active. Do you want to document another enrolment?");
            } else {
                // No maternal outcome or other outcome - require confirmation
                validation.setCanEnrollDirectly(false);
                validation.setRequiresConfirmation(true);
                validation.setMessage("PMTCT Client still active. Do you want to document another enrolment?");
            }
        }

        return validation;
    }

    /**
     * Checks if a patient has ever tested positive for Syphilis or Hepatitis
     * across ALL pregnancy cycles (pmtct_hts + hts_encounter tables).
     * Used by the frontend to determine menu visibility for MIP and related forms.
     */
    public java.util.Map<String, Object> getHistoricalSerologyStatus(String patientUuid) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("syphilisEverPositive", false);
        result.put("hepatitisEverPositive", false);

        if (patientUuid == null || patientUuid.isEmpty()) {
            return result;
        }

        try {
            // Check hts_encounter table (post-migration records)
            boolean syphFromHtsEnc = htsEncounterProxyRepository.hasEverPositiveSyphilis(patientUuid);
            boolean hepFromHtsEnc = htsEncounterProxyRepository.hasEverPositiveHepatitis(patientUuid);

            // Check pmtct_hts table (legacy records)
            boolean syphFromLegacy = pmtctHtsRepository.hasEverPositiveSyphilis(patientUuid);
            boolean hepFromLegacy = pmtctHtsRepository.hasEverPositiveHepatitis(patientUuid);

            result.put("syphilisEverPositive", syphFromHtsEnc || syphFromLegacy);
            result.put("hepatitisEverPositive", hepFromHtsEnc || hepFromLegacy);
        } catch (Exception e) {
            // Safe to return defaults on failure
        }

        return result;
    }

    /**
     * Checks if a patient has ever been HIV positive in any ANC, HTS, or Enrollment record
     * This method is called by the frontend to auto-populate HIV status
     * @param patientUuid The patient's UUID
     * @return The HIV status ("POSITIVE" or null)
     */
    public String getHistoricalHivStatus(String patientUuid) {
        if (patientUuid == null || patientUuid.isEmpty()) {
            return null;
        }

        Optional<User> currentUser = userService.getUserWithRoles();
        if (!currentUser.isPresent()) {
            return null;
        }
        Long facilityId = currentUser.get().getCurrentOrganisationUnitId();

        // Check hts_encounter table for PMTCT HTS records
        Optional<String> newHtsResult = htsEncounterProxyRepository.findLatestFinalResult(patientUuid);
        if (newHtsResult.isPresent() && isPositiveResult(newHtsResult.get())) {
            return "POSITIVE";
        }

        // Check hts_client table for HTS module records (may be removed later)
        try {
            Optional<HtsClientProjection> htsClientResult = ancRepository
                    .getHtsRecordByPersonsUuidAAndFacilityId(patientUuid, facilityId);
            if (htsClientResult.isPresent() && isPositiveResult(htsClientResult.get().getHivTestResult())) {
                return "POSITIVE";
            }
        } catch (Exception e) {
            // hts_client table may not exist - safe to ignore
        }

        // Check PMTCT Enrollment records for positive HIV status
        PMTCTEnrollment enrollment = pmtctEnrollmentRepository.findByPatientUuidAndArchived(patientUuid, false);
        if (enrollment != null && facilityId.equals(enrollment.getFacilityId())) {
            String hivStatus = enrollment.getHivStatus();
            if (isPositiveResult(hivStatus)) {
                return "POSITIVE";
            }
        }

        // Check ANC records for positive HIV status
        Optional<ANC> ancOptional = ancRepository.findLatestANCByPatientUuidAndArchived(patientUuid,false);
        if (ancOptional.isPresent()) {
            ANC anc = ancOptional.get();
            if (facilityId.equals(anc.getFacilityId())) {
                String staticHivStatus = anc.getStaticHivStatus();
                String previouslyKnownStatus = anc.getPreviouslyKnownHivStatus();

                if (isPositiveResult(staticHivStatus) || isPositiveResult(previouslyKnownStatus)) {
                    return "POSITIVE";
                }
            }
        }

        return null;
    }

    /**
     * Helper method to check if a result indicates HIV positive
     */
    private boolean isPositiveResult(String result) {
        if (result == null || result.isEmpty()) {
            return false;
        }

        String normalizedResult = result.trim().toUpperCase();
        if (normalizedResult.contains("NON-REACTIVE") || normalizedResult.contains("NON REACTIVE")) {
            return false;
        }
        return normalizedResult.contains("POSITIVE") ||
               normalizedResult.contains("REACTIVE") ||
               normalizedResult.equals("HIV_STATUS_POSITIVE");
    }

}
