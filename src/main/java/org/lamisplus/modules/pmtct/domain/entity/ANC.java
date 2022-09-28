package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.patient.domain.entity.PatientAuditEntity;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_anc")
@Data
@NoArgsConstructor
public class ANC extends PatientAuditEntity implements Serializable, Persistable<Long>
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private String ancNo;
    private LocalDate  visitDate;
    private Double systolic;
    private Double diastolic;
    private Double bodyWeight;
    private Double fundalHeight;
    private String  fetalPresentation;
    private String gestationalAge;
    private String  visitType;
    private String  visitStatus;
    private Double viralLoad;
    private LocalDate    sampleDate;
    private String  tbStatus;
    private LocalDate nextAppointmentDate;
    private String  nutritionalSupport;
    private String  infantFeeding;
    private String  familyPlaningMethod;
    private String  referredTo;
    private String  agreement;
    private Long archived;
    private String uuid;


    @Override
    public boolean isNew() {
        return id == null;
    }



}
