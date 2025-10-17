package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                    // ← Generates getters, setters, toString, equals, hashCode
@Builder                 // ← Enables builder pattern for object creation
@NoArgsConstructor       // ← Creates empty constructor: new HivRetestStatusResponse()
@AllArgsConstructor      // ← Creates constructor with all fields
public class HivRetestStatusResponse {

    private String status;              // "Seroconverted to HIV Positive" or "Remained HIV Negative"
    private String testResult;          // "reactive", "non-reactive", etc.
    private String testDate;            // "2025-10-15"
    private Boolean seroconverted;      // true if positive
    private Boolean remainedHivNegative; // true if negative
    private String message;             // Descriptive message
}