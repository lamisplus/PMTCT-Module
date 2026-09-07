import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import ButtonMui from "@material-ui/core/Button";
import { TiArrowBack } from "react-icons/ti";
import { Label } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { url as baseUrl, token } from "./../../../api";
import Typography from "@material-ui/core/Typography";
import {
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Box,
  Tooltip,
} from '@mui/material';
import { convertMaternalCodeToValue } from "../../utils";

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChildCareIcon from '@mui/icons-material/ChildCare';

Moment.locale("en");
momentLocalizer();

const styles = (theme) => ({
  root: {
    width: "100%",
  },
});

function PatientCard(props) {
  const { classes } = props;
  const patientObjs = props.patientObj ? props.patientObj : {};
  const [patientObj, setpatientObj] = useState(patientObjs);

  // Single source of truth for the patient identifier on this component.
  // PatientDetail resolves this once (across the 4 grids that route here — ANC,
  // PMTCT, PMTCT-HTS, Checked-In — each returning a differently-named uuid field)
  // and passes it down as `patientUuid`. The direct patientObj fallback below is
  // only a safety net for callers that don't pass the prop.
  const patientUuid =
    props.patientUuid ||
    props.patientObj?.patient_uuid ||
    props.patientObj?.patientUuid ||
    props.patientObj?.uuid;

  const [highRiskInfants, setHighRiskInfants] = useState([]);
  const [expandedHighRiskIndex, setExpandedHighRiskIndex] = useState(false);
  const [unsuppressedVl, setUnsuppressedVl] = useState(false);
  const [latestVl, setLatestVl] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(
    props?.patientObj?.finalResult ||
    props?.patientObj?.staticHivStatus ||
    props?.patientObj?.hivStatus ||
    props?.patientObj?.dynamicHivStatus
  );
  const [pmtctHtsFinalStatus, setPmtctHtsFinalStatus] = useState(null);
  const [hasPmtctHtsRecord, setHasPmtctHtsRecord] = useState(false);

  const [cycleAncNo, setCycleAncNo] = useState(patientObjs?.ancNo || "");
  const [artUniqueNumber, setArtUniqueNumber] = useState("");
  const [entryPointDisplay, setEntryPointDisplay] = useState("");
  const [biometricStatus, setBiometricStatus] = useState(false);
  const [devices, setDevices] = useState([]);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [biometricModal, setBiometricModal] = useState(false);
  const BiometricModalToggle = () => setBiometricModal(!biometricModal);
  const [hivStatus, setHivStatus] = useState('');
  // True when the HIV status shown was documented directly via the standalone HTS module
  // rather than through this PMTCT cycle — surfaced as a small badge so the user isn't left
  // wondering where/when they entered it.
  const [hivStatusFromHtsModule, setHivStatusFromHtsModule] = useState(false);
  // LV3-1732: distinct dashboard indications, layered on top of the plain Positive/Negative
  // hivStatus badge below — confirmed Acute HIV Infection vs. still-unresolved Suspected.
  const [acuteHivInfectionDetected, setAcuteHivInfectionDetected] = useState(false);
  const [suspectedAcuteInfection, setSuspectedAcuteInfection] = useState(false);
  const [infantHeiPcr, setInfantHeiPcr] = useState([]);
  const [infantHeiPcrAlert, setInfantHeiPcrAlert] = useState([]);
  const [retestStatus, setRetestStatus] = useState({
    status: '',
    seroconverted: '',
    remainedHivNegative: '',
  });
  const [syphilisResult, setSyphilisResult] = useState(null);
  const [hepatitisResult, setHepatitisResult] = useState(null);

  const [artModal, setArtModal] = useState(false);
  const Arttoggle = () => setArtModal(!artModal);

  const [expandedIndex, setExpandedIndex] = useState(false);
  const [patientBiometricStatus, setPatientBiometricStatus] = useState(
    props?.patientObj?.biometricStatus
  );

  const handleClick = () => {
    setExpandedIndex(!expandedIndex);
  };

  const handleHighRiskClick = () => {
    setExpandedHighRiskIndex(!expandedHighRiskIndex);
  };

  const fetchPatientHivSummary = async () => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;
    if (!patientUuid || !pmtctCycleUuid) return;

    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/patient-hiv-summary?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;

      // HIV status
      setConfirmStatus(data.hivStatus || null);
      setHasPmtctHtsRecord(data.hasHtsRecord);
      setPmtctHtsFinalStatus(data.hivStatus || null);
      setHivStatusFromHtsModule(Boolean(data.sourcedFromHtsModule));
      setAcuteHivInfectionDetected(Boolean(data.acuteHivInfectionDetected));
      setSuspectedAcuteInfection(Boolean(data.suspectedAcuteInfection));
      if (props.setLatestHivStatus) {
        props.setLatestHivStatus(data.hivStatus || null);
      }
      if (props.setLastestConfirmatoryTest) {
        props.setLastestConfirmatoryTest(data.hivStatus || null);
      }

      // Retest status
      setRetestStatus({
        remainedHivNegative: data.remainedHivNegative,
        seroconverted: data.seroconverted,
      });

      // Serology from HTS record
      if (data.syphilisResult) {
        const norm = data.syphilisResult.trim().toLowerCase();
        const isPositive = norm.includes("positive") || (norm.includes("reactive") && !norm.includes("non-reactive") && !norm.includes("non reactive"));
        setSyphilisResult(isPositive ? "Positive" : "Negative");
      } else {
        setSyphilisResult("");
      }

      const hepB = data.hepatitisBResult || "";
      const hepC = data.hepatitisCResult || "";
      if (hepB || hepC) {
        const normB = hepB.trim().toLowerCase();
        const normC = hepC.trim().toLowerCase();
        const isPositive = normB.includes("positive") || (normB.includes("reactive") && !normB.includes("non-reactive") && !normB.includes("non reactive"))
          || normC.includes("positive") || (normC.includes("reactive") && !normC.includes("non-reactive") && !normC.includes("non reactive"));
        setHepatitisResult(isPositive ? "Positive" : "Negative");
      } else {
        setHepatitisResult("");
      }
    } catch (error) {
      console.error("Error fetching patient HIV summary:", error);
      setConfirmStatus(null);
      setHasPmtctHtsRecord(false);
      setPmtctHtsFinalStatus(null);
      setRetestStatus(null);
      setSyphilisResult("");
      setHepatitisResult("");
      setAcuteHivInfectionDetected(false);
      setSuspectedAcuteInfection(false);
    }
  };

  const getEntryPointDisplay = () => {
    // Try patientObj.entryPoint first, then fallback to latestPmtctCycle.entryPoint
    const entryPointCode = patientObj?.entryPoint || props.latestPmtctCycle?.entryPoint;
    if (!entryPointCode) return;

    axios
      .get(`${baseUrl}application-codesets/v2/PMTCT_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          const match = response.data.find((item) => item.code === entryPointCode);
          if (match) {
            setEntryPointDisplay(match.display);
          }
        }
      })
      .catch(() => {});
  };

  const getCycleAncNo = () => {
    const entryPoint = patientObj?.entryPoint || props.latestPmtctCycle?.entryPoint;
    if (entryPoint !== "PMTCT_ENTRY_POINT_ANC") return;
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;
    if (!pmtctCycleUuid) return;
    if (!patientUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/get-anc-by-person?patientUuid=${patientUuid}&pmtctCycleUuid=${pmtctCycleUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCycleAncNo(response.data?.ancNo || "");
      })
      .catch(() => {
        setCycleAncNo("");
      });
  };

  const getArtUniqueNumber = () => {
    try {
      const identifierObj = patientObj?.identifier;
      if (identifierObj && identifierObj.identifier && Array.isArray(identifierObj.identifier)) {
        const artId = identifierObj.identifier.find(
          (id) => id.type === "UniqueId" || id.type === "HivUniqueId" || id.type === "ARTNumber"
        );
        if (artId && artId.value) {
          setArtUniqueNumber(artId.value);
          return;
        }
      }
    } catch (error) {
      // Could not extract ART number from identifiers
    }
    // Fallback: fetch from HIV module via /art/ endpoint
    if (patientUuid) {
      axios
        .get(`${baseUrl}pmtct/anc/art/?PatientUuid=${patientUuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data && response.data[0]?.uniqueArtNumber) {
            setArtUniqueNumber(response.data[0].uniqueArtNumber);
          }
        })
        .catch(() => {});
    }
  };

  // One-time calls that only depend on patient identity (not cycle)
  useEffect(() => {
    PatientCurrentStatus();
    CheckBiometric();
    getArtUniqueNumber();
    checkUnsuppressedVl();
  }, [props.patientObj]);

  // Calls that depend on latestPmtctCycle being available.
  // `activeContent` is a useState object in PatientDetail that only changes
  // reference on a real navigation (not on every render), so depending on the
  // whole object refetches on EVERY active-content change — including ones that
  // keep the same route but change id/activeTab/obj (e.g. saving an HTS form).
  // `htsSavedTick` is bumped by PmtctHtsForm right after a successful HTS/Retest
  // save, so the card refreshes immediately even when the route doesn't change.
  useEffect(() => {
    if (!props.latestPmtctCycle?.uuid) return;
    getHETInfantStatus();
    fetchPatientHivSummary();
    getHighRiskInfantStatus();
    getEntryPointDisplay();
    getCycleAncNo();
    fetchEnrollmentSerologyResults();
    checkAcuteInfectionStatus();
  }, [props.activeContent, props.latestPmtctCycle?.uuid, props.htsSavedTick]);

  // LV3-1732: on each page load, ask the backend whether this client has a suspected-acute
  // HTS/PMTCT record that just got resolved by a documented viral load result (Positive if
  // >= 1000 copies/mL, Negative otherwise). The backend is idempotent — updated only comes
  // back true the one time it actually resolves the status — so this only toasts once, even
  // though it's checked on every visit to this card. fromHtsModule tells the PMTCT user the
  // suspected-acute record wasn't entered here, so they're not left wondering why they don't
  // remember documenting it. Re-fetches the HIV summary afterward so the persistent
  // Acute/Suspected Acute badge in the status strip reflects the resolution immediately,
  // without needing a page reload.
  const checkAcuteInfectionStatus = () => {
    if (!patientUuid) return;
    axios
      .get(`${baseUrl}pmtct/anc/check-acute-infection-status/${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const result = response.data;
        if (result && result.updated) {
          const origin = result.fromHtsModule ? " (originally documented on the HTS module)" : "";
          const vlText = `${Number(result.triggerVl).toLocaleString()} copies/mL${origin}`;
          if (result.resolvedResult === "Positive") {
            toast.warning(
              `Client's status was automatically updated to Acute HIV Infection based on a Viral Load result of ${vlText}.`,
              { position: toast.POSITION.TOP_CENTER, autoClose: 8000 }
            );
          } else {
            toast.info(
              `Client's Suspected Acute HIV Infection was resolved as HIV Negative based on a Viral Load result of ${vlText}.`,
              { position: toast.POSITION.TOP_CENTER, autoClose: 8000 }
            );
          }
          fetchPatientHivSummary();
        }
      })
      .catch(() => {});
  };

  // Fetch syphilis & hepatitis results from PMTCT enrollment (MIP card) as fallback
  const fetchEnrollmentSerologyResults = async () => {
    if (!patientUuid) return;
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/latest-enrollment?patientUuid=${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const enrollment = response.data;
        // Syphilis from enrollment syphilisDetails
        const syphVal = enrollment.syphilisDetails?.testResult || "";
        if (syphVal) {
          setSyphilisResult((prev) => {
            if (prev) return prev; // HTS data already populated
            const norm = syphVal.trim().toLowerCase();
            const isPositive = norm.includes("positive") || (norm.includes("reactive") && !norm.includes("non-reactive") && !norm.includes("non reactive"));
            return isPositive ? "Positive" : "Negative";
          });
        }
        // Hepatitis B from enrollment hbvDetails
        const hepVal = enrollment.hbvDetails?.testResult || "";
        if (hepVal) {
          setHepatitisResult((prev) => {
            if (prev) return prev; // HTS data already populated
            const norm = hepVal.trim().toLowerCase();
            const isPositive = norm.includes("positive") || (norm.includes("reactive") && !norm.includes("non-reactive") && !norm.includes("non reactive"));
            return isPositive ? "Positive" : "Negative";
          });
        }
      }
    } catch (error) {
      // No enrollment found — serology results remain from HTS or empty
    }
  };

  const CheckBiometric = () => {
    axios
      .get(`${baseUrl}modules/check?moduleName=biometric`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setBiometricStatus(response.data);
        if (response.data === true) {
          axios
            .get(`${baseUrl}biometrics/devices`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              setDevices(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {});
  };

  const getHighRiskInfantStatus = () => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;
    if (!pmtctCycleUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/check-for-infant-high-risk/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setHighRiskInfants(response.data);
        } else {
          setHighRiskInfants([]);
        }
      })
      .catch((error) => {
        setHighRiskInfants([]);
      });
  };

  const checkUnsuppressedVl = () => {
    const patientId = props.patientObj.id || props.patientObj.personId;
    if (!patientId) return;

    axios
      .get(`${baseUrl}laboratory/vl-results/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const sorted = [...response.data].sort(
            (a, b) => new Date(b.dateResultReceived) - new Date(a.dateResultReceived)
          );
          const mostCurrent = sorted[0];
          const vlValue = Number(mostCurrent.result);
          setLatestVl({
            result: mostCurrent.result,
            date: mostCurrent.dateResultReceived ? mostCurrent.dateResultReceived.split(" ")[0] : mostCurrent.dateResultReported,
          });
          setUnsuppressedVl(vlValue >= 1000);
        } else {
          setLatestVl(null);
          setUnsuppressedVl(false);
        }
      })
      .catch((error) => {
        setLatestVl(null);
        setUnsuppressedVl(false);
      });
  };

  const getHETInfantStatus = () => {
    if (props.latestPmtctCycle?.uuid) {
      const pmtctCycleUuid = props.latestPmtctCycle?.uuid;
      axios
        .get(
          `${baseUrl}pmtct/anc/check-for-infant-pcr-alert/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.data) {
            setInfantHeiPcr(response.data);
            let heiInfant = response.data.filter((each) => each.alertMessage);
            setInfantHeiPcrAlert(heiInfant);
          }
        })
        .catch((error) => {});
    }
  };

  async function PatientCurrentStatus() {
    axios
      .get(
        `${baseUrl}hiv/status/patient-current/${patientObj.id ? patientObj.id : patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setHivStatus(response.data);
      })
      .catch((error) => {});
  }

  const getAddress = (identifier) => {
    const identifiers = identifier;
    const address = identifiers?.address.find((obj) => obj.city);
    const houseAddress = address && address?.line[0] !== null ? address?.line[0] : "";
    const landMark = address && address.city && address.city !== null ? address.city : "";
    return address ? houseAddress + " " + landMark : "";
  };

  // Derived values for display
  const rawName = patientObj?.fullname || patientObj?.fullName
    || [patientObj?.firstName, patientObj?.otherName, patientObj?.surname].filter(Boolean).join(" ")
    || "Unknown";
  const patientName = rawName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  // Not every grid that routes here returns an `age` field — e.g. the
  // Checked-In Patients grid's PersonResponseDto has no age, only dateOfBirth.
  // Fall back to computing it so the card doesn't show blank for those patients.
  const patientAge = patientObj?.age != null && patientObj?.age !== ""
    ? patientObj.age
    : (patientObj?.dateOfBirth ? Moment().diff(Moment(patientObj.dateOfBirth), "years") : "");
  const patientGender = (patientObj?.sex && patientObj.sex !== null) ? patientObj.sex : "Female";

  // Parse address: backend may return JSON string (CAST to TEXT) or parsed object
  let addressData = patientObj?.address;
  if (typeof addressData === 'string') {
    try { addressData = JSON.parse(addressData); } catch (e) { addressData = null; }
  }
  const patientAddress = (addressData && typeof addressData === 'object') ? getAddress(addressData) : "";
  // HIV status badge — always shows raw HTS result. LV3-1732: Acute HIV Infection and
  // Suspected Acute HIV Infection are distinct indications layered on top of the plain
  // Positive/Negative/Unknown result — acuteHivInfectionDetected takes priority since it means
  // the suspicion has already been confirmed as HIV-positive.
  const hivStatusLabel = acuteHivInfectionDetected ? 'Acute HIV Infection'
    : suspectedAcuteInfection ? 'Suspected Acute HIV Infection'
    : confirmStatus === 'Unknown' ? 'HIV Test Not Done'
    : confirmStatus === 'reactive' ? 'Positive'
    : confirmStatus === 'non-reactive' ? 'Negative'
    : confirmStatus || 'HIV Test Not Done';
  const hivStatusColor = acuteHivInfectionDetected ? "#dc2626"
    : suspectedAcuteInfection ? "#d97706"
    : (confirmStatus === "Positive" || confirmStatus === 'reactive') ? "#dc2626"
    : (confirmStatus === "Negative" || confirmStatus === 'non-reactive') ? "#16a34a"
    : "#6b7280";

  // Retesting badge — only shows when a retesting record exists
  const hasRetestResult = retestStatus?.seroconverted || retestStatus?.remainedHivNegative;
  const retestLabel = retestStatus?.seroconverted ? 'Seroconverted to HIV Positive'
    : retestStatus?.remainedHivNegative ? 'Remained HIV Negative'
    : null;
  const retestColor = retestStatus?.seroconverted ? "#dc2626" : "#16a34a";

  return (
    <div className={classes.root}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
        padding: "20px 24px",
        marginBottom: "16px",
      }}>
        {/* Header + Info on same line */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px", marginBottom: "16px",
        }}>
          {/* Name */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{
              width: "54px", height: "54px", borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "700", color: "#475569",
              marginTop: "2px", flexShrink: 0,
            }}>
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ color: "#0f172a", fontWeight: "700", fontSize: "18px", margin: "0 0 2px" }}>
                {patientName}
              </h4>
              <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "500" }}>
                Hospital No: <span style={{ color: "#0f172a", fontWeight: "600" }}>{patientObj?.hospitalNumber || (patientObj?.identifier?.identifier?.find(obj => obj.type === "HospitalNumber")?.value) || "---"}</span>
              </span>
            </div>
          </div>

          {/* Info items */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>Age</div>
              <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{patientAge} {Number(patientAge) > 1 ? "yrs" : "yr"}</div>
            </div>
            {entryPointDisplay && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>Point of Entry</div>
              <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{entryPointDisplay}</div>
            </div>
            )}
            {cycleAncNo && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>ANC Number</div>
              <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{cycleAncNo}</div>
            </div>
            )}
            {artUniqueNumber && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>Unique ART No.</div>
              <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{artUniqueNumber}</div>
            </div>
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>Sex</div>
              <div style={{ color: "#0f172a", fontWeight: "700", fontSize: "13px" }}>{patientGender}</div>
            </div>
            {patientAddress && (
            <Tooltip title={patientAddress} arrow placement="bottom" enterDelay={200}>
              <div style={{ textAlign: "center", maxWidth: "220px", cursor: "pointer" }}>
                <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" }}>Address</div>
                <div style={{ color: "#0f172a", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{patientAddress}</div>
              </div>
            </Tooltip>
            )}
          </div>

          {/* Back button */}
          <Link to={"/"} style={{ textDecoration: "none" }}>
            <ButtonMui
              variant="contained"
              startIcon={<TiArrowBack />}
              style={{
                backgroundColor: "#992E62", color: "#fff",
                borderRadius: "8px", textTransform: "none",
                fontWeight: "600", fontSize: "12px",
                padding: "6px 16px",
                boxShadow: "0 2px 8px rgba(153,46,98,0.25)",
              }}
            >
              Back
            </ButtonMui>
          </Link>
        </div>

        {/* Status Strip */}
        <div style={{
          marginTop: "20px",
          paddingTop: "14px",
          borderTop: "1px solid #f0f0f0",
          display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center",
        }}>
          {/* HIV Status — always visible. The "via HTS module" tag lives inside this same
              chip (not a separate one) so it can never visually drift away from the status
              it's explaining, even when the status strip wraps on narrow screens. */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "7px 14px", borderRadius: "6px",
            background: acuteHivInfectionDetected ? "#fef2f2"
              : suspectedAcuteInfection ? "#fffbeb"
              : (confirmStatus === "Positive" || confirmStatus === "reactive") ? "#fef2f2" : (confirmStatus === "Negative" || confirmStatus === "non-reactive") ? "#f0fdf4" : "#f8fafc",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hivStatusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span style={{ fontSize: "11.5px", color: hivStatusColor, fontWeight: "500" }}>HIV</span>
            <span style={{ fontSize: "11.5px", color: hivStatusColor, fontWeight: "700" }}>{hivStatusLabel}</span>
            {hivStatusFromHtsModule && (
              <span
                title="This HIV status was documented on the HTS module, not through this PMTCT cycle."
                style={{
                  display: "inline-flex", alignItems: "center", gap: "3px",
                  marginLeft: "2px", padding: "2px 7px", borderRadius: "10px",
                  background: "#dbeafe", color: "#1d4ed8",
                  fontSize: "9.5px", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: "0.3px",
                  cursor: "default",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                via HTS
              </span>
            )}
          </div>

          {/* Retesting Status — only visible when retesting record exists */}
          {hasRetestResult && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: retestStatus?.seroconverted ? "#fef2f2" : "#f0fdf4",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={retestColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span style={{ fontSize: "11.5px", color: retestColor, fontWeight: "500" }}>Retest</span>
              <span style={{ fontSize: "11.5px", color: retestColor, fontWeight: "700" }}>{retestLabel}</span>
            </div>
          )}

          {/* Biometric */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "7px 14px", borderRadius: "6px",
            background: props.patientObj?.biometricStatus ? "#f0fdf4" : "#fef2f2",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={props.patientObj?.biometricStatus ? "#16a34a" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6"/><path d="M12 12c0 4-1 8-4 10"/><path d="M12 12c0 4 1 8 4 10"/><path d="M12 6c3.5 0 6 2.5 6 6 0 3-0.5 6-1 7.5"/><path d="M22 12a10 10 0 0 1-2 6"/></svg>
            <span style={{ fontSize: "11.5px", color: props.patientObj?.biometricStatus ? "#16a34a" : "#ef4444", fontWeight: "500" }}>Biometric</span>
            <span style={{ fontSize: "11.5px", color: props.patientObj?.biometricStatus ? "#16a34a" : "#ef4444", fontWeight: "700" }}>
              {props.patientObj?.biometricStatus ? "Captured" : "Not Captured"}
            </span>
          </div>

          {/* Syphilis Result */}
          {syphilisResult && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: syphilisResult === "Positive" ? "#fef2f2" : "#f0fdf4",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={syphilisResult === "Positive" ? "#dc2626" : "#16a34a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span style={{ fontSize: "11.5px", color: syphilisResult === "Positive" ? "#dc2626" : "#16a34a", fontWeight: "500" }}>Syphilis</span>
              <span style={{ fontSize: "11.5px", color: syphilisResult === "Positive" ? "#dc2626" : "#16a34a", fontWeight: "700" }}>{syphilisResult}</span>
            </div>
          )}

          {/* Hepatitis Result */}
          {hepatitisResult && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: hepatitisResult === "Positive" ? "#fef2f2" : "#f0fdf4",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hepatitisResult === "Positive" ? "#dc2626" : "#16a34a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span style={{ fontSize: "11.5px", color: hepatitisResult === "Positive" ? "#dc2626" : "#16a34a", fontWeight: "500" }}>Hepatitis</span>
              <span style={{ fontSize: "11.5px", color: hepatitisResult === "Positive" ? "#dc2626" : "#16a34a", fontWeight: "700" }}>{hepatitisResult}</span>
            </div>
          )}

          {/* Maternal Outcome */}
          {props.maternalOutcome && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: "#eef2ff",
              boxShadow: "0 1px 4px rgba(99,102,241,0.12)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "500" }}>Outcome</span>
              <span style={{ fontSize: "11.5px", color: "#6366f1", fontWeight: "700" }}>{convertMaternalCodeToValue(props.maternalOutcome)}</span>
            </div>
          )}

          {/* Latest Viral Load */}
          {latestVl && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: unsuppressedVl ? "#fef2f2" : "#f0fdf4",
              boxShadow: unsuppressedVl ? "0 1px 4px rgba(220,38,38,0.12)" : "0 1px 4px rgba(22,163,74,0.12)",
            }}>
              {unsuppressedVl ? (
                <WarningAmberIcon sx={{ fontSize: '14px', color: '#dc2626' }} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              )}
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "500" }}>VL</span>
              <span style={{ fontSize: "11.5px", color: unsuppressedVl ? "#dc2626" : "#16a34a", fontWeight: "700" }}>
                {Number(latestVl.result).toLocaleString()} cp/ml
              </span>
              <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "500" }}>({latestVl.date})</span>
            </div>
          )}

          {/* PCR Alerts */}
          {infantHeiPcrAlert && infantHeiPcrAlert.length > 0 && (
            <div style={{ borderRadius: "6px", overflow: "hidden", boxShadow: "0 1px 4px rgba(220,38,38,0.15)" }}>
              <List sx={{ width: 'fit-content', bgcolor: '#fef2f2', padding: '0px' }}>
                <ListItem sx={{ padding: '0px' }}>
                  <ListItemButton onClick={() => handleClick()} sx={{ padding: '7px 14px', gap: '7px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#dc2626' }}>
                      PCR Alerts ({infantHeiPcrAlert.length})
                    </span>
                    {expandedIndex ? <ExpandMore sx={{ fontSize: '14px', color: '#dc2626' }} /> : <ExpandLess sx={{ fontSize: '14px', color: '#dc2626' }} />}
                  </ListItemButton>
                </ListItem>
                {infantHeiPcrAlert.map((alert, index) => (
                  <React.Fragment key={index}>
                    <Collapse in={expandedIndex} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 2, pr: 2, pb: 0.5 }}>
                        <Typography variant="body2" gutterBottom>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            <strong style={{ color: '#0f172a' }}>{alert.infantHospitalNo}:</strong> {alert.alertMessage}
                          </span>
                        </Typography>
                      </Box>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </div>
          )}

          {/* High Risk Infants */}
          {highRiskInfants && highRiskInfants.length > 0 && (
            <div style={{ borderRadius: "6px", overflow: "hidden", boxShadow: "0 1px 4px rgba(234,88,12,0.15)" }}>
              <List sx={{ width: 'fit-content', bgcolor: '#fff7ed', padding: '0px' }}>
                <ListItem sx={{ padding: '0px' }}>
                  <ListItemButton onClick={() => handleHighRiskClick()} sx={{ padding: '7px 14px', gap: '7px' }}>
                    <WarningAmberIcon sx={{ fontSize: '13px', color: '#ea580c' }} />
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#ea580c' }}>
                      High Risk ({highRiskInfants.length})
                    </span>
                    {expandedHighRiskIndex ? <ExpandMore sx={{ fontSize: '14px', color: '#ea580c' }} /> : <ExpandLess sx={{ fontSize: '14px', color: '#ea580c' }} />}
                  </ListItemButton>
                </ListItem>
                {highRiskInfants.map((infant, index) => (
                  <React.Fragment key={index}>
                    <Collapse in={expandedHighRiskIndex} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 2, pr: 2, pb: 0.5 }}>
                        <Typography variant="body2" gutterBottom>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            <ChildCareIcon sx={{ fontSize: '12px', mr: 0.5, verticalAlign: 'middle' }} />
                            <strong style={{ color: '#0f172a' }}>{infant.infantHospitalNo}:</strong> {infant.alertMessage}
                          </span>
                        </Typography>
                      </Box>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);
