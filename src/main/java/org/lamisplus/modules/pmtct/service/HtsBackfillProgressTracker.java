package org.lamisplus.modules.pmtct.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

// LV3-1965 §10: in-memory progress state for the one-time backfill, polled by the landing-page
// modal's progress bar while POST hts-backfill runs on a background thread. Deliberately not
// persisted - this operation runs once, triggered manually, and if the app restarts mid-run the
// pmtctCycleUuid IS NULL guard on every candidate query already makes re-running safe, so there's
// nothing meaningful to recover by persisting progress across a restart.
@Component
public class HtsBackfillProgressTracker {

    private final AtomicInteger total = new AtomicInteger(0);
    private final AtomicInteger processed = new AtomicInteger(0);
    private final AtomicBoolean running = new AtomicBoolean(false);

    // Atomically claims the "running" slot - returns false if another call already claimed it.
    // Must be called (and checked) BEFORE any candidate-gathering work starts, not after, or two
    // near-simultaneous POST hts-backfill calls (two tabs, two users) could both pass a
    // non-atomic "is it running" check before either actually marks itself running.
    public boolean tryClaim() {
        return running.compareAndSet(false, true);
    }

    public void start(int totalCount) {
        total.set(totalCount);
        processed.set(0);
    }

    public void increment() {
        processed.incrementAndGet();
    }

    public void finish() {
        running.set(false);
    }

    public int getTotal() {
        return total.get();
    }

    public int getProcessed() {
        return processed.get();
    }

    public boolean isRunning() {
        return running.get();
    }
}
