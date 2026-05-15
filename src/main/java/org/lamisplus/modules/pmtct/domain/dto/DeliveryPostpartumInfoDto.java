package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPostpartumInfoDto {
    private String ebfCounselled;
    private String postpartumFpCounselled;
    private String postpartumFpAccepted;
    private String postpartumFpMethod;
}
