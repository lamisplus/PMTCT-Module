package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import org.lamisplus.modules.pmtct.domain.dto.ActivityTracker;
import org.lamisplus.modules.pmtct.domain.dto.SummaryChart;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ANCAcivityTracker {
    private final ANCRepository ancRepository;
    private final DeliveryRepository deliveryRepository;
    private final PmtctVisitRepository pmtctVisitRepository;
    private final PMTCTEnrollmentReporsitory pmtctEnrollmentReporsitory;
    private final PmtctHtsRepository pmtctHtsRepository;

    private  final InfantVisitRepository infantVisitRepository;

    private  final InfantRepository infantRepository;



    private String resolvePatientUuidFromAncNo(String ancNo) {
        Optional<ANC> ancOpt = this.ancRepository.getByAncNoAndArchived(ancNo, 0L);
        return ancOpt.map(ANC::getPatientUuid).orElse(null);
    }

    private LocalDate getDeliveryDateByPatientUuid (String patientUuid)
    {
        LocalDate deliveryDate = LocalDate.now();
        Delivery delivery = new Delivery();
        try{
            delivery = this.deliveryRepository.getDeliveryByPatientUuid(patientUuid);
            deliveryDate = delivery.getDateOfDelivery();
        }catch (Exception e){}

        return deliveryDate;
    }

    private LocalDate getDeliveryDateByPatientUuid (String patientUuid, String pmtctCycleUuid)
    {
        LocalDate deliveryDate = LocalDate.now();
        try{
            Optional<Delivery> delivery = this.deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(patientUuid, pmtctCycleUuid);
            if (delivery.isPresent()) {
                deliveryDate = delivery.get().getDateOfDelivery();
            }
        }catch (Exception e){}

        return deliveryDate;
    }

    public List<ActivityTracker> getANCActivities(String ancNo)
    {
        String patientUuid = resolvePatientUuidFromAncNo(ancNo);
        if (patientUuid == null) {
            return new ArrayList<>();
        }
        return getAllActivities(patientUuid);
    }

//    private LocalDate getInfantArvDate (String hospitalNumber)
//    {
//        LocalDate infantArvDate  = LocalDate.now();
//        try{
//            Optional<InfantArv> infantArvs = this.infantArvRepository.getByInfantHospitalNumber(hospitalNumber);//.infantArvRepository
//            if(infantArvs.isPresent()) {
//                InfantArv infantArv = new InfantArv();
//                infantArvDate = infantArv.getVisitDate();
//            }
//        }catch (Exception e){}
//
//        return infantArvDate;
//    }

    public List<ActivityTracker> getInfanctVisitActivities(String hospitalNumber) {
        ArrayList<ActivityTracker> activityTrackers = new ArrayList<>();
        Optional<Infant> infantOpt = this.infantRepository.getInfantByInfantHospitalNumber(hospitalNumber);
        if (infantOpt.isPresent() && infantOpt.get().getInfantArvData() != null
                && infantOpt.get().getInfantArvData().getInfantArvType() != null
                && !infantOpt.get().getInfantArvData().getInfantArvType().isEmpty()) {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("ARV and CTX Administration");
            activityTracker.setPath("apmtct_infant_arv");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setRecordId(infantOpt.get().getId());
            activityTracker.setActivityDate(infantOpt.get().getDateOfDelivery());
            activityTrackers.add(activityTracker);
        }

        List<InfantVisit> infantVisitList = this.infantVisitRepository.getPreArvVisits(hospitalNumber);
        if (!(infantVisitList.isEmpty())) {
            ActivityTracker activityTracker = new ActivityTracker();
            infantVisitList.forEach(pmtctVisit -> {
                activityTracker.setActivityName("Infant Post-ARV Visit");
                activityTracker.setPath("pmtct_infant_visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getVisitDate());
                activityTrackers.add(activityTracker);
            });
        }
        return activityTrackers;
    }

    public SummaryChart getSummaryChart (String ancNo)
    {
        String patientUuid = resolvePatientUuidFromAncNo(ancNo);
        if (patientUuid == null) {
            SummaryChart summaryChart = new SummaryChart();
            summaryChart.setMotherVisit(0);
            summaryChart.setChildAlive(0);
            summaryChart.setChildDead(0);
            summaryChart.setChildVisit(0);
            return summaryChart;
        }
        return getPmtctSummaryChart(patientUuid);
    }

    public List<ActivityTracker> getAllActivities(String patientUuid) {
        ArrayList<ActivityTracker> activityTrackers = new ArrayList<>();

        List<InfantVisit> infantVisits = this.infantVisitRepository.getInfantVisitsByMotherPatientUuid(patientUuid);
        if(!(infantVisits.isEmpty()) ){
            infantVisits.forEach(infantVisit -> {
                ActivityTracker activityTracker = new ActivityTracker();

                activityTracker.setActivityName("Infant Visit");
                activityTracker.setPath("pmtct_infant_visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(infantVisit.getId());
                activityTracker.setActivityDate(infantVisit.getVisitDate());
                activityTrackers.add(activityTracker);
            });
        }

        LocalDate deliveryDate = this.getDeliveryDateByPatientUuid(patientUuid);
        List<PmtctVisit> pmtctVisits1 = this.pmtctVisitRepository.getPNCVisitsByPatientUuid(patientUuid, deliveryDate);
        if (!(pmtctVisits1.isEmpty()))
        {
            pmtctVisits1.forEach(pmtctVisit ->{
                ActivityTracker activityTracker = new ActivityTracker();

                String activityName = "ANC_REVISIT".equals(pmtctVisit.getVisitType()) ? "ANC Revisit" : "Mother Follow-up Visit";
                activityTracker.setActivityName(activityName);
                activityTracker.setPath("anc-mother-visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );

        }

        List<Infant> infantList = infantRepository.findInfantByMotherPatientUuid(patientUuid);

        if(!(infantList.isEmpty())){
            infantList.forEach(infant-> {
                ActivityTracker activityTracker = new ActivityTracker();
                activityTracker.setActivityName("Add Infant");
                activityTracker.setPath("pmtct_infant_information");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(infant.getId());
                activityTracker.setActivityDate(infant.getDateOfDelivery());
                activityTrackers.add(activityTracker);
            });
        }

        Optional<Delivery> deliveries = this.deliveryRepository.findDeliveryByPatientUuid(patientUuid);
        if (deliveries.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("Labour and Delivery");
            activityTracker.setPath("anc-delivery");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setRecordId(deliveries.get().getId());
            activityTracker.setActivityDate(deliveries.get().getDateOfDelivery());
            activityTrackers.add(activityTracker);
        }

        List<PmtctVisit> pmtctVisits = this.pmtctVisitRepository.getANCVisitsByPatientUuid(patientUuid, deliveryDate);
        if (!(pmtctVisits.isEmpty()))
        {
            pmtctVisits.forEach(pmtctVisit ->{
                ActivityTracker activityTracker = new ActivityTracker();

                String activityName = "ANC_REVISIT".equals(pmtctVisit.getVisitType()) ? "ANC Revisit" : "Mother Follow-up Visit";
                activityTracker.setActivityName(activityName);
                activityTracker.setPath("anc-mother-visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );
        }
        Optional<PMTCTEnrollment> pmtctEnrollments = this.pmtctEnrollmentReporsitory.getByPatientUuid(patientUuid);
        if (pmtctEnrollments.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("PMTCT Enrollment");
            activityTracker.setPath("pmtct-enrollment");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setRecordId(pmtctEnrollments.get().getId());
            activityTracker.setActivityDate(pmtctEnrollments.get().getPmtctEnrollmentDate());
            activityTrackers.add(activityTracker);
        }

        Optional<ANC> ancs = this.ancRepository.findANCByPatientUuidAndArchived(patientUuid,0L);
        if (ancs.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("ANC Enrollment");
            activityTracker.setPath("anc-enrollment");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setActivityDate(ancs.get().getDateOfEnrollment());
            activityTracker.setRecordId(ancs.get().getId());
            activityTrackers.add(activityTracker);
        }


        List<PmtctHts> pmtctHtsRecord = this.pmtctHtsRepository.findByPatientUuidAndUnarchived(patientUuid);
        if (!(pmtctHtsRecord.isEmpty()))
        {
            pmtctHtsRecord.forEach(pmtctHtsRec ->{
                ActivityTracker activityTracker = new ActivityTracker();

                activityTracker.setActivityName("PMTCT HTS");
                activityTracker.setPath("pmtct-hts");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctHtsRec.getUuid());
                activityTracker.setActivityDate(pmtctHtsRec.getDateOfHivTest());
                activityTrackers.add(activityTracker);
            } );
        }




        return activityTrackers;

    }

    public List<ActivityTracker> getAllActivities(String patientUuid, String pmtctCycleUuid) {
        ArrayList<ActivityTracker> activityTrackers = new ArrayList<>();

        List<InfantVisit> infantVisits = this.infantVisitRepository.getInfantVisitsByMotherPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);
        if(!(infantVisits.isEmpty()) ){
            infantVisits.forEach(infantVisit -> {
                ActivityTracker activityTracker = new ActivityTracker();

                activityTracker.setActivityName("Infant Visit");
                activityTracker.setPath("pmtct_infant_visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(infantVisit.getId());
                activityTracker.setActivityDate(infantVisit.getVisitDate());
                activityTrackers.add(activityTracker);
            });
        }

        LocalDate deliveryDate = this.getDeliveryDateByPatientUuid(patientUuid, pmtctCycleUuid);
        List<PmtctVisit> pmtctVisits1 = this.pmtctVisitRepository.getPNCVisitsByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid, deliveryDate);
        if (!(pmtctVisits1.isEmpty()))
        {
            pmtctVisits1.forEach(pmtctVisit ->{
                ActivityTracker activityTracker = new ActivityTracker();

                String activityName = "ANC_REVISIT".equals(pmtctVisit.getVisitType()) ? "ANC Revisit" : "Mother Follow-up Visit";
                activityTracker.setActivityName(activityName);
                activityTracker.setPath("anc-mother-visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );

        }

        List<Infant> infantList = infantRepository.getAllInfantByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid);

        if(!(infantList.isEmpty())){
            infantList.forEach(infant-> {
                ActivityTracker activityTracker = new ActivityTracker();
                activityTracker.setActivityName("Add Infant");
                activityTracker.setPath("pmtct_infant_information");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(infant.getId());
                activityTracker.setActivityDate(infant.getDateOfDelivery());
                activityTrackers.add(activityTracker);
            });
        }

        Optional<Delivery> deliveries = this.deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(patientUuid, pmtctCycleUuid);
        if (deliveries.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("Labour and Delivery");
            activityTracker.setPath("anc-delivery");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setRecordId(deliveries.get().getId());
            activityTracker.setActivityDate(deliveries.get().getDateOfDelivery());
            activityTrackers.add(activityTracker);
        }

        List<PmtctVisit> pmtctVisits = this.pmtctVisitRepository.getANCVisitsByPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid, deliveryDate);
        if (!(pmtctVisits.isEmpty()))
        {
            pmtctVisits.forEach(pmtctVisit ->{
                ActivityTracker activityTracker = new ActivityTracker();

                String activityName = "ANC_REVISIT".equals(pmtctVisit.getVisitType()) ? "ANC Revisit" : "Mother Follow-up Visit";
                activityTracker.setActivityName(activityName);
                activityTracker.setPath("anc-mother-visit");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );
        }
        Optional<PMTCTEnrollment> pmtctEnrollments = this.pmtctEnrollmentReporsitory.getByPatientUuidAndPmtctCycleId(patientUuid, pmtctCycleUuid);
        if (pmtctEnrollments.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("PMTCT Enrollment");
            activityTracker.setPath("pmtct-enrollment");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setRecordId(pmtctEnrollments.get().getId());
            activityTracker.setActivityDate(pmtctEnrollments.get().getPmtctEnrollmentDate());
            activityTrackers.add(activityTracker);
        }

        Optional<ANC> ancs = this.ancRepository.findANCByPatientUuidAndCycleIdAndArchived(patientUuid, pmtctCycleUuid, 0L);
        if (ancs.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("ANC Enrollment");
            activityTracker.setPath("anc-enrollment");
            activityTracker.setEditable(true);
            activityTracker.setDeletable(true);
            activityTracker.setViewable(true);
            activityTracker.setActivityDate(ancs.get().getDateOfEnrollment());
            activityTracker.setRecordId(ancs.get().getId());
            activityTrackers.add(activityTracker);
        }


        List<PmtctHts> pmtctHtsRecord = this.pmtctHtsRepository.findByPatientUuidAndPmtctCycleIdAndUnarchived(patientUuid, pmtctCycleUuid);
        if (!(pmtctHtsRecord.isEmpty()))
        {
            pmtctHtsRecord.forEach(pmtctHtsRec ->{
                ActivityTracker activityTracker = new ActivityTracker();

                activityTracker.setActivityName("PMTCT HTS");
                activityTracker.setPath("pmtct-hts");
                activityTracker.setEditable(true);
                activityTracker.setDeletable(true);
                activityTracker.setViewable(true);
                activityTracker.setRecordId(pmtctHtsRec.getUuid());
                activityTracker.setActivityDate(pmtctHtsRec.getDateOfHivTest());
                activityTrackers.add(activityTracker);
            } );
        }




        return activityTrackers;

    }

    public SummaryChart getPmtctSummaryChart(String patientUuid) {
        SummaryChart summaryChart = new SummaryChart();
        summaryChart.setMotherVisit(this.pmtctVisitRepository.getMotherVisitsWithPatientUuid(patientUuid));
        Optional<Delivery> delivery = this.deliveryRepository.findDeliveryByPatientUuid(patientUuid);
        if (delivery.isPresent()){
            summaryChart.setChildAlive(delivery.get().getNumberOfInfantsAlive());
            summaryChart.setChildDead(delivery.get().getNumberOfInfantsDead());
            summaryChart.setChildVisit(this.infantVisitRepository.getChildVisitsWithPatientUuid(patientUuid));

        }
        else
        {
            summaryChart.setChildAlive(0);
            summaryChart.setChildDead(0);
            summaryChart.setChildVisit(0);

        }
        return summaryChart;
    }

    public SummaryChart getPmtctSummaryChart(String patientUuid, String pmtctCycleUuid) {
        SummaryChart summaryChart = new SummaryChart();
        summaryChart.setMotherVisit(this.pmtctVisitRepository.getMotherVisitsWithPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid));
        Optional<Delivery> delivery = this.deliveryRepository.findDeliveryByPatientUuidAndPmtctCycleUuid(patientUuid, pmtctCycleUuid);
        if (delivery.isPresent()){
            summaryChart.setChildAlive(delivery.get().getNumberOfInfantsAlive());
            summaryChart.setChildDead(delivery.get().getNumberOfInfantsDead());
            summaryChart.setChildVisit(this.infantVisitRepository.getChildVisitsWithPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid));

        }
        else
        {
            summaryChart.setChildAlive(0);
            summaryChart.setChildDead(0);
            summaryChart.setChildVisit(0);

        }
        return summaryChart;
    }
}
