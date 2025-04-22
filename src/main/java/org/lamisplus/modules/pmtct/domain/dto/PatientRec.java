package org.lamisplus.modules.pmtct.domain.dto;

import java.time.LocalDate;
import com.fasterxml.jackson.databind.JsonNode;

public interface PatientRec {

    String getFullName();
    String getGender();
    int getAge();
    String getUuid();
    LocalDate getDateOfBirth();
    String getHospitalNumber();

}




