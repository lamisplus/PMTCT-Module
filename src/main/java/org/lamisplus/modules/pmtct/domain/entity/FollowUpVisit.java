package org.lamisplus.modules.pmtct.domain.entity;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "follow_up_visit")
@Data
@NoArgsConstructor
public class FollowUpVisit extends PatientAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    private LocalDate dateOfDelivery;
    private String FPCounselLing;
    private String FPMethod;
    private LocalDate viralLoadCollectionDate1;
    private Integer gAVLCollection1;
    private String resultRecordCopiesMLTND1;
    private String viralLoadCollectionDate2;
    private Integer gAVLCollection2;
    private String resultRecordCopiesMLTND2;
    private String dsd;
    private String dSdModel;
    private String dsdModelFacilityBased;
    private String dsdModelCommunityBased;
    private String maternalOutcome;
    private LocalDate dateOfOutcome;
    private String nameOfARTFacilityMaternalOutcomeTransitionedARTClinic;
    private String clientVisitStatus;


}

