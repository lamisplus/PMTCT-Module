package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class PmtctPregnancyCycleRequestDto {
    @NotNull(message = "person_uuid is required")
    private String personUuid;
    private String maternalOutcome;
    private String entryPoint;
    private String hivStatus;
    private String pregnancyOutcome;
    private Integer numberOfInfants;
    private String pmtctStatus;
}
