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
    // Required unless entryCategory is HEI_NO_MATERNAL_RECORD — enforced in
    // InfantService.save() rather than here, since that check is conditional.
    private String pmtctCycleUuid;
    private InfantArvDto infantArvDto;
    private InfantPCRTestDto infantPCRTestDto;
    private String birthOutcome;
    private String entryPoint;
    private String entryPointOther;
    private InfantSyphilisProphylaxisDto syphilisProphylaxis;
    private List<InfantHbvVaccinationDto> hbvVaccinations;
    // "HEI_NO_MATERNAL_RECORD" when this infant was found via the HIV-Exposed Infant grid
    // and has no maternal record in the system; null/absent for a standard, mother-linked infant.
    private String entryCategory;
}
