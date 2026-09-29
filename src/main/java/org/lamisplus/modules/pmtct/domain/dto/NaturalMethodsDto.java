package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// othersSpecify only meaningful when method = Others (values: OVM, STT, LAM per NHMIS register key).
@Data
@NoArgsConstructor
public class NaturalMethodsDto implements Serializable {
    private String clientStatus;
    private String method;
    private String othersSpecify;
}
