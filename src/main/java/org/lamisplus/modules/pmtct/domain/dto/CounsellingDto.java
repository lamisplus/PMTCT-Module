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
public class CounsellingDto {
    @JsonAlias("hts")
    private String counsellingHts;
    @JsonAlias("fgm")
    private String counsellingFgm;
    @JsonAlias("fp")
    private String counsellingFp;
    @JsonAlias("maternalNutrition")
    private String counsellingMaternalNutrition;
    @JsonAlias("earlyBf")
    private String counsellingEarlyBf;
    @JsonAlias("exclusiveBf")
    private String counsellingExclusiveBf;
}
