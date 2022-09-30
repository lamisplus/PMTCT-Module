package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import org.lamisplus.modules.pmtct.domain.entity.enums.ReferredSyphilisPositiveClient;
import org.lamisplus.modules.pmtct.domain.entity.enums.TestedForSyphilis;
import org.lamisplus.modules.pmtct.domain.entity.enums.TreatedForSyphilis;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.time.LocalDate;
@Data
public class ANCRequestDto
{
    private Long id;
    private LocalDate dateRegistration;
    private String hospitalNumber;
    private String ancNo;
    private LocalDate LMP;
    private Integer gAWeeks;
    private Integer gravida;
    private Integer parity;
    private String sourceOfReferral;
    @Enumerated(EnumType.STRING)
    private TestedForSyphilis testedForSyphilis;
    @Enumerated(EnumType.STRING)
    private TreatedForSyphilis treatedForSyphilis;
    @Enumerated(EnumType.STRING)
    private ReferredSyphilisPositiveClient referredSyphilisPositiveClient;
    private String syphilisTestResult;
}
