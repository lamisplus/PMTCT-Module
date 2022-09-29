package org.lamisplus.modules.pmtct.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.pmtct.domain.dto.ANCDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.service.ANCService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/patient/pmtct-anc")
public class ANCController {

    private final ANCService ancService;

    @PostMapping
    public ResponseEntity<ANC> ancEnrollment(@RequestBody ANC anc) {
        return ResponseEntity.ok (ancService.registerANC (anc));
    }

    @GetMapping
    public ResponseEntity<List<ANCDto>> getAllANC() {
        return ResponseEntity.ok (ancService.getANC());
    }
    @GetMapping(value = "/{id}")
    public ResponseEntity<ANC> getANCById(@PathVariable("id") Long id) {
        return ResponseEntity.ok (ancService.getExistingANC(id));
    }

    @GetMapping(value = "/get-anc-by-ancno/{ancNo}")
    public ResponseEntity<ANC> getANCByAncNo(@PathVariable("ancNo") String ancNo) {
        return ResponseEntity.ok (ancService.getExistANCByANDId(ancNo));
    }

    @PutMapping(value = "/edit-anc{ancDto}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ANCDto> updateAND(@RequestBody ANCDto ancDto) {
        return ResponseEntity.ok (ancService.updateANC(ancDto));
    }

}
