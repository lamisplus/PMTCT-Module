package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(0)
@Installer(name = "clear-schema-checksums",
        description = "Clears schema.xml checksums to handle modified changesets",
        runCondition = InstallerRunCondition.AlwaysRun)
public class ClearChecksumsInstaller extends AcrossLiquibaseInstaller {
    public ClearChecksumsInstaller() {
        super("classpath:installers/pmtct/schema/clear-checksums.xml");
    }
}
