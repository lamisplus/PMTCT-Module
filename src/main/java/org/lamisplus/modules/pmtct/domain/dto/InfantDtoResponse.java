package org.lamisplus.modules.pmtct.domain.dto;

import com.esotericsoftware.kryo.NotNull;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.pmtct.domain.entity.Infant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InfantDtoResponse {
    @NotNull
    private Infant infant;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
}
