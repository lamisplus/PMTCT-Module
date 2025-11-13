package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PmtctPregnancyCycleResponseDto {
    private Long id;
    private String personUuid;
    private String maternalOutcome;
    private String entryPoint;
    private String hivStatus;
    private String pregnancyOutcome;
    private Integer numberOfInfants;
    private String pmtctStatus;
    private Long facilityId;
    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
    private String uuid;
    private Long archived;
    private Boolean isClosed;
}
