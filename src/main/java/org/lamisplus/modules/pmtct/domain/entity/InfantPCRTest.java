package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Table(name = "pmtct_infant_pcr",  schema = "public")
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
    private Integer archived;
    private String motherPersonUuid;
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
