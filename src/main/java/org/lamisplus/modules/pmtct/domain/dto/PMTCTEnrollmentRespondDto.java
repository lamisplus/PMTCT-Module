 package org.lamisplus.modules.pmtct.domain.dto;

 import com.fasterxml.jackson.annotation.JsonProperty;
 import lombok.Data;
 import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;

 import java.time.LocalDate;

 @Data
 public class PMTCTEnrollmentRespondDto
 {
     private Long id;
     private String ancNo;
     private LocalDate pmtctEnrollmentDate;
     private Integer gravida;
     @JsonProperty("gaweeks")
     private Integer gAWeeks;
     public String entryPoint;
     public LocalDate artStartDate;
     private String artStartTime;
     private String tbStatus;
     private String hospitalNumber;
     private String fullName;
     private int age;
     private String uuid;
     public String hivStatus;
     private LocalDate lmp;
     private boolean pmtctRegStatus;
     private String patientUuid;

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
     private String pmtctCycleUuid;
     private String source;

 }