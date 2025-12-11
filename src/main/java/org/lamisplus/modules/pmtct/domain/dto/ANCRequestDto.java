package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
@Data
public class ANCRequestDto implements Serializable
{
    @NotNull(message = "Source is required")
    private String source;
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
    private String testedSyphilis;
    private String testResultSyphilis;
    private String treatedSyphilis;
    private String referredSyphilisTreatment;
    private PmtctHtsInfo pmtctHtsInfo;
    private PartnerNotification partnerNotification;
    private PersonDto personDto;
    private String person_uuid;
    private String staticHivStatus;
    private String sourceOfReferral;
    private String previouslyKnownHivStatus;
    private String currentlyOnArt;
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
    private String facilityEnrolledIn;
    @NotNull(message = "pmtctCycleId is required")
    private Long pmtctCycleId;




}
