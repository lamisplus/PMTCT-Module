package org.lamisplus.modules.pmtct.domain.dto;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
@RequiredArgsConstructor
public class PmtctVisitResponseDto implements Serializable
{
    private Long id;
    private String hospitalNumber;
    private String uuid;
    private String ancNo;
    private String fullName;
    private int age;
    private Long facilityId;
    private LocalDate dateOfVisit;
    private String pulse;
    private String respiratoryRate;
    private String temperature;
    private String bodyWeight;
    private String height;
    private String systolic;
    private String diastolic;
    private String clinicalNotes;
    private String whoStaging;
    private String functionalStatus;
    private String levelOfAdherence;
    private String onAntiTbDrugs;
    private LocalDate nextClinicalAppointmentDate;
    private Object opportunisticInfection;
    private Object adr;
}
