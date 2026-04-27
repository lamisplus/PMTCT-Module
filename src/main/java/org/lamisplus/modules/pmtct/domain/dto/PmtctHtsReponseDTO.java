package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Data
@RequiredArgsConstructor
public class PmtctHtsReponseDTO {
    private Long id;

    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String stageOfPregnancy;
    private String personUuid;
    private String hospitalNumber;
    private String uuid;
    private Long archived;
    private String testingType;
    private String syphilis;
    private String hepatitisB;
    private String hepatitisC;
    private String ancNo;
    private HivTestDto initialHivTest;
    private HivTestDto confirmatoryHivTest;
    private HivTestDto tieBreaker;
    private HivTestDto retesting;
    private HivTestDto confirmatoryTest2;
    private HivTestDto tieBreaker2;
    private String finalResult;
    private Long pmtctCycleId;

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
    private SyphilisDetailsDto syphilisInfo;
    private HbvInfoDto hbvInfo;
    private PartnerInfoDto partnerInfo;
    private String tbScreeningStatus;
    private String pmtctTestEntryPoint;
    private String viralLoadMonitoring;
    private Long personId;
    private String sex;
    private Integer age;
    private LocalDate dateOfBirth;
    private Long pregnancyCount;
    private String fullName;
    private String hivStatus;
    private Boolean pmtctRegStatus;
    private String entryPoint;
    private LocalDate artStartDate;
    private String tbStatus;
    private LocalDate pmtctEnrollmentDate;
    private String source;

}
