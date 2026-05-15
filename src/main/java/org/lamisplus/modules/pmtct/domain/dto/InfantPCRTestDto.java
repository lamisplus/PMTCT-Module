package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InfantPCRTestDto implements Serializable
{
    private String source;
    private String id;
    @CreatedDate
    private LocalDate visitDate = LocalDate.now();
    private String infantHospitalNumber;
    private String ancNumber;
    private String ageAtTest ;
    private String testType;
    private LocalDate dateSampleCollected;
    private LocalDate dateSampleSent;
    private LocalDate dateResultReceivedAtFacility;
    private LocalDate dateResultReceivedByCaregiver;
    private String results;
    private String uuid;
    private String  uniqueUuid;
    private String pmtctCycleUuid;
    private String motherPatientUuid;

}
