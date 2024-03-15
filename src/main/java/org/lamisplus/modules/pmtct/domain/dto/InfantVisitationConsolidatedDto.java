package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.pmtct.domain.entity.InfantRapidAntiBodyTest;

import java.io.Serializable;
import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InfantVisitationConsolidatedDto implements Serializable
{
    private InfantVisitRequestDto infantVisitRequestDto;
    private InfantMotherArtDto infantMotherArtDto;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
    private InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto;


}