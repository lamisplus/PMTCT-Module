package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
public class CondomDto implements Serializable {
    private String typeOfCondom;
    private String clientStatus;
    private Integer quantity;
}
