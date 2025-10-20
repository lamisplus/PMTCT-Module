package org.lamisplus.modules.pmtct.domain.dto;

import com.esotericsoftware.kryo.NotNull;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)


public class InfantDtoResponse {
    @NotNull
    private Infant infant;
    private InfantArv infantArv;
    private InfantPCRTest infantPCRTest;


}
