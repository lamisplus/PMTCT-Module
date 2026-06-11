-- ═══════════════════════════════════════════════════════════════════════════════
-- PMTCT HTS → HTS Encounter Migration Script
--
-- Purpose: Migrates ALL records (active + archived) from pmtct_hts table to
--          hts_encounter table. Archived mapping: 0 → false, 1 → true.
--          After migration, archives all old pmtct_hts records to prevent
--          duplicates in dual-read queries.
--
-- Idempotent: Safe to run multiple times. Uses NOT EXISTS guard to skip
--             records that have already been migrated.
--
-- Target DB: PostgreSQL (LAMISPlus)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── PRE-FLIGHT CHECK ────────────────────────────────────────────────────────
DO $$
DECLARE
    total_records INT;
    total_active INT;
    total_archived INT;
    already_migrated INT;
    no_patient INT;
    to_migrate INT;
BEGIN
    SELECT COUNT(*) INTO total_records FROM pmtct_hts;
    SELECT COUNT(*) INTO total_active FROM pmtct_hts WHERE archived = 0;
    SELECT COUNT(*) INTO total_archived FROM pmtct_hts WHERE archived = 1;

    SELECT COUNT(*) INTO already_migrated
    FROM pmtct_hts p
    WHERE EXISTS (
          SELECT 1 FROM hts_encounter he
          WHERE he.pmtct_hts = true
            AND he.observation->>'pmtctCycleUuid' = p.pmtct_cycle_uuid
            AND he.patient_uuid::text = p.patient_uuid
            AND he.date_of_visit = p.date_of_hiv_test
            AND COALESCE(he.observation->>'testingType', '') = COALESCE(p.testing_type, '')
      );

    SELECT COUNT(*) INTO no_patient
    FROM pmtct_hts p
    WHERE NOT EXISTS (
          SELECT 1 FROM patient_person pp
          WHERE pp.uuid::text = p.patient_uuid
      );

    to_migrate := total_records - already_migrated - no_patient;

    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '  PMTCT HTS Migration - Pre-flight';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Total pmtct_hts records:             %', total_records;
    RAISE NOTICE '  - Active (archived=0):             %', total_active;
    RAISE NOTICE '  - Archived (archived=1):           %', total_archived;
    RAISE NOTICE 'Already migrated (will be skipped):  %', already_migrated;
    RAISE NOTICE 'No matching patient (will skip):     %', no_patient;
    RAISE NOTICE 'Records to migrate:                  %', to_migrate;
    RAISE NOTICE '════════════════════════════════════════';
END $$;


