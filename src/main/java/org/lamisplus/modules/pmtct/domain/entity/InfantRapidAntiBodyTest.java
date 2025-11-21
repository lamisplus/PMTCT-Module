package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pmtct_infant_rapid_antibody",  schema = "public")
@Data
@NoArgsConstructor
//@Embeddable
public class InfantRapidAntiBodyTest implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)

    private Long id;
    private String rapidTestType;
    @Column(name="anc_number")
    private String ancNumber;
    private String ageAtTest;
    private LocalDate dateOfTest;
    private String result;
    @Column(name = "unique_uuid")
    private String  uniqueUuid;
    @Column(name = "uuid")
    private String uuid;
    @Column(name = "mother_person_uuid")
    private String motherPersonUuid;
    private Long archived;
    private Long pmtctCycleId;
    private Long facilityId;
    private LocalDateTime createdDate;
    private String createdBy;
    private LocalDateTime lastModifiedDate;
    private String lastModifiedBy;

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = 0L;
        }
    }
}
