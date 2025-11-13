package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PMTCTPersonResponseDto extends PersonResponseDto {
    private Boolean hasExistingEnrollment;
    private Long pregnancyCount;
}
