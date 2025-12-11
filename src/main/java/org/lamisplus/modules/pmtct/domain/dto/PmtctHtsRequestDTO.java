package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
@Data

@AllArgsConstructor
@Builder
public class PmtctHtsRequestDTO {
    @NotNull(message = "Source is required")
    private String source;
    private LocalDate dateOfHivTest;
    private String testEntryPoint;
    private String testSetting;
    private String stageOfPregnancy;
    private String personUuid;
    private String hospitalNumber;
    private String syphilis;
    private String hepatitisB;
    private String hepatitisC;
    private String testingType;
    private String ancNo;
    private HivTestDto initialHivTest;
    private HivTestDto confirmatoryHivTest;
    private HivTestDto tieBreaker;
    private HivTestDto retesting;
    private HivTestDto confirmatoryTest2;
    private HivTestDto tieBreaker2;
    private String finalResult;






}


