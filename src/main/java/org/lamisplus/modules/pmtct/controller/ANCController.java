package org.lamisplus.modules.pmtct.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.pmtct.domain.dto.ANCRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.ANCRespondDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTPersonDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.service.ANCService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RequestMapping("api/v1/pmtct/anc")
@RestController
@RequiredArgsConstructor
public class ANCController {
    private final ANCService ancService;

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

}
