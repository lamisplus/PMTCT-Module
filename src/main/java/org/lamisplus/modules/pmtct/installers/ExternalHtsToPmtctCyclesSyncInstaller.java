package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(21)
@Installer(name = "external-hts-to-pmtct-cycles-sync",
        description = "LV3-1965: Sync external HTS module records (pmtct_hts = false) to PMTCT pregnancy cycles by populating pmtctCycleUuid for view-only access in PMTCT patient history",
        runCondition = InstallerRunCondition.AlwaysRun)
public class ExternalHtsToPmtctCyclesSyncInstaller extends AcrossLiquibaseInstaller {

    public ExternalHtsToPmtctCyclesSyncInstaller() {
        super("classpath:installers/pmtct/schema/sync-external-hts-to-pmtct-cycles-changeset.xml");
    }
}
