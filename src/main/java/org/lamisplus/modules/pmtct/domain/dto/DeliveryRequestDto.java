package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class DeliveryRequestDto implements Serializable {
    @NotNull(message = "Source is required")
    private String source;
    private LocalDate dateOfDelivery;
    private String bookingStatus;
    @JsonProperty("gaweeks")
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
    private String nonHbvExposedInfantGivenHbWithin24hrs;
    private String deliveryTime;
    private String onArt;
    private String artStartedLdWard;
    @JsonProperty("hbstatus")
    private String HBStatus;
    @JsonProperty("hcstatus")
    private String HCStatus;
    private String referalSource;
    private Integer numberOfInfantsAlive;
    private Integer numberOfInfantsDead;
    private String patientUuid;
    private String placeOfDelivery;
    @NotNull(message = "pmtctCycleUuid is required")
    private String pmtctCycleUuid;

    private DeliveryLabourDetailsDto labourDetails;
    private DeliveryMaternalInterventionsDto maternalInterventions;
    private DeliveryBabyInfoDto babyInfo;
    private DeliveryNewbornCareDto newbornCare;
    private DeliveryPostpartumInfoDto postpartumInfo;
}
