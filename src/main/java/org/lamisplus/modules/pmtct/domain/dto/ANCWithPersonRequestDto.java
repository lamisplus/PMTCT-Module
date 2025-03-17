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
    private String ancSetting;
    private String communitySetting;

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
    private String sourceOfReferral;
    private PmtctHtsInfo pmtctHtsInfo;
    private PartnerNotification partnerNotification;
    private PersonDto personDto;
    private String previouslyKnownHivStatus;

    private LocalDate  dateOfHepatitisB;
    private String  hepatitisB;
    private String testedHepatitisB;
    private String treatedHepatitisB;
    private String referredHepatitisB;

    private LocalDate  dateOfHepatitisC;
    private String  hepatitisC;
    private String testedHepatitisC;
    private String treatedHepatitisC;
    private String referredHepatitisC;

}
