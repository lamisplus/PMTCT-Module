package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// clientStatus only meaningful when action = IN (Insertion); no sub-field for OUT (Removal).
@Data
@NoArgsConstructor
public class IudDto implements Serializable {
    private String typeOfIud;
    private String action;
    private String clientStatus;
}
