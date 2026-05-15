 package org.lamisplus.modules.pmtct.domain.dto;

 import com.fasterxml.jackson.annotation.JsonProperty;
 import lombok.AllArgsConstructor;
 import lombok.Builder;
 import lombok.Data;
 import org.lamisplus.modules.patient.domain.dto.PersonDto;
 import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;


 import javax.validation.constraints.NotNull;
 import java.io.Serializable;
 import java.time.LocalDate;

 @Data
 @AllArgsConstructor
 @Builder

 public class PMTCTEnrollmentRequestDto implements Serializable
 {
     @NotNull(message = "Source is required")
     private String source;
     private String id;
     private LocalDate pmtctEnrollmentDate;
     private Integer gravida;
     @JsonProperty("gaweeks")
     private Integer gAWeeks;
     private String entryPoint;
     private LocalDate artStartDate;
     private String artStartTime;
     private String tbStatus;
     private PersonDto personDto;
     private String patientUuid;
     private String hivStatus;
     private LocalDate lmp;

     private Long regimenTypeId;
     private String regimenId;
     private String urinalysis;
     private HbvDetailsDto hbvDetails;
     private SyphilisDetailsDto syphilisDetails;
     private String timeOfHivDiagnosis;
     private LocalDate dateOfDelivery;
     private LocalDate expectedDeliveryDate;
     private String modeOfDelivery;
     private String modeOfDeliveryOther;
     @NotNull(message = "pmtctCycleUuid is required")
     private String pmtctCycleUuid;

 }

