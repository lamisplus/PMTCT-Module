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
@Table(name = "pmtct_anc",  schema = "public")
@Data
@NoArgsConstructor
public class ANC extends PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
    private LocalDate firstAncDate;
    private Integer gravida;
    private Integer parity;
    private LocalDate LMP;
    private LocalDate expectedDeliveryDate;
    private Integer gAWeeks;
    private String hivDiognosicTime;
    private String testedSyphilis;
    private String testResultSyphilis;
    private String treatedSyphilis;
    private String referredSyphilisTreatment;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode pmtctHtsInfo;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode partnerNotification;
    private String personUuid;
    private Long archived;
    private String status;
    private String staticHivStatus;
    private String sourceOfReferral;
    private LocalDate lastVisitDate;
    private LocalDate nextAppointmentDate;
    private Integer defaultDays;
    private String ancSetting;
    private String previouslyKnownHivStatus;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode partnerInformation;

    @Column(name = "latitude")
    private String latitude;
    @Column(name = "longitude")
    private String longitude;
    @Column(name = "source")
    private String source = "Web";
    @Override
    public boolean isNew() {
        return false;
    }


}
