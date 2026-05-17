package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.patient.domain.dto.AddressDto;
import org.lamisplus.modules.patient.domain.dto.ContactDto;
import org.lamisplus.modules.patient.domain.dto.ContactPointDto;
import org.lamisplus.modules.patient.domain.dto.IdentifierDto;

import javax.persistence.Column;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
@Data
@AllArgsConstructor
@Builder
public class PmtctVisitRequestDto implements Serializable {
    @NotNull(message = "Source is required")
    private String source;
    private String id;
    @JsonProperty("enteryPoint")
    private String entryPoint;
    private String currentStatus;
    private Double weight;
    private Double sfhLength;
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String regimenLineId;
    private String currentHbvStatus;
    private String nameOfHbvDrug;
    private String currentSyphilisStatus;
    private String nameOfSyphilisDrug;
    private LocalDate dateOfInitialVisit;
    private LocalDate dateOfVisit;
    private String fpCounseling;
    private String fpMethod;
    private String timeOfViralLoad;
    private LocalDate dateOfViralLoad;
    private LocalDate dateOfVlResultReceived;
    private Integer gaOfViralLoad;
    private Long resultOfViralLoad;
    private String infantFeedingPractice;
    private String infantOnCtx;
    private String referredToTreatment;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String  maternalOutcome;
    @JsonProperty("dateOfmeternalOutcome")
    private LocalDate dateOfMaternalOutcome;
    private String visitStatus;
    private LocalDate nextAppointmentDate;
    private String signature;
    private String patientUuid;
    @NotNull(message = "pmtctCycleUuid is required")
    private String pmtctCycleUuid;
    private String visitType;
    private Double height;
    private Double systolic;
    private Double diastolic;
    private Integer gaWeeks;
    private String numberOfAncVisits;
    private String ancAttendance;
    private String counsellingHts;
    private String counsellingFgm;
    private String counsellingFp;
    private String counsellingMaternalNutrition;
    private String counsellingEarlyBf;
    private String counsellingExclusiveBf;
    private String hbPcv;
    private String bloodSugarGdm;
    private String urinalysisSugar;
    private String urinalysisProteins;
    private String llinGiven;
    private String iptDose;
    private String hematinicsGiven;
    private String tdImmunization;
    private String associatedProblems;
    private String referralReason;
    private String transportationOut;
    private String hepatitisCTestResult;
    private String referredForHcv;
    private String outcomeOfVisit;
    private String pcv;
    private SyphilisInfoDto syphilisInfo;
    private HepatitisBDto hepatitisBInfo;
    private HepatitisCDto hepatitisCInfo;
}
