package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class InfantMotherArtDto implements Serializable
{
    private Long id;
    private LocalDate visitDate;
    private String ancNumber;
    private String  motherArtInitiationTime;
    private Long regimenTypeId;
    private Long regimenId;
    private String  uuid;
    private String  uniqueUuid;




}
