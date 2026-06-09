package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_delivery")
@Data
@NoArgsConstructor
public class Delivery extends PMTCTTransactionalEntity implements Serializable, Persistable<String> {
    private LocalDate dateOfDelivery;
    private String bookingStatus;
    @JsonProperty("gaweeks")
    @Column(name = "gaweeks")
    private Integer gAWeeks;
    private String romDeliveryInterval;
    private String modeOfDelivery;
    private String modeOfDeliveryOther;
    private String episiotomy;
    private String vaginalTear;
    private String feedingDecision;
    private String maternalOutcome;
    private String childGivenArvWithin72;
    private String childStatus;
    private Boolean hivExposedInfantGivenHbWithin24hrs;
    @Column(name = "non_hbv_exposed_infant_given_hb_within_24hrs")
    private Boolean nonHbvExposedInfantGivenHbWithin24hrs;
    private String deliveryTime;
    private String onArt;
    private String artStartedLdWard;
    @JsonProperty("hbstatus")
    @Column(name = "hbstatus")
    private String HBStatus;
    @JsonProperty("hcstatus")
    @Column(name = "hcstatus")
    private String HCStatus;
    private String referalSource;
    private Integer numberOfInfantsAlive;
    private Integer numberOfInfantsDead;
    @Column(name = "patient_uuid")
    private String patientUuid;
    private String placeOfDelivery;
    private String pmtctCycleUuid;
    private Boolean archived;
    private String source;

    @Type(type = "jsonb")
    @Column(name = "labour_details", columnDefinition = "jsonb")
    private DeliveryLabourDetailsDto labourDetails;

    @Type(type = "jsonb")
    @Column(name = "maternal_interventions", columnDefinition = "jsonb")
    private DeliveryMaternalInterventionsDto maternalInterventions;

    @Type(type = "jsonb")
    @Column(name = "baby_info", columnDefinition = "jsonb")
    private DeliveryBabyInfoDto babyInfo;

    @Type(type = "jsonb")
    @Column(name = "newborn_care", columnDefinition = "jsonb")
    private DeliveryNewbornCareDto newbornCare;

    @Type(type = "jsonb")
    @Column(name = "postpartum_info", columnDefinition = "jsonb")
    private DeliveryPostpartumInfoDto postpartumInfo;

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = false;
        }
    }

    @Override
    public boolean isNew() {
        return getUuid() == null;
    }

}
