package org.lamisplus.modules.pmtct.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import com.foreach.across.core.installers.InstallerRunCondition;
import org.springframework.core.annotation.Order;

@Order(4)
@Installer(name = "populate-facility-id-migration",
        description = "Populate NULL facility_id in all PMTCT tables from patient_person",
        runCondition = InstallerRunCondition.AlwaysRun)
public class PopulateFacilityIdInstaller extends AcrossLiquibaseInstaller {

    public PopulateFacilityIdInstaller() {
        super("classpath:installers/pmtct/schema/populate-facility-id-migration.xml");
    }
}
