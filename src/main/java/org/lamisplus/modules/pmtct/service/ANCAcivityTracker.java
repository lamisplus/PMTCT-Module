package org.lamisplus.modules.pmtct.service;

import lombok.AllArgsConstructor;
import org.lamisplus.modules.pmtct.domain.dto.ActivityTracker;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.DeliveryRepository;
import org.lamisplus.modules.pmtct.repository.PMTCTEnrollmentReporsitory;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
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

    private LocalDate getDeliveryDate (String ancNo)
    {
        LocalDate deliveryDate = LocalDate.now();
        Delivery delivery = new Delivery();
        try{
            delivery = this.deliveryRepository.getDeliveryByAncNo(ancNo);
            deliveryDate = delivery.getDateOfDelivery();
        }catch (Exception e){}

        return deliveryDate;

    }

    public List<ActivityTracker> getANCActivities(String ancNo)
    {
        ArrayList<ActivityTracker> activityTrackers = new ArrayList<>();
        Optional<ANC> ancs = this.ancRepository.getByAncNo(ancNo);
        if (ancs.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("ANC Enrollment");
            activityTracker.setTableId(1);
            activityTracker.setActivityDate(ancs.get().getFirstAncDate());
            activityTracker.setRecordId(ancs.get().getId());
            activityTrackers.add(activityTracker);
        }

        Optional<PMTCTEnrollment> pmtctEnrollments = this.pmtctEnrollmentReporsitory.getByAncNo(ancNo);
        if (pmtctEnrollments.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("PMTCT Enrollment");
            activityTracker.setTableId(2);
            activityTracker.setRecordId(pmtctEnrollments.get().getId());
            activityTracker.setActivityDate(pmtctEnrollments.get().getPmtctEnrollmentDate());
            activityTrackers.add(activityTracker);
        }
        LocalDate deliveryDate = this.getDeliveryDate(ancNo);

        List<PmtctVisit> pmtctVisits = this.pmtctVisitRepository.getANCVisits(ancNo, deliveryDate);
        if (!(pmtctVisits.isEmpty()))
        {
            ActivityTracker activityTracker = new ActivityTracker();
            pmtctVisits.forEach(pmtctVisit ->{
                activityTracker.setActivityName("ANC Visit");
                activityTracker.setTableId(3);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );
        }
        Optional<Delivery> deliveries = this.deliveryRepository.findDeliveryByAncNo(ancNo);
        if (deliveries.isPresent())
        {
            ActivityTracker activityTracker = new ActivityTracker();
            activityTracker.setActivityName("Labour and Delivery");
            activityTracker.setTableId(4);
            activityTracker.setRecordId(deliveries.get().getId());
            activityTracker.setActivityDate(deliveries.get().getDateOfDelivery());
            activityTrackers.add(activityTracker);
        }

        List<PmtctVisit> pmtctVisits1 = this.pmtctVisitRepository.getPNCVisits(ancNo, deliveryDate);
        if (!(pmtctVisits1.isEmpty()))
        {
            ActivityTracker activityTracker = new ActivityTracker();
            pmtctVisits1.forEach(pmtctVisit ->{
                activityTracker.setActivityName("PNC Visit");
                activityTracker.setTableId(3);
                activityTracker.setRecordId(pmtctVisit.getId());
                activityTracker.setActivityDate(pmtctVisit.getDateOfVisit());
                activityTrackers.add(activityTracker);
            } );
        }



        return activityTrackers;

    }

}
