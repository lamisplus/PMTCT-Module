package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterResponse;
import org.lamisplus.modules.hts.service.HtsEncounterService;
import org.lamisplus.modules.pmtct.domain.dto.HtsBackfillResultDto;
import org.lamisplus.modules.pmtct.domain.entity.PmtctHtsBackfillStatus;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.DeliveryRepository;
import org.lamisplus.modules.pmtct.repository.HtsEncounterProxyRepository;
import org.lamisplus.modules.pmtct.repository.PmtctHtsBackfillStatusRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// LV3-1965: the historical backfill for HTS records that already existed before Flow A2/A2b's
// save-time triggers were built. Reuses the exact same candidate-finding queries and the exact
// same fetch-whole/reconstruct/write-back technique - the only things that differ are (a) it
// walks every existing pregnancy cycle instead of one just-created one, and (b) the write goes
// through HtsEncounterService in-process instead of the frontend's GET/PUT, since this needs to
// run unattended across a large existing patient population, not one browser session at a time.
//
// This is a collective, single bulk pass - not per-patient, and entirely invisible to the user.
// No modal, no confirmation, no progress UI - the PMTCT landing page silently checks the
// completed flag on mount and, if it's not set yet, fires this off in the background without
// asking. The only UI-facing trace of any of this is that persisted flag preventing it from
// ever re-checking or re-running once it's genuinely done.
//
// Known simplification: a record is claimed by whichever cycle's candidate list it appears in
// first in the flat list gathered up front, rather than evaluating every one of a patient's
// cycles against every one of her unmapped records simultaneously. The pmtctCycleUuid IS NULL
// guard still makes this safe (never double-claimed), but in the rare case a patient has
// multiple cycles that could both match the same record, this doesn't strictly apply §06's
// closest-date tie-break. Most patients have exactly one cycle, so the practical impact is
// expected to be small - flagged here rather than silently glossed over.
@Service
@RequiredArgsConstructor
@Slf4j
public class HtsBackfillService {

    private final HtsEncounterService htsEncounterService;
    private final HtsEncounterProxyRepository htsEncounterProxyRepository;
    private final ANCRepository ancRepository;
    private final DeliveryRepository deliveryRepository;
    private final PmtctHtsBackfillStatusRepository statusRepository;
    private final HtsBackfillProgressTracker progressTracker;
    private final ObjectMapper objectMapper;

    @AllArgsConstructor
    private static class Candidate {
        Long htsEncounterId;
        String pmtctCycleUuid;
        String patientUuid;
    }

    // Cheap, flag-only check - no candidate scan. There's no UI left to show a count to (no
    // modal, no dry run), so the landing page only ever needs a yes/no: has this run yet.
    public HtsBackfillResultDto getStatus() {
        PmtctHtsBackfillStatus status = currentStatus();
        return HtsBackfillResultDto.builder()
                .completed(Boolean.TRUE.equals(status.getCompleted()))
                .completedDate(status.getCompletedDate())
                .recordsMapped(status.getRecordsMapped())
                .patientsAffected(status.getPatientsAffected())
                .build();
    }

    public HtsBackfillResultDto getProgress() {
        return HtsBackfillResultDto.builder()
                .completed(!progressTracker.isRunning() && progressTracker.getTotal() > 0
                        && progressTracker.getProcessed() >= progressTracker.getTotal())
                .running(progressTracker.isRunning())
                .recordsMapped(progressTracker.getProcessed())
                .totalRecords(progressTracker.getTotal())
                .build();
    }

    // Kicks off the real run on a background thread and returns immediately - the modal polls
    // getProgress() for the bar, not this call's response. tryClaim() is checked first, atomically,
    // before any candidate-gathering work - closes the race where two near-simultaneous calls
    // (two tabs, two users) could otherwise both slip past a plain "is it running" check.
    public void startBackfill() {
        if (!progressTracker.tryClaim()) return;

        List<Candidate> candidates = gatherCandidates();
        progressTracker.start(candidates.size());

        Thread worker = new Thread(() -> runInBackground(candidates), "lv3-1965-hts-backfill");
        worker.setDaemon(true);
        worker.start();
    }

