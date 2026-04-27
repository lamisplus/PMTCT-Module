package org.lamisplus.modules.pmtct.domain.dto;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
@RequiredArgsConstructor
public class PmtctVisitResponseDto implements Serializable {
    private Long id;
    private String ancNo;
    private String hospitalNumber;
    private String fullName;
    private String sex;
    private int age;
    private LocalDate dateOfBirth;
    private String enteryPoint;
    private String currentStatus;
    private Double weight;
    private Double sfhLength;
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String currentHbvStatus;
    private String nameOfHbvDrug;
    private String currentSyphilisStatus;
    private String nameOfSyphilisDrug;
    private LocalDate dateOfInitialVisit;
    private LocalDate dateOfVisit;
    private LocalDate dateOfDelivery;
    private String fpCounseling;
    private String fpMethod;
    private String timeOfViralLoad;
    private LocalDate dateOfViralLoad;
    private LocalDate dateOfVlResultReceived;
    private Integer gaOfViralLoad;
    private Long resultOfViralLoad;
    private String infantFeedingPractice;
    private String infantOnCtx;
    private String referredToTreatment;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String maternalOutcome;
    private LocalDate dateOfmeternalOutcome;
    private String visitStatus;
    private String transferTo;
    private LocalDate nextAppointmentDate;
    private String signature;
    private String personUuid;
    private Long pmtctCycleId;
    private String source;
}