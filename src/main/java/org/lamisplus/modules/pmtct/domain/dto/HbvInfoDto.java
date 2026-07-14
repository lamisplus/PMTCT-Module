package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HbvInfoDto {
    private String knownPositive;
    private String hbvTest;
    private String testResult;
    private String treatment;
    private String vlResultDate;
    private String vlResult;
    private String drugName;
    // Date the entry was recorded — stamped by the backend, one per PMTCT HTS submission
    private String date;
}
