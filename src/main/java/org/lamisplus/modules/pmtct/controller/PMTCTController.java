package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.dto.VisitDto;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("api/v1/pmtct/anc")
@RestController
@RequiredArgsConstructor
public class PMTCTController {
    private final ANCService ancService;
    private final PMTCTEnrollmentService pmtctEnrollmentService;
    private final PmtctVisitService pmtctVisitService;

    private final DeliveryService deliveryService;

    private final ANCAcivityTracker ancAcivityTracker;

    private final InfantService infantService;
    @PostMapping(value = "anc-enrollement")
    public ResponseEntity<ANCRespondDto> ANCEnrollement(@RequestBody ANCEnrollementRequestDto ancEnrollementRequestDto) {
        System.out.println("Doc I got here nau");
        return ResponseEntity.ok(ancService.ANCEnrollement(ancEnrollementRequestDto));
    }



//    @PostMapping
//    public ANCRequestDto registerANC(@RequestBody ANCRequestDto ancRequestDto) {
//        this.ancService.save(ancRequestDto);
//        return ancRequestDto;
//    }

    @PostMapping(value = "anc-new-registration")
    public ResponseEntity<ANCRespondDto> newANCRegistration(@RequestBody ANCWithPersonRequestDto ancWithPersonRequestDto) {
       // this.ancService.ANCEnrollement(ancEnrollementRequestDto);
       return ResponseEntity.ok(ancService.newANCRegistration(ancWithPersonRequestDto));
    }


//    @PutMapping
//    public ANCRequestDto updateANC(@RequestBody ANCRequestDto ancRequestDto) {
//        this.ancService.save(ancRequestDto);
//        return ancRequestDto;
//    }


//    @GetMapping
//    public ResponseEntity<List<ANCRespondDto>> getAllANC() {
//        return ResponseEntity.ok(this.ancService.getAllAnc());
//    }

    @GetMapping("{id}")
    public ResponseEntity<ANC> getSingleANC(@PathVariable Long id) {
        return ResponseEntity.ok(this.ancService.getSingleAnc(id));
    }

