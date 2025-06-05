package org.lamisplus.modules.pmtct.domain.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterPatientResponseDTO {
       private String fullname;
       private String gender;
        private String dateOfBirth;
        private String   personUuid;
        private String   hivResult;
         private String   testingSetting;
//         private String   pregnancyStatus;
          private String   hospitalNumber;
          private  String  message;
            private boolean status;
            private boolean isOnPMTCT ;
             private boolean isOnANC;
}
