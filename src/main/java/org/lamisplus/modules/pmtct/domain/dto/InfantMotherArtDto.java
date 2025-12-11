package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class InfantMotherArtDto implements Serializable
{
    @NotNull(message = "Source is required")
    private String source;
    private Long id;
    private LocalDate visitDate;
    private String ancNumber;
    private String  motherArtInitiationTime;
    private Long regimenTypeId;
    private Long regimenId;
    private String  uuid;
    private String  uniqueUuid;
    @NotNull(message = "pmtctCycleId is required")
    private Long pmtctCycleId;
    private String motherPersonUuid;




}
