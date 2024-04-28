package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;

import javax.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@Embeddable
public class InfantRapidAntiBodyTest implements Serializable {
    private String rapidTestType;
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateOfTest;
    private String result;
}
