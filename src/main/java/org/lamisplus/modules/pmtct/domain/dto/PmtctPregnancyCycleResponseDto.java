package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PmtctPregnancyCycleResponseDto {
    private Long id;
    @JsonProperty("patientUuid")
    private String patientUuid;
    private String maternalOutcome;
    private String entryPoint;
    private String pregnancyOutcome;
    private String pmtctStatus;
    private Long facilityId;
    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
    private String uuid;
    private Boolean archived;
    private Boolean isClosed;
}
