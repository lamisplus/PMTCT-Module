package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pmtct_pregnancy_cycle", schema = "public")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PmtctPregnancyCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "person_uuid", nullable = false)
    private String personUuid;

    @Column(name = "maternal_outcome")
    private String maternalOutcome;

    @Column(name = "entry_point")
    private String entryPoint;

    @Column(name = "hiv_status")
    private String hivStatus;

    @Column(name = "pregnancy_outcome")
    private String pregnancyOutcome;

    @Column(name = "number_of_infants")
    private Integer numberOfInfants;

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

    @Column(name = "uuid", unique = true, nullable = false)
    private String uuid;

    @Column(name = "archived")
    private Long archived = 0L;

    @Column(name = "is_closed")
    private Boolean isClosed = false;
}
