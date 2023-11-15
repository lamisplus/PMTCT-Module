package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InfantVisitRequestDto implements Serializable
{
    private Long id;
    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private Long bodyWeight;
    private String visitStatus;
    private String ctxStatus;
    private String breastFeeding ;
    private String uuid;
    private String infantOutcomeAt18Months;
    private String personUuid;


}
