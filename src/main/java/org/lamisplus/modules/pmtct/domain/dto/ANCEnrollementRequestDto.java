package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class ANCEnrollementRequestDto{
    @NotNull(message = "Source is required")
    private String source;
    private String id;
    private String ancNo;
    private String ancAttendance;
    private String referredFromSpokesSite;

    private LocalDate dateOfEnrollment;
    private Integer gravida;
    private Integer parity;
    @JsonProperty("lmp")
    private LocalDate LMP;
    @JsonProperty("gaweeks")
    private Integer gAWeeks;
    private final String patient_uuid;

    @NotNull(message = "pmtctCycleUuid is required")
    private String pmtctCycleUuid;

    private VitalSignsDto vitalSigns;
    private CounsellingDto counselling;
    private SyphilisInfoDto syphilisInfo;
    private HepatitisBDto hepatitisBInfo;
    private HepatitisCDto hepatitisCInfo;
    private UrinalysisDto urinalysis;
    private LabTestDto labTest;
    private InterventionsDto interventions;
    private String outcomeOfVisit;
    private String referralReason;
    private String transportationOut;

}
