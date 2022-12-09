package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

@Data
public class PMTCTPersonDto
{
    private String hospitalNumber;
    private String surname;
    private String otherNames;
    private Object descriptiveAddress;
    private Object contactPoint;
    private Integer age;
    private Boolean ancRegstrationStatus;
}
