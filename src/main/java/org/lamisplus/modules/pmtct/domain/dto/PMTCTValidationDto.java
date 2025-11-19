package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PMTCTValidationDto {
    private boolean hasPreviousEnrollment;
    private LocalDate previousEnrollmentDate;
    private boolean hasPreviousDelivery;
    private LocalDate previousDeliveryDate;
}
