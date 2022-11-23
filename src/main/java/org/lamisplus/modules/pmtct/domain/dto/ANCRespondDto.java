package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.patient.domain.dto.AddressDto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class ANCRespondDto implements Serializable {
    private Long id;
    private String hospitalNumber;
    private String ancNo;
    private String fullname;
    private String ancUuid;
    private Integer age;
    private LocalDate firstAncDate;
    private Integer gravida;
    private Integer parity;
    private LocalDate LMP;
    private LocalDate expectedDeliveryDate;
    private Integer gAWeeks;
    private String hivDiognosicTime;
    private Object syphilisInfo;
    private Object pmtctHtsInfo;
    private Object partnerNotification;
    private String person_uuid;
    private Object address;
    private String hivStatus;
    private boolean pmtctRegStatus;
    private PMTCTEnrollmentRespondDto pmtctEnrollmentRespondDto;

}