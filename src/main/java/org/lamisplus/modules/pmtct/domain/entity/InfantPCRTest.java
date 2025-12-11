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
@Table(name = "pmtct_infant_pcr",  schema = "public")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor

public class InfantPCRTest implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private String ageAtTest ;
    private String testType;
    private LocalDate dateSampleCollected ;
    private LocalDate dateSampleSent;
    private LocalDate dateResultReceivedAtFacility;
    private LocalDate dateResultReceivedByCaregiver;
    private String results;
    private String uuid;
    @Column(name = "unique_uuid")
    private String  uniqueUuid;
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
    private String source;

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
