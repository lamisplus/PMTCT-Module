package org.lamisplus.modules.pmtct.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.pmtct.domain.dto.EnrollmentValidationDto;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleResponseDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHts;
import org.lamisplus.modules.pmtct.domain.entity.PmtctPregnancyCycle;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.PmtctHtsRepository;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
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
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentRepository;

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
        // Check if the patient already has an inactive record
        Optional<PmtctPregnancyCycle> existingInactiveCycle = pregnancyCycleRepository.findInactiveByPersonUuid(requestDto.getPersonUuid());

        if (existingInactiveCycle.isPresent()) {
            // Return the existing inactive record instead of creating a new one
            return convertToResponseDto(existingInactiveCycle.get());
        }

        // No inactive record found, create a new one
        Optional<User> currentUser = userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));
        Long facilityId = user.getCurrentOrganisationUnitId();

        PmtctPregnancyCycle pregnancyCycle = new PmtctPregnancyCycle();
        pregnancyCycle.setPersonUuid(requestDto.getPersonUuid());
        pregnancyCycle.setMaternalOutcome(requestDto.getMaternalOutcome());
        pregnancyCycle.setEntryPoint(mapEntryPoint(requestDto.getEntryPoint()));
        pregnancyCycle.setHivStatus(requestDto.getHivStatus());
        pregnancyCycle.setPregnancyOutcome(requestDto.getPregnancyOutcome());
        pregnancyCycle.setNumberOfInfants(requestDto.getNumberOfInfants());
        pregnancyCycle.setPmtctStatus(requestDto.getPmtctStatus());
        pregnancyCycle.setFacilityId(facilityId);
        pregnancyCycle.setCreatedBy(user.getUserName());
        pregnancyCycle.setCreatedDate(LocalDateTime.now());
        pregnancyCycle.setLastModifiedBy(user.getUserName());
        pregnancyCycle.setLastModifiedDate(LocalDateTime.now());
        pregnancyCycle.setUuid(UUID.randomUUID().toString());
        pregnancyCycle.setArchived(0L);
        pregnancyCycle.setIsClosed(false);

        PmtctPregnancyCycle savedCycle = pregnancyCycleRepository.save(pregnancyCycle);

        return convertToResponseDto(savedCycle);
    }

    private PmtctPregnancyCycleResponseDto convertToResponseDto(PmtctPregnancyCycle entity) {
        PmtctPregnancyCycleResponseDto responseDto = new PmtctPregnancyCycleResponseDto();
        BeanUtils.copyProperties(entity, responseDto);
        return responseDto;
    }

    public PmtctPregnancyCycleResponseDto getLatestCycleByPersonUuid(String personUuid) {
        Optional<PmtctPregnancyCycle> latestCycle = pregnancyCycleRepository.findLatestByPersonUuid(personUuid);
        return latestCycle.map(this::convertToResponseDto).orElse(null);
    }

    public void updatePmtctStatusToActive(Long cycleId) {
        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleId);
        if (cycleOptional.isPresent()) {
            PmtctPregnancyCycle cycle = cycleOptional.get();
            cycle.setPmtctStatus("ACTIVE");
            cycle.setLastModifiedDate(LocalDateTime.now());

            Optional<User> currentUser = userService.getUserWithRoles();
            currentUser.ifPresent(user -> cycle.setLastModifiedBy(user.getUserName()));

            pregnancyCycleRepository.save(cycle);
        }
    }

    public void updateMaternalOutcome(Long cycleId, String maternalOutcome) {
        if (cycleId == null || maternalOutcome == null) {
            return;
        }

        Optional<PmtctPregnancyCycle> cycleOptional = pregnancyCycleRepository.findById(cycleId);
        if (cycleOptional.isPresent()) {
            PmtctPregnancyCycle cycle = cycleOptional.get();
            cycle.setMaternalOutcome(maternalOutcome);
            cycle.setLastModifiedDate(LocalDateTime.now());

            Optional<User> currentUser = userService.getUserWithRoles();
            currentUser.ifPresent(user -> cycle.setLastModifiedBy(user.getUserName()));

            pregnancyCycleRepository.save(cycle);
        }
    }


    public List<PmtctPregnancyCycleResponseDto> getAllCyclesByPersonUuid(String personUuid) {
        List<PmtctPregnancyCycle> cycles = pregnancyCycleRepository.findAllByPersonUuid(personUuid);
        return cycles.stream()
                .map(this::convertToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Validates if a patient can enroll in a new ANC/PMTCT cycle
     * Checks the last pregnancy cycle's maternal outcome and closure status
     */
    public EnrollmentValidationDto validateEnrollment(String personUuid) {
        EnrollmentValidationDto validation = new EnrollmentValidationDto();

        // Get the latest pregnancy cycle
        Optional<PmtctPregnancyCycle> latestCycleOptional = pregnancyCycleRepository.findLatestByPersonUuid(personUuid);

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
        List<String> negativeOutcomes = Arrays.asList(
            "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP",
            "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP",
            "MATERNAL_OUTCOME_DEAD",
            "MATERNAL_OUTCOME_TRANSFERRED_OUT",
            "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_(NEW_PREGNANCY)",
            "MATERNAL_OUTCOME_TRANSFERRED_TO_ANOTHER_PMTCT_COHORT_NEW_PREGNANCY",
            "MATERNAL_OUTCOME_TRANSITIONED_TO_ART_CLINIC"
        );

        String maternalOutcome = latestCycle.getMaternalOutcome() != null
            ? latestCycle.getMaternalOutcome().trim().toUpperCase()
            : "";
        Boolean isClosed = latestCycle.getIsClosed() != null ? latestCycle.getIsClosed() : false;

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
     * Checks if a patient has ever been HIV positive in any ANC, HTS, or Enrollment record
     * This method is called by the frontend to auto-populate HIV status
     * @param personUuid The patient's UUID
     * @return The HIV status ("POSITIVE" or null)
     */
    public String getHistoricalHivStatus(String personUuid) {
        if (personUuid == null || personUuid.isEmpty()) {
            return null;
        }

        Optional<User> currentUser = userService.getUserWithRoles();
        if (!currentUser.isPresent()) {
            return null;
        }
        Long facilityId = currentUser.get().getCurrentOrganisationUnitId();

        // Check PMTCT HTS records for positive result
        List<PmtctHts> htsRecords = pmtctHtsRepository.findAll();
        for (PmtctHts hts : htsRecords) {
            if (personUuid.equals(hts.getPersonUuid()) &&
                hts.getArchived() != null && hts.getArchived() == 0L &&
                facilityId.equals(hts.getFacilityId())) {
                String finalResult = hts.getFinalResult();
                if (isPositiveResult(finalResult)) {
                    return "POSITIVE";
                }
            }
        }

        // Check PMTCT Enrollment records for positive HIV status
        List<PMTCTEnrollment> enrollments = pmtctEnrollmentRepository.findAll();
        for (PMTCTEnrollment enrollment : enrollments) {
            if (personUuid.equals(enrollment.getPersonUuid()) &&
                enrollment.getArchived() != null && enrollment.getArchived() == 0L &&
                facilityId.equals(enrollment.getFacilityId())) {
                String hivStatus = enrollment.getHivStatus();
                if (isPositiveResult(hivStatus)) {
                    return "POSITIVE";
                }
            }
        }

        // Check ANC records for positive HIV status
        Optional<ANC> ancOptional = ancRepository.findLatestANCByPersonUuidAndArchived(personUuid, 0L);
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
        return normalizedResult.contains("POSITIVE") ||
               normalizedResult.contains("REACTIVE") ||
               normalizedResult.equals("HIV_STATUS_POSITIVE");
    }

}
