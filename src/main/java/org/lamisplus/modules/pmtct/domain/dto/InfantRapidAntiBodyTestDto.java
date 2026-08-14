package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@Data
public class InfantRapidAntiBodyTestDto implements Serializable  {
    private String source;
    private String id ;
    private String rapidTestType;
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateSampleCollected;
    private LocalDate dateOfTest;
    private String result;
    private String  uniqueUuid;
    @JsonIgnore
    private String uuid;
    private String pmtctCycleUuid;
    private String motherPatientUuid;
}
