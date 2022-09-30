package org.lamisplus.modules.pmtct.domain.entity;


import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "partner_registrations")
@Data
@NoArgsConstructor
public class PartnerRegistrations extends PMTCTTransactionalEntity {

    private Integer womanAge;
    private String womanHivStatus;
    private String partnerInformation;
    private String partnerAge;
    private String preTestCounseled;
    private String partnerAcceptsHIVTest;
    private String positivePregnantWoman;
    private String negativePregnantWoman;
    private String postTestCounseledReceivedTestResult;
    private String HBVStatus;
    private String HCVStatus;
    private String syphilisStatus;
    private String referredTo;


    @Override
    public boolean isNew() {
        return false;
    }
}
