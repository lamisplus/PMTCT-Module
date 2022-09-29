package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.ANCRespondDto;
import org.lamisplus.modules.pmtct.domain.dto.ANCRequestDto;
import org.lamisplus.modules.pmtct.domain.dto.PMTCTPersonDto;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.enums.ReferredSyphilisPositiveClient;
import org.lamisplus.modules.pmtct.domain.entity.enums.TestedForSyphilis;
import org.lamisplus.modules.pmtct.domain.entity.enums.TreatedForSyphilis;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ANCService {
    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final UserService userService;


    public ANCRespondDto save(ANCRequestDto ancdto) {
        return this.convertEntityToDto(this.ancRepository.save(convertDtoToEntity(ancdto)));
    }

    public ANC convertDtoToEntity(ANCRequestDto ancdto) {
        ANC anc = new ANC();
        BeanUtils.copyProperties(ancdto, anc);
        return anc;
    }

    public ANCRespondDto convertEntityToDto(ANC anc) {
        ANCRespondDto ancdto = new ANCRespondDto();
        BeanUtils.copyProperties(anc, ancdto);
        return ancdto;
    }


    public List<ANCRespondDto> getAllAnc() {
        List<ANC> ancList = this.ancRepository.findAll();
        List<ANCRespondDto> ancRespondDtoList = new ArrayList<>();
        ancList.forEach(anc -> {
            Optional<User> currentUser = userService.getUserWithRoles();
            Long facilityId = 0L;
            if (currentUser.isPresent()) {
                User user = currentUser.get();
                facilityId = user.getCurrentOrganisationUnitId();
            }
            Optional<Person> persons = this.personRepository.getPersonByHospitalNumberAndFacilityId(anc.getHospitalNumber(), facilityId);
            Person person = new Person();
            if (persons.isPresent()) {
                person = persons.get();
            }
            ancRespondDtoList.add(convertANCtoANCRespondDto(anc, person));
        });

    return  ancRespondDtoList;

    }

    public ANCRespondDto convertANCtoANCRespondDto(ANC anc, Person person)
    {
        ANCRespondDto ancRespondDto = new ANCRespondDto();
        ancRespondDto.setAncNo(anc.getAncNo());
        int age = this.calculateAge(person.getDateOfBirth());
        ancRespondDto.setAge(age);
        ancRespondDto.setDateRegistration(anc.getDateRegistration());
        ancRespondDto.setHospitalNumber(person.getHospitalNumber());
        ancRespondDto.setDescriptiveAddress(person.getAddress());
        ancRespondDto.setId(anc.getId());
        ancRespondDto.setUuid(anc.getUuid());
        ancRespondDto.setSurname(person.getSurname());
        ancRespondDto.setOtherNames(person.getFirstName());
        ancRespondDto.setContactPoin(person.getContactPoint());
        ancRespondDto.setLMP(anc.getLMP());
        ancRespondDto.setGAWeeks(anc.getGAWeeks());
        ancRespondDto.setGravida(anc.getGravida());
        ancRespondDto.setParity(anc.getParity());
        ancRespondDto.setSourceOfReferral(anc.getSourceOfReferral());
        ancRespondDto.setTestedForSyphilis(anc.getTestedForSyphilis());
        ancRespondDto.setTreatedForSyphilis(anc.getTreatedForSyphilis());
        ancRespondDto.setReferredSyphilisPositiveClient(anc.getReferredSyphilisPositiveClient());
        ancRespondDto.setSyphilisTestResult(anc.getSyphilisTestResult());
        return ancRespondDto;

    }

    @SneakyThrows
    public ANC getSingleAnc(Long id) {
        return this.ancRepository.findById(id)
                .orElseThrow(() -> new Exception("ANC NOT FOUND"));

    }

    public int calculateAge(LocalDate dob) {
        LocalDate curDate = LocalDate.now();
        if ((dob != null) && (curDate != null)) {
            return Period.between(dob, curDate).getYears();
        } else {
            return 0;
        }
    }

    public List<PMTCTPersonDto> getAllPMTCTPerson() {
        List<Person> personList = this.personRepository.findAll();
        List<PMTCTPersonDto> pmtctPersonDtosList = new ArrayList<>();
        personList.forEach(person -> {
            int age = this.calculateAge(person.getDateOfBirth());
            String sex = person.getSex();
            Integer archive = person.getArchived();

            if ((age >= 10) && (sex.contains("F")) && (archive == 0)) {
                PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
                pmtctPersonDto.setAge(age);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                pmtctPersonDto.setSurname(person.getSurname());
                pmtctPersonDto.setContactPoint(person.getContactPoint());
                pmtctPersonDtosList.add(pmtctPersonDto);
            }
        });
        return pmtctPersonDtosList;
    }

    public PMTCTPersonDto getPMTCTPersonByHospitalNumber(String hospitalNumber) {
        Optional<User> currentUser = userService.getUserWithRoles();
        Long facilityId = 0L;
        if (currentUser.isPresent()) {
            User user = currentUser.get();
            facilityId = user.getCurrentOrganisationUnitId();
        }
        Long finalFacilityId = facilityId;
        Optional<Person> persons = this.personRepository.getPersonByHospitalNumberAndFacilityId(hospitalNumber, facilityId);
        PMTCTPersonDto pmtctPersonDto = new PMTCTPersonDto();
        if (persons.isPresent()) {
            Person person = persons.get();
            int age = this.calculateAge(person.getDateOfBirth());
            String sex = person.getSex();
            Integer archive = person.getArchived();

            if ((age >= 10) && (sex.contains("F")) && (archive == 0)) {
                pmtctPersonDto.setAge(age);
                pmtctPersonDto.setDescriptiveAddress(person.getAddress());
                pmtctPersonDto.setHospitalNumber(person.getHospitalNumber());
                pmtctPersonDto.setOtherNames(person.getOtherName());
                pmtctPersonDto.setSurname(person.getSurname());
                pmtctPersonDto.setContactPoint(person.getContactPoint());

            }
        }
        return pmtctPersonDto;
    }
}