    private void runInBackground(List<Candidate> candidates) {
        int mapped = 0;
        Set<String> patientsAffected = new HashSet<>();

        for (Candidate c : candidates) {
            if (syncOne(c.htsEncounterId, c.pmtctCycleUuid)) {
                mapped++;
                patientsAffected.add(c.patientUuid);
            }
            progressTracker.increment();
        }

        PmtctHtsBackfillStatus status = currentStatus();
        status.setCompleted(true);
        status.setCompletedDate(LocalDateTime.now());
        status.setCompletedBy(currentUsername());
        status.setRecordsMapped(mapped);
        status.setPatientsAffected(patientsAffected.size());
        statusRepository.save(status);

        progressTracker.finish();
        log.info("LV3-1965 backfill complete: {} records mapped across {} patients",
                mapped, patientsAffected.size());
    }

    // Read-only pass gathering every unmapped candidate across both branches, in one flat list -
    // used both for the dry-run count (§10) and as the exact work list the real run processes,
    // so the modal's upfront count and what actually gets done never disagree.
    private List<Candidate> gatherCandidates() {
        List<Candidate> candidates = new ArrayList<>();

        for (Object[] row : ancRepository.findCyclesForHtsBackfill()) {
            String patientUuid = (String) row[0];
            String cycleUuid = (String) row[1];
            LocalDate dateOfEnrollment = toLocalDate(row[2]);
            for (Long id : htsEncounterProxyRepository.findUnmappedAncSyncCandidateIds(patientUuid, dateOfEnrollment)) {
                candidates.add(new Candidate(id, cycleUuid, patientUuid));
            }
        }

        for (Object[] row : deliveryRepository.findCyclesForHtsBackfill()) {
            String patientUuid = (String) row[0];
            String cycleUuid = (String) row[1];
            LocalDate dateOfDelivery = toLocalDate(row[2]);
            for (Long id : htsEncounterProxyRepository.findUnmappedDeliverySyncCandidateIds(patientUuid, dateOfDelivery)) {
                candidates.add(new Candidate(id, cycleUuid, patientUuid));
            }
        }

        return candidates;
    }

    // Fetch whole, reconstruct, write back - the in-process equivalent of
    // syncExternalHtsRecordsToCycle (utils/index.js). pmtctHts is carried forward unchanged,
    // never flipped to true, same reasoning as Flow A2/A2b (§06).
    private boolean syncOne(Long htsEncounterId, String pmtctCycleUuid) {
        try {
            HtsEncounterResponse existing = htsEncounterService.getById(htsEncounterId);
            if (existing == null) return false;

            HtsEncounterRequestDTO request = existing.getObservation() != null
                    ? objectMapper.convertValue(existing.getObservation(), HtsEncounterRequestDTO.class)
                    : new HtsEncounterRequestDTO();

            request.setDateOfVisit(existing.getDateOfVisit());
            request.setClientCode(existing.getClientCode());
            request.setSetting(existing.getSetting());
            request.setFacilityId(existing.getFacilityId());
            request.setPmtctHts(existing.getPmtctHts());
            request.setSource(existing.getSource());
            request.setLongitude(existing.getLongitude());
            request.setLatitude(existing.getLatitude());
            request.setPmtctCycleUuid(pmtctCycleUuid);

            htsEncounterService.update(htsEncounterId, request);
            return true;
        } catch (Exception e) {
            log.warn("LV3-1965 backfill: failed to sync hts_encounter id={} to cycle={}: {}",
                    htsEncounterId, pmtctCycleUuid, e.getMessage());
            return false;
        }
    }

    private PmtctHtsBackfillStatus currentStatus() {
        return statusRepository.findById(1L).orElseGet(() -> {
            PmtctHtsBackfillStatus fresh = new PmtctHtsBackfillStatus();
            fresh.setId(1L);
            return fresh;
        });
    }

    private String currentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate) return (LocalDate) value;
        if (value instanceof java.sql.Date) return ((java.sql.Date) value).toLocalDate();
        return LocalDate.parse(value.toString());
    }
}
