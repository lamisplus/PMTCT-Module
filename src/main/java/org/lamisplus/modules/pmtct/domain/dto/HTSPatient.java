package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.patient.domain.entity.Person;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


public class HTSPatient {
     @Id
     @Column(name = "id", updatable = false)
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

     @Basic
     @Column(name = "target_group")
     private String targetGroup;


     @Basic
     @Column(name = "client_code")
     private String clientCode;

     @Basic
     @Column(name = "index_client_code")
     private String indexClientCode;

     @Basic
     @Column(name = "date_visit")
     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
     private LocalDate dateVisit;

     @Basic
     @Column(name = "referred_from")
     private Long referredFrom;



     private String capturedBy;

     @Basic
     @Column(name = "testing_setting")
     private String testingSetting;

     @Basic
     @Column(name = "first_time_visit")
     private Boolean firstTimeVisit;
     @Basic
     @Column(name = "num_children")
     private Integer numChildren;
     @Basic
     @Column(name = "num_wives")
     private Integer numWives;
     @Basic
     @Column(name = "type_counseling")
     private Long typeCounseling;


     @Basic
     @Column(name = "index_client")
     private Boolean indexClient;

     @Basic
     @Column(name = "previously_tested")
     private Boolean previouslyTested; //within the last 3 months

     @Basic
     @Column(name = "facility_id")
     private Long facilityId;


     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "extra", columnDefinition = "jsonb")
     private Object extra;

     @Basic
     @Column(name = "person_uuid")
     private String personUuid;

     @Basic
     @Column(name = "uuid", updatable = false)
     private String uuid;

     @OneToOne
     @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
     private Person person;


     @Basic
     @Column(name = "pregnant")
     private Long pregnant;



     @Basic
     @Column(name = "breast_feeding")
     private Boolean breastFeeding;

     @Basic
     @Column(name = "relation_with_index_client")
     private Long relationWithIndexClient;

     //PRE TEST COUNSELING
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "knowledge_assessment", columnDefinition = "jsonb")
     private  Object knowledgeAssessment;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "risk_assessment", columnDefinition = "jsonb")
     private  Object riskAssessment;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "tb_screening", columnDefinition = "jsonb")
     private  Object tbScreening;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "sti_screening", columnDefinition = "jsonb")
     private  Object stiScreening;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "sex_partner_risk_assessment", columnDefinition = "jsonb")
     private  Object sexPartnerRiskAssessment;

     //HIV Test Result 1
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "test1", columnDefinition = "jsonb")
     private  Object test1;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "confirmatory_test", columnDefinition = "jsonb")
     private  Object confirmatoryTest;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "tie_breaker_test", columnDefinition = "jsonb")
     private  Object tieBreakerTest;

     @Basic
     @Column(name = "hiv_test_result")
     private String hivTestResult;

     //HIV Test result 2
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "test2", columnDefinition = "jsonb")
     private  Object test2;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "confirmatory_test2", columnDefinition = "jsonb")
     private  Object confirmatoryTest2;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "tie_breaker_test2", columnDefinition = "jsonb")
     private  Object tieBreakerTest2;

     @Basic
     @Column(name = "hiv_test_result2")
     private String hivTestResult2;

     @Basic
     @Column(name = "archived")
     private int archived=0;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "syphilis_testing", columnDefinition = "jsonb")
     private Object syphilisTesting;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "hepatitis_testing", columnDefinition = "jsonb")
     private Object hepatitisTesting;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "others", columnDefinition = "jsonb")
     private Object others;

     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "cd4", columnDefinition = "jsonb")
     private Object cd4;

     //Recency Testing
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "recency", columnDefinition = "jsonb")
     private Object recency;

     //Post test counseling
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "post_test_counseling", columnDefinition = "jsonb")
     private Object postTestCounselingKnowledgeAssessment;

     //Index Notification Services - Elicitation
     @Type(type = "jsonb")
     @Basic(fetch = FetchType.LAZY)
     @Column(name = "index_notification_services_elicitation", columnDefinition = "jsonb")
     private Object indexNotificationServicesElicitation;
//
//     @OneToMany(mappedBy = "htsClient")
//     @ToString.Exclude
//     @JsonIgnore
//     public List<IndexElicitation> indexElicitation;
//
//     @OneToOne
//     @JoinColumn(name = "risk_stratification_code", referencedColumnName = "code", insertable = false, updatable = false)
//     private RiskStratification riskStratification;

     @Basic
     @Column(name = "risk_stratification_code")
     private String riskStratificationCode;

     @PrePersist
     public void setFields(){
          if(StringUtils.isEmpty(uuid)){
               uuid = UUID.randomUUID().toString();
          }
     }

     @Column(name = "prep_offered")
     private Boolean prepOffered;

     @Column(name = "prep_accepted")
     private Boolean prepAccepted;

     @Column(name = "prep_given")
     private String prepGiven;

     @Column(name = "other_drugs")
     private String otherDrugs;

     private String offeredPns;

     private String acceptedPns;

     @Column(name = "referred_for_sti")
     private String referredForSti;

     @Column(name = "source")
     private String source;
     @Column(name = "comment")
     private String comment;

     @Basic
     @Column(name = "longitude")
     private String longitude;

     @Basic
     @Column(name = "latitude")
     private  String latitude;

     @Basic
     @Column(name = "family_index")
     private  String familyIndex;

     @Basic
     @Column(name ="partner_notification_service")
     private String partnerNotificationService;


}
