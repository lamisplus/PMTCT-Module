package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CounsellingDto {
    private String hts;
    private String fgm;
    private String fp;
    private String maternalNutrition;
    private String earlyBf;
    private String exclusiveBf;
}
