package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
@Data
@AllArgsConstructor
@Builder
public class InfantVisitationConsolidated implements Serializable
{
    private InfantVisitRequestDto infantVisitRequestDto;
    private InfantMotherArtDto infantMotherArtDto;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
}
