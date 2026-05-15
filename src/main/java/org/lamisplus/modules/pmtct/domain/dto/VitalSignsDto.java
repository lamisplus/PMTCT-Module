package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalSignsDto {
    private Double weight;
    private Double height;
    private Double systolicBp;
    private Double diastolicBp;
}