-- ─── STEP 1: INSERT INTO hts_encounter ───────────────────────────────────────
INSERT INTO hts_encounter (
    patient_id,
    patient_uuid,
    client_code,
    date_of_visit,
    facility_id,
    setting,
    pmtct_hts,
    source,
    observation,
    archived,
    date_created,
    created_by,
    date_modified,
    modified_by
)
SELECT
    -- patient_id: look up from patient_person by uuid (any archived status)
    (
        SELECT pp.id FROM patient_person pp
        WHERE pp.uuid::text = p.patient_uuid
        ORDER BY pp.archived ASC
        LIMIT 1
    ),

    -- patient_uuid: cast String to UUID
    p.patient_uuid::uuid,

    -- client_code: generate unique code using ROW_NUMBER + offset
    'H01/'
        || TO_CHAR(COALESCE(p.date_of_hiv_test, CURRENT_DATE), 'YY') || '/'
        || TO_CHAR(COALESCE(p.date_of_hiv_test, CURRENT_DATE), 'MM') || '/'
        || (5000 + ROW_NUMBER() OVER (ORDER BY p.id))
        || CHR(65 + (p.id % 26)::int)
        || CHR(65 + ((p.id / 26) % 26)::int),

    -- date_of_visit
    p.date_of_hiv_test,

    -- facility_id
    p.facility_id,

    -- setting: from test_setting column (exact value)
    COALESCE(p.test_setting, ''),

    -- pmtct_hts: always true for PMTCT records
    true,

    -- source
    COALESCE(p.source, 'Web'),

    -- observation: build JSONB from all pmtct_hts columns
    jsonb_build_object(
        -- HIV Test Results
        'finalHivTestResult', COALESCE(p.final_result, ''),

        'initialHivTest', CASE
            WHEN p.initial_hiv_test IS NOT NULL AND jsonb_typeof(p.initial_hiv_test) = 'object'
                THEN COALESCE(p.initial_hiv_test->>'result', '')
            WHEN p.initial_hiv_test IS NOT NULL AND jsonb_typeof(p.initial_hiv_test) = 'string'
                THEN COALESCE(p.initial_hiv_test #>> '{}', '')
            ELSE ''
        END,

        'confirmatoryHivTest', CASE
            WHEN p.confirmatory_hiv_test IS NOT NULL AND jsonb_typeof(p.confirmatory_hiv_test) = 'object'
                THEN COALESCE(p.confirmatory_hiv_test->>'result', '')
            WHEN p.confirmatory_hiv_test IS NOT NULL AND jsonb_typeof(p.confirmatory_hiv_test) = 'string'
                THEN COALESCE(p.confirmatory_hiv_test #>> '{}', '')
            ELSE ''
        END,

        -- PMTCT Metadata
        'pmtctCycleUuid', COALESCE(p.pmtct_cycle_uuid, ''),
        'testingType', COALESCE(p.testing_type, ''),
        'testEntryPoint', COALESCE(p.test_entry_point, ''),
        'testSetting', COALESCE(p.test_setting, ''),

        -- facilitySetting / communityEntryPoint (based on test_entry_point)
        'facilitySetting', CASE
            WHEN UPPER(COALESCE(p.test_entry_point, '')) NOT LIKE '%COMMUNITY%'
                THEN COALESCE(p.test_setting, '')
            ELSE ''
        END,
        'communityEntryPoint', CASE
            WHEN UPPER(COALESCE(p.test_entry_point, '')) LIKE '%COMMUNITY%'
                THEN COALESCE(p.test_setting, '')
            ELSE ''
        END,

        'stageOfPregnancy', COALESCE(p.stage_of_pregnancy, ''),
        'pmtctTestEntryPoint', COALESCE(p.pmtct_test_entry_point, ''),

        -- Serology (syphilis & hepatitisB go inside syphilisInfo/hbvInfo; hepatitisC stays flat)
        'hepatitisC', COALESCE(p.hepatitis_c, ''),

        -- PMTCT Register fields
        'pregnancyStatusAtEntry', COALESCE(p.pregnancy_status_at_entry, ''),
        'previouslyKnownHivPositive', COALESCE(p.previously_known_hiv_positive, ''),
        'enrolledOnArt', COALESCE(p.enrolled_on_art, ''),
        'typeOfHivTest', COALESCE(p.type_of_hiv_test, ''),
        'hivEarlyDetect', COALESCE(p.hiv_early_detect, ''),
        'hivEarlyDetectViralLoad', COALESCE(p.hiv_early_detect_viral_load, ''),
        'confirmatoryFromSpokes', COALESCE(p.confirmatory_from_spokes, ''),
        'initiatedOnProphylaxis', COALESCE(p.initiated_on_prophylaxis, ''),
        'tbReferred', COALESCE(p.tb_referred, ''),
        'tbScreeningStatus', COALESCE(p.tb_screening_status, ''),
        'viralLoadMonitoring', COALESCE(p.viral_load_monitoring, ''),

        -- Migration marker: identifies this record as migrated from pmtct_hts
        'migratedFrom', 'pmtct_hts'
    )
    -- Append nested JSONB objects (syphilisInfo, hbvInfo, partnerInfo)
    -- If the JSONB column exists, use it. Otherwise build from the flat column.
    || CASE
        WHEN p.syphilis_info IS NOT NULL
            THEN jsonb_build_object('syphilisInfo', p.syphilis_info)
        WHEN p.syphilis IS NOT NULL AND p.syphilis != ''
            THEN jsonb_build_object('syphilisInfo',
                jsonb_build_object('testResult', p.syphilis, 'treatment', '', 'drugName', ''))
        ELSE '{}'::jsonb
       END
    || CASE
        WHEN p.hbv_info IS NOT NULL
            THEN jsonb_build_object('hbvInfo', p.hbv_info)
        WHEN p.hepatitis_b IS NOT NULL AND p.hepatitis_b != ''
            THEN jsonb_build_object('hbvInfo',
                jsonb_build_object('knownPositive', '', 'testResult', p.hepatitis_b,
                    'treatment', '', 'vlResultDate', '', 'vlResult', '', 'drugName', ''))
        ELSE '{}'::jsonb
       END
    || CASE WHEN p.partner_info IS NOT NULL
            THEN jsonb_build_object('partnerInfo', p.partner_info)
            ELSE '{}'::jsonb END,

    -- archived: 0 → false, 1 → true
    CASE WHEN p.archived = 0 THEN false ELSE true END,

    -- Audit fields
    COALESCE(p.created_date, NOW()),
    COALESCE(p.created_by, 'migration'),
    COALESCE(p.last_modified_date, NOW()),
    COALESCE(p.last_modified_by, 'migration')

FROM pmtct_hts p
WHERE
  -- Idempotent guard: skip already-migrated records
  NOT EXISTS (
      SELECT 1 FROM hts_encounter he
      WHERE he.pmtct_hts = true
        AND he.observation->>'pmtctCycleUuid' = p.pmtct_cycle_uuid
        AND he.patient_uuid::text = p.patient_uuid
        AND he.date_of_visit = p.date_of_hiv_test
        AND COALESCE(he.observation->>'testingType', '') = COALESCE(p.testing_type, '')
  )
  -- Only migrate records where patient exists in patient_person (any archived status)
  AND EXISTS (
      SELECT 1 FROM patient_person pp
      WHERE pp.uuid::text = p.patient_uuid
  );


-- ─── STEP 2: ARCHIVE OLD pmtct_hts RECORDS ──────────────────────────────────
-- Mark all migrated records as archived=1 to prevent dual-read duplicates.
-- Records already archived=1 stay as-is. Only active (archived=0) ones change.
UPDATE pmtct_hts
SET archived = 1
WHERE archived = 0
  AND EXISTS (
      SELECT 1 FROM hts_encounter he
      WHERE he.pmtct_hts = true
        AND he.observation->>'pmtctCycleUuid' = pmtct_hts.pmtct_cycle_uuid
        AND he.patient_uuid::text = pmtct_hts.patient_uuid
        AND he.date_of_visit = pmtct_hts.date_of_hiv_test
        AND COALESCE(he.observation->>'testingType', '') = COALESCE(pmtct_hts.testing_type, '')
  );


-- ─── POST-FLIGHT VERIFICATION ────────────────────────────────────────────────
DO $$
DECLARE
    total_pmtct_in_hts_encounter INT;
    migrated_active INT;
    migrated_archived INT;
    remaining_active_old INT;
    total_old INT;
    orphaned_count INT;
BEGIN
    SELECT COUNT(*) INTO total_pmtct_in_hts_encounter
    FROM hts_encounter WHERE pmtct_hts = true;

    SELECT COUNT(*) INTO migrated_active
    FROM hts_encounter WHERE pmtct_hts = true AND archived = false;

    SELECT COUNT(*) INTO migrated_archived
    FROM hts_encounter WHERE pmtct_hts = true AND archived = true;

    SELECT COUNT(*) INTO remaining_active_old
    FROM pmtct_hts WHERE archived = 0;

    SELECT COUNT(*) INTO total_old FROM pmtct_hts;

    SELECT COUNT(*) INTO orphaned_count
    FROM pmtct_hts p
    WHERE NOT EXISTS (
          SELECT 1 FROM patient_person pp
          WHERE pp.uuid::text = p.patient_uuid
      )
      AND NOT EXISTS (
          SELECT 1 FROM hts_encounter he
          WHERE he.pmtct_hts = true
            AND he.observation->>'pmtctCycleUuid' = p.pmtct_cycle_uuid
            AND he.patient_uuid::text = p.patient_uuid
            AND he.date_of_visit = p.date_of_hiv_test
            AND COALESCE(he.observation->>'testingType', '') = COALESCE(p.testing_type, '')
      );

    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '  PMTCT HTS Migration - Post-flight';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Total PMTCT records in hts_encounter:  %', total_pmtct_in_hts_encounter;
    RAISE NOTICE '  - Active (archived=false):           %', migrated_active;
    RAISE NOTICE '  - Archived (archived=true):          %', migrated_archived;
    RAISE NOTICE 'Remaining active in pmtct_hts:         %', remaining_active_old;
    RAISE NOTICE 'Total old pmtct_hts records:           %', total_old;
    RAISE NOTICE 'Orphaned (no patient_person match):    %', orphaned_count;
    RAISE NOTICE '════════════════════════════════════════';

    IF remaining_active_old > 0 AND orphaned_count = 0 THEN
        RAISE WARNING 'Some active records were not migrated! Investigate manually.';
    ELSIF remaining_active_old > 0 AND orphaned_count > 0 THEN
        RAISE NOTICE 'Remaining active records are orphaned (no patient_person match).';
    ELSE
        RAISE NOTICE 'Migration completed successfully. All records migrated.';
    END IF;
END $$;


