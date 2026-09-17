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
@Table(name = "pmtct_family_planning", schema = "public")
@EntityListeners(AuditingEntityListener.class)
@TypeDefs({@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)})
@Data
@NoArgsConstructor
public class FamilyPlanningVisit implements Serializable, Persistable<String> {
    @Getter(AccessLevel.NONE)
    @Column(name = "id", insertable = false, updatable = false)
    private Long id;

    @Id
    @Column(name = "uuid", nullable = false, updatable = false)
    private String uuid;

    private String patientUuid;
    private String pmtctCycleUuid;
    private LocalDate visitDate;

    // Clinical Data
    private Double weight;
    private String bloodPressure;
    private Integer parity;

    // Counselling & Client Categorization
    private String counselledOnFp;
    private String counselledOnPpfp;
    private String firstTimeModernFpUser;
    private Boolean emergencyContraception;
    private String typeOfFpClient;
    private String sourceOfReferral;

    // Multi-select gates, stored as a JSON array string (no existing entity in this
    // codebase uses a native Postgres array column, so this matches convention instead
    // of introducing a new storage pattern for just these two fields).
    private String methodsProvided;
    private String referredOut;

    @Type(type = "jsonb")
    @Column(name = "oral_pills_data", columnDefinition = "jsonb")
    private OralPillsDto oralPillsData;

    @Type(type = "jsonb")
    @Column(name = "injectable_data", columnDefinition = "jsonb")
    private InjectableDto injectableData;

    @Type(type = "jsonb")
    @Column(name = "iud_data", columnDefinition = "jsonb")
    private IudDto iudData;

    @Type(type = "jsonb")
    @Column(name = "condom_data", columnDefinition = "jsonb")
    private CondomDto condomData;

    @Type(type = "jsonb")
    @Column(name = "implant_data", columnDefinition = "jsonb")
    private ImplantDto implantData;

    @Type(type = "jsonb")
    @Column(name = "sterilization_data", columnDefinition = "jsonb")
    private SterilizationDto sterilizationData;

    @Type(type = "jsonb")
    @Column(name = "natural_methods_data", columnDefinition = "jsonb")
    private NaturalMethodsDto naturalMethodsData;

    private Long facilityId;
    private Boolean archived;
    private String source;

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
