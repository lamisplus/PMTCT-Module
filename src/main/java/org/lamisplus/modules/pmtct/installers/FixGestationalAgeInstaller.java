package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(22)
@Installer(name = "fix-gestational-age-migration",
        description = "Fix incorrect Gestational Age values in pmtct_enrollment caused by frontend recalculation bug",
        runCondition = InstallerRunCondition.AlwaysRun)
public class FixGestationalAgeInstaller extends AcrossLiquibaseInstaller {

    public FixGestationalAgeInstaller() {
        super("classpath:installers/pmtct/schema/fix-gestational-age-migration.xml");
    }
}
