package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

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
    private final CurrentUserOrganizationService organizationService;

    private final InfantVisitService infantVisitService;

    @PostMapping(value = "anc-enrollement")
    public ResponseEntity<ANCRespondDto> ANCEnrollement(@RequestBody ANCEnrollementRequestDto ancEnrollementRequestDto) {
        //System.out.println("Doc I got here nau");
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
        return ResponseEntity.ok(ancService.getSingleAnc(id));
    }

    @GetMapping(value = "/pmtct-from-person")
    public ResponseEntity<PersonMetaDataDto> getPMTCTFromPerson(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = ancService.getAllPMTCTPerson3(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping(value = "/all-active-pmtct")
    public ResponseEntity<PersonMetaDataDto> getANCFromPerson(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = ancService.getActiveOnPMTCT(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

//    @GetMapping(value = "/pmtct-from-person-by-hospitalNumber/{hospitalNumber}")
//    public ResponseEntity<PMTCTPersonDto> getpmtctFromPersonByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
//        return ResponseEntity.ok(this.ancService.getPMTCTPersonByHospitalNumber(hospitalNumber));
//    }

    @GetMapping(value = "/all-active-anc")
    public ResponseEntity<PersonMetaDataDto> getActiveOnANC(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        PersonMetaDataDto personMetaDataDto = ancService.getActiveOnANC(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
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

    @GetMapping("/art/")
    public List<PatientArtData> patientArtData(@RequestParam String PersonUuid) {
        Long facility = organizationService.getCurrentUserOrganization();
        return pmtctEnrollmentService.getArtDate(PersonUuid, facility);
    }

    @GetMapping("/vl-result/")
    public List<SingleResultProjectionDTO> vlResultOnDate(@RequestParam String PersonUuid,
                                                          @RequestParam String dateResultReceived) {
        Long facility = organizationService.getCurrentUserOrganization();
        return pmtctEnrollmentService.getVlResult(PersonUuid, dateResultReceived);
    }

    //    @GetMapping("{id}")
//    public ResponseEntity<PatientArtData>  getPatientArtData (@PathVariable String PersonUuid) {
//        return ResponseEntity.ok(pmtctEnrollmentService.getArtDate(PersonUuid));
//    }
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

    @PostMapping("/exist/anc-number")
    public boolean isANCNumberExisting(@RequestParam("ancNo") String ancNo) {
        return ancService.isANCExisting(ancNo);
    }

    @GetMapping(value = "/mother-visit-by-ancno/{ancNo}")
    public ResponseEntity<List<PmtctVisitResponseDto>> getMotherVisitByAncNo(@PathVariable("ancNo") String ancNo) {
        return ResponseEntity.ok(pmtctVisitService.getVisitByAncNo(ancNo));
    }

    @PutMapping(value = "update-mother-visit/{id}")
    public ResponseEntity<PmtctVisitResponseDto> updateMotherVisit(@PathVariable("id") Long id, @RequestBody PmtctVisitRequestDto pmtctVisitRequestDtoPmtctVisit) {
        return ResponseEntity.ok(pmtctVisitService.updatePmtctVisit(id, pmtctVisitRequestDtoPmtctVisit));
    }

    @GetMapping(value = "view-mother-visit/{id}")
    public ResponseEntity<PmtctVisitResponseDto> viewMotherVisit(@PathVariable("id") Long id) {
        return ResponseEntity.ok(pmtctVisitService.viewPmtctVisit(id));
    }


    @GetMapping(value = "get-delivery-date/{personUuid}")
    public ResponseEntity<String> getDeliveryDate(@PathVariable("personUuid") String personUuid) {
        return ResponseEntity.ok(pmtctEnrollmentService.getDeliveryDate(personUuid));
    }


    @PutMapping(value = "update-anc/{id}")
    public ResponseEntity<ANCRequestDto> updateANC(@PathVariable("id") Long id, @RequestBody ANCRequestDto ancRequestDto) {
        return ResponseEntity.ok(ancService.updateAnc(id, ancRequestDto));
    }

    @GetMapping(value = "view-anc/{id}")
    public ResponseEntity<ANCRequestDto> viewANC(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ancService.viewANCById(id));
    }

    @PutMapping(value = "update-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollmentRequestDto> updatePmtctEnrollment(@PathVariable("id") Long id, @RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        return ResponseEntity.ok(pmtctEnrollmentService.updatePMTCTEnrollment(id, pmtctEnrollmentRequestDto));
    }

    @GetMapping(value = "view-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollmentRespondDto> viewPmtctEnrollment(@PathVariable("id") Long id) {
        return ResponseEntity.ok(pmtctEnrollmentService.viewPMTCTEnrollmentById(id));
    }

    @PutMapping(value = "update-delivery/{id}")
    public ResponseEntity<DeliveryRequestDto> updateDelivery(@PathVariable("id") Long id, @RequestBody DeliveryRequestDto deliveryRequestDto) {
        return ResponseEntity.ok(deliveryService.updateDelivery(id, deliveryRequestDto));
    }

    @GetMapping(value = "view-delivery/{id}")
    public ResponseEntity<Delivery> viewDelivery(@PathVariable("id") Long id) {
        return ResponseEntity.ok(deliveryService.getSingleDelivery(id));
    }

    @GetMapping(value = "view-delivery2/{ancNo}")
    public ResponseEntity<Delivery> viewDelivery2(@PathVariable("ancNo") String ancNo) {
        return ResponseEntity.ok(deliveryService.getSingleDelivery2(ancNo));
    }

    @GetMapping(value = "view-delivery-with-uuid/{personUuid}")
    public ResponseEntity<Delivery> viewDeliveryWithUuid(@PathVariable("personUuid") String personUuid) {
        return ResponseEntity.ok(deliveryService.getSingleDeliveryWithUuid(personUuid));
    }

    @GetMapping(value = "activities/{ancNo}")
    public List<ActivityTracker> getActivitiesByANC(@PathVariable("ancNo") String ancNo) {
        return ancAcivityTracker.getANCActivities(ancNo);
    }

    @GetMapping(value = "getAllActivities/{personUuid}")
    public List<ActivityTracker> getAllActivitiesByPersonUuid(@PathVariable("personUuid") String personUuid) {
        return ancAcivityTracker.getAllActivities(personUuid);
    }

    @PostMapping(value = "add-infants")
    public ResponseEntity<InfantDtoResponse> AddInfants(@RequestBody InfantDto infantDto) {
        return ResponseEntity.ok(infantService.save(infantDto));
    }

    @GetMapping(value = "view-infant/{id}")
    public ResponseEntity<Infant> viewInfant(@PathVariable("id") Long id) {
        return ResponseEntity.ok(infantService.getSingleInfant(id));
    }

    @PutMapping(value = "update-infant/{id}")
    public ResponseEntity<InfantDtoUpdateResponse> updateInfant(@PathVariable("id") Long id, @RequestBody InfantDto infantDto) {
        return ResponseEntity.ok(infantService.updateInfant(id, infantDto));
    }

    @PutMapping(value = "update-partnerinformation-in-anc/{id}")
    public PartnerInformation updatePartnerInformation(@PathVariable("id") Long id, @RequestBody PartnerInformation partnerInformation) {
        return ancService.updateAncWithPartnerInfo(id, partnerInformation);
    }

    @PutMapping(value = "delete-partnerinformation-in-anc/{id}")
    public void deletePartnerInformation(@PathVariable("id") Long id) {
        ancService.deletePartnerInfo(id);
    }

    @GetMapping(value = "get-infant-by-ancno")
    public ResponseEntity<List<Infant>> getInfantByAncNo(@RequestParam("ancNo") String ancNo) {
        System.out.println("ANCNO " + ancNo);

        return ResponseEntity.ok(infantService.getInfantByAncNo(ancNo));
    }

//    @GetMapping(value = "get-infant-by-mother-person-uuid/{personUuid}")
//    public ResponseEntity<List<Infant>> getInfantByMotherPersonUuid(@PathVariable("personUuid") String personUuid) {
//        System.out.println("personUuid "+ personUuid);
//
//        return ResponseEntity.ok (infantService.getInfantWithMotherPersonUuid(personUuid));
//    }

    @GetMapping(value = "get-infant-by-mother-person-uuid/{personUuid}")
    public ResponseEntity<List<InfantDto>> getInfantByMotherPersonUuid(@PathVariable("personUuid") String personUuid) {
        System.out.println("personUuid " + personUuid);

        return ResponseEntity.ok(infantService.getSingleInfantByPersonUUID(personUuid));
    }

    @GetMapping(value = "/all-infants")
    public ResponseEntity<PersonMetaDataDto> getAllInfants(
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = infantService.getAllInfants(pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping(value = "infant-visitations")
    public ResponseEntity<InfantVisitResponseDto> InfantVisitation(@RequestBody InfantVisitRequestDto infantVisitRequestDto) {
        return ResponseEntity.ok(infantVisitService.save(infantVisitRequestDto));
    }

    @GetMapping(value = "get-infantvisit-by-hospitalnumber/{hospitalNumber}")
    public ResponseEntity<List<InfantVisit>> getInfantVisitByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
        return ResponseEntity.ok(infantVisitService.getInfantVisitByHospitalNumber(hospitalNumber));
    }

    @GetMapping(value = "view-infantvisit/{id}")
    public ResponseEntity<InfantVisitationConsolidatedDto> viewInfantVisit(@PathVariable("id") Long id) {
        return ResponseEntity.ok(infantVisitService.getSingleInfantVisit(id));
    }

    @PostMapping(value = "infant-pcr-test")
    public ResponseEntity<InfantPCRTest> InfantPCRTest(@RequestBody InfantPCRTestDto infantPCRTestDto) {
        return ResponseEntity.ok(infantVisitService.save(infantPCRTestDto));
    }

    @GetMapping(value = "get-infant-prc-by-hospitalnumber/{hospitalNumber}")
    public ResponseEntity<List<InfantPCRTest>> getInfantPCRTestByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
        return ResponseEntity.ok(infantVisitService.getInfantPCRTestByHospitalNumber(hospitalNumber));
    }

    @GetMapping(value = "view-infant-prc/{id}")
    public ResponseEntity<InfantPCRTest> viewInfantPCRTest(@PathVariable("id") Long id) {
        return ResponseEntity.ok(infantVisitService.getSingleInfantPCRTest(id));
    }

    @PostMapping(value = "infant-arv")
    public ResponseEntity<InfantArv> InfantPCRTest(@RequestBody InfantArvDto infantArvDto) {
        return ResponseEntity.ok(infantVisitService.save(infantArvDto));
    }

    @GetMapping(value = "get-infant-arv-by-hospitalnumber/{hospitalNumber}")
    public ResponseEntity<List<InfantArv>> getInfantArvByHospitalNumber(@PathVariable("hospitalNumber") String hospitalNumber) {
        return ResponseEntity.ok(infantVisitService.getInfantArvByHospitalNumber(hospitalNumber));
    }

    @GetMapping(value = "view-infant-avr/{id}")
    public ResponseEntity<InfantArv> viewInfantArv(@PathVariable("id") Long id) {
        return ResponseEntity.ok(infantVisitService.getSingleInfantArv(id));
    }

    @PostMapping(value = "infant-mother-art")
    public ResponseEntity<InfantMotherArt> createInpmfantMotherArt(@RequestBody InfantMotherArtDto infantMotherArtDto) {
        return ResponseEntity.ok(infantVisitService.save(infantMotherArtDto));
    }

    @GetMapping(value = "get-infant-mother-art-by-anc-number/{ancNo}")
    public ResponseEntity<List<InfantMotherArt>> getInfantMotherArtByAncNo(@PathVariable("ancNo") String ancNo) {
        return ResponseEntity.ok(infantVisitService.getInfantMotherArtByANCNumber(ancNo));
    }

    @GetMapping(value = "view-infant-mother-art/{id}")
    public ResponseEntity<InfantMotherArt> viewInfantMotherArt(@PathVariable("id") Long id) {
        return ResponseEntity.ok(infantVisitService.getSingleInfantMotherArt(id));
    }

//    , @RequestBody  InfantRapidAntiBodyTestDto infantRapidAntiBodyTestDto

    @PostMapping(value = "infant-visit-consolidated")
    public ResponseEntity<InfantVisitationConsolidatedDto> InfantVisitConsolidated(@RequestBody InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {
        if (infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantOutcomeAt18Months() != null)
            this.infantService.updateInfant(infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantHospitalNumber(), infantVisitationConsolidatedDto.getInfantVisitRequestDto().getInfantOutcomeAt18Months());
        return ResponseEntity.ok(infantVisitService.saveConsolidation(infantVisitationConsolidatedDto, infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto()));
    }

    @GetMapping(value = "get-form-filter/{hospitalNumber}")
    public FormFilterResponseDto getFormFilter(@PathVariable("hospitalNumber") String hospitalNumber) {
        return infantVisitService.getFormFilter(hospitalNumber);
    }

    @GetMapping(value = "get-summary-chart")
    public SummaryChart getSummaryChart(@RequestParam("ancNo") String ancNo) {
        return ancAcivityTracker.getSummaryChart(ancNo);
    }

    @GetMapping(value = "get-pmtct-summary-chart/{personUuid}")
    public SummaryChart getPmtctSummaryChart(@PathVariable("personUuid") String personUuid) {
        return ancAcivityTracker.getPmtctSummaryChart(personUuid);
    }

    @GetMapping(value = "/calculate-ga/{lmp}")
    public int calculateGa(@PathVariable("lmp") LocalDate lmp) {
        return ancService.calculateGA(lmp);
    }

    @GetMapping(value = "/calculate-ga2")
    public int calculateGa(@RequestParam("ancNo") String ancNo, @RequestParam("visitDate") LocalDate visitDate) {
        return ancService.calculateGA(ancNo, visitDate);
    }

    @GetMapping(value = "/calculate-ga-from-person")
    public int calculateGaFromPmtct(@RequestParam("personUuid") String personUuid, @RequestParam("visitDate") LocalDate visitDate) {
        return ancService.calculateGaFromPmtct(personUuid, visitDate);
    }

    @GetMapping(value = "/calculate-ga3")
    public int calculateGa2(@RequestParam("hospitalNumber") String hospitalNumber, @RequestParam("visitDate") LocalDate visitDate) {
        return ancService.calculateGA2(hospitalNumber, visitDate);
    }

    @PostMapping("/exist/infant-hospital-number")
    public ResponseEntity<Boolean> hospitalNumberExists(@RequestBody String hospitalNumber) throws InterruptedException, ExecutionException {
        CompletableFuture<Boolean> hospitalNumberExist = infantService.hospitalNumberExist(hospitalNumber);
        return ResponseEntity.ok(hospitalNumberExist.get());
    }


    @DeleteMapping(value = "/delete/delivery/{id}")
    public ResponseEntity<String> deleteDelivery(@PathVariable("id") Long id) {
        this.deliveryService.deleteDelivery(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/anc/{id}")
    public ResponseEntity<String> deleteANC(@PathVariable("id") Long id) {
        this.ancService.deleteANC(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/pmtct/{id}")
    public ResponseEntity<String> deletePMTCT(@PathVariable("id") Long id) {
        this.pmtctEnrollmentService.deletePMTCT(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping(value = "update-infant-visit")
    public ResponseEntity<InfantVisitationConsolidatedDto> updateInfantVisit(@RequestBody InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {
        return ResponseEntity.ok(infantVisitService.updateInfantVisit(infantVisitationConsolidatedDto));
    }

    @DeleteMapping(value = "/delete/infantvisit/{id}")
    public ResponseEntity<String> deleteInfantVisit(@PathVariable("id") Long id) {
        this.infantVisitService.DeleteInfantVisit(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/mothervisit/{id}")
    public ResponseEntity<String> deleteMotherVisit(@PathVariable("id") Long id) {
        this.pmtctVisitService.deleteMotherVisit(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/infantinfo/{id}")
    public ResponseEntity<String> deleteInfantInfo(@PathVariable("id") Long id) {
        this.infantService.deleteInfant(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "delete/partnerinfo/{id}")
    public ResponseEntity<String> deletePartnerInfo(@PathVariable("id") Long id) {
        ancService.deletePartnerInfo(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "hiv-status")
    public ResponseEntity<String> getClientHivStatus(@RequestParam String hospitalNumber, @RequestParam String personUuid) {
        return ResponseEntity.ok(pmtctEnrollmentService.getHIVStatus(hospitalNumber, personUuid));
    }
}
