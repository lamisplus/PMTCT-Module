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
  const [infantHeiPcr, setInfantHeiPcr] = useState([]);
  const [infantHeiPcrAlert, setInfantHeiPcrAlert] = useState([]);
  const [retestStatus, setRetestStatus] = useState({
    status: '',
    seroconverted: '',
    remainedHivNegative: '',
  });

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

  const getHivRetestStatus = async () => {
    if (props.latestPmtctCycle?.uuid) {
      const patientUuid = props.patientObj.patient_uuid || props.patientObj.patientUuid;
      try {
        let url = `${baseUrl}pmtct/anc/get-hiv-retest-status?patientUuid=${patientUuid}&pmtctCycleUuid=${props.latestPmtctCycle.uuid}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRetestStatus(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching HIV retest status:", error);
        toast.error("Failed to load HIV retest status");
      }
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
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid;
    if (!pmtctCycleUuid) return;
    const patientUuid = patientObj?.patient_uuid || patientObj?.patientUuid || patientObj?.uuid;
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
    const patientUuid = patientObj?.patient_uuid || patientObj?.patientUuid || patientObj?.uuid;
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

  // Calls that depend on latestPmtctCycle being available
  useEffect(() => {
    if (!props.latestPmtctCycle?.uuid) return;
    getHETInfantStatus();
    getHivRetestStatus();
    getLatestConfirmatoryResult();
    getHighRiskInfantStatus();
    getEntryPointDisplay();
    getCycleAncNo();
  }, [props.activeContent, props.latestPmtctCycle?.uuid]);

  const getLatestConfirmatoryResult = async () => {
    if (props.latestPmtctCycle?.uuid) {
      const patientUuid = props.patientObj.patient_uuid || props.patientObj.patientUuid;
      await axios
        .get(
          `${baseUrl}pmtct/anc/get-confirmatory-latest-result?patientUuid=${patientUuid}&pmtctCycleUuid=${props.latestPmtctCycle.uuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.data !== null && response.data !== undefined && response.data !== '') {
            props.setLastestConfirmatoryTest(response.data);
            setConfirmStatus(response.data);
            props.setLatestHivStatus(response.data);
          } else {
            const fallbackStatus =
              props?.patientObj?.finalResult ||
              props?.patientObj?.staticHivStatus ||
              props?.patientObj?.hivStatus ||
              props?.patientObj?.dynamicHivStatus;
            if (fallbackStatus) {
              setConfirmStatus(fallbackStatus);
              props.setLatestHivStatus(fallbackStatus);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching confirmatory result:", error);
        });
      await getPmtctHtsRecord(patientUuid, props.latestPmtctCycle.uuid);
    }
  };

  const getPmtctHtsRecord = async (patientUuid, pmtctCycleUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.finalResult) {
        setPmtctHtsFinalStatus(response.data.finalResult);
        setHasPmtctHtsRecord(true);
      } else {
        setHasPmtctHtsRecord(false);
      }
    } catch (error) {
      console.error("Error fetching PMTCT HTS record:", error);
      setHasPmtctHtsRecord(false);
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
    const patientUuid = props.patientObj.patient_uuid || props.patientObj.patientUuid;
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
      const patientUuid = props.patientObj.patient_uuid || props.patientObj.patientUuid;
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
  const patientAge = patientObj?.age;
  const patientGender = (patientObj?.sex && patientObj.sex !== null) ? patientObj.sex : "Female";

  // Parse address: backend may return JSON string (CAST to TEXT) or parsed object
  let addressData = patientObj?.address;
  if (typeof addressData === 'string') {
    try { addressData = JSON.parse(addressData); } catch (e) { addressData = null; }
  }
  const patientAddress = (addressData && typeof addressData === 'object') ? getAddress(addressData) : "";
  const hivStatusLabel = confirmStatus === 'Unknown' ? 'Not Tested' : confirmStatus === 'reactive' ? 'Positive' : confirmStatus === 'non-reactive' ? 'Negative' : confirmStatus;
  const hivStatusColor = (confirmStatus === "Positive" || confirmStatus === 'reactive') ? "#dc2626" : (confirmStatus === "Negative" || confirmStatus === 'non-reactive') ? "#16a34a" : "#6b7280";

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
                Hospital No: <span style={{ color: "#0f172a", fontWeight: "600" }}>{patientObj?.hospitalNumber || "---"}</span>
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
          {/* HIV Status */}
          {(confirmStatus) && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: (confirmStatus === "Positive" || confirmStatus === "reactive") ? "#fef2f2" : (confirmStatus === "Negative" || confirmStatus === "non-reactive") ? "#f0fdf4" : "#f8fafc",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hivStatusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span style={{ fontSize: "11.5px", color: hivStatusColor, fontWeight: "500" }}>HIV</span>
              <span style={{ fontSize: "11.5px", color: hivStatusColor, fontWeight: "700" }}>{hivStatusLabel}</span>
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

          {/* Seroconversion */}
          {(retestStatus?.seroconverted || retestStatus?.remainedHivNegative) && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 14px", borderRadius: "6px",
              background: retestStatus?.seroconverted ? "#fef2f2" : "#f0fdf4",
              boxShadow: retestStatus?.seroconverted ? "0 1px 4px rgba(220,38,38,0.12)" : "0 1px 4px rgba(22,163,74,0.12)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={retestStatus?.remainedHivNegative ? "#16a34a" : "#dc2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              <span style={{ fontSize: "11.5px", color: retestStatus?.remainedHivNegative ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                {retestStatus?.seroconverted ? "Seroconverted" : "Remained HIV -ve"}
              </span>
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
