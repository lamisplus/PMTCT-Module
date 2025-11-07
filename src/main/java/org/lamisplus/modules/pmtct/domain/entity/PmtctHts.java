package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.HivTestDto;

import javax.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name = "pmtct_hts",  schema = "public")
@Data
@NoArgsConstructor
public class PmtctHts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String uuid;
//    private String initialHivTest;
//    private String confirmatoryHivTest;
    private String stageOfPregnancy;
    private String personUuid;
    private String hospitalNumber;
    private Long archived;
    private String syphilis;
    @Column(name = "hepatitis_b")
    private String hepatitisB;
    @Column(name = "hepatitis_c")
    private String hepatitisC;
    private String testingType;
    private String ancNo;
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

    private Long pmtctCycleId;

}
