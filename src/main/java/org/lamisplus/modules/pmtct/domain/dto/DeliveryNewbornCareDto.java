package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryNewbornCareDto {
    private String cordClampedTime;
    private String chxGelApplied;
    private String babyPutToBreast;
    private String temperatureAt1Hour;
}
