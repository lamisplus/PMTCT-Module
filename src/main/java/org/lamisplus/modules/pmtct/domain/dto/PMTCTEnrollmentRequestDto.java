 package org.lamisplus.modules.pmtct.domain.dto;

 import lombok.AllArgsConstructor;
 import lombok.Builder;
 import lombok.Data;

 import java.io.Serializable;
 import java.time.LocalDate;

 @Data
 @AllArgsConstructor
 @Builder

 public class PMTCTEnrollmentRequestDto implements Serializable
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
     private String timeOfHivDiagnosis;
 }

