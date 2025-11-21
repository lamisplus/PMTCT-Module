package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pmtct_infant_visit", schema = "public")
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
    private Integer archived;
    private Long facilityId;
    private LocalDateTime createdDate;
    private String createdBy;
    private LocalDateTime lastModifiedDate;
    private String lastModifiedBy;


    @Override
    public boolean isNew() {
        return false;
    }
}
