package org.lamisplus.modules.pmtct;

import com.foreach.across.config.AcrossApplication;
import com.foreach.across.core.AcrossModule;
import com.foreach.across.core.context.configurer.ComponentScanConfigurer;
import com.foreach.across.modules.hibernate.jpa.AcrossHibernateJpaModule;
import org.lamisplus.modules.patient.PatientModule;
import org.lamisplus.modules.patient.PatientModule;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@EntityScan

@AcrossApplication(
        modules = {
                AcrossHibernateJpaModule.NAME,
                PatientModule.NAME

        }

        )
public class PMTCTModule extends AcrossModule {

    public static final String NAME = "PMTCTModule";


    public PMTCTModule() {
        super ();
        addApplicationContextConfigurer (new ComponentScanConfigurer(
                getClass ().getPackage ().getName () + ".domain",
                getClass ().getPackage ().getName () + ".repository",
                getClass ().getPackage ().getName () + ".config",
                getClass ().getPackage ().getName () + ".service",
                getClass ().getPackage ().getName () + ".controller",
                "org.lamisplus.modules.base.service"
        ));

    }

    @Override
    public String getName() {
        return NAME;
    }


}
