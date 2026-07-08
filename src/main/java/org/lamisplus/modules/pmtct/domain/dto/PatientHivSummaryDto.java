package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientHivSummaryDto {
    private String hivStatus;
    private boolean hasHtsRecord;
    private boolean remainedHivNegative;
    private boolean seroconverted;
    private String syphilisResult;
    private String hepatitisBResult;
    private String hepatitisCResult;
}
