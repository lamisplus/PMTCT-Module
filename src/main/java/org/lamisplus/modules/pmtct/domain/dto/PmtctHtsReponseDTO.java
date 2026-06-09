package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Data
@RequiredArgsConstructor
public class PmtctHtsReponseDTO {
    private Long id;
    private String clientCode;

    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String stageOfPregnancy;
    private String patientUuid;
    private String hospitalNumber;
    private String uuid;
    private Boolean archived;
    private String testingType;
    private String syphilis;
    private String hepatitisB;
    private String hepatitisC;
    private HivTestDto initialHivTest;
    private HivTestDto confirmatoryHivTest;
    private HivTestDto retesting;
    private String finalResult;
    private String pmtctCycleUuid;

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

    // Person / patient card fields
    private Long personId;
    private String firstName;
    private String surname;
    private String otherName;
    private String sex;
    private Integer age;
    private LocalDate dateOfBirth;
    private Long pregnancyCount;
    private String fullName;
    private String address;
    private String contactPoint;
    private String ancNo;
    private String hivStatus;
    private Boolean pmtctRegStatus;
    private String entryPoint;
    private LocalDate artStartDate;
    private String tbStatus;
    private LocalDate pmtctEnrollmentDate;
    private String source;

}
