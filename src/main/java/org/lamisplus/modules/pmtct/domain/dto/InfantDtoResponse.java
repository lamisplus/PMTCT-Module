package org.lamisplus.modules.pmtct.domain.dto;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import lombok.Builder;
import lombok.Data;
import org.lamisplus.modules.pmtct.domain.entity.Infant;
import org.lamisplus.modules.pmtct.domain.entity.InfantArv;
import org.lamisplus.modules.pmtct.domain.entity.InfantPCRTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Data
@Builder
public class InfantDtoResponse {
    private Infant infant;
    private InfantArv infantArv;
    private InfantPCRTest infantPCRTest;


}
