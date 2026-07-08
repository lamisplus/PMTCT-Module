package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.PersonMetaDataDto;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.*;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.lamisplus.modules.pmtct.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
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

    private final PmtctHtsService pmtctHtsService;

    private final PmtctPregnancyCycleService pmtctPregnancyCycleService;

    private final PmtctVisitRepository pmtctVisitRepository;

    @GetMapping(value = "anc-visit-count")
    public ResponseEntity<Integer> getAncVisitCount(
            @RequestParam String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctVisitRepository.getMotherVisitsWithPatientUuidAndCycleUuid(patientUuid, pmtctCycleUuid));
    }

    @PostMapping(value = "anc-enrollement")
    public ResponseEntity<?> ANCEnrollement(@RequestBody ANCEnrollementRequestDto ancEnrollementRequestDto) {
        if (ancEnrollementRequestDto.getPmtctCycleUuid() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"pmtct cycle uuid is required\"}");
        }
        return ResponseEntity.ok(ancService.ANCEnrollement(ancEnrollementRequestDto));
    }


//    @PostMapping
//    public ANCRequestDto registerANC(@RequestBody ANCRequestDto ancRequestDto) {
//        this.ancService.save(ancRequestDto);
//        return ancRequestDto;
//    }

    @PostMapping(value = "anc-new-registration")
    public ResponseEntity<ANCRespondDto> newANCRegistration(@Valid @RequestBody ANCWithPersonRequestDto ancWithPersonRequestDto) {
        // this.ancService.ANCEnrollement(ancEnrollementRequestDto);
        return ResponseEntity.ok(ancService.newANCRegistration(ancWithPersonRequestDto));
    }



    @GetMapping("{id}")
    public ResponseEntity<ANC> getSingleANC(@PathVariable String id) {
        try {
            return ResponseEntity.ok(ancService.getSingleAnc(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping(value = "get-anc-by-person")
    public ResponseEntity<ANC> getANCByPatientUuidAndCycleId(
            @RequestParam String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        ANC anc = ancService.getAncByPatientUuidAndCycleId(patientUuid, pmtctCycleUuid);
        if (anc == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(anc);
    }

//    @GetMapping(value = "check-for-infant-high-risk")
//    public ResponseEntity<Boolean> checkForInfantRiskStatus(@PathVariable long PatientUuid) {
//        return ResponseEntity.ok(ancService.isAtRisk(PatientUuid));
//    }



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

    @GetMapping(value = "/all-active-pmtct-hts")
    public ResponseEntity<PersonMetaDataDto> getActiveOnPmtctHts(
            @RequestParam(defaultValue = "*") String searchParam,
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        PersonMetaDataDto personMetaDataDto = pmtctHtsService.getActiveOnPmtctHts(searchParam, pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    //    @GetMapping(value = "/non-active-anc")
//    public ResponseEntity<List<ANCRespondDto>> getNonactiveANC() {
//        return ResponseEntity.ok(this.ancService.getNonActiveAnc());
//    }
//
    @PostMapping(value = "/pmtct-enrollment")
    public ResponseEntity<?> pmtctEnrollment(@Valid @RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        try {
            return ResponseEntity.ok(this.pmtctEnrollmentService.save(pmtctEnrollmentRequestDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/art/")
    public List<PatientArtData> patientArtData(@RequestParam String PatientUuid) {
        Long facility = organizationService.getCurrentUserOrganization();
        return pmtctEnrollmentService.getArtDate(PatientUuid, facility);
    }

    //uncomment

    @GetMapping("/vl-result/")
    public List<SingleResultProjectionDTO> vlResultOnDate(@RequestParam String PatientUuid,
                                                          @RequestParam String dateResultReceived) {
        Long facility = organizationService.getCurrentUserOrganization();
        return pmtctEnrollmentService.getVlResult(PatientUuid, dateResultReceived);
    }

    //    @GetMapping("{id}")
//    public ResponseEntity<PatientArtData>  getPatientArtData (@PathVariable String PatientUuid) {
//        return ResponseEntity.ok(pmtctEnrollmentService.getArtDate(PatientUuid));
//    }
//    @GetMapping(value = "/get-all-pmtct-enrollment")
//    public ResponseEntity<List<PMTCTEnrollmentRespondDto>> getAllPmtctEnrollment() {
//        return ResponseEntity.ok(this.pmtctEnrollmentService.getAllPmtctEnrollment());
//    }
//
    @PostMapping(value = "/pmtct-visit")
    public PmtctVisitResponseDto pmtctVisit(@Valid @RequestBody PmtctVisitRequestDto pmtctVisitRequestDto) {
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
    public DeliveryResponseDto createPmtctDelivery(@Valid @RequestBody DeliveryRequestDto deliveryRequestDto) {
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
    public ResponseEntity<PmtctVisitResponseDto> updateMotherVisit(@PathVariable("id") String id, @RequestBody PmtctVisitRequestDto pmtctVisitRequestDtoPmtctVisit) {
        return ResponseEntity.ok(pmtctVisitService.updatePmtctVisit(id, pmtctVisitRequestDtoPmtctVisit));
    }

    @GetMapping(value = "view-mother-visit/{id}")
    public ResponseEntity<PmtctVisitResponseDto> viewMotherVisit(@PathVariable("id") String id) {
        return ResponseEntity.ok(pmtctVisitService.viewPmtctVisit(id));
    }


    @GetMapping(value = "get-delivery-date/{patientUuid}")
    public ResponseEntity<String> getDeliveryDate(@PathVariable("patientUuid") String patientUuid, @RequestParam("pmtctCycleUuid") String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctEnrollmentService.getDeliveryDate(patientUuid, pmtctCycleUuid));
    }

    @GetMapping(value = "get-initial-visit-date/{patientUuid}")
    public ResponseEntity<LocalDate> getInitialVisitDate(@PathVariable("patientUuid") String patientUuid, @RequestParam("pmtctCycleUuid") String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctEnrollmentService.getInitialVisitDate(patientUuid, pmtctCycleUuid));
    }

    @GetMapping(value = "get-latest-art-regimen/{patientUuid}")
    public ResponseEntity<String> getLatestArtRegimen(@PathVariable("patientUuid") String patientUuid) {
        return ResponseEntity.ok(pmtctVisitService.getLatestArtRegimenFromPharmacy(patientUuid));
    }

    @GetMapping(value = "is-cycle-closed/{cycleUuid}")
    public ResponseEntity<Boolean> isCycleClosed(@PathVariable("cycleUuid") String cycleUuid) {
        return ResponseEntity.ok(pmtctPregnancyCycleService.isCycleClosed(cycleUuid));
    }

    @PutMapping(value = "reopen-cycle/{cycleUuid}")
    public ResponseEntity<String> reopenCycle(@PathVariable("cycleUuid") String cycleUuid) {
        pmtctPregnancyCycleService.reopenCycle(cycleUuid);
        return ResponseEntity.ok("Cycle re-opened successfully");
    }

    @GetMapping(value = "check-unsuppressed-vl/{patientUuid}")
    public ResponseEntity<Boolean> checkUnsuppressedVl(
            @PathVariable("patientUuid") String patientUuid) {
        return ResponseEntity.ok(pmtctVisitService.isViralLoadUnsuppressed(patientUuid));
    }


    @PutMapping(value = "update-anc/{id}")
    public ResponseEntity<ANCRequestDto> updateANC(@PathVariable("id") String id, @RequestBody ANCRequestDto ancRequestDto) {
        return ResponseEntity.ok(ancService.updateAnc(id, ancRequestDto));
    }

    @GetMapping(value = "view-anc/{id}")
    public ResponseEntity<ANCRequestDto> viewANC(@PathVariable("id") String id) {
        return ResponseEntity.ok(ancService.viewANCById(id));
    }

    @PutMapping(value = "update-pmtct-enrollment/{id}")
    public ResponseEntity<?> updatePmtctEnrollment(@PathVariable("id") String id, @RequestBody PMTCTEnrollmentRequestDto pmtctEnrollmentRequestDto) {
        try {
            return ResponseEntity.ok(pmtctEnrollmentService.updatePMTCTEnrollment(id, pmtctEnrollmentRequestDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping(value = "view-pmtct-enrollment/{id}")
    public ResponseEntity<PMTCTEnrollmentRespondDto> viewPmtctEnrollment(@PathVariable("id") String id) {
        return ResponseEntity.ok(pmtctEnrollmentService.viewPMTCTEnrollmentById(id));
    }

    @PutMapping(value = "update-delivery/{id}")
    public ResponseEntity<DeliveryRequestDto> updateDelivery(@PathVariable("id") String id, @RequestBody DeliveryRequestDto deliveryRequestDto) {
        return ResponseEntity.ok(deliveryService.updateDelivery(id, deliveryRequestDto));
    }

    @GetMapping(value = "view-delivery/{id}")
    public ResponseEntity<Delivery> viewDelivery(@PathVariable("id") String id) {
        return ResponseEntity.ok(deliveryService.getSingleDelivery(id));
    }

    @GetMapping(value = "view-delivery2")
    public ResponseEntity<Delivery> viewDelivery2(@RequestParam String ancNo) {
        return ResponseEntity.ok(deliveryService.getSingleDelivery2(ancNo));
    }

    @GetMapping(value = "view-delivery-with-uuid/{patientUuid}/{pmtctCycleUuid}")
    public ResponseEntity<Delivery> viewDeliveryWithUuid(@PathVariable("patientUuid") String patientUuid, @PathVariable("pmtctCycleUuid") String pmtctCycleUuid) {
        return ResponseEntity.ok(deliveryService.getSingleDeliveryWithUuid(patientUuid,pmtctCycleUuid));
    }

    @GetMapping(value = "view-latest-delivery/{patientUuid}")
    public ResponseEntity<Delivery> viewLatestDelivery(@PathVariable("patientUuid") String patientUuid) {
        return ResponseEntity.ok(deliveryService.getLatestDeliveryByPatientUuid(patientUuid));
    }

    @GetMapping(value = "activities/{ancNo}")
    public List<ActivityTracker> getActivitiesByANC(@PathVariable("ancNo") String ancNo) {
        return ancAcivityTracker.getANCActivities(ancNo);
    }

    @GetMapping(value = "getAllActivities/{patientUuid}")
    public List<ActivityTracker> getAllActivitiesByPatientUuid(
            @PathVariable("patientUuid") String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ancAcivityTracker.getAllActivities(patientUuid, pmtctCycleUuid);
    }

    @PostMapping(value = "add-infants")
    public ResponseEntity<InfantDtoResponse> AddInfants(@Valid @RequestBody InfantDto infantDto) {
        return ResponseEntity.ok(infantService.save(infantDto));
    }

    @GetMapping(value = "view-infant/{id}")
    public ResponseEntity<Infant> viewInfant(@PathVariable("id") String id) {
        return ResponseEntity.ok(infantService.getSingleInfant(id));
    }

    @GetMapping(value = "get-infant-dto/{id}")
    public ResponseEntity<InfantDto> getInfantDtoById(@PathVariable("id") String id) {
        return ResponseEntity.ok(infantService.getInfantDtoById(id));
    }

    @PutMapping(value = "update-infant/{id}")
    public ResponseEntity<InfantDtoUpdateResponse> updateInfant(@PathVariable("id") String id, @RequestBody InfantDto infantDto) {
        return ResponseEntity.ok(infantService.updateInfant(id, infantDto));
    }

    @PostMapping(value = "add-partnerinformation-in-anc/{id}")
    public PartnerInformation addPartnerInformation(@PathVariable("id") String id, @RequestBody PartnerInformation partnerInformation) {
        return ancService.addPartnerToAnc(id, partnerInformation);
    }

    @PutMapping(value = "update-partnerinformation-in-anc/{id}/{partnerId}")
    public PartnerInformation updatePartnerInformation(@PathVariable("id") String id, @PathVariable("partnerId") String partnerId, @RequestBody PartnerInformation partnerInformation) {
        return ancService.updatePartnerInAnc(id, partnerId, partnerInformation);
    }

    @PutMapping(value = "delete-partnerinformation-in-anc/{id}")
    public void deletePartnerInformation(@PathVariable("id") String id) {
        ancService.deletePartnerInfo(id);
    }

    @GetMapping(value = "get-infant-by-ancno")
    public ResponseEntity<List<Infant>> getInfantByAncNo(@RequestParam("ancNo") String ancNo) {
        System.out.println("ANCNO " + ancNo);

        return ResponseEntity.ok(infantService.getInfantByAncNo(ancNo));
    }

//    @GetMapping(value = "get-infant-by-mother-person-uuid/{patientUuid}")
//    public ResponseEntity<List<Infant>> getInfantByMotherPatientUuid(@PathVariable("patientUuid") String patientUuid) {
//        System.out.println("patientUuid "+ patientUuid);
//
//        return ResponseEntity.ok (infantService.getInfantWithMotherPatientUuid(patientUuid));
//    }

    @GetMapping(value = "get-infant-by-mother-person-uuid/{patientUuid}")
    public ResponseEntity<List<InfantDto>> getInfantByMotherPatientUuid(
            @PathVariable("patientUuid") String patientUuid,
            @RequestParam String pmtctCycleUuid) {

        return ResponseEntity.ok(infantService.getSingleInfantByPersonUUID(patientUuid, pmtctCycleUuid));
    }

    @GetMapping(value = "/all-infants")
    public ResponseEntity<PersonMetaDataDto> getAllInfants(
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PersonMetaDataDto personMetaDataDto = infantService.getAllInfants(pageNo, pageSize);
        return new ResponseEntity<>(personMetaDataDto, new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping(value = "infant-visitations")
    public ResponseEntity<InfantVisitResponseDto> InfantVisitation(@Valid @RequestBody InfantVisitRequestDto infantVisitRequestDto) {
        return ResponseEntity.ok(infantVisitService.save(infantVisitRequestDto));
    }

    @GetMapping(value = "get-infantvisit-by-hospitalnumber")
    public ResponseEntity<List<InfantVisit>> getInfantVisitByHospitalNumber(@RequestParam("hospitalNumber") String hospitalNumber) {
        return ResponseEntity.ok(infantVisitService.getInfantVisitByHospitalNumber(hospitalNumber));
    }

    @GetMapping(value = "view-infantvisit/{id}")
    public ResponseEntity<InfantVisitationConsolidatedDto> viewInfantVisit(@PathVariable("id") String id) {
        return ResponseEntity.ok(infantVisitService.getSingleInfantVisit(id));
    }

    @PostMapping(value = "infant-visit-consolidated")
    public ResponseEntity<InfantVisitationConsolidatedDto> InfantVisitConsolidated(@Valid @RequestBody InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {
        return ResponseEntity.ok(infantVisitService.saveConsolidation(infantVisitationConsolidatedDto, infantVisitationConsolidatedDto.getInfantRapidAntiBodyTestDto()));
    }

    @GetMapping(value = "get-form-filter")
    public FormFilterResponseDto getFormFilter(@RequestParam("hospitalNumber") String hospitalNumber) {
        return infantVisitService.getFormFilter(hospitalNumber);
    }

    @GetMapping(value = "get-summary-chart")
    public SummaryChart getSummaryChart(
            @RequestParam("patientUuid") String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ancAcivityTracker.getPmtctSummaryChart(patientUuid, pmtctCycleUuid);
    }

    @GetMapping(value = "get-pmtct-summary-chart/{patientUuid}")
    public SummaryChart getPmtctSummaryChart(
            @PathVariable("patientUuid") String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ancAcivityTracker.getPmtctSummaryChart(patientUuid, pmtctCycleUuid);
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
    public int calculateGaFromPmtct(
            @RequestParam("patientUuid") String patientUuid,
            @RequestParam("visitDate") LocalDate visitDate,
            @RequestParam("pmtctCycleUuid") String pmtctCycleUuid) {
        return ancService.calculateGaFromPmtct(patientUuid, visitDate, pmtctCycleUuid);
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
    public ResponseEntity<String> deleteDelivery(@PathVariable("id") String id) {
        this.deliveryService.deleteDelivery(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/anc/{id}")
    public ResponseEntity<String> deleteANC(@PathVariable("id") String id) {
        this.ancService.deleteANC(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/pmtct/{id}")
    public ResponseEntity<String> deletePMTCT(@PathVariable("id") String id) {
        this.pmtctEnrollmentService.deletePMTCT(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping(value = "update-infant-visit")
    public ResponseEntity<InfantVisitationConsolidatedDto> updateInfantVisit(@RequestBody InfantVisitationConsolidatedDto infantVisitationConsolidatedDto) {
        return ResponseEntity.ok(infantVisitService.updateInfantVisit(infantVisitationConsolidatedDto));
    }

    @DeleteMapping(value = "/delete/infantvisit/{id}")
    public ResponseEntity<String> deleteInfantVisit(@PathVariable("id") String id) {
        this.infantVisitService.DeleteInfantVisit(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/mothervisit/{id}")
    public ResponseEntity<String> deleteMotherVisit(@PathVariable("id") String id) {
        this.pmtctVisitService.deleteMotherVisit(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "/delete/infantinfo/{id}")
    public ResponseEntity<String> deleteInfantInfo(@PathVariable("id") String id) {
        this.infantService.deleteInfant(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping(value = "delete/partnerinfo/{id}/{partnerId}")
    public ResponseEntity<String> deletePartnerInfo(@PathVariable("id") String id, @PathVariable("partnerId") String partnerId) {
        ancService.deletePartnerFromAnc(id, partnerId);
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "hiv-status")
    public ResponseEntity<String> getClientHivStatus(@RequestParam String hospitalNumber, @RequestParam String patientUuid) {
        return ResponseEntity.ok(pmtctEnrollmentService.getHIVStatus(hospitalNumber, patientUuid));
    }

    @GetMapping(value = "hiv-status-detail")
    public ResponseEntity<java.util.Map<String, Object>> getClientHivStatusDetail(@RequestParam String patientUuid) {
        return ResponseEntity.ok(ancService.getHtsStatusWithDate(patientUuid));
    }

    @GetMapping(value = "get-latest-pcr")
    public ResponseEntity<InfantPCRTestDto> getLastPCR(@RequestParam String infantHospitalNumber, @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(infantService.getLatestPCR(infantHospitalNumber, pmtctCycleUuid));
    }

    @GetMapping(value = "get-latest-rapid-test")
    public ResponseEntity<InfantRapidAntiBodyTestDto> getLastRapidTest(@RequestParam String infantHospitalNumber, @RequestParam String motherUuid, @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(infantService.getLatestRapidTest(infantHospitalNumber, motherUuid, pmtctCycleUuid));
    }

//
//    @GetMapping(value = "get-all-pcr")
//    public ResponseEntity<InfantPCRTestDto> getAllPCR(@RequestParam String infantHospitalNumber) {
//        return ResponseEntity.ok(infantService.getLatestPCR(infantHospitalNumber));
//    }

    @GetMapping(value = "is-on-pmtct")
    public boolean getPatientOnPMTCT(@RequestParam String patientUuid, @RequestParam String pmtctCycleUuid) {
        return   pmtctEnrollmentService.checkPatientOnPMTCT(patientUuid, pmtctCycleUuid);
    }

    @GetMapping(value = "is-on-hts")
    public  ResponseEntity<RegisterPatientResponseDTO>  getPatientOnHTS(@RequestParam String clientCode) {
//RegisterPatientResponseDTO
              return ResponseEntity.ok(pmtctEnrollmentService.checkPatientOnHTS(clientCode.trim()));


    }
//    getAllPCR

    @GetMapping(value = "first-pcr-exist")
    public  ResponseEntity<Boolean>  checkFirstPcrExist(@RequestParam String infantHospitalNo) {
//RegisterPatientResponseDTO
        return ResponseEntity.ok(infantService.firstPcrExist(infantHospitalNo));

    }


    @PostMapping(value = "/pmtct-hts-enrollment")
    public ResponseEntity<?> pmtctHtsEnrollment(@RequestBody PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        if (pmtctHtsRequestDTO.getPmtctCycleUuid() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"pmtct cycle uuid is required\"}");
        }
        // Prevent saving a second initial PMTCT HTS record for the same cycle
        if (pmtctHtsRequestDTO.getTestingType() != null
                && !pmtctHtsRequestDTO.getTestingType().equalsIgnoreCase("RETESTING")
                && pmtctHtsService.existsInitialHtsForCycle(
                        pmtctHtsRequestDTO.getPatientUuid(),
                        pmtctHtsRequestDTO.getPmtctCycleUuid())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"An initial PMTCT HTS record already exists for this cycle\"}");
        }
        return ResponseEntity.ok(this.pmtctHtsService.saveToHtsEncounter(pmtctHtsRequestDTO));
    }



    @DeleteMapping(value = "/delete/pmtct-hts/{id}")
    public ResponseEntity<String> deletePmtctHts(@PathVariable("id") String id) throws Exception {
        // Routes by id type internally (Long → hts_encounter, UUID → pmtct_hts)
        this.pmtctHtsService.deletePmtctHtsRecord(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "view-pmtct-hts-enrollment/{id}")
    public ResponseEntity<PmtctHtsReponseDTO> viewPMTCTHTSEnrollmentById(@PathVariable("id") String id) {
        // Routes by id type internally (Long → hts_encounter, UUID → pmtct_hts)
        return ResponseEntity.ok(pmtctHtsService.viewPMTCTHTSEnrollmentById(id));
    }

    @GetMapping(value = "get-latest-pmtct-hts-enrollment/{patientUuid}")
    public ResponseEntity<PmtctHtsReponseDTO> getLastPMTCTHTSEnrollmentById(
            @PathVariable("patientUuid") String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctHtsService.getLastPMTCTHTSEnrollmentById(patientUuid, pmtctCycleUuid));
    }

    @GetMapping(value = "patient-hiv-summary")
    public ResponseEntity<PatientHivSummaryDto> getPatientHivSummary(
            @RequestParam String patientUuid,
            @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctHtsService.getPatientHivSummary(patientUuid, pmtctCycleUuid));
    }

    @GetMapping(value = "get-latest-pmtct-hts-by-person-uuid/{patientUuid}")
    public ResponseEntity<PmtctHtsReponseDTO> getLastPMTCTHTSByPatientUuid(
            @PathVariable("patientUuid") String patientUuid) {
        return ResponseEntity.ok(pmtctHtsService.getLastPMTCTHTSEnrollmentById(patientUuid));
    }

    @PutMapping(value = "update-pmtct-hts-enrollment/{id}")
    public ResponseEntity<?> updatePmtctHtsRecord(@PathVariable("id") String id, @RequestBody PmtctHtsRequestDTO pmtctHtsRequestDTO) {
        if (pmtctHtsRequestDTO.getPmtctCycleUuid() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"pmtct cycle uuid is required\"}");
        }
        // Route: numeric id = hts_encounter (post-migration)
        try {
            Long htsId = Long.parseLong(id);
            return ResponseEntity.ok(pmtctHtsService.updateHtsEncounter(htsId, pmtctHtsRequestDTO));
        } catch (NumberFormatException e) {
            // UUID-based IDs indicate un-migrated legacy records in pmtct_hts.
            // After migration (pmtct-2.5.0), all records should have numeric IDs.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"This record has a legacy UUID identifier and cannot be updated. "
                            + "Please run the PMTCT HTS data migration (pmtct-2.5.0) to migrate records to the new format.\"}");
        }
    }




    @GetMapping(value = "get-confirmatory-latest-result")
    public  ResponseEntity<String>  getPmtctHtsConfirmatoryTest(
            @RequestParam String patientUuid,
            @RequestParam(required = false) String pmtctCycleUuid) {

        String result;

        // If pmtctCycleUuid is not provided, fetch the latest cycle
        if (pmtctCycleUuid == null) {
            result = pmtctHtsService.getLatestConfirmatoryResult(patientUuid);
        } else {
            result = pmtctHtsService.getLatestConfirmatoryResult(patientUuid, pmtctCycleUuid);
        }

        return ResponseEntity.ok(result);

    }



    @GetMapping(value = "get-latest-maternal-outcome")
    public  ResponseEntity<String>  getLatestMaternalOutcome(@RequestParam String patientUuid, @RequestParam String pmtctCycleUuid) {
        return ResponseEntity.ok(pmtctVisitService.getLatestMaternalOutcome(patientUuid, pmtctCycleUuid));
    }


    @GetMapping(value = "check-for-infant-high-risk/{patientUuid}")
    public List<InfantPCRAlert> checkForInfantRiskStatus(
            @PathVariable String patientUuid,
            @RequestParam String pmtctCycleUuid) {

        return ancService.getHighRiskInfantDetails(patientUuid, pmtctCycleUuid);
    }


    @GetMapping(value = "check-for-infant-pcr-alert/{patientUuid}")
    public List<InfantPCRAlert> getHEIPrompt(
            @PathVariable String patientUuid,
            @RequestParam String pmtctCycleUuid) {

        return pmtctEnrollmentService.checkHEIPrompt(patientUuid, pmtctCycleUuid);
    }



    @GetMapping(value = "check-if-date-exist")
    public boolean checkifDateExist(@RequestParam String patientUuid,  @RequestParam LocalDate dateOfHivTest) {


        return pmtctHtsService.confirmIfDateExist(patientUuid, dateOfHivTest);
    }

    @GetMapping(value = "get-hiv-retest-status")
    public  ResponseEntity<HivRetestStatusResponse>  getStatusBaseOnLastRetesting(
            @RequestParam String patientUuid,
            @RequestParam String pmtctCycleUuid) {

        HivRetestStatusResponse response = pmtctHtsService.getHivRetestStatus(patientUuid, pmtctCycleUuid);

        return ResponseEntity.ok(response);

    }

    @PostMapping(value = "pregnancy-cycle")
    public ResponseEntity<?> createPregnancyCycle(@RequestBody PmtctPregnancyCycleRequestDto requestDto) {
        if (requestDto.getPatientUuid() == null || requestDto.getPatientUuid().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"patient_uuid is not provided\"}");
        }

        PmtctPregnancyCycleResponseDto response = pmtctPregnancyCycleService.save(requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "get-latest-pregnancy-cycle")
    public ResponseEntity<?> getLatestPregnancyCycle(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"patient_uuid is required\"}");
        }

        PmtctPregnancyCycleResponseDto cycle = pmtctPregnancyCycleService.getLatestCycleByPatientUuid(patientUuid);

        if (cycle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"message\": \"No pregnancy cycle found for this patient\"}");
        }

        return ResponseEntity.ok(cycle);
    }

    @GetMapping(value = "pregnancy-cycles")
    public ResponseEntity<?> getAllPregnancyCycles(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"patient_uuid is required\"}");
        }

        List<PmtctPregnancyCycleResponseDto> cycles = pmtctPregnancyCycleService.getAllCyclesByPatientUuid(patientUuid);

        return ResponseEntity.ok(cycles);
    }

    @GetMapping(value = "check-anc-enrollment")
    public ResponseEntity<ANCEnrollmentCheckDto> checkANCEnrollment(@RequestParam String patientUuid, @RequestParam String pmtctCycleUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        ANCEnrollmentCheckDto response = ancService.checkANCEnrollmentByPatientUuid(patientUuid, pmtctCycleUuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "check-pmtct-validation-dates")
    public ResponseEntity<PMTCTValidationDto> checkPMTCTValidationDates(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        PMTCTValidationDto response = pmtctEnrollmentService.getPMTCTValidationDates(patientUuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "latest-enrollment")
    public ResponseEntity<?> getLatestEnrollmentByPatientUuid(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"patient_uuid is required\"}");
        }

        PMTCTEnrollmentRespondDto enrollment = pmtctEnrollmentService.getSinglePmtctEnrollmentByPatientUuid(patientUuid);
        if (enrollment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"message\": \"No previous enrollment found\"}");
        }
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping(value = "validate-enrollment")
    public ResponseEntity<EnrollmentValidationDto> validateEnrollment(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        EnrollmentValidationDto response = pmtctPregnancyCycleService.validateEnrollment(patientUuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "check-art-enrollment-duplicate")
    public ResponseEntity<Boolean> checkArtEnrollmentDuplicate(@RequestParam String artEnrollmentNo) {
        return ResponseEntity.ok(infantVisitService.isArtEnrollmentNoDuplicate(artEnrollmentNo));
    }

    @GetMapping(value = "is-infant-visit-date-exists")
    public ResponseEntity<Boolean> isInfantVisitDateExists(
            @RequestParam String hospitalNumber,
            @RequestParam LocalDate visitDate,
            @RequestParam(required = false) String excludeId) {
        boolean exists = infantVisitService.isInfantVisitDateExists(hospitalNumber, visitDate, excludeId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping(value = "get-historical-hiv-status")
    public ResponseEntity<String> getHistoricalHivStatus(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("patient_uuid is required");
        }

        String hivStatus = pmtctPregnancyCycleService.getHistoricalHivStatus(patientUuid);

        if (hivStatus == null) {
            return ResponseEntity.ok("");
        }

        return ResponseEntity.ok(hivStatus);
    }

    @GetMapping(value = "historical-serology-status")
    public ResponseEntity<java.util.Map<String, Object>> getHistoricalSerologyStatus(@RequestParam String patientUuid) {
        if (patientUuid == null || patientUuid.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        return ResponseEntity.ok(pmtctPregnancyCycleService.getHistoricalSerologyStatus(patientUuid));
    }

    @GetMapping(value = "statistics")
    public ResponseEntity<PMTCTStatisticsDto> getPMTCTStatistics() {
        PMTCTStatisticsDto statistics = ancService.getPMTCTStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping(value = "check-client-code")
    public ResponseEntity<Boolean> isClientCodeTaken(@RequestParam String code) {
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(pmtctHtsService.isClientCodeTaken(code.trim()));
    }

    @GetMapping(value = "migration-status")
    public ResponseEntity<java.util.Map<String, Object>> getMigrationStatus() {
        long unmigratedCount = pmtctHtsService.getUnmigratedRecordCount();
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("migrationRequired", unmigratedCount > 0);
        result.put("unmigratedCount", unmigratedCount);
        return ResponseEntity.ok(result);
    }

}
