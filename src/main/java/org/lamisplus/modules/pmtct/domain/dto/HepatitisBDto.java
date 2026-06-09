package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HepatitisBDto {
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean testedHepatitisB;
    private String dateOfHepatitisB;
    private String hepatitisB;
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean treatedHepatitisB;
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean referredHepatitisB;
    // MIP Card fields (merged from legacy flat columns)
    private String currentHbvStatus;
    private String nameOfHbvDrug;
}
