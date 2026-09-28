import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { url as baseUrl, token } from "./../../../api";
import ButtonMui from "@material-ui/core/Button";
import { Menu } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import AssignmentIcon from "@material-ui/icons/Assignment";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import EventNoteIcon from "@material-ui/icons/EventNote";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { TiArrowBack } from "react-icons/ti";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Moment from "moment";
import AddInfants from "./../PmtctServices/Infants/InfantRegistration";
import InfantVisit from "./../Consultation/InfantVisit";

// Dedicated dashboard for an HIV-Exposed Infant with no maternal record in the system.
// Deliberately does NOT reuse PatientDetail.js — that component carries a lot of
// pregnancy-shaped state (active PMTCT cycle, ANC effects, menu items) that doesn't apply
// to a non-pregnant patient, and bolting a third identity onto it via more conditionals is
// the same pattern that caused most of this week's bugs. Visual language (card shape, colors,
// spacing, Home/Infant Information/History menu bar) mirrors PatientCard.js + SubMenu.js on
// the mother's dashboard, so this doesn't read as an unfamiliar, second-class screen.
//
// Note on what could NOT be carried over: the mother's dashboard also shows a "High Risk
// Infant" alert, but that flag is derived entirely from the MOTHER's own risk factors
// (timing of her ART initiation, rupture of membranes before delivery, etc. — see
// ANCService.getHighRiskInfantDetails) — there is no equivalent data for a child with no
// maternal record, so it's intentionally not shown here. The PCR Alert, by contrast, is
// based entirely on the infant's own delivery date, visit history and PCR results, so it
// applies unchanged (see PMTCTEnrollmentService.checkHEIPromptForInfant).
const InfantOnlyDashboard = () => {
  const history = useHistory();
  const patientObj = history.location && history.location.state
    ? history.location.state.patientObj
    : {};
  const infantPatientUuid =
    patientObj.patient_uuid || patientObj.patientUuid || patientObj.uuid;

  const [activeContent, setActiveContentRaw] = useState({ route: "home" });
  const [infantRecord, setInfantRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [pcrAlert, setPcrAlert] = useState(null);

  // AddInfants/InfantVisit signal "done, go back" using their own route sentinels
  // ("infants" and "recent-history" respectively) — map both back to this dashboard's
  // Home instead of a route that doesn't exist here.
  const setActiveContent = (newContent) => {
    if (newContent.route === "infants" || newContent.route === "recent-history") {
      setActiveContentRaw({ route: "home" });
    } else {
      setActiveContentRaw(newContent);
    }
  };

  const checkInfantRecord = () => {
    if (!infantPatientUuid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${baseUrl}pmtct/anc/infant-by-own-patient-uuid/${infantPatientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInfantRecord(response.data && response.data.uuid ? response.data : null);
        setLoading(false);
      })
      .catch(() => {
        setInfantRecord(null);
        setLoading(false);
      });
  };

  const fetchVisits = (hospitalNumber) => {
    if (!hospitalNumber) {
      setVisits([]);
      return;
    }
    setVisitsLoading(true);
    axios
      .get(`${baseUrl}pmtct/anc/get-infantvisit-by-hospitalnumber?hospitalNumber=${hospitalNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setVisits((response.data || []).filter((v) => !v.archived));
        setVisitsLoading(false);
      })
      .catch(() => {
        setVisits([]);
        setVisitsLoading(false);
      });
  };

  const fetchPcrAlert = (hospitalNumber) => {
    if (!hospitalNumber) {
      setPcrAlert(null);
      return;
    }
    axios
      .get(`${baseUrl}pmtct/anc/check-for-infant-pcr-alert-standalone/${hospitalNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPcrAlert(response.data && response.data.alertMessage ? response.data : null);
      })
      .catch(() => setPcrAlert(null));
  };

  useEffect(() => {
    if (activeContent.route === "home" || activeContent.route === "history") {
      checkInfantRecord();
    }
    // eslint-disable-next-line
  }, [activeContent.route]);

  // Fetch this child's visit history and PCR alert once we know their hospital number
  // (i.e. once Infant Information exists), and re-fetch whenever we come back to Home or
  // History after saving/deleting something.
  useEffect(() => {
    if ((activeContent.route === "home" || activeContent.route === "history") && infantRecord?.infantHospitalNumber) {
      fetchVisits(infantRecord.infantHospitalNumber);
      fetchPcrAlert(infantRecord.infantHospitalNumber);
    } else if (!infantRecord) {
      setVisits([]);
      setPcrAlert(null);
    }
    // eslint-disable-next-line
  }, [activeContent.route, infantRecord?.infantHospitalNumber]);

  const openInfantInformation = () => {
    if (infantRecord) {
      setActiveContentRaw({
        route: "add-infant",
        actionType: "update",
        id: infantRecord.id,
        obj: infantRecord,
      });
    } else {
      setActiveContentRaw({ route: "add-infant" });
    }
  };

  const openInfantVisit = () => {
    setActiveContentRaw({
      route: "infant-visit",
      actionType: "create",
      activeTab: "child",
    });
  };

  const editInfantVisit = (visit) => {
    setActiveContentRaw({
      route: "infant-visit",
      actionType: "update",
      id: visit.uuid,
      activeTab: "child",
    });
  };

  const deleteInfantInformation = () => {
    if (!infantRecord) return;
    if (!window.confirm(`Delete this child's Infant Information record? This does not delete any saved Infant Visits.`)) return;
    axios
      .delete(`${baseUrl}pmtct/anc/delete/infantinfo/${infantRecord.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success("Infant Information deleted.");
        setInfantRecord(null);
        setActiveContentRaw({ route: "home" });
      })
      .catch(() => {
        toast.error("Could not delete Infant Information. Please try again.");
      });
  };

  const deleteVisit = (visit) => {
    if (!window.confirm(`Delete the Infant Visit dated ${visit.visitDate}?`)) return;
    axios
      .delete(`${baseUrl}pmtct/anc/delete/infantvisit/${visit.uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success("Infant Visit deleted.");
        setVisits((prev) => prev.filter((v) => v.uuid !== visit.uuid));
      })
      .catch(() => {
        toast.error("Could not delete Infant Visit. Please try again.");
      });
  };

  // Derived display values — same shape of logic as PatientCard.js's rawName/patientAge.
  const rawName = patientObj?.fullName
    || [patientObj?.firstName, patientObj?.surname].filter(Boolean).join(" ")
    || "Unknown";
  const patientName = rawName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const ageInMonths = patientObj?.dateOfBirth
    ? Moment().diff(Moment(patientObj.dateOfBirth), "months")
    : null;
  const patientSex = patientObj?.sex || "";
  const avatarBg = patientSex === "Male" ? "#dbeafe" : patientSex === "Female" ? "#fce7f3" : "#f1f5f9";
  const avatarColor = patientSex === "Male" ? "#1d4ed8" : patientSex === "Female" ? "#be185d" : "#475569";
  // Recent Activities feed for Home — Infant Information + every Infant Visit, newest first.
  const activityFeed = [
    ...(infantRecord ? [{
      label: "Infant Information",
      // InfantDto doesn't carry created/modified timestamps — dateOfDelivery is the only
      // date on the record, so it doubles as this entry's activity date.
      date: infantRecord.dateOfDelivery,
      icon: <AssignmentIcon style={{ fontSize: "18px", color: "#6366f1" }} />,
      color: "#6366f1",
      onClick: openInfantInformation,
    }] : []),
    ...visits.map((visit) => ({
      label: "Infant Visit",
      date: visit.visitDate,
      icon: <EventNoteIcon style={{ fontSize: "18px", color: "#16a34a" }} />,
      color: "#16a34a",
      onClick: () => editInfantVisit(visit),
    })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const infoLabelStyle = { color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600", marginBottom: "2px" };
  const infoValueStyle = { color: "#0f172a", fontWeight: "700", fontSize: "13px" };
  const chipBase = { display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };
  const cardStyle = {
    background: "#fff", borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
    padding: "20px 24px",
  };
  // Same treatment as SubMenu.js's menuItemStyle, on the mother's dashboard.
  const menuItemStyle = (isActive) => ({
    color: "#fff",
    fontWeight: isActive ? "700" : "600",
    fontSize: "12.5px",
    borderRadius: "7px",
    margin: "0 1px",
    padding: "8px 14px",
    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
    boxShadow: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* Patient card — always visible regardless of tab, matching PatientCard.js's
          placement on the mother's dashboard (rendered above SubMenu, not tab content). */}
      <div style={{ ...cardStyle, overflow: "hidden", marginBottom: "16px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px", marginBottom: "16px",
        }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{
              width: "54px", height: "54px", borderRadius: "50%",
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: "2px", flexShrink: 0,
            }}>
              <ChildCareIcon style={{ fontSize: "28px", color: avatarColor }} />
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
              <div style={infoLabelStyle}>Age</div>
              <div style={infoValueStyle}>{ageInMonths != null ? `${ageInMonths} mo` : "---"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={infoLabelStyle}>Sex</div>
              <div style={infoValueStyle}>{patientSex || "---"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={infoLabelStyle}>Date of Birth</div>
              <div style={infoValueStyle}>{patientObj?.dateOfBirth || "---"}</div>
            </div>
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

        {/* Status strip */}
        <div style={{
          marginTop: "4px",
          paddingTop: "14px",
          borderTop: "1px solid #f0f0f0",
          display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center",
        }}>
          <div style={{ ...chipBase, background: "#f3e3d6" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3542e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span style={{ fontSize: "11.5px", color: "#a3542e", fontWeight: "500" }}>Entry</span>
            <span style={{ fontSize: "11.5px", color: "#a3542e", fontWeight: "700" }}>HIV-Exposed Infant, No Maternal Record</span>
          </div>

          {patientObj?.hivStatus && (
            <div style={{
              ...chipBase,
              background: patientObj.hivStatus.toLowerCase().includes("positive") ? "#fef2f2" : "#f8fafc",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={patientObj.hivStatus.toLowerCase().includes("positive") ? "#dc2626" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span style={{ fontSize: "11.5px", color: patientObj.hivStatus.toLowerCase().includes("positive") ? "#dc2626" : "#64748b", fontWeight: "500" }}>HIV Status</span>
              <span style={{ fontSize: "11.5px", color: patientObj.hivStatus.toLowerCase().includes("positive") ? "#dc2626" : "#64748b", fontWeight: "700" }}>
                {patientObj.hivStatus}
              </span>
            </div>
          )}

          {pcrAlert && (
            <div style={{ ...chipBase, background: "#fef2f2", boxShadow: "0 1px 4px rgba(220,38,38,0.15)" }}>
              <WarningAmberIcon style={{ fontSize: "14px", color: "#dc2626" }} />
              <span style={{ fontSize: "11.5px", color: "#dc2626", fontWeight: "500" }}>PCR Alert</span>
              <span style={{ fontSize: "11.5px", color: "#dc2626", fontWeight: "700" }}>{pcrAlert.alertMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu bar — same dark-pill Menu treatment as SubMenu.js on the mother's dashboard,
          so this doesn't read as a visually different/unfamiliar screen. Infant Visit only
          appears once Infant Information exists for this child — sequential on purpose. */}
      {!loading && (
        <Menu size="large" secondary style={{
          background: "#1e293b",
          borderRadius: "10px",
          padding: "4px 5px",
          border: "none",
          marginBottom: "16px",
          minHeight: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <Menu.Item onClick={() => setActiveContentRaw({ route: "home" })} style={menuItemStyle(activeContent.route === "home")}>
            Home
          </Menu.Item>

          <Menu.Item onClick={openInfantInformation} style={menuItemStyle(activeContent.route === "add-infant")}>
            Infant Information
          </Menu.Item>

          <Menu.Item onClick={() => setActiveContentRaw({ route: "history" })} style={menuItemStyle(activeContent.route === "history")}>
            History
          </Menu.Item>

          {infantRecord && (
            <Menu.Item onClick={openInfantVisit} style={menuItemStyle(activeContent.route === "infant-visit")}>
              Infant Visit
            </Menu.Item>
          )}
        </Menu>
      )}

      {/* Home — same two-sibling-column layout as RecentHistory.js on the mother's
          dashboard: a Recent Activities feed (col-xl-4) beside a stats card (col-xl-8),
          not one component spanning the row. */}
      {activeContent.route === "home" && !loading && (
        <div className="row" style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Recent Activities */}
          <div className="col-xl-4 col-xxl-4 col-lg-4" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", height: "100%" }}>
              <div style={{
                padding: "14px 20px", background: "#1466c2", borderRadius: "12px 12px 0 0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Recent Activities
                </h4>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#fff", background: "rgba(255,255,255,0.15)", padding: "2px 10px", borderRadius: "12px" }}>
                  {activityFeed.length}
                </span>
              </div>
              <div style={{ padding: "8px 12px", maxHeight: "370px", overflowY: "auto" }}>
                {activityFeed.length > 0 ? (
                  activityFeed.map((item, i) => (
                    <div
                      key={i}
                      onClick={item.onClick}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 10px", borderRadius: "8px", marginBottom: "4px", cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: item.color + "12",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{item.label}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{item.date}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "13px", color: "#94a3b8", padding: "12px 10px" }}>
                    No activity yet. Start with <strong>Infant Information</strong> above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Infant Chart — sibling stats card, same spirit as the mother dashboard's
              Patient Chart (visit counts, current status) but scoped to this one infant. */}
          <div className="col-xl-8 col-xxl-8 col-lg-8" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", width: "100%" }}>
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#014d88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Infant Chart
                </h4>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {!infantRecord ? (
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                    No Infant Information on file yet for this child.
                  </p>
                ) : (
                  <div className="row">
                    <div className="col-sm-6 col-md-6 col-lg-6">
                      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                          Total Infant Visits
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: 1, textAlign: "center" }}>
                          {visits.length}
                        </div>
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                          Birth Outcome
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: infantRecord.birthOutcome === "Dead" ? "#ef4444" : "#0f172a" }}>
                          {infantRecord.birthOutcome || "---"}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        PCR Status
                      </div>
                      {pcrAlert ? (
                        <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "14px", fontSize: "12.5px", color: "#dc2626", fontWeight: "600" }}>
                          {pcrAlert.alertMessage}
                        </div>
                      ) : (
                        <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px", fontSize: "12.5px", color: "#16a34a", fontWeight: "600" }}>
                          No PCR alert at this time.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History — how a saved Infant Information record and past Infant Visits get
          viewed, edited, or deleted. Infant Information is a single record; Infant Visit
          is repeatable, so it gets a list. */}
      {activeContent.route === "history" && !loading && (
        <div style={cardStyle}>
          {!infantRecord ? (
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>Nothing on file yet for this child.</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h6 style={{ margin: 0, color: "#0f172a", fontWeight: "700", fontSize: "14px" }}>Infant Information</h6>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Birth Outcome: <strong style={{ color: "#0f172a" }}>{infantRecord.birthOutcome || "---"}</strong>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <ButtonMui
                    onClick={openInfantInformation}
                    startIcon={<EditIcon />}
                    style={{ color: "#014d88", fontSize: "12px", textTransform: "none", fontWeight: "600" }}
                  >
                    Edit
                  </ButtonMui>
                  <ButtonMui
                    onClick={deleteInfantInformation}
                    startIcon={<DeleteIcon />}
                    style={{ color: "#dc2626", fontSize: "12px", textTransform: "none", fontWeight: "600" }}
                  >
                    Delete
                  </ButtonMui>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px" }}>
                <h6 style={{ margin: "0 0 10px", color: "#0f172a", fontWeight: "700", fontSize: "14px" }}>Infant Visits</h6>
                {visitsLoading ? (
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>Loading...</p>
                ) : visits.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No visits recorded yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {visits.map((visit) => (
                      <div
                        key={visit.uuid}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 14px", borderRadius: "8px", background: "#f8fafc",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <EventNoteIcon style={{ fontSize: "16px", color: "#014d88" }} />
                          <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: "600" }}>{visit.visitDate}</span>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <ButtonMui
                            size="small"
                            onClick={() => editInfantVisit(visit)}
                            startIcon={<EditIcon style={{ fontSize: "15px" }} />}
                            style={{ color: "#014d88", fontSize: "11.5px", textTransform: "none", fontWeight: "600" }}
                          >
                            Edit
                          </ButtonMui>
                          <ButtonMui
                            size="small"
                            onClick={() => deleteVisit(visit)}
                            startIcon={<DeleteIcon style={{ fontSize: "15px" }} />}
                            style={{ color: "#dc2626", fontSize: "11.5px", textTransform: "none", fontWeight: "600" }}
                          >
                            Delete
                          </ButtonMui>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeContent.route === "add-infant" && (
        <AddInfants
          patientObj={patientObj}
          patientAge={ageInMonths}
          setActiveContent={setActiveContent}
          activeContent={activeContent}
          isHeiFlow={true}
        />
      )}

      {activeContent.route === "infant-visit" && (
        <InfantVisit
          patientObj={patientObj}
          setActiveContent={setActiveContent}
          activeContent={activeContent}
          isHeiFlow={true}
        />
      )}
    </div>
  );
};

export default InfantOnlyDashboard;
