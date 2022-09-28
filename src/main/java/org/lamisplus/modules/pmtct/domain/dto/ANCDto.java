package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ANCDto implements Serializable
{

    private Long  id;
    private String ancNo;
    private LocalDate  visitDate;
    private Double systolic;
    private Double diastolic;
    private Double bodyWeight;
    private Double fundalHeight;
    private String  fetalPresentation;
    private String gestationalAge;
    private String  visitType;
    private String  visitStatus;
    private Double viralLoad;
    private LocalDate  sampleDate;
    private String  tbStatus;
    private LocalDate nextAppointmentDate;
    private String  nutritionalSupport;
    private String  infantFeeding;
    private String  familyPlaningMethod;
    private String  referredTo;
    private String  agreement;
    private Long archived;
    private String uuid;



}
