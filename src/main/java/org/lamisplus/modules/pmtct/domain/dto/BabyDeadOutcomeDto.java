package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BabyDeadOutcomeDto {
    private String babyAbortion;
    private String babyNotBreathingAtBirth;
    private String babyStillBirthType;
    private String babyDeadWithin7Days;
}
