package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.pmtct.domain.dto.HtsBackfillResultDto;
import org.lamisplus.modules.pmtct.service.HtsBackfillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// LV3-1965 §10: the PMTCT landing page silently calls GET status on mount - if completed = true
// it does nothing further; otherwise it calls POST, which kicks off the real run on a background
// thread and returns immediately, with no confirmation and nothing shown to the user either way.
// GET progress is not called by anything in the UI - kept as a diagnostic endpoint for checking
// on a run in flight (e.g. via curl), not part of the user-facing flow.
@RestController
@RequestMapping("api/v1/pmtct/anc")
@RequiredArgsConstructor
public class HtsBackfillController {

    private final HtsBackfillService htsBackfillService;

    @GetMapping("hts-backfill-status")
    public ResponseEntity<HtsBackfillResultDto> getStatus() {
        return ResponseEntity.ok(htsBackfillService.getStatus());
    }

    @GetMapping("hts-backfill-progress")
    public ResponseEntity<HtsBackfillResultDto> getProgress() {
        return ResponseEntity.ok(htsBackfillService.getProgress());
    }

    @PostMapping("hts-backfill")
    public ResponseEntity<Void> startBackfill() {
        htsBackfillService.startBackfill();
        return ResponseEntity.accepted().build();
    }
}
