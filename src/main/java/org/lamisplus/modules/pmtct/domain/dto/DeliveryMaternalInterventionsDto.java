package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryMaternalInterventionsDto {
    private String receivedOxytocin;
    private String receivedMisoprostol;
    private String maternalComplication;
    private String eclampsiaReceivedMgso4;
    private String motherAdmittedReason;
    private String motherDischarged;
    private String motherReferredOut;
    private String motherReceivedPac;
    private String motherTransportationOut;
    private String mdaConducted;
}
