package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LabTestDto {
    private String hbPcv;
    private String pcv;
    private String bloodSugarGdm;
    private String urinalysisSugar;
    private String urinalysisProteins;
}
