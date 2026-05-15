package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

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
    private Integer gravida;
    private Integer parity;
    @JsonProperty("lmp")
    private LocalDate LMP;
    @JsonProperty("gaweeks")
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
    private String hbPcv;
    private String bloodSugarGdm;
    private String llinGiven;
    private String iptDose;
    private String hematinicsGiven;
    private String tdImmunization;
    private String associatedProblems;
    private String outcomeOfVisit;
    private String referralReason;
    private String transportationOut;

}
