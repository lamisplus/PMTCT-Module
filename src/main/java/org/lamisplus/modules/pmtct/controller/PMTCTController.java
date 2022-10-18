package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.domain.entity.PMTCTEnrollment;
import org.lamisplus.modules.pmtct.domain.entity.PmtctVisit;
import org.lamisplus.modules.pmtct.service.ANCService;
import org.lamisplus.modules.pmtct.service.DeliveryService;
import org.lamisplus.modules.pmtct.service.PMTCTEnrollmentService;
import org.lamisplus.modules.pmtct.service.PmtctVisitService;
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


    @PostMapping
    public ANCRequestDto registerANC(@RequestBody ANCRequestDto ancRequestDto) {
        this.ancService.save(ancRequestDto);
        return ancRequestDto;
    }

    @PutMapping
    public ANCRequestDto updateANC(@RequestBody ANCRequestDto ancRequestDto) {
        this.ancService.save(ancRequestDto);
        return ancRequestDto;
    }


    @GetMapping
    public ResponseEntity<List<ANCRespondDto>> getAllANC() {
        return ResponseEntity.ok(this.ancService.getAllAnc());
    }

    @GetMapping("{id}")
    public ResponseEntity<ANC> getSingleANC(@PathVariable Long id) {
        return ResponseEntity.ok(this.ancService.getSingleAnc(id));
    }

    @GetMapping(value = "/pmtct-from-person")
    public ResponseEntity<List<PMTCTPersonDto>> getpmtctFromPersons() {
        return ResponseEntity.ok(this.ancService.getAllPMTCTPerson());
    }

    @GetMapping(value = "/pmtct-from-person-by-hospitalNumber/{hospitalNumber}")
    public ResponseEntity<PMTCTPersonDto> getpmtctFromPersonByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
        return ResponseEntity.ok(this.ancService.getPMTCTPersonByHospitalNumber(hospitalNumber));
    }

    @GetMapping(value = "/all-active-anc")
    public ResponseEntity<List<ANCRespondDto>> getActiveANC() {
        return ResponseEntity.ok(this.ancService.getActiveAnc());
    }

    @GetMapping(value = "/non-active-anc")
    public ResponseEntity<List<ANCRespondDto>> getNonactiveANC() {
        return ResponseEntity.ok(this.ancService.getNonActiveAnc());
    }

    @PostMapping(value = "/pmtct-enrollment")
    public PMTCTEnrollmentRespondDto pmtctEnrollment(@RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        return this.pmtctEnrollmentService.save(pmtctEnrollmentRequestDto);
    }

    @GetMapping(value = "/get-all-pmtct-enrollment")
    public ResponseEntity<List<PMTCTEnrollmentRespondDto>> getAllPmtctEnrollment() {
        return ResponseEntity.ok(this.pmtctEnrollmentService.getAllPmtctEnrollment());
    }

    @PostMapping(value = "/pmtct-visit")
    public PmtctVisitResponseDto pmtctVisit(@RequestBody PmtctVisitRequestDto pmtctVisitRequestDto) {
        return this.pmtctVisitService.save(pmtctVisitRequestDto);
    }

    @GetMapping(value = "/get-all-pmtct-visit")
    public ResponseEntity<List<PmtctVisitResponseDto>> getAllPmtctVisit() {
        return ResponseEntity.ok(this.pmtctVisitService.getAllPmtctVisits());
    }

    @GetMapping("/get-signle-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollment> getSinglePMTCTEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(this.pmtctEnrollmentService.getSinglePmtctEnrollment(id));
    }

    @GetMapping("{/get-signle-pmtct-visit/id}")
    public ResponseEntity<PmtctVisit> getSinglePmtctVisit(@PathVariable Long id) {
        return ResponseEntity.ok(this.pmtctVisitService.getSinglePmtctVisit(id));
    }

    @PostMapping(value = "/pmtct-delivery")
    public DeliveryResponseDto createPmtctDelivery(@RequestBody DeliveryRequestDto deliveryRequestDto) {
        return this.deliveryService.save(deliveryRequestDto);
    }

    @GetMapping(value = "/get-all-pmtct-delivery")
    public ResponseEntity<List<DeliveryResponseDto>> getAllPmtctDelivery() {
        return ResponseEntity.ok(this.deliveryService.getAllDeliveries());
    }

    @GetMapping("/get-signle-pmtct-delivery/{id}")
    public ResponseEntity<Delivery> getSinglePMTCTDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(this.deliveryService.getSingleDelivery(id));
    }
}
