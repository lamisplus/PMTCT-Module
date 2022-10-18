 package org.lamisplus.modules.pmtct.domain.dto;

 import lombok.Data;

 import java.time.LocalDate;

 @Data
 public class PMTCTEnrollmentRespondDto
 {
     private Long id;
     private String ancNo;
     private LocalDate pmtctEnrollmentDate;
     private Integer gAWeeks;
     private String systolic;
     private String diastolic;
     private String bodyWeight;
     private String fundalHeight;
     private String fetalPresentation;
     private String visitType;
     private String visitStatus;
     private String tbStatus;
     private LocalDate nextAppointmentDate;
     private String nutritionalSupport;
     private String infantFeeding;
     private String fpl;
     private String referredTo;
     private String agreed2PartnerNotification;
     private String viralLoadSample;
     private LocalDate viralLoadSampleDate;
     private String hospitalNumber;
     private String fullName;
     private int age;
     private String uuid;

 }