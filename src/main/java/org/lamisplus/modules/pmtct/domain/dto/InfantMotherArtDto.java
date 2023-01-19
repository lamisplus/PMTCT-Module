package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class InfantMotherArtDto implements Serializable
{
    private Long id;
    private LocalDate visitDate;
    private String ancNumber;
    private String  motherArtInitiationTime;
    private String  motherArtRegimen;
    private String  uuid;
}
