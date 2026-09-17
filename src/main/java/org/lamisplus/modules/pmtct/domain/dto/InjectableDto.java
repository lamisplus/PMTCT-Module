package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// route only meaningful when nameOfInjectable = DMPA-IM; quantity only meaningful when
// route = Self-Injection (DMPA-SC is a route value here, never a selectable injectable name).
@Data
@NoArgsConstructor
public class InjectableDto implements Serializable {
    private String nameOfInjectable;
    private String route;
    private Integer quantity;
    private String clientStatus;
}
