package org.lamisplus.modules.pmtct.domain.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "pmtct_infant_information",  schema = "public")
@Data
@NoArgsConstructor
public class Infant extends PMTCTTransactionalEntity implements Serializable, Persistable<Long> {
    private LocalDate dateOfDelivery;
    private String firstName;
    private String middleName;
    private String surname;
    private String sex;
    private String nin;
    private String infantOutcomeAt18_months;
    private LocalDate lastVisitDate;
    private LocalDate nextAppointmentDate;
    private Integer defaultDays;
    private String motherPersonUuid;
    private Long bodyWeight;
    private String ctxStatus;
   }