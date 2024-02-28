 package org.lamisplus.modules.pmtct.domain.dto;

 import lombok.AllArgsConstructor;
 import lombok.Builder;
 import lombok.Data;
 import org.lamisplus.modules.patient.domain.dto.PersonDto;
 import org.lamisplus.modules.pmtct.domain.entity.InfantMotherArt;
 import org.lamisplus.modules.pmtct.domain.entity.enums.PmtctType;

 import java.io.Serializable;
 import java.time.LocalDate;

 @Data
 @AllArgsConstructor
 @Builder

 public class PMTCTEnrollmentRequestDto implements Serializable
 {
     private Long id;
     private String ancNo;
     private LocalDate pmtctEnrollmentDate;
     private Integer gravida;
     private Integer gAWeeks;
     private String entryPoint;
     private LocalDate artStartDate;
     private String artStartTime;
     private String tbStatus;
     private PersonDto personDto;
     private String pmtctType;
     private String personUuid;
     private String hivStatus;
     private LocalDate lmp;
     private String  motherArtInitiationTime;
     private Long regimenTypeId;
     private String regimenId;
 }

