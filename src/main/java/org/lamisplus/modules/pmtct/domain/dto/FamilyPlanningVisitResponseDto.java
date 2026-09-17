package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class FamilyPlanningVisitResponseDto implements Serializable {
    private String id;
    private String uuid;
    private String patientUuid;
    private String pmtctCycleUuid;
    private LocalDate visitDate;

    // Header (read-only, resolved server-side from the client's patient/PMTCT/HIV records)
    private String facilityName;
    private String state;
    private String lga;
    private String reportingMonthYear;
    private String fullName;
    private String hospitalNumber;
    private String uniqueId;
    private String ancNo;
    private String address;
    private String telephone;
    private String sex;
    private LocalDate dateOfBirth;
    private Integer age;

    private Double weight;
    private String bloodPressure;
    private Integer parity;

    private String counselledOnFp;
    private String counselledOnPpfp;
    private String firstTimeModernFpUser;
    private Boolean emergencyContraception;
    private String typeOfFpClient;
    private String sourceOfReferral;

    private String methodsProvided;
    private String referredOut;

    private OralPillsDto oralPillsData;
    private InjectableDto injectableData;
    private IudDto iudData;
    private CondomDto condomData;
    private ImplantDto implantData;
    private SterilizationDto sterilizationData;
    private NaturalMethodsDto naturalMethodsData;

    private String source;
}
