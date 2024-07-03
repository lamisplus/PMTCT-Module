package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class InfantRapidAntiBodyTestDto implements Serializable  {
    private Long id ;
    private String rapidTestType;
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateOfTest;
    private String result;
    private String  uniqueUuid;
    @JsonIgnore
    private String uuid;
}
