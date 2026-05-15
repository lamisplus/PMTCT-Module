package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfantSyphilisProphylaxisDto implements Serializable {
    private String dateOfInitiation;
    private String ageAtInitiation;
    private String typeOfProphylaxis;
}
