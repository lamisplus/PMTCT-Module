package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InfantMotherArtDto implements Serializable
{
    private String source;
    private String id;
    private LocalDate visitDate;
    private String ancNumber;
    private String  motherArtInitiationTime;
    private Long regimenTypeId;
    private Long regimenId;
    private String  uuid;
    private String  uniqueUuid;
    private String pmtctCycleUuid;
    private String motherPatientUuid;
    private String syphilisTreatmentReferral;
    private String syphilisTreatmentStartDate;
    private String hbvTreatmentProphylaxis;
    private String hbvTreatmentStartDate;
    private String motherCurrentArtStatus;
    private String whyArtUnknown;
}
