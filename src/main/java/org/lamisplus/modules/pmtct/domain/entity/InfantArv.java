package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pmtct_infant_arv", schema = "public")
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



    @Override
    public boolean isNew() {
        return false;
    }
}
