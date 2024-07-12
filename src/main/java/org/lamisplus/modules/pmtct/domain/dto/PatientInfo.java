package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PatientInfo {
    String getFullName();
    String getSex();
    Integer getAge();
    String getUuid();
    Long getId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    LocalDate getDateOfBirth();
    String getHospitalNumber();
    String getAddress();
    String getContactPoint();
    String getNinNumber();
    String getEmrId();
    Long getFacilityId();
    Boolean getIsDateOfBirthEstimated();
    String getContact();
    LocalDate getDateOfRegistration();
    Boolean getDeceased();
    Boolean getActive();
    LocalDateTime getDeceasedDateTime();
    String getOrganization();
    String getGender();
    String getMaritalStatus();
    String getEmploymentStatus();
    String getIdentifier();
    String getEducation();

}
