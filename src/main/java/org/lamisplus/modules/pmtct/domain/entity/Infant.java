package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.pmtct.domain.dto.InfantArvDto;
import org.lamisplus.modules.pmtct.domain.dto.InfantHbvVaccinationDto;
import org.lamisplus.modules.pmtct.domain.dto.InfantPCRTestDto;
import org.lamisplus.modules.pmtct.domain.dto.InfantSyphilisProphylaxisDto;
import org.springframework.data.domain.Persistable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pmtct_infant_information",  schema = "public")
@Data
@NoArgsConstructor
public class Infant extends PMTCTTransactionalEntity implements Serializable, Persistable<String> {
    @Column(name = "infant_hospital_number")
    private String infantHospitalNumber;
    private LocalDate dateOfDelivery;
    @Column(name = "mother_patient_uuid")
    private String motherPatientUuid;
    @Column(name = "infant_patient_uuid")
    private String infantPatientUuid;
    private Double bodyWeight;
    private Double length;
    private String ctxStatus;
    private String pmtctCycleUuid;
    private Boolean archived;
    private String source;

    @Type(type = "jsonb")
    @Column(name = "infant_arv_data", columnDefinition = "jsonb")
    private InfantArvDto infantArvData;

    @Type(type = "jsonb")
    @Column(name = "infant_pcr_data", columnDefinition = "jsonb")
    private InfantPCRTestDto infantPcrData;

    @Type(type = "jsonb")
    @Column(name = "syphilis_prophylaxis", columnDefinition = "jsonb")
    private InfantSyphilisProphylaxisDto syphilisProphylaxis;

    @Type(type = "jsonb")
    @Column(name = "hbv_vaccinations", columnDefinition = "jsonb")
    private List<InfantHbvVaccinationDto> hbvVaccinations;

    private String birthOutcome;
    private String entryPoint;
    private String entryPointOther;

    @PrePersist
    public void prePersist() {
        if (this.archived == null) {
            this.archived = false;
        }
    }
}
