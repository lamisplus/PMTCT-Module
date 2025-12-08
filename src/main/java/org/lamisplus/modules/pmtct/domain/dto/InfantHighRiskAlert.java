package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfantHighRiskAlert {
    private String infantHospitalNo;
    private String infantName;
    private LocalDate dateOfDelivery;
    private List<String> highRiskReasons;
}
