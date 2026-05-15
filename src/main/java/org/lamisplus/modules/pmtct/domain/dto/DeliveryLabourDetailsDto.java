package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryLabourDetailsDto {
    private String decisionSeekingCare;
    private String transportationIn;
    private Integer parity;
    private String partographUsed;
    private String whoTookDelivery;
    private String whoTookDeliveryOther;
    private String nameOfDeliveryAttendant;
}
