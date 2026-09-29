package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// clientStatus only meaningful when action = IN (Insertion), symmetric with IudDto.
@Data
@NoArgsConstructor
public class ImplantDto implements Serializable {
    private String typeOfImplant;
    private String action;
    private String clientStatus;
}
