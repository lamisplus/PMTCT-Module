package org.lamisplus.modules.pmtct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.service.UserService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.pmtct.domain.dto.*;
import org.lamisplus.modules.pmtct.domain.entity.ANC;
import org.lamisplus.modules.pmtct.domain.entity.Delivery;
import org.lamisplus.modules.pmtct.repository.ANCRepository;
import org.lamisplus.modules.pmtct.repository.DeliveryRepository;
import org.lamisplus.modules.pmtct.repository.PmtctVisitRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService
{

    private final ANCRepository ancRepository;
    private final PersonRepository personRepository;
    private final PmtctVisitRepository pmtctVisitRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserService userService;
    ObjectMapper mapper = new ObjectMapper();

    public DeliveryResponseDto save(DeliveryRequestDto deliveryRequestDto) {
        return convertEntitytoRespondDto(converRequestDtotoEntity(deliveryRequestDto));
    }

    public Delivery converRequestDtotoEntity(DeliveryRequestDto deliveryRequestDto) {
        Delivery delivery = new Delivery();

        delivery.setAncNo(deliveryRequestDto.getAncNo());
        delivery.setDateOfDelivery(deliveryRequestDto.getDateOfDelivery());
        delivery.setBookingStatus(deliveryRequestDto.getBookingStatus());
        delivery.setGAWeeks(deliveryRequestDto.getGAWeeks());
        delivery.setRomDeliveryInterval(deliveryRequestDto.getRomDeliveryInterval());
        delivery.setModeOfDelivery(deliveryRequestDto.getModeOfDelivery());
        delivery.setEpisiotomy(deliveryRequestDto.getEpisiotomy());
        delivery.setVaginalTear(deliveryRequestDto.getVaginalTear());
        delivery.setFeedingDecision(deliveryRequestDto.getFeedingDecision());
        delivery.setMaternalOutcome(deliveryRequestDto.getMaternalOutcome());
        delivery.setChildGivenArvWithin72(deliveryRequestDto.getChildGivenArvWithin72());
        delivery.setChildStatus(deliveryRequestDto.getChildStatus());
        delivery.setHivExposedInfantGivenHbWithin24hrs(deliveryRequestDto.getHivExposedInfantGivenHbWithin24hrs());
        delivery.setDeliveryTime(deliveryRequestDto.getDeliveryTime());
        delivery.setOnArt(deliveryRequestDto.getOnArt());
        delivery.setArtStartedLdWard(deliveryRequestDto.getArtStartedLdWard());
        delivery.setHBStatus(deliveryRequestDto.getHBStatus());
        delivery.setHCStatus(deliveryRequestDto.getHCStatus());
        delivery.setReferalSource(deliveryRequestDto.getReferalSource());

        delivery.setUuid(UUID.randomUUID().toString());
        ANC anc = this.ancRepository.findByAncNoAndArchived(deliveryRequestDto.getAncNo(), Long.valueOf(0L));
        if (anc != null)
        {
            delivery.setHospitalNumber(anc.getHospitalNumber());
            delivery.setFacilityId(anc.getFacilityId()); }
        else { throw new RuntimeException("YET TO REGISTER FOR ANC"); }

        return (Delivery) this.deliveryRepository.save(delivery);
    }
    public DeliveryResponseDto convertEntitytoRespondDto(Delivery delivery) {
        DeliveryResponseDto deliveryResponseDto = new DeliveryResponseDto();
        deliveryResponseDto.setId(delivery.getId());
        deliveryResponseDto.setAncNo(delivery.getAncNo());
        deliveryResponseDto.setHospitalNumber(delivery.getHospitalNumber());
        deliveryResponseDto.setFullName(getFullName(delivery.getHospitalNumber()));
        deliveryResponseDto.setAge(calculateAge(delivery.getHospitalNumber()));
        deliveryResponseDto.setUuid(delivery.getUuid());
        deliveryResponseDto.setDateOfDelivery(delivery.getDateOfDelivery());
        deliveryResponseDto.setBookingStatus(delivery.getBookingStatus());
        deliveryResponseDto.setGAWeeks(delivery.getGAWeeks());
        deliveryResponseDto.setRomDeliveryInterval(delivery.getRomDeliveryInterval());
        deliveryResponseDto.setModeOfDelivery(delivery.getModeOfDelivery());
        deliveryResponseDto.setEpisiotomy(delivery.getEpisiotomy());
        deliveryResponseDto.setVaginalTear(delivery.getVaginalTear());
        deliveryResponseDto.setFeedingDecision(delivery.getFeedingDecision());
        deliveryResponseDto.setMaternalOutcome(delivery.getMaternalOutcome());
        deliveryResponseDto.setChildGivenArvWithin72(delivery.getChildGivenArvWithin72());
        deliveryResponseDto.setChildStatus(delivery.getChildStatus());
        deliveryResponseDto.setHivExposedInfantGivenHbWithin24hrs(delivery.getHivExposedInfantGivenHbWithin24hrs());
        deliveryResponseDto.setDeliveryTime(delivery.getDeliveryTime());
        deliveryResponseDto.setOnArt(delivery.getOnArt());
        deliveryResponseDto.setArtStartedLdWard(delivery.getArtStartedLdWard());
        deliveryResponseDto.setHBStatus(delivery.getHBStatus());
        deliveryResponseDto.setHCStatus(delivery.getHCStatus());
        deliveryResponseDto.setReferalSource(delivery.getReferalSource());
        deliveryResponseDto.setFacilityId(delivery.getFacilityId());


        return deliveryResponseDto;
    }

    private String getFullName(String uuid) {
        System.out.println("hostpitalNumber = " + uuid);
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = 0L;
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId,0);
        String fullName = "";
        if (persons.isPresent())
        { Person person = persons.get();
            String fn = person.getFirstName();
            String sn = person.getSurname();
            String on = person.getOtherName();
            if (fn == null) fn = "";
            if (sn == null) sn = "";
            if (on == null) on = "";
            fullName = sn + ", " + fn + " " + on; }
        else { fullName = ""; }
        return fullName;
    }
    public int calculateAge(String uuid) {
        System.out.println("hostpitalNumber = " + uuid);
        Optional<User> currentUser = this.userService.getUserWithRoles();
        User user = (User) currentUser.get();
        Long facilityId = 0L;
        Optional<Person> persons = this.personRepository.getPersonByUuidAndFacilityIdAndArchived(uuid, facilityId,0);
        int age = 0;
        System.out.println("HostpitalNumber in Age " + uuid);
        if (persons.isPresent()) {
            Person person = persons.get();
            LocalDate dob = person.getDateOfBirth();
            LocalDate curDate = LocalDate.now();
            if (dob != null && curDate != null) {
                age = Period.between(dob, curDate).getYears();
            } else {
                age = 0;
            }
        }
        System.out.println("Age " + age);
        return age;
    }
    public List<DeliveryResponseDto> getAllDeliveries() {
        List<Delivery> deliveryList = this.deliveryRepository.findAll();
        List<DeliveryResponseDto> deliveryResponseDtoList = new ArrayList<>();
        deliveryList.forEach(delivery -> deliveryResponseDtoList.add(convertEntitytoRespondDto(delivery)));
        return deliveryResponseDtoList;
    }

    @SneakyThrows
    public Delivery getSingleDelivery(Long id) {
        return this.deliveryRepository.findById(id)
                .orElseThrow(() -> new Exception("Delivery NOT FOUND"));
    }
}