package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
@Data
public class SummaryChart implements Serializable
{
    private int motherVisit;
    private int childVisit;
    private int childAlive;
    private int childDead;
}
