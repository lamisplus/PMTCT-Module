package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryLabourDetailsDto {
    private String decisionSeekingCare;
    private String transportationIn;
    private String transportationInOther;
    private Integer parity;
    private String partographUsed;
    private String whoTookDelivery;
    private String whoTookDeliveryOther;
    private String nameOfDeliveryAttendant;
    // LMP for L&D-entry clients, who have no prior ANC/MIP-card record to source
    // Gestational Age from — the frontend auto-calculates GA from this when provided.
    private LocalDate lmp;
}
