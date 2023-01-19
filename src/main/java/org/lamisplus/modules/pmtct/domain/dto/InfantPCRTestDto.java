package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
@Data
public class InfantPCRTestDto implements Serializable
{
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Long ageAtTest ;
    private String testType;
    private LocalDate dateSampleCollected ;
    private LocalDate dateSampleSent;
    private LocalDate dateResultReceivedAtFacility;
    private LocalDate dateResultReceivedByCaregiver;
    private String results;
    private String uuid;
}
