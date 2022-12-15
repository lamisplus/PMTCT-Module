package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ActivityTracker implements Serializable
{
    private String activityName;
    private int tableId;
    private Long recordId;
    private LocalDate activityDate;
}
