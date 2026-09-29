package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

// LV3-1965: single-row status table tracking whether the one-time historical backfill (mapping
// pre-existing external HTS records to their pregnancy cycles) has been run to completion. The
// PMTCT landing page checks this via HtsBackfillController before ever showing the "map existing
// records" modal - once completed = true, it's never shown again on this install.
@Entity
@Table(name = "pmtct_hts_backfill_status", schema = "public")
@Data
@NoArgsConstructor
public class PmtctHtsBackfillStatus {

    @Id
    @Column(name = "id")
    private Long id = 1L;

    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "completed_by")
    private String completedBy;

    @Column(name = "records_mapped")
    private Integer recordsMapped;

    @Column(name = "patients_affected")
    private Integer patientsAffected;
}
