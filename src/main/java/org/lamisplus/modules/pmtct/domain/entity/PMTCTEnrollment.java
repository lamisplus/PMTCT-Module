package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import org.springframework.data.domain.Persistable;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.domain.Persistable;

import org.lamisplus.modules.pmtct.domain.dto.HbvDetailsDto;
import org.lamisplus.modules.pmtct.domain.dto.SyphilisDetailsDto;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_enrollment",  schema = "public")
@Data
@NoArgsConstructor
public class PMTCTEnrollment extends PMTCTTransactionalEntity implements Serializable, Persistable<String> {
    @Column(name = "pmtct_enrollment_date")
    private LocalDate pmtctEnrollmentDate;
    private Integer gravida;
    @JsonProperty("gaweeks")
    @Column(name = "gaweeks")
    private Integer gAWeeks;
    public String entryPoint;
    public LocalDate artStartDate;
    private String artStartTime;
    private String tbStatus;
    @Column(name = "patient_uuid")
    private String patientUuid;
    private Boolean archived;
    public String hivStatus;
    private LocalDate lmp;

    private Long regimenTypeId;
    private String regimenId;
    private String urinalysis;
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private HbvDetailsDto hbvDetails;
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private SyphilisDetailsDto syphilisDetails;
    private String timeOfHivDiagnosis;
    private LocalDate dateOfDelivery;
    private LocalDate expectedDeliveryDate;
    private String modeOfDelivery;
    private String modeOfDeliveryOther;
    private String pmtctCycleUuid;
    private String source;

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
