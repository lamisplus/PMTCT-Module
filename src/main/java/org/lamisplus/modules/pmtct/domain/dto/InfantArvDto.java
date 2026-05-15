package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;


import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
@Data
@NoArgsConstructor
public class InfantArvDto implements Serializable
{
    private String source;
    private String id;
    private Long infantId;

    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private String infantArvType;
    private String otherProphylaxisType;
    private String infantArvTime;
    private String arvDeliveryPoint;
    private String uuid;
    private String ageAtCtx;
    private String timingOfAvrAfter72Hours;
    private String timingOfAvrWithin72Hours;
    private String  uniqueUuid;
    private LocalDate dateOfCtx;
    private LocalDate dateOfArv;
    private String pmtctCycleUuid;
    private String motherPatientUuid;

}
