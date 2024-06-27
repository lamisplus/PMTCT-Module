package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class InfantRapidAntiBodyTestDto implements Serializable  {
    private String rapidTestType;
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateOfTest;
    private String result;
    private String uuid;
    private String  uniqueUuid;

}
