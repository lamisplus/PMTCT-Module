package org.lamisplus.modules.pmtct.domain.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_anc",  schema = "public")
@Data
@NoArgsConstructor
public class ANC extends PMTCTTransactionalEntity implements Serializable, Persistable<String> {
    private String ancNo;
    private LocalDate dateOfEnrollment;
    private Integer gravida;
    private Integer parity;
    @JsonProperty("lmp")
    private LocalDate LMP;
    @JsonProperty("gaweeks")
    @Column(name = "gaweeks")
    private Integer gAWeeks;
    private String patientUuid;
    private Long archived;
    private String status;
    private String staticHivStatus;
    private String sourceOfReferral;
    private String ancSetting;
    private String communitySetting;

    private String previouslyKnownHivStatus;
    private String currentlyOnArt;
    private String facilityEnrolledIn;
    private String pmtctCycleUuid;
    private String source;
    private String ancAttendance;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private VitalSignsDto vitalSigns;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private CounsellingDto counselling;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private SyphilisInfoDto syphilisInfo;

    @Type(type = "jsonb")
    @Column(name = "hepatitis_b_info", columnDefinition = "jsonb")
    private HepatitisBDto hepatitisBInfo;

    @Type(type = "jsonb")
    @Column(name = "hepatitis_c_info", columnDefinition = "jsonb")
    private HepatitisCDto hepatitisCInfo;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private UrinalysisDto urinalysis;

    private String hbPcv;
    private String bloodSugarGdm;
    private String llinGiven;
    private String iptDose;
    private String hematinicsGiven;
    private String tdImmunization;
    private String associatedProblems;
    private String outcomeOfVisit;
    private String referralReason;
    private String transportationOut;

    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb")
    private JsonNode partnerInformation;
    @Override
    public boolean isNew() {
        return getUuid() == null;
    }


}
