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
    // True when hivStatus was sourced from a record documented directly via the standalone
    // HTS module rather than this PMTCT cycle — lets the UI tell the user where it came from
    // so they aren't left wondering where/when they entered it.
    private boolean sourcedFromHtsModule;
}
