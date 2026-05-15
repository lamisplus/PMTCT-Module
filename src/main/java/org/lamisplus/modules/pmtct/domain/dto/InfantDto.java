package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
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
    private String id;
    private String infantHospitalNumber;
    private String uuid;
    private String infantPatientUuid;
    private String patientUuid;
    private Double bodyWeight;
    private Double length;
    private String ctxStatus;
    @NotNull(message = "pmtctCycleUuid is required")
    private String pmtctCycleUuid;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
    private String birthOutcome;
    private String entryPoint;
    private String entryPointOther;
    private InfantSyphilisProphylaxisDto syphilisProphylaxis;
    private List<InfantHbvVaccinationDto> hbvVaccinations;
}
