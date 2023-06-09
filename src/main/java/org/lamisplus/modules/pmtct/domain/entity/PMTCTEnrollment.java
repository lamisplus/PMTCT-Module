package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.domain.Persistable;


import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_enrollment",  schema = "public")
@Data
@NoArgsConstructor
public class PMTCTEnrollment extends PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
    private LocalDate pmtctEnrollmentDate;
    private Integer gravida;
    private Integer gAWeeks;
    private String entryPoint;
    private LocalDate artStartDate;
    private String artStartTime;
    private String tbStatus;




    @Override
    public boolean isNew() {
        return false;
    }
}
