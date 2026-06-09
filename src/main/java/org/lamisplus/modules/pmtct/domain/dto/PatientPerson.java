package org.lamisplus.modules.pmtct.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;

public interface PatientPerson {
   String getFullName();
   String getSex();
   Integer getAge();
   String getUuid();
   Long getId();

   Long getPersonId();

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
   String getPatientUuid();
   String getAncNo();
   String getTbStatus();
   Long getPregnancyCount();

   // ANC-specific fields
   String getAncSetting();
   String getCommunitySetting();
   String getCurrentlyOnArt();
   String getDynamicHivStatus();
   LocalDate getDateOfEnrollment();
   Integer getGaweeks();
   Integer getGravida();
   LocalDate getLmp();
   Integer getParity();
   String getPreviouslyKnownHivStatus();
   String getReferredSyphilisTreatment();
   String getStaticHivStatus();
   String getPmtctCycleUuid();
   String getAncUuid();

}
