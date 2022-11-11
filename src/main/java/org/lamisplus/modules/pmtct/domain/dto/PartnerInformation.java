package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PartnerInformation
{
    private String fullName;
    private LocalDate dateOfBirth;
    private String preTestCounseled;
    private String acceptHivTest;
    private String postTestCounseled;
    private String hbStatus;
    private String hcStatus;
    private String syphillisStatus;
    private String referredTo;
    private int age;
}
