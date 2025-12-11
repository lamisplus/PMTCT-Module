package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import lombok.Data;
import org.lamisplus.modules.patient.utility.SecurityUtils;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@MappedSuperclass
@Data
public class InfantPCRTestDto implements Serializable
{
    @NotNull(message = "Source is required")
    private String source;
    private Long id;
    @CreatedDate
    private LocalDate visitDate = LocalDate.now();
    private String infantHospitalNumber;
    private String ancNumber;
    private String ageAtTest ;
    private String testType;
    private LocalDate dateSampleCollected;
    private LocalDate dateSampleSent;
    private LocalDate dateResultReceivedAtFacility;
    private LocalDate dateResultReceivedByCaregiver;
    private String results;
    private String uuid;
    private String  uniqueUuid;
    private String motherPersonUuid;

}
