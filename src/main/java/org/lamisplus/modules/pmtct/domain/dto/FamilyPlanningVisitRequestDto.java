package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class FamilyPlanningVisitRequestDto implements Serializable {
    private String uuid;

    @NotNull
    private String patientUuid;
    @NotNull
    private String pmtctCycleUuid;
    @NotNull
    private LocalDate visitDate;

    private Double weight;
    private String bloodPressure;
    private Integer parity;

    private String counselledOnFp;
    private String counselledOnPpfp;
    private String firstTimeModernFpUser;
    private Boolean emergencyContraception;
    private String typeOfFpClient;
    private String sourceOfReferral;

    // JSON array strings, e.g. ["ORAL_PILLS","INJECTABLE"]
    private String methodsProvided;
    private String referredOut;

    private OralPillsDto oralPillsData;
    private InjectableDto injectableData;
    private IudDto iudData;
    private CondomDto condomData;
    private ImplantDto implantData;
    private SterilizationDto sterilizationData;
    private NaturalMethodsDto naturalMethodsData;

    private String source;
}
