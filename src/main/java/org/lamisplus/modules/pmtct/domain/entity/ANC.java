package org.lamisplus.modules.pmtct.domain.entity;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_anc")
@Data
@NoArgsConstructor
public class ANC extends PMTCTTransactionalEntity {
    private LocalDate firstAncDate;
    private Integer gravida;
    private Integer parity;
    private LocalDate LMP;
    private LocalDate expectedDeliveryDate;
    private Integer gAWeeks;
    private String hivDiognosicTime;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode syphilisInfo;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode pmtctHtsInfo;
    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode partnerNotification;
    private String personUuid;
    private Long archived;


}
