import React, { Fragment, useState, useEffect } from "react";
// BS
import { Dropdown } from "react-bootstrap";
/// Scroll
//import { makeStyles } from '@material-ui/core/styles';
import PerfectScrollbar from "react-perfect-scrollbar";
//import { Link } from "react-router-dom";
import axios from "axios";
import { url as baseUrl, token } from "../../../api";
//import { Alert } from "react-bootstrap";
import { Card, Accordion } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "react-widgets/dist/css/react-widgets.css";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { Button } from "semantic-ui-react";

const RecentHistory = (props) => {
  let history = useHistory();
  const [recentActivities, setRecentActivities] = useState([]);
  const [infants, setInfants] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = useState(false);
  // const [entryValueDisplay, setEntryValueDisplay] = useState({});

  const [record, setRecord] = useState(null);
  const toggle = () => setOpen(!open);
  let notToBeUpdated = ["pmtct_infant_information"];
  const [summartChart, setSummaryChart] = useState({
    motherVisit: 0,
    childVisit: 1,
    childAlive: 0,
    childDead: 0,
  });
  const [activeAccordionHeaderShadow, setActiveAccordionHeaderShadow] =
    useState(0);
 const [unknownStatus, setUnknownStatus] =useState(props?.patientObj?.staticHivStatus === "Unknown" || props?.patientObj?.hivStatus === "Unknown" ||  props?.patientObj?.dynamicHivStatus  === "Unknown");
    const [showHTSStatus, setShowHTSStatus] = useState(props.lastestHivStatus !== "Unknown"? false : unknownStatus);
    
  // Resolve patientUuid consistently across all API calls
  const resolvedPatientUuid = props.patientObj.patient_uuid || props.patientObj.patientUuid || props.patientObj.uuid;
  const resolvedCycleUuid = props.selectedCycleId || props.latestPmtctCycle?.uuid;

  useEffect(() => {
    let cancelled = false;

    if (props?.allEntryPoint) {
      // getPatientEntryType();
    }

    let generalStatus = props?.patientObj?.staticHivStatus === "Unknown" || props?.patientObj?.hivStatus === "Unknown" ||  props?.patientObj?.dynamicHivStatus  === "Unknown"
    setShowHTSStatus(props.lastestHivStatus !== "Unknown" && props.lastestHivStatus !== ""? false : generalStatus)

    if (!resolvedCycleUuid || !resolvedPatientUuid) return;

    // Fetch infants
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${resolvedPatientUuid}?pmtctCycleUuid=${resolvedCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (!cancelled) setInfants(response.data);
      })
      .catch(() => {});

    // Fetch recent activities, then enrich HTS records with testingType
    axios
      .get(
        `${baseUrl}pmtct/anc/getAllActivities/${resolvedPatientUuid}?pmtctCycleUuid=${resolvedCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (cancelled) return;
        const activities = response.data || [];
        // For HTS activities missing testingType, fetch the record detail
        const htsActivities = activities.filter(
          (a) => a.path === "pmtct-hts" && !a.testingType && a.recordId
        );
        if (htsActivities.length > 0) {
          Promise.all(
            htsActivities.map((a) =>
              axios
                .get(`${baseUrl}pmtct/anc/view-pmtct-hts-enrollment/${a.recordId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => ({ recordId: a.recordId, testingType: res.data?.testingType || "" }))
                .catch(() => ({ recordId: a.recordId, testingType: "" }))
            )
          ).then((results) => {
            if (cancelled) return;
            const typeMap = {};
            results.forEach((r) => { typeMap[r.recordId] = r.testingType; });
            const enriched = activities.map((a) =>
              a.path === "pmtct-hts" && typeMap[a.recordId]
                ? { ...a, testingType: typeMap[a.recordId] }
                : a
            );
            setRecentActivities(enriched);
            checkForPmtctEnrollment(enriched);
          });
        } else {
          setRecentActivities(activities);
          checkForPmtctEnrollment(activities);
        }
      })
      .catch(() => {});

    // Fetch summary chart
    axios
      .get(
        `${baseUrl}pmtct/anc/get-pmtct-summary-chart/${resolvedPatientUuid}?pmtctCycleUuid=${resolvedCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (!cancelled) setSummaryChart(response.data);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [props.patientObj.id, props.selectedCycleId, props.latestPmtctCycle?.uuid]);

  // Function to check if pmtct_enrollment exists in activities
  const checkForPmtctEnrollment = (activities) => {
    if (!activities || !Array.isArray(activities)) {
      return;
    }

    // Check if any activity has path "pmtct-enrollment"
    const hasPmtctEnrollment = activities.some(
      (activity) => activity.path === "pmtct-enrollment"
    );

    // Update isOnPMTCT based on whether enrollment exists for the selected cycle
    if (props.setIsOnPMTCT) {
      props.setIsOnPMTCT(hasPmtctEnrollment);
    }
  };

  // Standalone fetch for use by delete handlers
  const RecentActivities = () => {
    if (!resolvedCycleUuid || !resolvedPatientUuid) return;

    axios
      .get(
        `${baseUrl}pmtct/anc/getAllActivities/${resolvedPatientUuid}?pmtctCycleUuid=${resolvedCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setRecentActivities(response.data);
        checkForPmtctEnrollment(response.data);
      })
      .catch(() => {});
  };
  const SummaryChart = () => {
    if (!resolvedCycleUuid || !resolvedPatientUuid) return;

    axios
      .get(
        `${baseUrl}pmtct/anc/get-pmtct-summary-chart/${resolvedPatientUuid}?pmtctCycleUuid=${resolvedCycleUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setSummaryChart(response.data);
      })
      .catch(() => {});
  };
  // Map activity names for display
  const displayActivityName = (name, data) => {
    if (!name) return name;
    if (name.toLowerCase() === "pmtct enrollment") return "Mother Clinical Information";
    // For HTS records, check testingType from payload first, then fall back to activityName
    if (name.toLowerCase() === "pmtct hts" || name.toLowerCase() === "retesting" || name.toLowerCase() === "initial") {
      if (data?.testingType && data.testingType.toUpperCase() === "RETESTING") return "Retesting";
      if (name.toLowerCase() === "retesting") return "Retesting";
      return "PMTCT HTS";
    }
    if (name.toLowerCase() === "mother follow up visit" || name.toLowerCase() === "mother follow-up visit") {
      if (data && data.visitType === "ANC_REVISIT") return "ANC Revisit";
      return name;
    }
    return name;
  };

  const ActivityName = (name) => {
    if (name === "pmtct-enrollment") {
      return "MI";
    } else if (name === "anc-enrollment") {
      return "AE";
    } else if (name === "anc-delivery") {
      return "AD";
    } else if (name === "anc-mother-visit") {
      return "MV";
    } else if (name === "pmtct_infant_visit") {
      return "IV";
    } else if (name === "pmtct_infant_information") {
      return "II";
    } else {
      return "RA";
    }
  };

  const LoadViewPage = (row, action) => {
    if (row.path === "anc-enrollment") {
      //props.setActiveContent({...props.activeContent, route:'anc-enrollment', id:row.id, actionType:action})
      history.push({
        pathname: "/update-patient",
        state: {
          id: row.recordId,
          patientObj: props.patientObj,
          actionType: action,
          postValue: "ANC",
          entrypointValue: props.entrypointValue,
        },
      });
    } else if (row.path === "anc-delivery") {
      props.setActiveContent({
        ...props.activeContent,
        route: "labour-delivery",
        id: row.recordId,
        actionType: action,
      });
    } else if (row.path === "pmtct-enrollment") {
      props.setActiveContent({
        ...props.activeContent,
        route: "anc-pnc",
        id: row.recordId,
        activeTab: "history",
        actionType: action,
      });
    } else if (row.path === "anc-mother-visit") {
      props.setActiveContent({
        ...props.activeContent,
        route: "consultation",
        id: row.recordId,
        activeTab: "home",
        actionType: action,
      });
    } else if (row.path === "pmtct_infant_visit") {
      props.setActiveContent({
        ...props.activeContent,
        route: "infant-visit",
        id: row.recordId,
        activeTab: "child",
        actionType: action,
      });
    } else if (row.path === "pmtct_infant_information") {
      props.setActiveContent({
        ...props.activeContent,
        route: "add-infant",
        id: row.recordId,
        activeTab: "home",
        actionType: action,
      });
    }  else if (row.path === "pmtct-hts") {
      props.setActiveContent({
        ...props.activeContent,
        route: "pmtct-hts",
        id: row.recordId,
        activeTab: "home",
        actionType: action,
      });

      console.log("setPmtctHtsRetestingType", row)
      // Check testingType from payload first, fall back to activityName
      const isRetesting = (row?.testingType && row.testingType.toUpperCase() === "RETESTING")
        || row?.activityName?.toLowerCase() === "retesting";
      props.setPmtctHtsRetestingType(isRetesting ? "retesting" : "pmtct-hts")
    }else {
    }
  };
  const LoadDeletePage = (row) => {
    if (row.path === "anc-enrollment") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/anc/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "pmtct-enrollment") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/pmtct/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "anc-delivery") {
      setSaving(false);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/delivery/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "anc-mother-visit") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/mothervisit/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "pmtct_infant_visit") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/infantvisit/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "pmtct_infant_information") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/infantinfo/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    } else if (row.path === "pmtct-hts") {
         setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}pmtct/anc/delete/pmtct-hts/${row.recordId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
          setSaving(false);
          // Notify parent so PatientCard re-fetches HIV status after HTS deletion
          if (props.setActiveContent) {
            props.setActiveContent((prev) => ({ ...prev, actionType: "hts-deleted" }));
          }
        })
        .catch((error) => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ""
                ? error.response.data.apierror.message
                : "Something went wrong, please try again";
            toast.error(errorMessage);
          } else {
            toast.error("Something went wrong. Please try again...");
          }
        });
    }
  };
  const LoadModal = (row) => {
    toggle();
    setRecord(row);
  };
  const index = 0;

  const activityColors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <Fragment>
      <div className="row" style={{ display: "flex", flexWrap: "wrap" }}>
        {/* Recent Activities */}
        <div className="col-xl-4 col-xxl-4 col-lg-4" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            background: "#fff", borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
            height: "100%",
          }}>
            <div style={{
              padding: "14px 20px",
              background: "#1466c2",
              borderRadius: "12px 12px 0 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Recent Activities
              </h4>
              <span style={{
                fontSize: "11px", fontWeight: "600", color: "#fff",
                background: "rgba(255,255,255,0.15)", padding: "2px 10px",
                borderRadius: "12px",
              }}>
                {recentActivities.length}
              </span>
            </div>
            <div style={{ padding: "8px 12px" }}>
              <PerfectScrollbar
                style={{ height: "370px" }}
                id="DZ_W_Todo1"
                className="widget-media dz-scroll ps ps--active-y"
              >
                {recentActivities.length > 0 ? (
                  recentActivities.map((data, i) => {
                    const accentColor = activityColors[i % activityColors.length];
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 10px",
                        borderRadius: "8px",
                        marginBottom: "4px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        background: activeAccordionHeaderShadow === i ? "#f8fafc" : "transparent",
                      }}
                      onClick={() => setActiveAccordionHeaderShadow(activeAccordionHeaderShadow === i ? -1 : i)}
                      >
                        {/* Icon */}
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "10px",
                          background: accentColor + "12",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: "800", color: accentColor,
                          flexShrink: 0,
                        }}>
                          {ActivityName(data.path)}
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "13px", fontWeight: "600", color: "#0f172a",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {displayActivityName(data.activityName, data)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            {data.activityDate}
                          </div>
                        </div>
                        {/* Actions */}
                        <Dropdown className="dropdown" onClick={(e) => e.stopPropagation()}>
                          <Dropdown.Toggle
                            variant="light"
                            style={{
                              background: "#f1f5f9", border: "none",
                              padding: "5px 7px", borderRadius: "8px",
                              lineHeight: 1, display: "flex", alignItems: "center",
                            }}
                          >
                            <svg width="16px" height="16px" viewBox="0 0 24 24">
                              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <circle fill="#475569" cx="5" cy="12" r="2.5" />
                                <circle fill="#475569" cx="12" cy="12" r="2.5" />
                                <circle fill="#475569" cx="19" cy="12" r="2.5" />
                              </g>
                            </svg>
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{
                            borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            border: "1px solid #f1f5f9", padding: "6px", minWidth: "140px",
                          }}>
                            <Dropdown.Item
                              onClick={() => LoadViewPage(data, "view")}
                              style={{ borderRadius: "6px", fontSize: "12px", fontWeight: "500", padding: "8px 12px", color: "#6366f1", display: "flex", alignItems: "center", gap: "8px" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              View
                            </Dropdown.Item>
                            {!notToBeUpdated.includes(data.path) && (
                              <>
                                <Dropdown.Item
                                  onClick={() => LoadViewPage(data, "update")}
                                  style={{ borderRadius: "6px", fontSize: "12px", fontWeight: "500", padding: "8px 12px", color: "#0ea5e9", display: "flex", alignItems: "center", gap: "8px" }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  Update
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => LoadModal(data, "delete")}
                                  style={{ borderRadius: "6px", fontSize: "12px", fontWeight: "500", padding: "8px 12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  Delete
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "50px 20px", textAlign: "center",
                  }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "12px",
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>
                      No recent activities
                    </div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", maxWidth: "160px", lineHeight: "1.4" }}>
                      Activities will show up here as forms are completed
                    </div>
                  </div>
                )}
              </PerfectScrollbar>
            </div>
          </div>
        </div>

        {/* Patient Chart */}
        {props.patientObj.dynamicHivStatus === "Positive" ||
        props.patientObj.hivStatus === "Positive" ? (
          <div className="col-xl-8 col-xxl-8 col-lg-8" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              background: "#fff", borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
              width: "100%",
            }}>
              <div style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#014d88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Patient Chart
                </h4>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div className="row">
                  {/* Metrics Column */}
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    {/* Clinic Visits Metric */}
                    <div style={{
                      background: "#f8fafc", borderRadius: "10px",
                      padding: "16px", marginBottom: "12px",
                    }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                        Total Clinic Visits
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                            {summartChart.motherVisit}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                            Mother
                          </div>
                        </div>
                        {infants.length > 0 && (
                          <>
                            <div style={{ width: "1px", background: "#e2e8f0" }} />
                            <div style={{ flex: 1, textAlign: "center" }}>
                              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                                {summartChart.childVisit}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                                Infant
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Infants Metric */}
                    <div style={{
                      background: "#f8fafc", borderRadius: "10px",
                      padding: "16px",
                    }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                        Infants{infants.length > 0 ? ` (${infants.length})` : ""}
                      </div>
                      {infants.length > 0 ? (
                        <div style={{ display: "flex", gap: "16px" }}>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a", lineHeight: 1 }}>
                              {summartChart.childAlive}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                              Alive
                            </div>
                          </div>
                          <div style={{ width: "1px", background: "#e2e8f0" }} />
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444", lineHeight: 1 }}>
                              {summartChart.childDead}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                              Dead
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          padding: "12px 8px", textAlign: "center",
                        }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "8px",
                          }}>
                            <svg width="18" height="18" viewBox="0 0 64 64" fill="#cbd5e1" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="12" r="8"/><ellipse cx="34" cy="32" rx="14" ry="9"/><ellipse cx="18" cy="42" rx="5" ry="7" transform="rotate(-20 18 42)"/><ellipse cx="48" cy="44" rx="5" ry="7" transform="rotate(20 48 44)"/><ellipse cx="10" cy="50" rx="4.5" ry="3" transform="rotate(-10 10 50)"/><ellipse cx="55" cy="52" rx="4.5" ry="3" transform="rotate(10 55 52)"/><ellipse cx="22" cy="26" rx="4" ry="5.5" transform="rotate(30 22 26)"/><ellipse cx="14" cy="20" rx="3.5" ry="2.5" transform="rotate(30 14 20)"/></svg>
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>No infant record</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Infant Details Column */}
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Current Infant Details
                    </div>
                    {infants.length > 0 ? (
                      <PerfectScrollbar
                        style={{ height: "300px" }}
                        id="DZ_W_TimeLine1"
                        className="dz-scroll ps ps--active-y"
                      >
                        {infants.map((obj, idx) => (
                          <div key={idx} style={{
                            display: "flex", alignItems: "flex-start", gap: "12px",
                            padding: "12px 14px", borderRadius: "8px",
                            background: "#f8fafc", marginBottom: "8px",
                          }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              background: idx % 2 === 0 ? "#6366f112" : "#10b98112",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "14px", flexShrink: 0,
                              color: idx % 2 === 0 ? "#6366f1" : "#10b981",
                              fontWeight: "700",
                            }}>
                              {obj.firstName ? obj.firstName.charAt(0).toUpperCase() : "I"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                                {obj.firstName || "---"}
                              </div>
                              <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>
                                  DOB: <span style={{ fontWeight: "600", color: "#475569" }}>{obj.dateOfDelivery}</span>
                                </span>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>
                                  Sex: <span style={{ fontWeight: "600", color: "#475569" }}>{obj.sex === "SEX_FEMALE" ? "Female" : "Male"}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </PerfectScrollbar>
                    ) : (
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "40px 20px", textAlign: "center",
                        background: "#f8fafc", borderRadius: "10px", border: "1px dashed #e2e8f0",
                        minHeight: "200px",
                      }}>
                        <div style={{
                          width: "56px", height: "56px", borderRadius: "50%",
                          background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: "14px",
                        }}>
                          <svg width="28" height="28" viewBox="0 0 64 64" fill="#a5b4fc" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="12" r="8"/><ellipse cx="34" cy="32" rx="14" ry="9"/><ellipse cx="18" cy="42" rx="5" ry="7" transform="rotate(-20 18 42)"/><ellipse cx="48" cy="44" rx="5" ry="7" transform="rotate(20 48 44)"/><ellipse cx="10" cy="50" rx="4.5" ry="3" transform="rotate(-10 10 50)"/><ellipse cx="55" cy="52" rx="4.5" ry="3" transform="rotate(10 55 52)"/><ellipse cx="22" cy="26" rx="4" ry="5.5" transform="rotate(30 22 26)"/><ellipse cx="14" cy="20" rx="3.5" ry="2.5" transform="rotate(30 14 20)"/></svg>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", marginBottom: "4px" }}>
                          No infant records yet
                        </div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", maxWidth: "180px", lineHeight: "1.4" }}>
                          Infant details will appear here once registered during Labour &amp; Delivery
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* HTS referral notice */}
        <>
          <div className="col-sm-6 col-md-6 col-lg-6">
            <div style={{ padding: "12px 0" }}>
              {props.checkForRetesting &&
              !recentActivities.some(
                (activity) => activity.path === "pmtct-hts"
              ) &&
              (!props.patientObj.dynamicHivStatus ||
                props.patientObj.dynamicHivStatus === "") &&
              (!props.patientObj.staticHivStatus ||
                props.patientObj.staticHivStatus === "") &&
              (!props.patientObj.hivStatus ||
                props.patientObj.hivStatus === "") ? (
                <div style={{
                  padding: "12px 16px", borderRadius: "8px",
                  background: "#fffbeb", color: "#92400e",
                  fontSize: "13px", fontWeight: "600",
                }}>
                  Patient has no HTS record. Please refer for testing...
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </>

        {/* Delete Confirmation Modal */}
        <Modal
          show={open}
          toggle={toggle}
          className="fade"
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          backdrop="static"
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter" style={{ fontSize: "16px", fontWeight: "700" }}>
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>
              Are you sure you want to delete <b style={{ color: "#0f172a" }}>{record && displayActivityName(record.activityName, record)}</b>?
            </p>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid #f1f5f9", gap: "8px" }}>
            <Button
              onClick={toggle}
              disabled={saving}
              style={{
                backgroundColor: "#f1f5f9", color: "#475569",
                borderRadius: "8px", fontWeight: "600", fontSize: "13px",
                border: "none", padding: "8px 20px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => LoadDeletePage(record)}
              disabled={saving}
              style={{
                backgroundColor: "#ef4444", color: "#fff",
                borderRadius: "8px", fontWeight: "600", fontSize: "13px",
                border: "none", padding: "8px 20px",
              }}
            >
              {saving === false ? "Delete" : "Deleting..."}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Fragment>
  );
};

export default RecentHistory;
