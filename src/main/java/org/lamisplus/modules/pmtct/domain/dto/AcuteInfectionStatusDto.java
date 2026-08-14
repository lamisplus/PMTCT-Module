package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcuteInfectionStatusDto {
    private boolean updated;
    private Long triggerVl;
    private LocalDate detectedDate;
    // True when the suspected-acute record that triggered this update was entered via the
    // HTS module rather than the PMTCT HTS form — lets the PMTCT UI tell the user this wasn't
    // something they missed entering on this side.
    private boolean fromHtsModule;

    public static AcuteInfectionStatusDto noUpdate() {
        return new AcuteInfectionStatusDto(false, null, null, false);
    }
}
