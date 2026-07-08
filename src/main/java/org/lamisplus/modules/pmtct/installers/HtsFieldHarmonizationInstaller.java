package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(5)
@Installer(name = "hts-field-harmonization-migration",
        description = "Rename PMTCT observation keys (typeOfHivTest, hivEarlyDetect) to match HTS module naming",
        runCondition = InstallerRunCondition.AlwaysRun)
public class HtsFieldHarmonizationInstaller extends AcrossLiquibaseInstaller {

    public HtsFieldHarmonizationInstaller() {
        super("classpath:installers/pmtct/schema/hts-field-harmonization-migration.xml");
    }
}
