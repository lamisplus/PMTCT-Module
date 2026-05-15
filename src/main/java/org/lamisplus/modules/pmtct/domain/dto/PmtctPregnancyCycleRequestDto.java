package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class PmtctPregnancyCycleRequestDto {
    @NotNull(message = "patient_uuid is required")
    @JsonProperty("patientUuid")
    private String patientUuid;
    private String maternalOutcome;
    private String entryPoint;
    private String pregnancyOutcome;
    private String pmtctStatus;
}
