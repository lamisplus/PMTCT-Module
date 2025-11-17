package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
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
    @NotNull(message = "pmtctCycleId is required")
    private Long pmtctCycleId;
    private String motherPersonUuid;
}
