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
    private LocalDate dateOfVisit;
    private String fpCounseling;
    private String fpMethod;
    private LocalDate dateOfViralLoad32;
    private Integer gaOfViralLoad32;
    private Integer resultOfViralLoad32;
    private LocalDate dateOfViralLoadOt;
    private Integer gaOfViralLoadOt;
    private Integer resultOfViralLoadOt;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String maternalOutcome;
    private LocalDate dateOfmeternalOutcome;
    private String visitStatus;
    private String transferTo;
    private LocalDate nextAppointmentDate;
    private String personUuid;
}