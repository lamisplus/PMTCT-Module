package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;

// Response shape for the HIV-Exposed Infant grid — deliberately its own, minimal projection
// rather than reusing the shared PatientPerson interface, which carries ~30 ANC/PMTCT-specific
// fields that don't apply here and were always coming back null.
public interface HivExposedInfantCandidateDto {
    Long getId();
    String getUuid();
    String getPatientUuid();
    Long getPersonId();
    String getFullName();
    String getFirstName();
    String getSurname();
    String getHospitalNumber();
    String getSex();
    LocalDate getDateOfBirth();
    LocalDate getDateOfEnrollment();
    String getHivStatus();
}
