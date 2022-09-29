package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_recency")
@Data
@NoArgsConstructor
public class PMTCTRecency extends PMTCTTransactionalEntity {
    @ManyToOne
    @JoinColumn(name = "pmtct_hts_uuid", nullable = false)
    private PMTCTHTS pmtctHtsUuid;
    private String recencyID;
    private String recencyTestName;
    private String recencyTestDate;
    private Integer controlLine;
    private Long verificationLine;
    private Long longTermLine;
    private String vLSampleCollection;
    private LocalDate vLSampleCollectionDate;
    private String sampleReferenceNumber;
    private String sampleType;
    private LocalDate dateSampleSentPCRLab;
    private LocalDate sampleTestDate;
    private String receivingPCRLab;
    private String viralLoadResult;
    private String finalRecencyResult;
    private String hepatitisTesting;
    private String testedHepatitisB;
    private String hepatitisBTestResult;
    private String testedHepatitisC;
    private String hepatitisCTestResult;
    private String agreedPartnerNotification;


    @Override
    public Long getId() {
        return null;
    }

    @Override
    public boolean isNew() {
        return false;
    }
}
