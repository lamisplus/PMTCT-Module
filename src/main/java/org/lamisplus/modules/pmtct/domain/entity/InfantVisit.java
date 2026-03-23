package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
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
@Data
@NoArgsConstructor

public class InfantVisit implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Double bodyWeight;
    private String visitStatus;
    private String ctxStatus;
    private String breastFeeding;
    private String uuid;
    private String motherPersonUuid;
    @Column(name = "unique_uuid")
    private String uniqueUuid;
    private Long pmtctCycleId;
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

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = 0L;
        }
    }

    @Override
    public boolean isNew() {
        return id == null;
    }
}
