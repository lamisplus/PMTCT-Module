package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.HbvInfoDto;
import org.lamisplus.modules.pmtct.domain.dto.HivTestDto;
import org.lamisplus.modules.pmtct.domain.dto.PartnerInfoDto;
import org.lamisplus.modules.pmtct.domain.dto.SyphilisDetailsDto;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Table(name = "pmtct_hts",  schema = "public")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
public class PmtctHts {
    @Column(name = "id", insertable = false, updatable = false)
    private Long id;
    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    @Id
    @Column(name = "uuid", nullable = false, updatable = false)
    private String uuid;
//    private String initialHivTest;
//    private String confirmatoryHivTest;
    private String stageOfPregnancy;
    @Column(name = "patient_uuid")
    private String patientUuid;
    private Integer archived;
    private String syphilis;
    @Column(name = "hepatitis_b")
    private String hepatitisB;
    @Column(name = "hepatitis_c")
    private String hepatitisC;
    private String testingType;
    private String finalResult;

    // JSONB columns mapped to HivTestDto
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private HivTestDto initialHivTest;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private HivTestDto confirmatoryHivTest;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private HivTestDto tieBreaker;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private HivTestDto retesting;

    @Type(type = "jsonb")
    @Column(name = "confirmatory_test2",columnDefinition = "jsonb")
    private HivTestDto confirmatoryTest2;

    @Type(type = "jsonb")
    @Column(name = "tie_breaker2",columnDefinition = "jsonb")
    private HivTestDto tieBreaker2;

    // New PMTCT Register fields
    private String pregnancyStatusAtEntry;
    private String previouslyKnownHivPositive;
    private String enrolledOnArt;
    private String typeOfHivTest;
    private String hivEarlyDetect;
    private String hivEarlyDetectViralLoad;
    private String confirmatoryFromSpokes;
    private String initiatedOnProphylaxis;
    private String tbReferred;

    @Type(type = "jsonb")
    @Column(name = "syphilis_info", columnDefinition = "jsonb")
    private SyphilisDetailsDto syphilisInfo;

    @Type(type = "jsonb")
    @Column(name = "hbv_info", columnDefinition = "jsonb")
    private HbvInfoDto hbvInfo;

    @Type(type = "jsonb")
    @Column(name = "partner_info", columnDefinition = "jsonb")
    private PartnerInfoDto partnerInfo;

    private String tbScreeningStatus;
    private String pmtctTestEntryPoint;
    private String viralLoadMonitoring;

    private String pmtctCycleUuid;
    private Long facilityId;

    @Column(name = "created_date", updatable = false)
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(name = "created_by", updatable = false)
    @CreatedBy
    private String createdBy;

    @Column(name = "last_modified_date")
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    @Column(name = "last_modified_by")
    @LastModifiedBy
    private String lastModifiedBy;
    private String source;

}
