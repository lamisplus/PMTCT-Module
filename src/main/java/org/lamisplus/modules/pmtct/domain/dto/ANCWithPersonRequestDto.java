package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.pmtct.util.SafeIntegerDeserializer;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ANCWithPersonRequestDto implements Serializable
{
    @NotNull(message = "Source is required")
    private String source;
    private String id;
    private String ancNo;
    private String ancSetting;
    private String communitySetting;

    private LocalDate dateOfEnrollment;
    @JsonDeserialize(using = SafeIntegerDeserializer.class)
    private Integer gravida;
    @JsonDeserialize(using = SafeIntegerDeserializer.class)
    private Integer parity;
    @JsonProperty("lmp")
    private LocalDate LMP;
    @JsonProperty("gaweeks")
    @JsonDeserialize(using = SafeIntegerDeserializer.class)
    private Integer gAWeeks;
    private String staticHivStatus;
    private String sourceOfReferral;
    private PersonDto personDto;
    private String previouslyKnownHivStatus;
    private String currentlyOnArt;
    private String facilityEnrolledIn;

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
