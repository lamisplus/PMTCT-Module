package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.HepatitisBDto;
import org.lamisplus.modules.pmtct.domain.dto.HepatitisCDto;
import org.lamisplus.modules.pmtct.domain.dto.SyphilisInfoDto;
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
    private Double weight;
    private Double sfhLength;
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String regimenLineId;
    private String currentHbvStatus;
    private String nameOfHbvDrug;
    private String currentSyphilisStatus;
    private String nameOfSyphilisDrug;
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
    private Long archived;
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
    private Double height;
    private Double systolic;
    private Double diastolic;
    private Integer gaWeeks;
    private String numberOfAncVisits;
    private String ancAttendance;
    private String counsellingHts;
    private String counsellingFgm;
    private String counsellingFp;
    private String counsellingMaternalNutrition;
    private String counsellingEarlyBf;
    private String counsellingExclusiveBf;
    private String hbPcv;
    private String bloodSugarGdm;
    private String urinalysisSugar;
    private String urinalysisProteins;
    private String llinGiven;
    private String iptDose;
    private String hematinicsGiven;
    private String tdImmunization;
    private String associatedProblems;
    private String referralReason;
    private String transportationOut;
    @Column(name = "hepatitis_c_test_result")
    private String hepatitisCTestResult;
    @Column(name = "referred_for_hcv")
    private String referredForHcv;
    private String outcomeOfVisit;
    private String pcv;

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
            this.archived = 0L;
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
