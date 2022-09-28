package org.lamisplus.modules.pmtct.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;

import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.pmtct.domain.dto.ANCDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ANCService
{
    private final UserService userService;
    private final ANCRepository ancRepository;

    public void archivedANC(Long id) {
        ANC existingAnc = getExistingANC(id);
        existingAnc.setArchived(new Long(1));
        ancRepository.save(existingAnc);
    }


    public ANC getExistingANC(Long id) {
        return ancRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(ANC.class, "id", "" + id));
    }

    public ANC getExistANCByANDId(String ancNo) {
        ANC anc = ancRepository.findByAncNoAndArchived(ancNo, new Long(0));
        return anc;
    }

    private ANC convertANCDtoToANCEntity(ANCDto ancDto) {
        ANC anc = new ANC();

        BeanUtils.copyProperties(ancDto, anc);
        return anc;
    }

    private ANCDto convertANCEntityToANCDto(ANC anc) {
        ANCDto ancDto = new ANCDto();
        BeanUtils.copyProperties(anc, ancDto);
        return ancDto;
    }



    public ANC registerANC(ANC anc) {
        System.out.println("I am in service  ID 2  "+ anc.getId());
        Optional<User> currentUser = userService.getUserWithRoles();
        Long facilityId = 0L;
        if (currentUser.isPresent()) {
            log.info("currentUser: " + currentUser.get());
            User user = currentUser.get();
            facilityId = user.getCurrentOrganisationUnitId();
        }
        Long finalFacilityId = facilityId;
        String ancId = anc.getAncNo();
        if (ancId != null) {
            ANC existAnc = null;
            existAnc = getExistANCByANDId(ancId);
            if (existAnc != null)
                throw new RecordExistException(ANC.class, "id", "" + ancId);
        }
        anc.setUuid(UUID.randomUUID().toString());
        anc.setArchived(new Long(0));
        anc.setFacilityId(finalFacilityId);
        return  ancRepository.save(anc) ;
        //return ancSaved; //convertANCEntityToANCDto(ancRepository.save(anc));
    }


    public ANCDto updateANC(ANCDto ancDto) {
        ANC existAnc = this.getExistANCByANDId(ancDto.getAncNo());
        ANC anc = new ANC();
        if(existAnc != null) {
            anc = convertANCDtoToANCEntity(ancDto);
            anc.setId(ancDto.getId());
        }
        ANC updatedAnc = ancRepository.save(anc);
        return this.convertANCEntityToANCDto(updatedAnc);
    }

    public List<ANCDto> getANC() {
        return ancRepository.findByArchived(new Long(0))
                .stream()
                .map(this::convertANCEntityToANCDto)
                .collect(Collectors.toList());
    }
}
