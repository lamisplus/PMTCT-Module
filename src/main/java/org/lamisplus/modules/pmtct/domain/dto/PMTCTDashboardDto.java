package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PMTCTDashboardDto {
    // Mother Statistics
    private MotherStatistics motherStatistics;

    // Key PMTCT Indicators
    private PMTCTIndicators pmtctIndicators;

    // Infant Statistics
    private InfantStatistics infantStatistics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MotherStatistics {
        private Long totalMothersEnrolled;
        private Long activeOnPMTCT;
        private Long mothersOnART;
        private Long mothersWithViralLoad;
        private Long viralLoadSuppressed;
        private Long mothersDelivered;
        private Long pendingDelivery;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PMTCTIndicators {
        private Long totalPregnancyCycles;
        private Long activePregnancyCycles;
        private Long closedPregnancyCycles;
        private Long totalANCVisits;
        private Long totalMotherVisits;
        private Long mothersLostToFollowUp;
        private Long mothersTransferredOut;
        private Long mothersDeceased;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InfantStatistics {
        private Long totalInfantsRegistered;
        private Long infantsAlive;
        private Long infantsOnARV;
        private Long infantsWithPCRTest;
        private Long infantsPCRPositive;
        private Long infantsPCRNegative;
        private Long infantsWithRapidTest;
        private Long infantsDeceased;
    }
}
