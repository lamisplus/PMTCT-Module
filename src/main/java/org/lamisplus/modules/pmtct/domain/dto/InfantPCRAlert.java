package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InfantPCRAlert {
    private String infantHospitalNo;
    private LocalDate deliveryDate;
    private LocalDate lastVisitDate;
    private String  alertMessage;
    private InfantPCRTestDto lastPCRTest;

}
