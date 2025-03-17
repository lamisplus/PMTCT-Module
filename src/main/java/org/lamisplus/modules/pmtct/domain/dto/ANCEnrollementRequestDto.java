package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class ANCEnrollementRequestDto{
    private Long id;
    private String ancNo;
    private String ancSetting;
    private String communitySetting;

    private LocalDate firstAncDate; // is the enrollmentDate from frontend
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
   // private String sourceOfReferral;
    private final String person_uuid;
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
