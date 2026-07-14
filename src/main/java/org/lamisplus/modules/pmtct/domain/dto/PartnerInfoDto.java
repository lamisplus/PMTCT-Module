package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PartnerInfoDto {
    private String notificationAgreed;
    private String testedHiv;
    private String testedSyphilis;
    private String testedHbv;
    private String referral;
    // Date the entry was recorded — stamped by the backend, one per PMTCT HTS submission
    private String date;
}
