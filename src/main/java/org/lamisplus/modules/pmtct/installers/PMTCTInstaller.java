package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(1)
@Installer(name = "pmtct-schema-installer",
        description = "Installs the required database tables",
        version = 5)
public class PMTCTInstaller extends AcrossLiquibaseInstaller {

    public PMTCTInstaller() {
        super ("classpath:installers/pmtct/schema/schema.xml");
    }
}
