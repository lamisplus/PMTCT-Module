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
    private Long id;
    private String ancNo;
    private Long enteryPoint;
    private LocalDate dateOfVisit;
    private String fpCounseling;
    private String fpMethod;
    private LocalDate dateOfViralLoad32;
    private Integer gaOfViralLoad32;
    private Integer resultOfViralLoad32;
    private LocalDate dateOfViralLoadOt;
    private Integer gaOfViralLoadOt;
    private Integer resultOfViralLoadOt;
    private boolean dsd;
    private String dsdOption;
    private String dsdModel;
    private String  maternalOutcome;
    private LocalDate dateOfmeternalOutcome;
    private String visitStatus;
    private String transferTo;
    private LocalDate nextAppointmentDate;
    private String personUuid;
}
