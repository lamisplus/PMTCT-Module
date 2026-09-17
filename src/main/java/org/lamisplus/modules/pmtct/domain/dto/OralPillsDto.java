package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
public class OralPillsDto implements Serializable {
    private String nameOfPill;
    private String clientStatus;
    private Integer quantity;
}
