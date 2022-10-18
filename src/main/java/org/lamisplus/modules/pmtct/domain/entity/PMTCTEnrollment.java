package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.domain.Persistable;


import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_enrollment",  schema = "public")
@Data
@NoArgsConstructor
public class PMTCTEnrollment extends PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
    private LocalDate pmtctEnrollmentDate;
    private String systolic;
    private String diastolic;
    private String bodyWeight;
    private String fundalHeight;
    private String fetalPresentation;
    private Integer gAWeeks;
    private String visitType;
    private String visitStatus;
    private String tbStatus;
    private LocalDate nextAppointmentDate;
    private String nutritionalSupport;
    private String infantFeeding;
    private String fpl;
    private String referredTo;
    private String agreed2PartnerNotification;
    private String viralLoadSample;
    private LocalDate viralLoadSampleDate;

    @Override
    public boolean isNew() {
        return false;
    }
}
