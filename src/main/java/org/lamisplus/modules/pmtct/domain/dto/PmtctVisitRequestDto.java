package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.patient.domain.dto.AddressDto;
import org.lamisplus.modules.patient.domain.dto.ContactDto;
import org.lamisplus.modules.patient.domain.dto.ContactPointDto;
import org.lamisplus.modules.patient.domain.dto.IdentifierDto;

import javax.persistence.Column;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
@Data
@AllArgsConstructor
@Builder
public class PmtctVisitRequestDto implements Serializable {
    private String ancNo;
    private LocalDate dateOfVisit;
    private String pulse;
    private String respiratoryRate;
    private String temperature;
    private String bodyWeight;
    private String height;
    private String systolic;
    private String diastolic;
    private String clinicalNotes;
    private String whoStaging;
    private String functionalStatus;
    private String levelOfAdherence;
    private String onAntiTbDrugs;
    private LocalDate nextClinicalAppointmentDate;
    private List<OpportunisticInfection> opportunisticInfection;
    private List<Adr> adr;

}
