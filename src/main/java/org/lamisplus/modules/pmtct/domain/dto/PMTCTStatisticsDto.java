package org.lamisplus.modules.pmtct.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PMTCTStatisticsDto {
    private Long totalPatients;
    private Long ancPatients;
    private Long pmtctPatients;
    private Long pmtctViralLoadNumerator;
    private Long pmtctViralLoadDenominator;
    private Double pmtctViralLoadUptakePercentage;

    // Viral Suppression
    private Long viralSuppressionNumerator;
    private Long viralSuppressionDenominator;
    private Double viralSuppressionPercentage;

    // Unsuppressed by quarters (Oct-Dec, Jan-Mar, Apr-Jun, Jul-Sep)
    private Long unsuppressedQ1; // Oct-Dec
    private Long unsuppressedQ2; // Jan-Mar
    private Long unsuppressedQ3; // Apr-Jun
    private Long unsuppressedQ4; // Jul-Sep
    private Long unsuppressedTotal;

    // PMTCT Exit Tracked - Mothers (from pmtct_pregnancy_cycle.maternal_outcome)
    private Long pmtctExitActiveInCohort;
    private Long pmtctExitTransferredOut;
    private Long pmtctExitTransferredToAnotherPMTCT;
    private Long pmtctExitTransitionedToART;
    private Long pmtctExitLostToFollowUp;
    private Long pmtctExitDead;
    private Long pmtctExitDenominator; // Total on PMTCT

    // Mothers LTFU
    private Long mothersLTFUNumerator;
    private Long mothersLTFUDenominator;
    private Double mothersLTFUPercentage;

    // Deliveries Recorded by quarters
    private Long deliveriesQ1; // Oct-Dec
    private Long deliveriesQ2; // Jan-Mar
    private Long deliveriesQ3; // Apr-Jun
    private Long deliveriesQ4; // Jul-Sep
    private Long deliveriesTotal;

    // HEI Linked by quarters (live births: child_alive - child_dead >= 1)
    private Long heiLinkedQ1; // Oct-Dec
    private Long heiLinkedQ2; // Jan-Mar
    private Long heiLinkedQ3; // Apr-Jun
    private Long heiLinkedQ4; // Jul-Sep
    private Long heiLinkedTotal;

    // Infant Testing Statistics
    private Long infantTested; // Number of HEI-exposed infants whose samples were taken for DNA-PCR or Rapid antibody tests
    private Long infantPositiveNumerator; // Number of infants with positive results
    private Long infantPositiveDenominator; // Total infants tested (same as infantTested)
    private Long infantNegativeNumerator; // Number of infants with negative results
    private Long infantNegativeDenominator; // Total infants tested (same as infantTested)

    // PMTCT Exit Tracked - Infants (Infant Outcome at 18 months from latest cycle)
    private Long infantExitHivPositive; // Infants with HIV-positive status at 18 months
    private Long infantExitHivNegative; // Infants with HIV-negative status at 18 months
    private Long infantExitHivUnknown; // Infants with HIV status unknown at 18 months
    private Long infantExitDenominator; // Total HEI exposed infants registered
}
