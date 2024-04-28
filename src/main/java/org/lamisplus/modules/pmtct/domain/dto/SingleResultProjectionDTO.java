package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;

public interface SingleResultProjectionDTO {

    String getCurrentViralLoad();
    LocalDate getDateOfCurrentViralLoad();
}
