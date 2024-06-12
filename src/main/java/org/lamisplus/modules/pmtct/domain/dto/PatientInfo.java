package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface PatientInfo {
    String getFullName();
    String getSex();
    int getAge();
    String getUuid();
    long getId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    LocalDate getDateOfBirth();
    String getHospitalNumber();
    String getAddress();
    String getContactPoint();
    String getNinNumber();
    String getEmrId();
    long getFacilityId();
    boolean getIsDateOfBirthEstimated();
    String getContact();
    LocalDate getDateOfRegistration();
    boolean getDeceased();
    boolean getActive();
    LocalDateTime getDeceasedDateTime();
    String getOrganization();
    String getGender();
    String getMaritalStatus();
    String getEmploymentStatus();
    String getIdentifier();
    String getEducation();

}
