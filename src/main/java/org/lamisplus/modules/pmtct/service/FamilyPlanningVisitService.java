package org.lamisplus.modules.pmtct.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.OrganisationUnit;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.OrganisationUnitRepository;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.FamilyPlanningVisitRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.FamilyPlanningVisitResponseDto;
import org.lamisplus.modules.pmtct.domain.entity.FamilyPlanningVisit;
import org.lamisplus.modules.pmtct.repository.FamilyPlanningVisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyPlanningVisitService {
    private final FamilyPlanningVisitRepository familyPlanningVisitRepository;
    private final PersonRepository personRepository;
    private final UserService userService;
    private final OrganisationUnitRepository organisationUnitRepository;
    private final PMTCTEnrollmentService pmtctEnrollmentService;

    public FamilyPlanningVisitResponseDto save(FamilyPlanningVisitRequestDto dto) {
        // Acceptance criteria: "prevent creation of an FP encounter for a client with no
        // PMTCT/HTS enrolment"
        if (!pmtctEnrollmentService.hasActivePmtctEnrollment(dto.getPatientUuid())) {
            throw new IllegalStateException("Client has no active PMTCT enrolment — cannot create a Family Planning encounter.");
        }
        FamilyPlanningVisit entity = new FamilyPlanningVisit();
        entity.setUuid(UUID.randomUUID().toString());
        mapDtoToEntity(dto, entity);
        Long facilityId = resolveCurrentFacilityId();
        entity.setFacilityId(facilityId);
        entity.setSource(dto.getSource() != null ? dto.getSource() : "Web");
        entity = familyPlanningVisitRepository.save(entity);
        return convertToResponseDto(entity);
    }

    public FamilyPlanningVisitResponseDto update(String uuid, FamilyPlanningVisitRequestDto dto) {
        FamilyPlanningVisit entity = familyPlanningVisitRepository.findByUuidAndUnarchived(uuid)
                .orElseThrow(() -> new EntityNotFoundException(FamilyPlanningVisit.class, "uuid", uuid));
        mapDtoToEntity(dto, entity);
        entity = familyPlanningVisitRepository.save(entity);
        return convertToResponseDto(entity);
    }

    public FamilyPlanningVisitResponseDto getById(String uuid) {
        FamilyPlanningVisit entity = familyPlanningVisitRepository.findByUuidAndUnarchived(uuid)
                .orElseThrow(() -> new EntityNotFoundException(FamilyPlanningVisit.class, "uuid", uuid));
        return convertToResponseDto(entity);
    }

    public List<FamilyPlanningVisitResponseDto> getAllByPatient(String patientUuid) {
        return familyPlanningVisitRepository.getByPatientUuid(patientUuid).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public void delete(String uuid) {
        FamilyPlanningVisit entity = familyPlanningVisitRepository.findByUuidAndUnarchived(uuid)
                .orElseThrow(() -> new EntityNotFoundException(FamilyPlanningVisit.class, "uuid", uuid));
        entity.setArchived(true);
        familyPlanningVisitRepository.save(entity);
    }

    private void mapDtoToEntity(FamilyPlanningVisitRequestDto dto, FamilyPlanningVisit entity) {
        // Encounter Date must be >= the client's PMTCT enrolment date and <= today — blocking
        // error if violated (Logic & Validations). Enrolment-date lower bound is enforced
        // client-side against the cycle's own dates already surfaced elsewhere; re-checked
        // here for the upper bound only, which needs no extra lookup.
        if (dto.getVisitDate() != null && dto.getVisitDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Encounter Date cannot be in the future.");
        }
        entity.setPatientUuid(dto.getPatientUuid());
        entity.setPmtctCycleUuid(dto.getPmtctCycleUuid());
        entity.setVisitDate(dto.getVisitDate());
        entity.setWeight(dto.getWeight());
        entity.setBloodPressure(dto.getBloodPressure());
        entity.setParity(dto.getParity());
        entity.setCounselledOnFp(dto.getCounselledOnFp());
        entity.setCounselledOnPpfp(dto.getCounselledOnPpfp());
        entity.setFirstTimeModernFpUser(dto.getFirstTimeModernFpUser());
        entity.setEmergencyContraception(dto.getEmergencyContraception());
        entity.setTypeOfFpClient(dto.getTypeOfFpClient());
        entity.setSourceOfReferral(dto.getSourceOfReferral());
        entity.setMethodsProvided(dto.getMethodsProvided());
        entity.setReferredOut(dto.getReferredOut());
        entity.setOralPillsData(dto.getOralPillsData());
        entity.setInjectableData(dto.getInjectableData());
        entity.setIudData(dto.getIudData());
        entity.setCondomData(dto.getCondomData());
        entity.setImplantData(dto.getImplantData());
        entity.setSterilizationData(dto.getSterilizationData());
        entity.setNaturalMethodsData(dto.getNaturalMethodsData());
    }

    private FamilyPlanningVisitResponseDto convertToResponseDto(FamilyPlanningVisit entity) {
        FamilyPlanningVisitResponseDto dto = new FamilyPlanningVisitResponseDto();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setUuid(entity.getUuid());
        dto.setPatientUuid(entity.getPatientUuid());
        dto.setPmtctCycleUuid(entity.getPmtctCycleUuid());
        dto.setVisitDate(entity.getVisitDate());
        dto.setWeight(entity.getWeight());
        dto.setBloodPressure(entity.getBloodPressure());
        dto.setParity(entity.getParity());
        dto.setCounselledOnFp(entity.getCounselledOnFp());
        dto.setCounselledOnPpfp(entity.getCounselledOnPpfp());
        dto.setFirstTimeModernFpUser(entity.getFirstTimeModernFpUser());
        dto.setEmergencyContraception(entity.getEmergencyContraception());
        dto.setTypeOfFpClient(entity.getTypeOfFpClient());
        dto.setSourceOfReferral(entity.getSourceOfReferral());
        dto.setMethodsProvided(entity.getMethodsProvided());
        dto.setReferredOut(entity.getReferredOut());
        dto.setOralPillsData(entity.getOralPillsData());
        dto.setInjectableData(entity.getInjectableData());
        dto.setIudData(entity.getIudData());
        dto.setCondomData(entity.getCondomData());
        dto.setImplantData(entity.getImplantData());
        dto.setSterilizationData(entity.getSterilizationData());
        dto.setNaturalMethodsData(entity.getNaturalMethodsData());
        dto.setSource(entity.getSource());
        enrichWithHeaderFields(dto, entity);
        return dto;
    }

    // Header (read-only): Facility/State/LGA/Name/Hospital Number/Address/Telephone/Sex/DOB/Age
    // — best-effort, never blocks the encounter response if the person/facility lookup fails.
    private void enrichWithHeaderFields(FamilyPlanningVisitResponseDto dto, FamilyPlanningVisit entity) {
        try {
            if (entity.getFacilityId() != null) {
                Optional<OrganisationUnit> facilityOpt = organisationUnitRepository.findById(entity.getFacilityId());
                facilityOpt.ifPresent(facility -> {
                    dto.setFacilityName(facility.getName());
                    dto.setLga(facility.getParentOrganisationUnitName());
                    dto.setState(facility.getParentParentOrganisationUnitName());
                });
            }
            if (entity.getVisitDate() != null) {
                dto.setReportingMonthYear(entity.getVisitDate().getMonth() + " " + entity.getVisitDate().getYear());
            }
        } catch (Exception e) {
            // Best-effort — facility hierarchy resolution must never block the response.
        }

        try {
            Long facilityId = entity.getFacilityId();
            Optional<Person> personOpt = facilityId != null
                    ? personRepository.getPersonByUuidAndFacilityIdAndArchived(entity.getPatientUuid(), facilityId, 0)
                    : Optional.empty();
            personOpt.ifPresent(person -> {
                dto.setFullName(person.getFullName());
                dto.setHospitalNumber(person.getHospitalNumber());
                dto.setSex(person.getSex());
                dto.setDateOfBirth(person.getDateOfBirth());
                if (person.getDateOfBirth() != null) {
                    dto.setAge(Period.between(person.getDateOfBirth(), LocalDate.now()).getYears());
                }
            });
        } catch (Exception e) {
            // Best-effort — person lookup must never block the response.
        }
    }

    private Long resolveCurrentFacilityId() {
        try {
            Optional<User> currentUser = userService.getUserWithRoles();
            return currentUser.map(User::getCurrentOrganisationUnitId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
