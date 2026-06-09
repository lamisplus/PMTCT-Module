package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.*;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pmtct_mother_visitation",  schema = "public")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
public class PmtctVisit implements Serializable, Persistable<String>
{
    @Getter(AccessLevel.NONE)
    @Column(name = "id", insertable = false, updatable = false)
    private Long id;
    @Column(name = "patient_uuid")
    private String patientUuid;
    @Id
    @Column(name = "uuid", nullable = false, updatable = false)
    private String uuid;
    private String entryPoint;
    private String currentStatus;
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String regimenLineId;
    private LocalDate dateOfInitialVisit;
    private LocalDate dateOfVisit;
    private String fpCounseling;
    private String fpMethod;
    private String timeOfViralLoad;
    private LocalDate dateOfViralLoad;
    private LocalDate dateOfVlResultReceived;
    private Integer gaOfViralLoad;
    private Long resultOfViralLoad;
    private String infantFeedingPractice;
    private String infantOnCtx;
    private String referredToTreatment;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String  maternalOutcome;
    private LocalDate dateOfMaternalOutcome;
    private String visitStatus;
    private LocalDate nextAppointmentDate;
    private String pmtctCycleUuid;
    private Boolean archived;
    private String signature;
    private Long facilityId;
    @Column(name = "created_date", updatable = false)
    @CreatedDate
    private LocalDateTime createdDate;
    @Column(name = "created_by", updatable = false)
    @CreatedBy
    private String createdBy;
    @Column(name = "last_modified_date")
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
    @Column(name = "last_modified_by")
    @LastModifiedBy
    private String lastModifiedBy;
    private String source;
    private String visitType;
    private Integer gaWeeks;
    private String numberOfAncVisits;
    private String ancAttendance;
    private String referralReason;
    private String transportationOut;
    private String outcomeOfVisit;

    @Type(type = "jsonb")
    @Column(name = "vital_signs", columnDefinition = "jsonb")
    private VitalSignsDto vitalSigns;

    @Type(type = "jsonb")
    @Column(name = "counselling", columnDefinition = "jsonb")
    private CounsellingDto counselling;

    @Type(type = "jsonb")
    @Column(name = "lab_test", columnDefinition = "jsonb")
    private LabTestDto labTest;

    @Type(type = "jsonb")
    @Column(name = "interventions", columnDefinition = "jsonb")
    private InterventionsDto interventions;

    @Type(type = "jsonb")
    @Column(name = "syphilis_info", columnDefinition = "jsonb")
    private SyphilisInfoDto syphilisInfo;

    @Type(type = "jsonb")
    @Column(name = "hepatitis_b_info", columnDefinition = "jsonb")
    private HepatitisBDto hepatitisBInfo;

    @Type(type = "jsonb")
    @Column(name = "hepatitis_c_info", columnDefinition = "jsonb")
    private HepatitisCDto hepatitisCInfo;

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = false;
        }
    }

    @Override
    public String getId() {
        return this.uuid;
    }

    @Override
    public boolean isNew() {
        return uuid == null;
    }

}
