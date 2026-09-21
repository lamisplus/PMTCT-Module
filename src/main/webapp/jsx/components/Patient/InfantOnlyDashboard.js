import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { url as baseUrl, token } from "./../../../api";
import { Card } from "react-bootstrap";
import AddInfants from "./../PmtctServices/Infants/InfantRegistration";
import InfantVisit from "./../Consultation/InfantVisit";

// Dedicated dashboard for an HIV-Exposed Infant with no maternal record in the system.
// Deliberately does NOT reuse PatientDetail.js — that component carries a lot of
// pregnancy-shaped state (active PMTCT cycle, ANC effects, menu items) that doesn't apply
// to a non-pregnant patient, and bolting a third identity onto it via more conditionals is
// the same pattern that caused most of this week's bugs. This dashboard only ever shows
// two things: Infant Information, and — once that exists — Infant Visit.
const InfantOnlyDashboard = () => {
  const history = useHistory();
  const patientObj = history.location && history.location.state
    ? history.location.state.patientObj
    : {};
  const infantPatientUuid =
    patientObj.patient_uuid || patientObj.patientUuid || patientObj.uuid;

  const [activeContent, setActiveContentRaw] = useState({ route: "overview" });
  const [infantRecord, setInfantRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // AddInfants/InfantVisit signal "done, go back" using their own route sentinels
  // ("infants" and "recent-history" respectively) — map both back to this dashboard's
  // overview instead of a route that doesn't exist here.
  const setActiveContent = (newContent) => {
    if (newContent.route === "infants" || newContent.route === "recent-history") {
      setActiveContentRaw({ route: "overview" });
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

  useEffect(() => {
    if (activeContent.route === "overview") {
      checkInfantRecord();
    }
  }, [activeContent.route]);

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
    if (!infantRecord) return;
    setActiveContentRaw({
      route: "infant-visit",
      actionType: "create",
      activeTab: "child",
    });
  };

  const fullName =
    patientObj.fullName ||
    `${patientObj.firstName || ""} ${patientObj.surname || ""}`.trim();

  return (
    <div style={{ padding: "20px" }}>
      <Card style={{ marginBottom: "20px" }}>
        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h5 style={{ margin: 0, color: "#014d88" }}>{fullName || "HIV-Exposed Infant"}</h5>
              <span style={{ fontSize: "13px", color: "#6c757d" }}>
                {patientObj.hospitalNumber ? `Hospital No: ${patientObj.hospitalNumber} · ` : ""}
                {patientObj.sex ? `${patientObj.sex} · ` : ""}
                {patientObj.dateOfBirth ? `DOB: ${patientObj.dateOfBirth}` : ""}
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#a3542e",
                border: "1px solid #d6ac8c",
                background: "#f3e3d6",
                borderRadius: "4px",
                padding: "4px 10px",
                height: "fit-content",
              }}
            >
              HIV-Exposed Infant — no maternal record
            </span>
          </div>
        </Card.Body>
      </Card>

      {activeContent.route === "overview" && (
        <Card>
          <Card.Body>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "320px" }}>
                <button
                  onClick={openInfantInformation}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "4px",
                    border: "1px solid #a9c2ac",
                    background: "#e2ebe3",
                    color: "#3d6a54",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Infant Information {infantRecord ? "(view / edit)" : "(not yet registered)"}
                </button>
                {infantRecord ? (
                  <button
                    onClick={openInfantVisit}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "4px",
                      border: "1px solid #a9c2ac",
                      background: "#e2ebe3",
                      color: "#3d6a54",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    Infant Visit
                  </button>
                ) : (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderRadius: "4px",
                      border: "1px dashed #c9cdbf",
                      color: "#6c757d",
                      fontStyle: "italic",
                      fontSize: "13px",
                    }}
                  >
                    Infant Visit — unlocks once Infant Information is saved
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeContent.route === "add-infant" && (
        <AddInfants
          patientObj={patientObj}
          patientAge={patientObj.age}
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
