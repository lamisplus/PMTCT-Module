package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_infant_visit",  schema = "public")
@Data
@NoArgsConstructor

public class InfantVisit implements Serializable, Persistable<Long>{
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Long bodyWeight;
    private String visitStatus;
    private String ctxStatus;
    private String breastFeeding ;
    private String uuid;


    @Override
    public boolean isNew() {
        return false;
    }
}
