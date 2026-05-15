package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfantVisitHbvVaccinationDto implements Serializable {
    private String firstDoseBirthDoseDate;
    private String timingOfVaccination;
    private String secondDoseDate;
    private String thirdDoseDate;
}
