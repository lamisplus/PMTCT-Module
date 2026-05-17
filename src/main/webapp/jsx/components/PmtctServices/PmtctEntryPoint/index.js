import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link, useHistory } from "react-router-dom";
import { url as baseUrl, token } from "../../../../api";
import axios from "axios";
import { usePermissions } from "../../../../hooks/usePermissions";

import React, { useState, useEffect, useMemo } from "react";

const entryPointMeta = {
  ANC: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007bb6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: "#007bb6",
    bg: "#e8f4fc",
    description: "Antenatal Care registration",
  },
  "L&D": {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#992E62" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: "#992E62",
    bg: "#fdf2f8",
    description: "Labour & Delivery entry",
  },
  "Post-Partum": {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: "#16a34a",
    bg: "#f0fdf4",
    description: "Post-partum period entry",
  },
};

const postPartumOptions = [
  { value: "≤ 72 hrs", label: "≤ 72 hrs" },
  { value: "> 72 hrs - < 6 month", label: "> 72 hrs – < 6 months" },
  { value: "> 6 months - 12 months", label: "> 6 months – 12 months" },
];

const PmtctEntryPoint = (props) => {
  const [entryPoint, setentryPoint] = useState([]);
  const [expandedPostPartum, setExpandedPostPartum] = useState(false);

  const history = useHistory();
  const { hasPermission, hasRDErole } = usePermissions();

  const permissions = useMemo(
    () => ({
      canSeePMTCT: hasPermission("maternal_cohort_register"),
      genAndPmtct: hasRDErole || hasPermission("maternal_cohort_register"),
      genAndANC: hasRDErole || hasPermission("general_anc_register"),
    }),
    [hasPermission, hasRDErole]
  );

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${baseUrl}application-codesets/v2/PMTCT_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (isMounted) {
          setentryPoint(response.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset expanded state when modal opens/closes
  useEffect(() => {
    if (!props.show) {
      setExpandedPostPartum(false);
    }
  }, [props.show]);

  const isReEnrollment = props?.info?.patientObj?.hasExistingEnrollment;

  const cardStyle = (color, bg) => ({
    flex: "1 1 0",
    minWidth: "160px",
    maxWidth: "220px",
    background: "#fff",
    border: `1.5px solid ${bg}`,
    borderRadius: "12px",
    padding: "20px 14px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  });

  const cardHoverHandlers = (color, bg) => ({
    onMouseEnter: (e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 4px 16px ${color}20`;
      e.currentTarget.style.transform = "translateY(-2px)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.borderColor = bg;
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    },
  });

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="pmtct-entry-point-modal"
      centered
    >
      <div style={{ padding: "28px 24px 24px", background: "#fff", borderRadius: "8px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
          <h5 style={{ color: "#0f172a", fontWeight: "700", fontSize: "16px", margin: "0 0 4px" }}>
            {isReEnrollment ? "Re-enroll Patient" : "Select Entry Point"}
          </h5>
          <p style={{ color: "#94a3b8", fontSize: "12.5px", margin: 0 }}>
            Choose how the patient enters the PMTCT program
          </p>
        </div>

        {/* Entry Point Cards */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "14px", flexWrap: "nowrap", marginBottom: "24px",
        }}>
          {entryPoint.map((each, i) => {
            const meta = entryPointMeta[each.display];
            if (!meta) return null;

            if (each.display === "ANC" && permissions.genAndANC) {
              return (
                <Link
                  key={i}
                  to={{
                    pathname: props.route,
                    state: {
                      showANC: true,
                      postValue: each.display,
                      entrypointValue: each.code,
                      ...props.info,
                    },
                  }}
                  style={cardStyle(meta.color, meta.bg)}
                  {...cardHoverHandlers(meta.color, meta.bg)}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: meta.bg, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: meta.color }}>
                    {each.display}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.3" }}>
                    {meta.description}
                  </div>
                </Link>
              );
            }

            if (each.display === "L&D" && permissions.genAndPmtct) {
              return (
                <Link
                  key={i}
                  to={{
                    pathname: props.route,
                    state: {
                      showANC: false,
                      postValue: each.display,
                      entrypointValue: each.code,
                      ...props.info,
                    },
                  }}
                  style={cardStyle(meta.color, meta.bg)}
                  {...cardHoverHandlers(meta.color, meta.bg)}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: meta.bg, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: meta.color }}>
                    {each.display}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.3" }}>
                    {meta.description}
                  </div>
                </Link>
              );
            }

            if (each.display === "Post-Partum" && permissions.genAndPmtct) {
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={cardStyle(meta.color, meta.bg)}
                    onClick={() => setExpandedPostPartum(!expandedPostPartum)}
                    {...cardHoverHandlers(meta.color, meta.bg)}
                  >
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: meta.bg, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {meta.icon}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: meta.color, display: "flex", alignItems: "center", gap: "4px" }}>
                      {each.display}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: expandedPostPartum ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.3" }}>
                      {meta.description}
                    </div>
                  </div>

                  {/* Post-Partum sub-options */}
                  {expandedPostPartum && (
                    <div style={{
                      marginTop: "8px", display: "flex", flexDirection: "column",
                      gap: "6px", width: "100%",
                    }}>
                      {postPartumOptions.map((opt, j) => (
                        <div
                          key={j}
                          onClick={() => {
                            history.push({
                              pathname: props.route,
                              state: {
                                showANC: false,
                                postValue: each.display,
                                subPostValue: opt.value,
                                entrypointValue: each.code,
                                ...props.info,
                              },
                            });
                          }}
                          style={{
                            padding: "8px 12px", borderRadius: "8px",
                            background: meta.bg, border: `1px solid ${meta.bg}`,
                            cursor: "pointer", fontSize: "12px",
                            fontWeight: "600", color: meta.color,
                            textAlign: "center", transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = meta.color;
                            e.currentTarget.style.background = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = meta.bg;
                            e.currentTarget.style.background = meta.bg;
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={props.onHide}
            style={{
              background: "none", border: "none",
              color: "#94a3b8", fontSize: "13px",
              fontWeight: "600", cursor: "pointer",
              padding: "6px 20px", borderRadius: "6px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#475569";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PmtctEntryPoint;
