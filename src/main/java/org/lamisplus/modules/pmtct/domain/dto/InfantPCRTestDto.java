package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import lombok.Data;
import org.lamisplus.modules.patient.utility.SecurityUtils;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@MappedSuperclass
@Data
public class InfantPCRTestDto implements Serializable
{
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

    private String latitude;
    private String longitude;
    private String source;

}
