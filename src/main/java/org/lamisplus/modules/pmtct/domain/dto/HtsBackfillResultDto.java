package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

// LV3-1965: response shape for GET hts-backfill-status (dry run count, or already-completed
// summary) and GET hts-backfill-progress (polled while the background run is in flight).
// totalRecords/running are only meaningful for the progress poll; recordsMapped/patientsAffected
// carry different meanings depending on which endpoint populated this (dry-run candidate count
// vs. actual synced count) - see HtsBackfillService for which is which at each call site.
@Data
@Builder
public class HtsBackfillResultDto {
    private boolean completed;
    private boolean running;
    private LocalDateTime completedDate;
    private Integer recordsMapped;
    private Integer patientsAffected;
    private Integer totalRecords;
}
