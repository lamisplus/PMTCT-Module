package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

// LV3-1965 §10: creates pmtct_hts_backfill_status - see HtsBackfillService.
@Order(20)
@Installer(name = "hts-backfill-status-migration",
        description = "Creates the single-row status table tracking the LV3-1965 historical HTS backfill",
        runCondition = InstallerRunCondition.AlwaysRun)
public class HtsBackfillStatusMigrationInstaller extends AcrossLiquibaseInstaller {

    public HtsBackfillStatusMigrationInstaller() {
        super("classpath:installers/pmtct/schema/hts-backfill-status-migration.xml");
    }
}
