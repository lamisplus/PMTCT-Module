package org.lamisplus.modules.pmtct.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PmtctPregnancyCycleResponseDto;
import org.lamisplus.modules.pmtct.domain.entity.PmtctPregnancyCycle;
import org.lamisplus.modules.pmtct.repository.PmtctPregnancyCycleRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PmtctPregnancyCycleService {

    private final PmtctPregnancyCycleRepository pregnancyCycleRepository;
    private final UserService userService;

    public PmtctPregnancyCycleResponseDto save(PmtctPregnancyCycleRequestDto requestDto) {
        Optional<User> currentUser = userService.getUserWithRoles();
        User user = currentUser.orElseThrow(() -> new RuntimeException("User not found"));
        Long facilityId = user.getCurrentOrganisationUnitId();

        PmtctPregnancyCycle pregnancyCycle = new PmtctPregnancyCycle();
        pregnancyCycle.setPersonUuid(requestDto.getPersonUuid());
        pregnancyCycle.setMaternalOutcome(requestDto.getMaternalOutcome());
        pregnancyCycle.setEntryPoint(requestDto.getEntryPoint());
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

    public List<PmtctPregnancyCycleResponseDto> getAllCyclesByPersonUuid(String personUuid) {
        List<PmtctPregnancyCycle> cycles = pregnancyCycleRepository.findAllByPersonUuid(personUuid);
        return cycles.stream()
                .map(this::convertToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }




}
