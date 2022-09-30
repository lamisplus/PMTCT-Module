package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_Enrollment")
@Data
@NoArgsConstructor
public class PMTCTEnrollment extends PatientAuditEntity implements Serializable, Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private String hospitalNumber;
    private String uuid;
    private LocalDate PMTCTEnrollmentDate;
    private String ancNo;
    private String name;
    private Integer age;
    private String pointOfEntry;
    private Integer gA;
    private Integer gravida;
    private LocalDate ARTStartDate;
    private String timingARTInitiation;
    private String TBStatus;

    @Override
    public boolean isNew() {
        return false;
    }
}
