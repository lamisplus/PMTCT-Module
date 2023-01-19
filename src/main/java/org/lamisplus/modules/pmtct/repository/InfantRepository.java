package org.lamisplus.modules.pmtct.repository;


import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InfantRepository extends CommonJpaRepository<Infant, Long> {
    List<Infant> findInfantByAncNo (String ancNo);

    Optional<Infant> findInfantByHospitalNumber(String hospitalNumber);

    @Query(
            value = "SELECT * FROM pmtct_infant_information pi WHERE pi.facility_id=?1 AND (EXTRACT (YEAR FROM now()) - EXTRACT(YEAR FROM pi.date_of_delivery) < 10 ) ORDER BY pi.id desc",
            nativeQuery = true
    )
    Page<Infant> getInfant(Long facilityId, Pageable pageable);

}
