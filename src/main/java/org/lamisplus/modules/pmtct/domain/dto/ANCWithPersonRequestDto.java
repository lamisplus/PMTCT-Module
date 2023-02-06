package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.enums.ReferredSyphilisPositiveClient;
import org.lamisplus.modules.pmtct.domain.entity.enums.TestedForSyphilis;
import org.lamisplus.modules.pmtct.domain.entity.enums.TreatedForSyphilis;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ANCWithPersonRequestDto implements Serializable
{
    private Long id;
    private String ancNo;
    private LocalDate firstAncDate;
    private Integer gravida;
    private Integer parity;
    private LocalDate LMP;
    private LocalDate expectedDeliveryDate;
    private Integer gAWeeks;
    private String hivDiognosicTime;
    private String staticHivStatus;
    private String testedSyphilis;
    private String testResultSyphilis;
    private String treatedSyphilis;
    private String referredSyphilisTreatment;
    private PmtctHtsInfo pmtctHtsInfo;
    private PartnerNotification partnerNotification;
    private PersonDto personDto;
}
