package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String initialHivTest;
    private String confirmatoryHivTest;
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

}
