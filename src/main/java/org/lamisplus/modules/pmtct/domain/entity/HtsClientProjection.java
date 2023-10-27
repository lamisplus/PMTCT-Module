package org.lamisplus.modules.pmtct.domain.entity;

import java.time.LocalDate;

public interface HtsClientProjection {
     Long getId();
     String getClientCode();
     LocalDate getDateVisit();
     String getPersonUuid();
     String getUuid();
     String getHivTestResult();
}
