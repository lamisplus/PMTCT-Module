package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "pmtct_hts")
@Data
@NoArgsConstructor
public class PMTCTHTS extends PMTCTTransactionalEntity {
    private String settings;
    private String previouslyKnownHIVPositiveResult;
    private String hivTestResult;
    private String hivReResting;
    private String optOutOfRTRI;


    @Override
    public boolean isNew() {
        return false;
    }
}
