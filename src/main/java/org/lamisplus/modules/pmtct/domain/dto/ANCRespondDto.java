package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.AddressDto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class ANCRespondDto implements Serializable {
    private Long id;
    private String ancNo;
    private String ancSetting;
    private String communitySetting;
    private String ancAttendance;

    private String fullname;
    private String hospitalNumber;
    private String ancUuid;
    private Integer age;
    private LocalDate dateOfEnrollment;
    private Integer gravida;
    private Integer parity;
    @JsonProperty("lmp")
    private LocalDate LMP;
    @JsonProperty("gaweeks")
    private Integer gAWeeks;
    private Object partnerInformation;
    private String patient_uuid;
    private Object address;
    private  Object contactPoint;
    private String hivStatus;
    private boolean pmtctRegStatus;
    private boolean deliveryStatus;
    private LocalDate dateOfBirth;
    private String sex;
    private Long personId;
    private String staticHivStatus;
    private String dynamicHivStatus;
    private String referredSyphilisTreatment;
    private PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto;
    private LocalDate artStartDate;
    private String previouslyKnownHivStatus;
    private String currentlyOnArt;
    private String facilityEnrolledIn;
    private String pmtctCycleUuid;
    private Long pregnancyCount;
    private String entryPoint;
    private String tbStatus;
    private String source;

    private VitalSignsDto vitalSigns;
    private CounsellingDto counselling;
    private SyphilisInfoDto syphilisInfo;
    private HepatitisBDto hepatitisBInfo;
    private HepatitisCDto hepatitisCInfo;
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

}