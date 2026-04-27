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
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
@Data
@AllArgsConstructor
@Builder
public class PmtctVisitRequestDto implements Serializable {
    @NotNull(message = "Source is required")
    private String source;
    private Long id;
    private String ancNo;
    private String enteryPoint;
    private String currentStatus;
    private Double weight;
    private Double sfhLength;
    private String currentArtStatus;
    private String mothersArtRegimen;
    private String currentHbvStatus;
    private String nameOfHbvDrug;
    private String currentSyphilisStatus;
    private String nameOfSyphilisDrug;
    private LocalDate dateOfInitialVisit;
    private LocalDate dateOfVisit;
    private LocalDate dateOfDelivery;
    private String fpCounseling;
    private String fpMethod;
    private String timeOfViralLoad;
    private LocalDate dateOfViralLoad;
    private LocalDate dateOfVlResultReceived;
    private Integer gaOfViralLoad;
    private Long resultOfViralLoad;
    private String infantFeedingPractice;
    private String infantOnCtx;
    private String referredToTreatment;
    private String dsd;
    private String dsdOption;
    private String dsdModel;
    private String  maternalOutcome;
    private LocalDate dateOfmeternalOutcome;
    private String visitStatus;
    private String transferTo;
    private LocalDate nextAppointmentDate;
    private String signature;
    private String personUuid;
    @NotNull(message = "pmtctCycleId is required")
    private Long pmtctCycleId;
}
