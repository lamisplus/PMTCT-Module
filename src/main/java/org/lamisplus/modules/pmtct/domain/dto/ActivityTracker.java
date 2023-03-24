package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ActivityTracker implements Serializable
{
    private String activityName;
    private String path;
    private Long recordId;
    private LocalDate activityDate;
    private boolean deletable;
    private boolean editable;
    private boolean viewable;

}
