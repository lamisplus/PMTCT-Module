package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(6)
@Installer(name = "syphilis-field-scheme-migration",
        description = "Normalize legacy ANC Revisit testedSyphilis values and backfill pmtct_anc syphilis/hepatitis B info from ANC Revisit records",
        runCondition = InstallerRunCondition.AlwaysRun)
public class SyphilisFieldSchemeMigrationInstaller extends AcrossLiquibaseInstaller {

    public SyphilisFieldSchemeMigrationInstaller() {
        super("classpath:installers/pmtct/schema/syphilis-field-scheme-migration.xml");
    }
}
