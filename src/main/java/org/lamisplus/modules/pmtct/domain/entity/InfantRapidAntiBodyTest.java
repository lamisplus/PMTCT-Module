package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pmtct_infant_rapid_antibody",  schema = "public")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
//@Embeddable
public class InfantRapidAntiBodyTest implements Serializable {
    @Column(name = "id", insertable = false, updatable = false)
    private Long id;
    private String rapidTestType;
    @Column(name="anc_number")
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateOfTest;
    private String result;
    @Column(name = "unique_uuid")
    private String  uniqueUuid;
    @Id
    @Column(name = "uuid", nullable = false, updatable = false)
    private String uuid;
    @Column(name = "mother_patient_uuid")
    private String motherPatientUuid;
    private Boolean archived;
    private String pmtctCycleUuid;
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
            this.archived = false;
        }
    }
}
