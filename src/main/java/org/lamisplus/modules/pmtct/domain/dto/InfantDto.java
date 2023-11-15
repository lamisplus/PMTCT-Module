package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
@Data
public class InfantDto implements Serializable
{
    private LocalDate dateOfDelivery;
    private String firstName;
    private String middleName;
    private String surname;
    private String sex;
    private String nin;
    private Long id;
    private String hospitalNumber;
    private String uuid;
    private String ancNo;
    private String infantOutcomeAt18Months;
    private String personUuid;
}
