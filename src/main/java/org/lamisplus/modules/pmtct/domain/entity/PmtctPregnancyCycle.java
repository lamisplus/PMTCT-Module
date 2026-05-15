package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pmtct_pregnancy_cycle", schema = "public")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PmtctPregnancyCycle {

    @Column(name = "id", insertable = false, updatable = false)
    private Long id;

    @Id
    @Column(name = "uuid", columnDefinition = "varchar", nullable = false)
    private String uuid;

    @Column(name = "patient_uuid", nullable = false)
    private String patientUuid;

    @Column(name = "maternal_outcome")
    private String maternalOutcome;

    @Column(name = "visit_status")
    private String visitStatus;

    @Column(name = "entry_point")
    private String entryPoint;

    @Column(name = "pregnancy_outcome")
    private String pregnancyOutcome;

    @Column(name = "pmtct_status")
    private String pmtctStatus;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate = LocalDateTime.now();

    @Column(name = "archived")
    private Long archived = 0L;

    @Column(name = "is_closed")
    private Boolean isClosed = false;

    @PrePersist
    public void prePersist() {
        if (this.uuid == null || this.uuid.isEmpty()) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
