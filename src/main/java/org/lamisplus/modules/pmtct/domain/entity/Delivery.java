package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "delivery")
@Data
@NoArgsConstructor
public class Delivery extends PatientAuditEntity implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private String dateOfDelivery;
    private String hospitalNumber;
    private String ancNo;
    private String uniqueARTNo;
    private Integer age;
    private String timeOfHIVDiagnosis;
    private Integer gAinWeeks;
    private String HBVStatus;
    private String HCVStatus;
    private String ART;
    private String ARTStartedLDWard;
    private String ROMDeliveryInterval;
    private String modeOfDelivery;
    private String episiotomy;
    private String vaginalTear;
    private String feedingDecision;
    private String maternalOutcome;
    private String childGivenARVWithin72;
    private String childStatus;
    private String HBVExposedInfantGivenHepBWithin24hrsBirth;
    private String nonHBVExposedInfantGivenHBVVaccineWithin24hrsbirth;

    @Override
    public boolean isNew() {
        return false;
    }

}