    @GetMapping(value = "/pmtct-from-person")
    public ResponseEntity<PersonMetaDataDto> getPMTCTFromPerson(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize)  {
        PersonMetaDataDto personMetaDataDto = ancService.getAllPMTCTPerson3(searchParam, pageNo, pageSize);
        return new ResponseEntity<> (personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

//    @GetMapping(value = "/pmtct-from-person-by-hospitalNumber/{hospitalNumber}")
//    public ResponseEntity<PMTCTPersonDto> getpmtctFromPersonByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
//        return ResponseEntity.ok(this.ancService.getPMTCTPersonByHospitalNumber(hospitalNumber));
//    }

    @GetMapping(value = "/all-active-anc")
    public ResponseEntity<PersonMetaDataDto> getActiveOnANC(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize)  {
        PersonMetaDataDto personMetaDataDto = ancService.getActiveOnANC(searchParam, pageNo, pageSize);
        return new ResponseEntity<> (personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

//    @GetMapping(value = "/non-active-anc")
//    public ResponseEntity<List<ANCRespondDto>> getNonactiveANC() {
//        return ResponseEntity.ok(this.ancService.getNonActiveAnc());
//    }
//
    @PostMapping(value = "/pmtct-enrollment")
    public PMTCTEnrollmentRespondDto pmtctEnrollment(@RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        return this.pmtctEnrollmentService.save(pmtctEnrollmentRequestDto);
    }

//    @GetMapping(value = "/get-all-pmtct-enrollment")
//    public ResponseEntity<List<PMTCTEnrollmentRespondDto>> getAllPmtctEnrollment() {
//        return ResponseEntity.ok(this.pmtctEnrollmentService.getAllPmtctEnrollment());
//    }
//
    @PostMapping(value = "/pmtct-visit")
    public PmtctVisitResponseDto pmtctVisit(@RequestBody PmtctVisitRequestDto pmtctVisitRequestDto) {
        return this.pmtctVisitService.save(pmtctVisitRequestDto);
    }
//
//    @GetMapping(value = "/get-all-pmtct-visit")
//    public ResponseEntity<List<PmtctVisitResponseDto>> getAllPmtctVisit() {
//        return ResponseEntity.ok(this.pmtctVisitService.getAllPmtctVisits());
//    }
//
//    @GetMapping("/get-signle-pmtct-enrollment/{id}")
//    public ResponseEntity<PMTCTEnrollment> getSinglePMTCTEnrollment(@PathVariable Long id) {
//        return ResponseEntity.ok(this.pmtctEnrollmentService.getSinglePmtctEnrollment(id));
//    }
//
//    @GetMapping("{/get-signle-pmtct-visit/id}")
//    public ResponseEntity<PmtctVisit> getSinglePmtctVisit(@PathVariable Long id) {
//        return ResponseEntity.ok(this.pmtctVisitService.getSinglePmtctVisit(id));
//    }

    @PostMapping(value = "/pmtct-delivery")
    public DeliveryResponseDto createPmtctDelivery(@RequestBody DeliveryRequestDto deliveryRequestDto) {
        return this.deliveryService.save(deliveryRequestDto);
    }
//
//    @GetMapping(value = "/get-all-pmtct-delivery")
//    public ResponseEntity<List<DeliveryResponseDto>> getAllPmtctDelivery() {
//        return ResponseEntity.ok(this.deliveryService.getAllDeliveries());
//    }
//
//    @GetMapping("/get-signle-pmtct-delivery/{id}")
//    public ResponseEntity<Delivery> getSinglePMTCTDelivery(@PathVariable Long id) {
//        return ResponseEntity.ok(this.deliveryService.getSingleDelivery(id));
//    }

    @PostMapping("/exist/anc-number/{ancNo}")
    public boolean isANCNumberExisting(@PathVariable("ancNo") String ancNo) {
        return ancService.isANCExisting(ancNo);
    }

    @GetMapping(value ="/mother-visit-by-ancno/{ancNo}")
    public ResponseEntity<List<PmtctVisitResponseDto>> getMotherVisitByAncNo(@PathVariable("ancNo") String ancNo) {
        return ResponseEntity.ok (pmtctVisitService.getVisitByAncNo (ancNo));
    }

    @PutMapping(value = "update-mother-visit/{id}")
    public ResponseEntity<PmtctVisitResponseDto> updateMotherVisit(@PathVariable("id") Long id, @RequestBody PmtctVisitRequestDto pmtctVisitRequestDtoPmtctVisit) {
        return ResponseEntity.ok (pmtctVisitService.updatePmtctVisit (id, pmtctVisitRequestDtoPmtctVisit));
    }

    @GetMapping(value = "view-mother-visit/{id}")
    public ResponseEntity<PmtctVisitResponseDto> viewMotherVisit(@PathVariable("id") Long id) {
        return ResponseEntity.ok (pmtctVisitService.viewPmtctVisit(id));
    }


    @PutMapping(value = "update-anc/{id}")
    public ResponseEntity<ANCRequestDto> updateANC(@PathVariable("id") Long id, @RequestBody ANCRequestDto ancRequestDto) {
        return ResponseEntity.ok (ancService.updateAnc(id, ancRequestDto));
    }

    @GetMapping(value = "view-anc/{id}")
    public ResponseEntity<ANCRequestDto> viewANC(@PathVariable("id") Long id) {
        return ResponseEntity.ok (ancService.viewANCById(id));
    }

    @PutMapping(value = "update-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollmentRequestDto> updatePmtctEnrollment(@PathVariable("id") Long id, @RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        return ResponseEntity.ok (pmtctEnrollmentService.updatePMTCTEnrollment(id, pmtctEnrollmentRequestDto));
    }

    @GetMapping(value = "view-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollment> viewPmtctEnrollment(@PathVariable("id") Long id) {
        return ResponseEntity.ok (pmtctEnrollmentService.viewPMTCTEnrollmentById(id));
    }

    @PutMapping(value = "update-delivery/{id}")
    public ResponseEntity<DeliveryRequestDto> updateDelivery(@PathVariable("id") Long id, @RequestBody DeliveryRequestDto deliveryRequestDto) {
        return ResponseEntity.ok (deliveryService.updateDelivery(id, deliveryRequestDto));
    }

    @GetMapping(value = "view-delivery/{id}")
    public ResponseEntity<Delivery> viewDelivery(@PathVariable("id") Long id) {
        return ResponseEntity.ok (deliveryService.viewDeliveryById(id));
    }

    @GetMapping(value = "activities/{ancNo}")
    public List<ActivityTracker> getActivitiesByANC(@PathVariable("ancNo") String ancNo) {
        return ancAcivityTracker.getANCActivities(ancNo);
    }

    @PostMapping(value = "add-infants")
    public ResponseEntity<Infant> AddInfants(@RequestBody InfantDto infantDto) {
         return ResponseEntity.ok(infantService.save(infantDto));
    }

    @GetMapping(value = "view-infant/{id}")
    public ResponseEntity<Infant> viewInfant(@PathVariable("id") Long id) {
        return ResponseEntity.ok (infantService.getSingleInfant(id));
    }

    @PutMapping(value = "update-infant/{id}")
    public ResponseEntity<Infant> updateInfant(@PathVariable("id") Long id, @RequestBody InfantDto infantDto) {
        return ResponseEntity.ok (infantService.updateInfant(id, infantDto));
    }

    @PutMapping(value = "update-partnerinformation-in-anc/{id}")
    public PartnerInformation updatePartnerInformation(@PathVariable("id") Long id, @RequestBody PartnerInformation partnerInformation) {
        return ancService.updateAncWithPartnerInfo(id, partnerInformation);
    }

}
