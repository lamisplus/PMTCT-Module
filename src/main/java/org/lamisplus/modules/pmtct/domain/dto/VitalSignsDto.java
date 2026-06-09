package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class VitalSignsDto {
    private Double weight;
    private Double height;
    private Double sfhLength;
    @JsonAlias("systolicBp")
    private Double systolic;
    @JsonAlias("diastolicBp")
    private Double diastolic;
}
