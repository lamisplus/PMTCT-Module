package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.enums.ReferredSyphilisPositiveClient;
import org.lamisplus.modules.pmtct.domain.entity.enums.TestedForSyphilis;
import org.lamisplus.modules.pmtct.domain.entity.enums.TreatedForSyphilis;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.time.LocalDate;

@Data
public class ANCWithPersonRequestDto
{
    private Long id;
    private String ancNo;
    private LocalDate firstANCDate;
    private Integer gravida;
    private Integer parity;
    private LocalDate LMP;
    private LocalDate expectedDeliveryDate;
    private Integer gAWeeks;
    private String timeOfHIVDiognosis;
    private SyphilisInfo syphilisInfo;
    private PmtctHtsInfo pmtctHtsInfo;
    private PartnerNotification partnerNotification;
    private PersonDto personDto;
}
