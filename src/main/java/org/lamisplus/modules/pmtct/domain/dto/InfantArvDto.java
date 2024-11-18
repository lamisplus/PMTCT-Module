package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;


import lombok.Data;
import org.springframework.beans.factory.annotation.Value;


import java.io.Serializable;
@Data
public class InfantArvDto implements Serializable
{
    private Long id;
    private Long infantId;

    private LocalDate visitDate;
    private String infantHospitalNumber;
    private String ancNumber;
    private String infantArvType;
    private String infantArvTime;
    private String arvDeliveryPoint;
    private String uuid;
    private String ageAtCtx;
    private String timingOfAvrAfter72Hours;
    private String timingOfAvrWithin72Hours;
    private String  uniqueUuid;
    private LocalDate dateOfCtx;
    private LocalDate dateOfArv;

}
