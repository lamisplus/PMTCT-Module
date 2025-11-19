package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ANCEnrollmentCheckDto {
    private boolean hasAncEnrollment;
    private LocalDate firstAncDate;
    private LocalDate lmp;
    private String ancNo;
}
