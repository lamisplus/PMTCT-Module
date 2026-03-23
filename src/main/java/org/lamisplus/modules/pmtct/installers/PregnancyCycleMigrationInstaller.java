package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(3)
@Installer(name = "pregnancy-cycle-migration",
        description = "Standalone pregnancy cycle migration for facilities where add-new-columns.xml was blocked",
        runCondition = InstallerRunCondition.AlwaysRun)
public class PregnancyCycleMigrationInstaller extends AcrossLiquibaseInstaller {

    public PregnancyCycleMigrationInstaller() {
        super("classpath:installers/pmtct/schema/pregnancy-cycle-migration.xml");
    }
}
