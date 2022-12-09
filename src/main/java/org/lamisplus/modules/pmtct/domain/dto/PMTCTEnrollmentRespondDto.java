 package org.lamisplus.modules.pmtct.domain.dto;

 import lombok.Data;

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

 }