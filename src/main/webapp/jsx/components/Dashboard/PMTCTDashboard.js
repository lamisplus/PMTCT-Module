import React, { useState, useEffect, Fragment } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { url as baseUrl } from "../../../api";
import { token } from "../../../api";
import Button from "@material-ui/core/Button";
import { FaChartLine } from "react-icons/fa";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PMTCTDashboard = ({ onNavigateToMenu }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Card styling to match Core module
  const cardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e6e6e6",
    borderRadius: "1.25rem",
    boxShadow: "0px 2px 10px 0px rgba(82,63,105,0.15)",
    marginBottom: "1.875rem",
  };

  const cardHeaderStyle = {
    backgroundColor: "transparent",
    borderBottom: "1px solid #f0f1f5",
    padding: "1.25rem 1.875rem",
  };

  const [statistics, setStatistics] = useState({
    totalPatients: 0,
    ancPatients: 0,
    pmtctPatients: 0,
    pmtctViralLoadNumerator: 0,
    pmtctViralLoadDenominator: 0,
    pmtctViralLoadUptakePercentage: 0,
    viralSuppressionNumerator: 0,
    viralSuppressionDenominator: 0,
    viralSuppressionPercentage: 0,
    unsuppressedQ1: 0,
    unsuppressedQ2: 0,
    unsuppressedQ3: 0,
    unsuppressedQ4: 0,
    unsuppressedTotal: 0,
    // PMTCT Exit Tracked - Mothers
    pmtctExitActiveInCohort: 0,
    pmtctExitTransferredOut: 0,
    pmtctExitTransferredToAnotherPMTCT: 0,
    pmtctExitTransitionedToART: 0,
    pmtctExitLostToFollowUp: 0,
    pmtctExitDead: 0,
    pmtctExitDenominator: 0,
    // Mothers LTFU
    mothersLTFUNumerator: 0,
    mothersLTFUDenominator: 0,
    mothersLTFUPercentage: 0,
    // Deliveries Recorded
    deliveriesQ1: 0,
    deliveriesQ2: 0,
    deliveriesQ3: 0,
    deliveriesQ4: 0,
    deliveriesTotal: 0,
    // HEI Linked
    heiLinkedQ1: 0,
    heiLinkedQ2: 0,
    heiLinkedQ3: 0,
    heiLinkedQ4: 0,
    heiLinkedTotal: 0,
    // Infant Testing Statistics
    infantTested: 0,
    infantPositiveNumerator: 0,
    infantPositiveDenominator: 0,
    infantNegativeNumerator: 0,
    infantNegativeDenominator: 0,
    // PMTCT Exit Tracked - Infants
    infantExitHivPositive: 0,
    infantExitHivNegative: 0,
    infantExitHivUnknown: 0,
    infantExitDenominator: 0,
    // Key PMTCT Indicators
    totalPregnancyCycles: 0,
    activePregnancyCycles: 0,
    closedPregnancyCycles: 0,
    totalANCVisits: 0,
    totalMotherVisits: 0,
    // Infant Information Summary
    totalInfantsRegistered: 0,
    infantsAlive: 0,
    infantsOnARV: 0,
    infantsWithPCRTest: 0,
    infantsPCRPositive: 0,
    infantsPCRNegative: 0,
    infantsWithRapidTest: 0,
    infantsDeceased: 0,
  });

  const [dashboardData, setDashboardData] = useState({
    motherStatistics: {
      totalFemalePatients: 0,
      totalANCPatients: 0,
      totalPMTCTPatients: 0,
      totalMothersEnrolled: 0,
      activeOnPMTCT: 0,
      mothersOnART: 0,
      mothersWithViralLoad: 0,
      viralLoadSuppressed: 0,
      mothersDelivered: 0,
      pendingDelivery: 0,
    },
    pmtctIndicators: {
      totalPregnancyCycles: 0,
      activePregnancyCycles: 0,
      closedPregnancyCycles: 0,
      totalANCVisits: 0,
      totalMotherVisits: 0,
      mothersLostToFollowUp: 0,
      mothersTransferredOut: 0,
      mothersDeceased: 0,
    },
    infantStatistics: {
      totalInfantsRegistered: 0,
      infantsAlive: 0,
      infantsOnARV: 0,
      infantsWithPCRTest: 0,
      infantsPCRPositive: 0,
      infantsPCRNegative: 0,
      infantsWithRapidTest: 0,
      infantsDeceased: 0,
    },
    viralLoadMetrics: {
      mothersOnARTWithVL: 0,
      mothersOnARTTotal: 0,
      viralLoadUptakePercentage: 0,
      suppressedCount: 0,
      suppressionPercentage: 0,
      unsuppressedByQuarter: [],
    },
    motherExitMetrics: {
      activeInPMTCT: 0,
      transferredOut: 0,
      transferredToAnotherPMTCT: 0,
      transitionedToART: 0,
      lostToFollowUp: 0,
      dead: 0,
      totalOnPMTCT: 0,
    },
    deliveryMetrics: {
      deliveriesByQuarter: [],
      totalDeliveries: 0,
    },
    infantMetrics: {
      infantsTested: 0,
      totalInfantsRegistered: 0,
      heiLinkedByQuarter: [],
      positiveInfants: 0,
      negativeInfants: 0,
      infantsOnART: 0,
      exitTracking: {
        hivPositive: 0,
        hivNegative: 0,
        hivUnknown: 0,
      },
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics from the endpoint
      const statisticsResponse = await axios.get(`${baseUrl}pmtct/anc/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Set statistics from the endpoint
      if (statisticsResponse.data) {
        const data = statisticsResponse.data;
        setStatistics(data);

        // Map statistics to dashboardData so all widgets display correctly
        setDashboardData((prev) => ({
          ...prev,
          motherStatistics: {
            ...prev.motherStatistics,
            totalFemalePatients: data.totalPatients || 0,
            totalANCPatients: data.ancPatients || 0,
            totalPMTCTPatients: data.pmtctPatients || 0,
          },
          pmtctIndicators: {
            totalPregnancyCycles: data.totalPregnancyCycles || 0,
            activePregnancyCycles: data.activePregnancyCycles || 0,
            closedPregnancyCycles: data.closedPregnancyCycles || 0,
            totalANCVisits: data.totalANCVisits || 0,
            totalMotherVisits: data.totalMotherVisits || 0,
            mothersLostToFollowUp: data.pmtctExitLostToFollowUp || 0,
            mothersTransferredOut: data.pmtctExitTransferredOut || 0,
            mothersDeceased: data.pmtctExitDead || 0,
          },
          infantStatistics: {
            totalInfantsRegistered: data.totalInfantsRegistered || 0,
            infantsAlive: data.infantsAlive || 0,
            infantsOnARV: data.infantsOnARV || 0,
            infantsWithPCRTest: data.infantsWithPCRTest || 0,
            infantsPCRPositive: data.infantsPCRPositive || 0,
            infantsPCRNegative: data.infantsPCRNegative || 0,
            infantsWithRapidTest: data.infantsWithRapidTest || 0,
            infantsDeceased: data.infantsDeceased || 0,
          },
          infantMetrics: {
            ...prev.infantMetrics,
            infantsTested: data.infantTested || 0,
            totalInfantsRegistered: data.totalInfantsRegistered || 0,
            positiveInfants: data.infantPositiveNumerator || 0,
            negativeInfants: data.infantNegativeNumerator || 0,
            infantsOnART: data.infantsOnARV || 0,
            exitTracking: {
              hivPositive: data.infantExitHivPositive || 0,
              hivNegative: data.infantExitHivNegative || 0,
              hivUnknown: data.infantExitHivUnknown || 0,
            },
          },
        }));
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  const calculateMotherStatistics = (allFemalesData, ancData, pmtctData) => {
    // Total female patients >= 5 years (already filtered by backend query)
    const totalFemalePatients = allFemalesData.length;

    // Total ANC Patients (with ANC enrollment date not blank)
    const totalANCPatients = ancData.filter(
      (patient) =>
        patient.ancEnrollmentDate != null && patient.ancEnrollmentDate !== ""
    ).length;

    // Total PMTCT Patients (HIV positive pregnant women with PMTCT enrollment date not blank)
    const totalPMTCTPatients = pmtctData.filter(
      (patient) =>
        patient.pmtctEnrollmentDate != null &&
        patient.pmtctEnrollmentDate !== ""
    ).length;

    const totalMothersEnrolled = pmtctData.length;
    const activeOnPMTCT = pmtctData.filter(
      (m) =>
        m.currentStatus === "Active on PMTCT" || m.currentStatus === "Active"
    ).length;

    return {
      totalFemalePatients,
      totalANCPatients,
      totalPMTCTPatients,
      totalMothersEnrolled,
      activeOnPMTCT,
      mothersOnART: 0,
      mothersWithViralLoad: 0,
      viralLoadSuppressed: 0,
      mothersDelivered: 0,
      pendingDelivery: 0,
    };
  };

  const calculateViralLoadMetrics = (pmtctData) => {
    // Filter mothers on ART
    const mothersOnART = pmtctData.filter(
      (m) =>
        m.artStartDate != null &&
        m.artStartDate !== "" &&
        m.pmtctEnrollmentDate != null
    );

    const mothersOnARTTotal = mothersOnART.length;

    // Filter mothers with viral load result documented in current pregnancy
    // VL date >= PMTCT enrollment date
    const mothersOnARTWithVL = mothersOnART.filter((m) => {
      if (!m.viralLoadDate || !m.pmtctEnrollmentDate) return false;
      const vlDate = new Date(m.viralLoadDate);
      const pmtctDate = new Date(m.pmtctEnrollmentDate);
      return vlDate >= pmtctDate;
    });

    const mothersOnARTWithVLCount = mothersOnARTWithVL.length;

    // Calculate viral load uptake percentage
    const viralLoadUptakePercentage =
      mothersOnARTTotal > 0
        ? ((mothersOnARTWithVLCount / mothersOnARTTotal) * 100).toFixed(1)
        : 0;

    // Filter suppressed (<1000 c/ml)
    const suppressedCount = mothersOnARTWithVL.filter((m) => {
      const vlResult = parseFloat(m.viralLoadResult);
      return !isNaN(vlResult) && vlResult < 1000;
    }).length;

    // Calculate suppression percentage
    const suppressionPercentage =
      mothersOnARTWithVLCount > 0
        ? ((suppressedCount / mothersOnARTWithVLCount) * 100).toFixed(1)
        : 0;

    // Calculate unsuppressed by quarter
    const unsuppressedByQuarter = calculateByQuarter(
      mothersOnARTWithVL,
      (m) => {
        const vlResult = parseFloat(m.viralLoadResult);
        return !isNaN(vlResult) && vlResult >= 1000;
      },
      "viralLoadDate"
    );

    return {
      mothersOnARTWithVL: mothersOnARTWithVLCount,
      mothersOnARTTotal,
      viralLoadUptakePercentage: parseFloat(viralLoadUptakePercentage),
      suppressedCount,
      suppressionPercentage: parseFloat(suppressionPercentage),
      unsuppressedByQuarter,
    };
  };

  // Helper function to calculate data by quarter
  const calculateByQuarter = (data, filterFn, dateField) => {
    const currentYear = new Date().getFullYear();
    const quarters = [
      {
        label: `Q1 ${currentYear}`,
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 2, 31),
      },
      {
        label: `Q2 ${currentYear}`,
        start: new Date(currentYear, 3, 1),
        end: new Date(currentYear, 5, 30),
      },
      {
        label: `Q3 ${currentYear}`,
        start: new Date(currentYear, 6, 1),
        end: new Date(currentYear, 8, 30),
      },
      {
        label: `Q4 ${currentYear}`,
        start: new Date(currentYear, 9, 1),
        end: new Date(currentYear, 11, 31),
      },
    ];

    return quarters.map((quarter) => {
      const count = data.filter((item) => {
        if (!item[dateField]) return false;
        const date = new Date(item[dateField]);
        const meetsFilter = filterFn ? filterFn(item) : true;
        return date >= quarter.start && date <= quarter.end && meetsFilter;
      }).length;

      return { quarter: quarter.label, count };
    });
  };

  const calculateMotherExitMetrics = (pmtctData) => {
    // PMTCT Enrollment > 24 months
    const now = new Date();
    const twentyFourMonthsAgo = new Date(now.setMonth(now.getMonth() - 24));

    const eligibleMothers = pmtctData.filter((m) => {
      if (!m.pmtctEnrollmentDate) return false;
      const enrollmentDate = new Date(m.pmtctEnrollmentDate);
      return enrollmentDate <= twentyFourMonthsAgo;
    });

    const activeInPMTCT = eligibleMothers.filter(
      (m) =>
        m.currentStatus === "Active on PMTCT" || m.currentStatus === "Active"
    ).length;

    const transferredOut = eligibleMothers.filter(
      (m) => m.currentStatus === "Transferred Out"
    ).length;

    const transferredToAnotherPMTCT = eligibleMothers.filter(
      (m) => m.currentStatus === "Transferred to another PMTCT"
    ).length;

    const transitionedToART = eligibleMothers.filter(
      (m) => m.currentStatus === "Transitioned to ART clinic"
    ).length;

    const lostToFollowUp = eligibleMothers.filter(
      (m) =>
        m.currentStatus === "Lost to follow-up" || m.currentStatus === "LTFU"
    ).length;

    const dead = eligibleMothers.filter(
      (m) => m.currentStatus === "Dead" || m.currentStatus === "Deceased"
    ).length;

    return {
      activeInPMTCT,
      transferredOut,
      transferredToAnotherPMTCT,
      transitionedToART,
      lostToFollowUp,
      dead,
      totalOnPMTCT: pmtctData.length,
    };
  };

  const calculateDeliveryMetrics = (pmtctData) => {
    // Filter deliveries where delivery date is not blank
    const deliveries = pmtctData.filter(
      (m) => m.deliveryDate != null && m.deliveryDate !== ""
    );

    const deliveriesByQuarter = calculateByQuarter(
      deliveries,
      null,
      "deliveryDate"
    );

    return {
      deliveriesByQuarter,
      totalDeliveries: deliveries.length,
    };
  };

  const calculateInfantMetrics = (infantsData) => {
    // Infants with hospital ID (registered)
    const registeredInfants = infantsData.filter(
      (infant) => infant.hospitalNumber != null && infant.hospitalNumber !== ""
    );

    // Infants tested (with PCR or Rapid test)
    const infantsTested = registeredInfants.filter(
      (infant) =>
        (infant.pcrTestDate != null && infant.pcrTestDate !== "") ||
        (infant.rapidTestDate != null && infant.rapidTestDate !== "")
    ).length;

    // HEI Linked (alive infants)
    const aliveInfants = infantsData.filter((infant) => {
      // Number of child alive - Number of child dead >= 1
      return (
        infant.infantOutcomeAt18_months !== "Died" &&
        infant.infantOutcomeAt18_months !== "Death" &&
        infant.infantOutcomeAt18_months !== "Dead"
      );
    });

    const heiLinkedByQuarter = calculateByQuarter(
      aliveInfants,
      null,
      "dateOfDelivery"
    );

    // Positive and Negative infants
    const positiveInfants = registeredInfants.filter(
      (infant) =>
        infant.pcrTestResult === "Positive" ||
        infant.rapidTestResult === "Positive"
    ).length;

    const negativeInfants = registeredInfants.filter(
      (infant) =>
        infant.pcrTestResult === "Negative" ||
        infant.rapidTestResult === "Negative"
    ).length;

    // Infants on ART
    const infantsOnART = registeredInfants.filter(
      (infant) => infant.arvStartDate != null && infant.arvStartDate !== ""
    ).length;

    // Exit tracking
    const hivPositive = infantsData.filter(
      (infant) => infant.infantOutcomeAt18_months === "HIV-positive"
    ).length;

    const hivNegative = infantsData.filter(
      (infant) => infant.infantOutcomeAt18_months === "HIV-negative"
    ).length;

    const hivUnknown = infantsData.filter(
      (infant) => infant.infantOutcomeAt18_months === "HIV status unknown"
    ).length;

    return {
      infantsTested,
      totalInfantsRegistered: registeredInfants.length,
      heiLinkedByQuarter,
      positiveInfants,
      negativeInfants,
      infantsOnART,
      exitTracking: {
        hivPositive,
        hivNegative,
        hivUnknown,
      },
    };
  };

  const calculatePMTCTIndicators = (data) => {
    return {
      totalPregnancyCycles: data.length,
      activePregnancyCycles: data.filter(
        (m) =>
          m.currentStatus === "Active on PMTCT" || m.currentStatus === "Active"
      ).length,
      closedPregnancyCycles: data.filter(
        (m) =>
          m.currentStatus !== "Active on PMTCT" && m.currentStatus !== "Active"
      ).length,
      totalANCVisits: 0,
      totalMotherVisits: 0,
      mothersLostToFollowUp: 0,
      mothersTransferredOut: 0,
      mothersDeceased: 0,
    };
  };

  const calculateInfantStatistics = (data) => {
    const totalInfantsRegistered = data.length;
    const infantsAlive = data.filter(
      (i) =>
        i.infantOutcomeAt18_months !== "Died" &&
        i.infantOutcomeAt18_months !== "Death"
    ).length;

    return {
      totalInfantsRegistered,
      infantsAlive,
      infantsOnARV: 0,
      infantsWithPCRTest: 0,
      infantsPCRPositive: 0,
      infantsPCRNegative: 0,
      infantsWithRapidTest: 0,
      infantsDeceased: data.filter(
        (i) =>
          i.infantOutcomeAt18_months === "Died" ||
          i.infantOutcomeAt18_months === "Death"
      ).length,
    };
  };

  const StatWidget = ({ icon, label, value, color }) => (
    <div className="col-xl-3 col-xxl-3 col-lg-4 col-md-6 col-sm-6">
      <div className="card" style={cardStyle}>
        <div
          className="card-header border-1 pb-0"
          style={{
            backgroundColor: "transparent",
            borderBottom: "none",
            padding: "1.25rem 1.875rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            className="chart-num font-w800 mb-0"
            style={{ fontSize: "38px", margin: 0 }}
          >
            {value}
          </h2>
          <span>
            <i className={`${icon} fa-4x text-${color}`}></i>
          </span>
        </div>
        <div
          className="card-body pt-0 chart-body-wrapper"
          style={{ paddingBottom: "1.25rem" }}
        >
          <h4 className="text-black font-w400 mb-0" style={{ margin: "1rem" }}>
            {label}
          </h4>
        </div>
      </div>
    </div>
  );

  // Pie chart for PMTCT Viral Load Uptake
  const getViralLoadUptakeChartOptions = () => {
    const numerator = statistics.pmtctViralLoadNumerator || 0;
    const denominator = statistics.pmtctViralLoadDenominator || 0;
    const withoutVL = denominator - numerator;

    return {
      chart: {
        type: "pie",
      },
      title: {
        text: "PMTCT Viral Load Uptake",
      },
      subtitle: {
        text: `${statistics.pmtctViralLoadUptakePercentage || 0}% (${numerator}/${denominator})`,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f}%",
          },
        },
      },
      series: [
        {
          name: "Mothers",
          colorByPoint: true,
          data: [
            {
              name: "With Viral Load",
              y: numerator,
              color: "#28a745",
            },
            {
              name: "Without Viral Load",
              y: withoutVL > 0 ? withoutVL : 0,
              color: "#dc3545",
            },
          ],
        },
      ],
      credits: {
        enabled: false,
      },
    };
  };

  // Pie chart for Viral Suppression
  const getViralSuppressionChartOptions = () => {
    const numerator = statistics.viralSuppressionNumerator || 0;
    const denominator = statistics.viralSuppressionDenominator || 0;
    const notSuppressed = denominator - numerator;

    return {
      chart: {
        type: "pie",
      },
      title: {
        text: "Viral Suppression",
      },
      subtitle: {
        text: `${statistics.viralSuppressionPercentage || 0}% (${numerator}/${denominator})`,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f}%",
          },
        },
      },
      series: [
        {
          name: "Mothers",
          colorByPoint: true,
          data: [
            {
              name: "Suppressed (<1000 c/ml)",
              y: numerator,
              color: "#28a745",
            },
            {
              name: "Not Suppressed (>=1000 c/ml)",
              y: notSuppressed > 0 ? notSuppressed : 0,
              color: "#ffc107",
            },
          ],
        },
      ],
      credits: {
        enabled: false,
      },
    };
  };

  // Bar chart for Unsuppressed (by quarters)
  const getUnsuppressedChartOptions = () => {
    const categories = ["Q1 (Oct-Dec)", "Q2 (Jan-Mar)", "Q3 (Apr-Jun)", "Q4 (Jul-Sep)"];
    const data = [
      statistics.unsuppressedQ1 || 0,
      statistics.unsuppressedQ2 || 0,
      statistics.unsuppressedQ3 || 0,
      statistics.unsuppressedQ4 || 0,
    ];

    return {
      chart: { type: "column" },
      title: { text: "Unsuppressed" },
      subtitle: { text: `Total: ${statistics.unsuppressedTotal || 0}` },
      xAxis: { categories, title: { text: "Quarter" } },
      yAxis: { title: { text: "Count" }, allowDecimals: false },
      series: [{ name: "Unsuppressed (>=1000 c/ml)", data, color: "#dc3545" }],
      credits: { enabled: false },
    };
  };

  // Bar chart for PMTCT Exit Tracked - Mothers
  const getMotherExitChartOptions = () => {
    const categories = [
      "Active in PMTCT",
      "Transferred Out",
      "To Another PMTCT",
      "Transitioned to ART",
      "Lost to Follow-up",
      "Dead"
    ];
    const data = [
      statistics.pmtctExitActiveInCohort || 0,
      statistics.pmtctExitTransferredOut || 0,
      statistics.pmtctExitTransferredToAnotherPMTCT || 0,
      statistics.pmtctExitTransitionedToART || 0,
      statistics.pmtctExitLostToFollowUp || 0,
      statistics.pmtctExitDead || 0,
    ];

    return {
      chart: { type: "column" },
      title: { text: "PMTCT Exit Tracked - Mothers" },
      subtitle: { text: `Total on PMTCT (>24 months): ${statistics.pmtctExitDenominator || 0}` },
      xAxis: { categories, title: { text: "Exit Status" } },
      yAxis: { title: { text: "Count" }, allowDecimals: false },
      plotOptions: {
        column: {
          colorByPoint: true,
          colors: ["#28a745", "#17a2b8", "#007bff", "#6c757d", "#ffc107", "#dc3545"],
        },
      },
      series: [{ name: "Mothers", data, showInLegend: false }],
      credits: { enabled: false },
    };
  };

  // Bar chart for Deliveries Recorded (by quarters)
  const getDeliveriesChartOptions = () => {
    const categories = ["Q1 (Oct-Dec)", "Q2 (Jan-Mar)", "Q3 (Apr-Jun)", "Q4 (Jul-Sep)"];
    const data = [
      statistics.deliveriesQ1 || 0,
      statistics.deliveriesQ2 || 0,
      statistics.deliveriesQ3 || 0,
      statistics.deliveriesQ4 || 0,
    ];

    return {
      chart: { type: "column" },
      title: { text: "Deliveries Recorded" },
      subtitle: { text: `Total: ${statistics.deliveriesTotal || 0}` },
      xAxis: { categories, title: { text: "Quarter" } },
      yAxis: { title: { text: "Count" }, allowDecimals: false },
      series: [{ name: "Deliveries", data, color: "#007bff" }],
      credits: { enabled: false },
    };
  };

  // Bar chart for HEI Linked (by quarters)
  const getHEILinkedChartOptions = () => {
    const categories = ["Q1 (Oct-Dec)", "Q2 (Jan-Mar)", "Q3 (Apr-Jun)", "Q4 (Jul-Sep)"];
    const data = [
      statistics.heiLinkedQ1 || 0,
      statistics.heiLinkedQ2 || 0,
      statistics.heiLinkedQ3 || 0,
      statistics.heiLinkedQ4 || 0,
    ];

    return {
      chart: { type: "column" },
      title: { text: "HEI Linked" },
      subtitle: { text: `Total: ${statistics.heiLinkedTotal || 0}` },
      xAxis: { categories, title: { text: "Quarter" } },
      yAxis: { title: { text: "Count" }, allowDecimals: false },
      series: [{ name: "HEI Linked to Mothers", data, color: "#28a745" }],
      credits: { enabled: false },
    };
  };

  // Stacked Bar Chart for Positive and Negative Infants
  const getInfantTestResultsChartOptions = () => {
    const positiveNumerator = statistics.infantPositiveNumerator || 0;
    const negativenumerator = statistics.infantNegativeNumerator || 0;
    const totalTested = statistics.infantTested || 0;

    const positivePercentage = totalTested > 0 ? ((positiveNumerator / totalTested) * 100).toFixed(1) : 0;
    const negativePercentage = totalTested > 0 ? ((negativenumerator / totalTested) * 100).toFixed(1) : 0;

    return {
      chart: { type: "bar" },
      title: { text: "Infant Test Results" },
      subtitle: { text: `Total Infants Tested: ${totalTested}` },
      xAxis: { categories: ["Test Results"] },
      yAxis: { title: { text: "Count" }, allowDecimals: false },
      plotOptions: { series: { stacking: "normal", dataLabels: { enabled: true } } },
      tooltip: {
        formatter: function() {
          const percentage = this.series.name === "Positive" ? positivePercentage : negativePercentage;
          return `<b>${this.series.name}</b>: ${this.y} (${percentage}%)`;
        }
      },
      series: [
        { name: "Positive", data: [positiveNumerator], color: "#dc3545" },
        { name: "Negative", data: [negativenumerator], color: "#28a745" },
      ],
      credits: { enabled: false },
    };
  };

  // Pie chart for PMTCT Exit Tracked - Infants
  const getInfantExitChartOptions = () => {
    const hivPositive = statistics.infantExitHivPositive || 0;
    const hivNegative = statistics.infantExitHivNegative || 0;
    const hivUnknown = statistics.infantExitHivUnknown || 0;
    const totalInfants = statistics.infantExitDenominator || 0;

    return {
      chart: { type: "pie" },
      title: { text: "PMTCT Exit Tracked - Infants (Outcome at 18 Months)" },
      subtitle: { text: `Total HEI Exposed Infants Registered: ${totalInfants}` },
      tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)" },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
          },
        },
      },
      series: [
        {
          name: "Infants",
          colorByPoint: true,
          data: [
            { name: "HIV-positive", y: hivPositive, color: "#dc3545" },
            { name: "HIV-negative", y: hivNegative, color: "#28a745" },
            { name: "HIV status unknown", y: hivUnknown, color: "#ffc107" },
          ],
        },
      ],
      credits: { enabled: false },
    };
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
        <Button
          variant="outlined"
          color="primary"
          onClick={fetchDashboardData}
          className="ml-3"
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Fragment>
      <div
        className="container-fluid"
        style={{
          backgroundColor: "#f4f7ff",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            padding: "10px 0",
          }}
        >
          <h4 style={{ margin: 0, padding: 0 }}>PMTCT Dashboard</h4>
          <Button
            variant="contained"
            onClick={onNavigateToMenu}
            startIcon={<FaChartLine />}
            style={{ backgroundColor: "rgb(1, 77, 136)", color: "#fff" }}
          >
            View Patient Lists
          </Button>
        </div>

        {/* Mother Information Section */}
        <Row>
          <Col xl={12}>
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">Mother Summary Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <StatWidget
                    icon="fa fa-female"
                    label="TOTAL PATIENTS"
                    value={statistics.totalPatients}
                    color="primary"
                  />
                  <StatWidget
                    icon="fa fa-user-md"
                    label="ANC PATIENTS"
                    value={statistics.ancPatients}
                    color="info"
                  />
                  <StatWidget
                    icon="fa fa-heartbeat"
                    label="PMTCT PATIENTS"
                    value={statistics.pmtctPatients}
                    color="success"
                  />
                    <StatWidget
                      icon="fa fa-user-times"
                      label="MOTHERS LTFU"
                      value={`${statistics.mothersLTFUNumerator || 0} (${statistics.mothersLTFUPercentage || 0}%)`}
                      color="danger"
                    />
                    <StatWidget
                      icon="fa fa-baby"
                      label="DELIVERIES"
                      value={statistics.deliveriesTotal || 0}
                      color="info"
                    />
                    <StatWidget
                      icon="fa fa-vial"
                      label="INFANTS TESTED"
                      value={statistics.infantTested || 0}
                      color="warning"
                    />
                  {/* <StatWidget
                    icon="fa fa-flask"
                    label="PMTCT VL UPTAKE"
                    value={`${statistics.pmtctViralLoadUptakePercentage}%`}
                    color="warning"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-users"
                    label="TOTAL MOTHERS ENROLLED"
                    value={dashboardData.motherStatistics.totalMothersEnrolled}
                    color="primary"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-check"
                    label="ACTIVE ON PMTCT"
                    value={dashboardData.motherStatistics.activeOnPMTCT}
                    color="success"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-medkit"
                    label="MOTHERS ON ART"
                    value={dashboardData.motherStatistics.mothersOnART}
                    color="info"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-flask"
                    label="WITH VIRAL LOAD"
                    value={dashboardData.motherStatistics.mothersWithViralLoad}
                    color="warning"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-check-circle"
                    label="VIRALLY SUPPRESSED"
                    value={dashboardData.motherStatistics.viralLoadSuppressed}
                    color="success"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-baby"
                    label="MOTHERS DELIVERED"
                    value={dashboardData.motherStatistics.mothersDelivered}
                    color="primary"
                  /> */}
                  {/* <StatWidget
                    icon="fa fa-clock"
                    label="PENDING DELIVERY"
                    value={dashboardData.motherStatistics.pendingDelivery}
                    color="warning"
                  /> */}
                </Row>
                {/* Mother LTFU Card */}

                <br />

                {/* Pie Charts */}
                <Row>
                  <Col xl={6} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getViralLoadUptakeChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xl={6} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getViralSuppressionChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <br />

                {/* Additional Mother Charts */}
                <Row>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getUnsuppressedChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getMotherExitChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getDeliveriesChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <br />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <br />

        {/* Key PMTCT Indicators Section */}
        <Row>
          <Col xl={12}>
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">Key PMTCT Indicators</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <StatWidget
                    icon="fa fa-repeat"
                    label="TOTAL PREGNANCY CYCLES"
                    value={dashboardData.pmtctIndicators.totalPregnancyCycles}
                    color="primary"
                  />
                  <StatWidget
                    icon="fa fa-check"
                    label="ACTIVE CYCLES"
                    value={dashboardData.pmtctIndicators.activePregnancyCycles}
                    color="success"
                  />
                  <StatWidget
                    icon="fa fa-times-circle"
                    label="CLOSED CYCLES"
                    value={dashboardData.pmtctIndicators.closedPregnancyCycles}
                    color="secondary"
                  />
                  <StatWidget
                    icon="fa fa-calendar-check"
                    label="TOTAL ANC VISITS"
                    value={dashboardData.pmtctIndicators.totalANCVisits}
                    color="info"
                  />
                  <StatWidget
                    icon="fa fa-user-md"
                    label="TOTAL MOTHER VISITS"
                    value={dashboardData.pmtctIndicators.totalMotherVisits}
                    color="primary"
                  />
                  <StatWidget
                    icon="fa fa-user-times"
                    label="LOST TO FOLLOW-UP"
                    value={dashboardData.pmtctIndicators.mothersLostToFollowUp}
                    color="danger"
                  />
                  <StatWidget
                    icon="fa fa-exchange"
                    label="TRANSFERRED OUT"
                    value={dashboardData.pmtctIndicators.mothersTransferredOut}
                    color="warning"
                  />
                  <StatWidget
                    icon="fa fa-heart-broken"
                    label="DECEASED"
                    value={dashboardData.pmtctIndicators.mothersDeceased}
                    color="danger"
                  />
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <br />

        {/* Infant Information Section */}
        <Row>
          <Col xl={12}>
            <Card style={cardStyle}>
              <Card.Header style={cardHeaderStyle}>
                <h5 className="mb-0">Infant Information Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <StatWidget
                    icon="fa fa-child"
                    label="TOTAL INFANTS REGISTERED"
                    value={
                      dashboardData.infantStatistics.totalInfantsRegistered
                    }
                    color="primary"
                  />
                  <StatWidget
                    icon="fa fa-smile"
                    label="INFANTS ALIVE"
                    value={dashboardData.infantStatistics.infantsAlive}
                    color="success"
                  />
                  <StatWidget
                    icon="fa fa-pills"
                    label="INFANTS ON ARV"
                    value={dashboardData.infantStatistics.infantsOnARV}
                    color="info"
                  />
                  <StatWidget
                    icon="fa fa-vial"
                    label="WITH PCR TEST"
                    value={dashboardData.infantStatistics.infantsWithPCRTest}
                    color="primary"
                  />
                  <StatWidget
                    icon="fa fa-plus-circle"
                    label="PCR POSITIVE"
                    value={dashboardData.infantStatistics.infantsPCRPositive}
                    color="danger"
                  />
                  <StatWidget
                    icon="fa fa-minus-circle"
                    label="PCR NEGATIVE"
                    value={dashboardData.infantStatistics.infantsPCRNegative}
                    color="success"
                  />
                  <StatWidget
                    icon="fa fa-tint"
                    label="WITH RAPID TEST"
                    value={dashboardData.infantStatistics.infantsWithRapidTest}
                    color="warning"
                  />
                  <StatWidget
                    icon="fa fa-sad-tear"
                    label="DECEASED"
                    value={dashboardData.infantStatistics.infantsDeceased}
                    color="danger"
                  />
                </Row>

                <br />

                {/* Additional Infant Cards */}
                <Row>
                  <StatWidget
                    icon="fa fa-vial"
                    label="INFANT TESTED"
                    value={dashboardData.infantMetrics.infantsTested}
                    color="info"
                  />
                  <StatWidget
                    icon="fa fa-medkit"
                    label="INFANTS INITIATED"
                    value={dashboardData.infantMetrics.infantsOnART}
                    color="success"
                  />
                </Row>

                <br />

                {/* Infant Charts */}
                <Row>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getHEILinkedChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getInfantTestResultsChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} lg={6}>
                    <div className="card" style={cardStyle}>
                      <div className="card-body pt-0 chart-body-wrapper">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={getInfantExitChartOptions()}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default PMTCTDashboard;
