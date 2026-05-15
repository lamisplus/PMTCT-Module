package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfantHbvVaccinationDto implements Serializable {
    private String dose;
    private String dateOfVaccination;
    private String ageAtVaccination;
}
