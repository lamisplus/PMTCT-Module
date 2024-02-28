package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;

@Data
@Builder
public class InfantDtoUpdateResponse {
    private Infant infant;
    private InfantArv infantArv;
    private InfantPCRTest infantPCRTest;
}
