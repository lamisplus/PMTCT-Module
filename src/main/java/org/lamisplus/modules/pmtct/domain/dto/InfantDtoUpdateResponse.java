package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.pmtct.domain.entity.Infant;

@Data
@Builder
public class InfantDtoUpdateResponse {
    private Infant infant;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
}
