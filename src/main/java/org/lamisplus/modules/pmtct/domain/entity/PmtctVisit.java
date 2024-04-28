package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_mother_visitation",  schema = "public")
@Data
@NoArgsConstructor
public class PmtctVisit implements Serializable, Persistable<Long>
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private String ancNo;
    private String hospitalNumber;
    private String personUuid;
    private String uuid;
    private String entryPoint;
    private LocalDate dateOfVisit;
    private LocalDate dateOfDelivery;
    private String fpCounseling;
    private String fpMethod;
    private String timeOfViralLoad;
    private LocalDate dateOfViralLoad;
    private Integer gaOfViralLoad;
    private Integer resultOfViralLoad;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String  maternalOutcome;
    private LocalDate dateOfMaternalOutcome;
    private String visitStatus;
    private String transferTo;
    private LocalDate nextAppointmentDate;



    @Override
    public boolean isNew() {
        return false;
    }

}
