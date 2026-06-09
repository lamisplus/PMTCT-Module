package org.lamisplus.modules.pmtct.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hts_encounter", schema = "public")
@EntityListeners(AuditingEntityListener.class)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
public class HtsEncounterProxy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "uuid", insertable = false, updatable = false, unique = true, nullable = false)
    private UUID uuid;

    @Column(name = "patient_id", nullable = false)
    private Long personId;

    @Column(name = "patient_uuid", columnDefinition = "uuid")
    private UUID patientUuid;

    @Column(name = "client_code", nullable = false, length = 50)
    private String clientCode;

    @Column(name = "date_of_visit", nullable = false)
    private LocalDate dateOfVisit;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "setting", length = 50)
    private String setting;

    @Column(name = "pmtct_hts", nullable = false)
    private Boolean pmtctHts = true;

    @Column(name = "source", length = 50, nullable = false)
    private String source = "Web";

    @Column(name = "longitude", length = 50)
    private String longitude;

    @Column(name = "latitude", length = 50)
    private String latitude;

    @Type(type = "jsonb")
    @Column(name = "observation", columnDefinition = "jsonb")
    private JsonNode observation;

    @Column(nullable = false)
    private Boolean archived = false;

    @Column(name = "date_created")
    private LocalDateTime createdDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "date_modified")
    private LocalDateTime lastModifiedDate;

    @Column(name = "modified_by")
    private String lastModifiedBy;
}
