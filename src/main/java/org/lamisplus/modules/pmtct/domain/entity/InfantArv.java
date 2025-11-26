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
import java.util.List;

@Entity
@Table(name = "pmtct_infant_arv", schema = "public")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
public class InfantArv implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private String infantArvType;
    private String infantArvTime;
    private String arvDeliveryPoint;
    private String uuid;
    private String ageAtCtx;
    @Column(name = "timing_of_avr_after_72hours")
    private String timingOfAvrAfter72Hours;

    @Column(name = "timing_of_avr_within_72hours")
    private String timingOfAvrWithin72Hours;
    @Column(name = "unique_uuid")
    private String  uniqueUuid;
    private LocalDate dateOfCtx;
    private LocalDate dateOfArv;
    private Long infantId;
    private String otherProphylaxisType;
    @Column(name = "mother_person_uuid")
    private String motherPersonUuid;
    private Long archived;
    private Long pmtctCycleId;
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

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = 0L;
        }
    }

    @Override
    public boolean isNew() {
        return false;
    }
}
