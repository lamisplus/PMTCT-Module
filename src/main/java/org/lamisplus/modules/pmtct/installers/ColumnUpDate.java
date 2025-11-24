package org.lamisplus.modules.pmtct.installers;


import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;


@Order(2)
@Installer(name = "update-columns",
        description = "add new columns",
        version = 2)
public class ColumnUpDate extends AcrossLiquibaseInstaller
{
    public ColumnUpDate() {
        super ("classpath:installers/pmtct/schema/add-new-columns.xml");
    }
}
