package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BabyAliveOutcomeDto {
    private String sexOfBaby;
    private String babyTimeOfDelivery;
    private String babyPreterm;
    private String babyNotBreathingAtBirth;
    private String babyResuscitated;
    private String babyLiveBirthWeight;
    private String babyLiveBirthHivPositive;
}
