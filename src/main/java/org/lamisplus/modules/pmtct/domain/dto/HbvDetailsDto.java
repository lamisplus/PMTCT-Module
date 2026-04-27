package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HbvDetailsDto {
    private String vlResultDate;
    private String vlResult;
    private String treatmentType;
    private String drugName;
}
