package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@RequiredArgsConstructor
public class InfantVisitResponseDto implements Serializable
{
    private Long id;
    private String fullname;
    private int age;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Double bodyWeight;
    private String visitStatus;
    private String ctxStatus;
    private String breastFeeding ;
    private String uuid;
    private String ageAtCtx;
    private String infantOutcomeAt18Months;
    private String uniqueUuid;

    private String latitude;
    private String longitude;
    private String source;
}