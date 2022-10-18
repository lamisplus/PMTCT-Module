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
 }

