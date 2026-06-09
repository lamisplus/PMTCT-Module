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
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String regimenLineId;
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
    private Integer gaWeeks;
    private String numberOfAncVisits;
    private String ancAttendance;
    private String referralReason;
    private String transportationOut;
    private String outcomeOfVisit;
    private VitalSignsDto vitalSigns;
    private CounsellingDto counselling;
    private LabTestDto labTest;
    private InterventionsDto interventions;
    private SyphilisInfoDto syphilisInfo;
    private HepatitisBDto hepatitisBInfo;
    private HepatitisCDto hepatitisCInfo;
}
