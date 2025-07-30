package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Data
@RequiredArgsConstructor
public class PmtctHtsReponseDTO {
    private Long id;

    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String initialHivTest;
    private String confirmatoryHivTest;
    private String stageOfPregnancy;
    private String personUuid;
    private String hospitalNumber;
    private String uuid;
    private Long archived;
    private String testingType;
    private String syphilis;
    private String hepatitisB;
    private String hepatitisC;


}
