package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class DeliveryRequestDto implements Serializable {
    private String ancNo;
    private LocalDate dateOfDelivery;
    private String bookingStatus;
    private Integer gAWeeks;
    private String romDeliveryInterval;
    private String modeOfDelivery;
    private String episiotomy;
    private String vaginalTear;
    private String feedingDecision;
    private String maternalOutcome;
    private String childGivenArvWithin72;
    private String childStatus;
    private String hivExposedInfantGivenHbWithin24hrs;
    private String deliveryTime;
    private String onArt;
    private String artStartedLdWard;
    private String HBStatus;
    private String HCStatus;
    private String referalSource;
    private Integer numberOfInfantsAlive;
    private Integer numberOfInfantsDead;
    private String personUuid;
    private String placeOfDelivery;
}
