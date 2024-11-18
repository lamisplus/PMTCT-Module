package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class PMTCTEnrollmentWithPersonRespondDto implements Serializable {
    private Long id;
    private String ancNo;
    private LocalDate pmtctEnrollmentDate;
    private Integer gravida;
    private Integer gAWeeks;
    private String entryPoint;
    private LocalDate artStartDate;
    private String artStartTime;
    private String tbStatus;
    private String hospitalNumber;
    private String fullName;
    private int age;
    private String uuid;
    private String fullname;
    private String person_uuid;
    private Object address;
    private  Object contactPoint;
    private LocalDate dateOfBirth;
    private String sex;
    private Long personId;
    private String hivStatus;
    private boolean pmtctRegStatus;
    private String dateOfDelivery;

}
