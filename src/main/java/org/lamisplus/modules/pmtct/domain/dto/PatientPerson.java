package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;

public interface PatientPerson {
   String getFullName();
   String getSex();
   int getAge();
   String getUuid();
   long getId();

   long getPersonId();

   String getFirstName();
   String getSurname();
   String getOtherName();
   LocalDate getDateOfBirth();
   String getHospitalNumber();
   String getAddress();
   String getContactPoint();
   String getEntryPoint();
   LocalDate getArtStartDate();
   String getHivStatus();
   String getPersonUuid();
   String getAncNo();
   String getTbStatus();

}
