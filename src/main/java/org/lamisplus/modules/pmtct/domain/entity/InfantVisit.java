package org.lamisplus.modules.pmtct.domain.entity;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
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
@Table(name = "pmtct_infant_visit", schema = "public")
@EntityListeners(AuditingEntityListener.class)
@TypeDefs({@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)})
@Data
@NoArgsConstructor
public class InfantVisit implements Serializable, Persistable<String> {
    @Getter(AccessLevel.NONE)
    @Column(name = "id", insertable = false, updatable = false)
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Double bodyWeight;
    private String visitStatus;
    private String ctxStatus;
    private String breastFeeding;
    @Id
    @Column(name = "uuid", nullable = false, updatable = false)
    private String uuid;
    @Column(name = "mother_patient_uuid")
    private String motherPatientUuid;
    @Column(name = "unique_uuid")
    private String uniqueUuid;
    private String pmtctCycleUuid;
    private Long archived;
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

    @Type(type = "jsonb")
    @Column(name = "infant_arv_data", columnDefinition = "jsonb")
    private InfantArvDto infantArvData;

    @Type(type = "jsonb")
    @Column(name = "infant_pcr_data", columnDefinition = "jsonb")
    private InfantPCRTestDto infantPcrData;

    @Type(type = "jsonb")
    @Column(name = "mother_art_data", columnDefinition = "jsonb")
    private InfantMotherArtDto motherArtData;

    @Type(type = "jsonb")
    @Column(name = "rapid_test_data", columnDefinition = "jsonb")
    private InfantRapidAntiBodyTestDto rapidTestData;

    @Type(type = "jsonb")
    @Column(name = "hbv_vaccination_data", columnDefinition = "jsonb")
    private InfantVisitHbvVaccinationDto hbvVaccinationData;

    @Column(name = "infant_outcome_at18_months")
    private String infantOutcomeAt18Months;
    @Column(name = "infant_outcome_sub_option")
    private String infantOutcomeSubOption;
    @Column(name = "date_linked_to_art_clinic")
    private LocalDate dateLinkedToArtClinic;
    private String artEnrollmentNo;
    private String comments;

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
