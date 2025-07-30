package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
@Data

@AllArgsConstructor
@Builder
public class PmtctHtsRequestDTO {

    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String initialHivTest;
    private String confirmatoryHivTest;
    private String stageOfPregnancy;
    private String personUuid;
    private String hospitalNumber;
    private String syphilis;
    private String hepatitisB;
    private String hepatitisC;
    private String testingType;


}


