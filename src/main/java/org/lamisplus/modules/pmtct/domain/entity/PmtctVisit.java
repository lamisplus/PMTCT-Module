package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.domain.Persistable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_visit",  schema = "public")
@Data
@NoArgsConstructor
public class PmtctVisit extends PMTCTTransactionalEntity implements Serializable, Persistable<Long>
{
    private LocalDate dateOfVisit;
    private String pulse;
    private String respiratoryRate;
    private String temperature;
    private String bodyWeight;
    private String height;
    private String systolic;
    private String diastolic;
    private String clinicalNotes;
    private String whoStaging;
    private String functionalStatus;
    private String levelOfAdherence;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode opportunisticInfection;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode adr;
    private String onAntiTbDrugs;
    private LocalDate nextClinicalAppointmentDate;

    @Override
    public boolean isNew() {
        return false;
    }

}
