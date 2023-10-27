package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.time.LocalDate;
@Data
public class PmtctHtsInfo
{
    private String previouslyKnownHIVPositive;
    private LocalDate dateTestedHivPositive;
    private String acceptedHIVTesting;
    private String hivTestResult;
    private String hivRestested;
    private String receivedHivRetestedResult;
}
