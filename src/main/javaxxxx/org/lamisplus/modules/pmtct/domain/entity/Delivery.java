package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_delivery")
@Data
@NoArgsConstructor
public class Delivery extends PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
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


    @Override
    public boolean isNew() {
        return false;
    }

}
