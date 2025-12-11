package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
@Data
@Builder
public class InfantDto implements Serializable
{
    @NotNull(message = "Source is required")
    private String source;
    private LocalDate dateOfDelivery;
    private String firstName;
    private String middleName;
    private String surname;
    private String sex;
    private String nin;
    private Long id;
    private String hospitalNumber;
    private String uuid;
    private String ancNo;
    private String infantOutcomeAt18Months;
    private String personUuid;
    private Double bodyWeight;
    private String ctxStatus;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
}
