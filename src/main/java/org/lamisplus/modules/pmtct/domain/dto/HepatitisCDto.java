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
public class HepatitisCDto {
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean testedHepatitisC;
    private String dateOfHepatitisC;
    private String hepatitisC;
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean treatedHepatitisC;
    @JsonDeserialize(using = YesNoBooleanDeserializer.class)
    private Boolean referredHepatitisC;
}
