package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerInfoDto {
    private String notificationAgreed;
    private String testedHiv;
    private String testedSyphilis;
    private String testedHbv;
    private String referral;
}
