 package org.lamisplus.modules.pmtct.domain.dto;

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
     private Integer gAWeeks;
     private String entryPoint;
     private LocalDate artStartDate;
     private String artStartTime;
     private String tbStatus;
     private String hospitalNumber;
     private String fullName;
     private int age;
     private String uuid;
     private String hivStatus;
     private LocalDate lmp;
     private boolean pmtctRegStatus;
     private String personUuid;
     private String  motherArtInitiationTime;
     private Long regimenTypeId;
     private String regimenId;
     private String hepatitisB;
     private String urinalysis;
     private String timeOfHivDiagnosis;
     private String dateOfDelivery;
 }