package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(4)
@Installer(name = "partner-info-migration",
        description = "Migrate partnerInformation from single object to array with partnerId UUIDs",
        runCondition = InstallerRunCondition.AlwaysRun)
public class PartnerInfoMigrationInstaller extends AcrossLiquibaseInstaller {

    public PartnerInfoMigrationInstaller() {
        super("classpath:installers/pmtct/schema/partner-info-migration.xml");
    }
}
