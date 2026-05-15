import React, { useEffect, useState } from "react";
import axios from "axios";
import { url as baseUrl, token } from "./../../../../api";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { calculate_age } from "../../../utils";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Dropdown } from "react-bootstrap";

const cardStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: "0.5rem",
  overflow: "visible",
  backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const headerBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  backgroundColor: "#f8f9fa",
  borderBottom: "1px solid #e0e0e0",
};

const titleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "700",
  fontSize: "15px",
  color: "#1e293b",
  margin: 0,
};

const iconStyle = {
  fontSize: "20px",
  color: "#014d88",
};

const addBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#014d88",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "7px 16px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const thStyle = {
  padding: "10px 14px",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#fff",
  backgroundColor: "#014d88",
  borderBottom: "2px solid #013a66",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 14px",
  fontSize: "13.5px",
  color: "#334155",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

const rowHoverClass = "infant-row";

const badgeStyle = (color) => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  backgroundColor: color === "blue" ? "#dbeafe" : color === "pink" ? "#fce7f3" : "#e2e8f0",
  color: color === "blue" ? "#1e40af" : color === "pink" ? "#9d174d" : "#475569",
});

const actionBtnStyle = {
  backgroundColor: "transparent",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  padding: "5px 12px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#475569",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "48px 20px",
  color: "#94a3b8",
};

const InfantInformation = (props) => {
  const [infants, setInfants] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aliveChild, setAliveChild] = useState(0);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toggle = () => setOpen(!open);

  useEffect(() => {
    InfantInfoByUuid();
    DeliveryInfo();
  }, [props?.latestPmtctCycle?.uuid, props?.selectedCycleId]);

  const InfantInfoByUuid = () => {
    let patientUuid = props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid
      ? props.patientObj.patientUuid
      : props.patientObj.uuid;

    setLoading(true);
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${patientUuid}?pmtctCycleUuid=${props?.latestPmtctCycle?.uuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setLoading(false);
        setInfants(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.log("the errr", error);
      });
  };

  const handleDeliveryResponse = (data) => {
    if (data && data.dateOfDelivery) {
      setDelivery(data.dateOfDelivery);
      const alive = data.numberOfInfantsAlive;
      setAliveChild(alive != null && alive > 0 ? alive : 0);
      return true;
    }
    return false;
  };

  const DeliveryInfo = () => {
    const pmtctCycleUuid =
      props?.latestPmtctCycle?.uuid ||
      props?.selectedCycleId ||
      props?.patientObj?.pmtctCycleUuid;
    let patientUuid = props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid
      ? props.patientObj.patientUuid
      : props.patientObj.uuid;

    if (!patientUuid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (pmtctCycleUuid) {
      axios
        .get(
          `${baseUrl}pmtct/anc/view-delivery-with-uuid/${patientUuid}/${pmtctCycleUuid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setLoading(false);
          if (!handleDeliveryResponse(response.data)) {
            fetchLatestDelivery(patientUuid);
          }
        })
        .catch((error) => {
          console.log("Error fetching delivery info by cycle, trying fallback:", error);
          fetchLatestDelivery(patientUuid);
        });
    } else {
      fetchLatestDelivery(patientUuid);
    }
  };

  const fetchLatestDelivery = (patientUuid) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-latest-delivery/${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setLoading(false);
        handleDeliveryResponse(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.log("Error fetching latest delivery info:", error);
      });
  };

  const LoadPage = (obj, actionType) => {
    props.setActiveContent({
      ...props.activeContent,
      route: "add-infant",
      id: obj?.id,
      actionType: actionType,
      obj: obj,
    });
  };

  const LoadVisitPage = (obj) => {
    props.setActiveContent({
      ...props.activeContent,
      route: "infant-visit",
      id: "",
      actionType: "create",
      activeTab: "child",
      obj: obj,
    });
  };

  const LoadDeletePage = (row) => {
    setSaving(true);
    axios
      .delete(`${baseUrl}pmtct/anc/delete/infantinfo/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        toast.success("Record Deleted Successfully");
        InfantInfoByUuid();
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
  };

  const LoadModal = (row) => {
    toggle();
    setRecord(row);
  };

  const getSexDisplay = (sex) => {
    if (sex === "Female" || sex === "SEX_FEMALE") return "Female";
    return "Male";
  };

  const getSexBadgeColor = (sex) => {
    const display = getSexDisplay(sex);
    return display === "Female" ? "pink" : "blue";
  };

  const filteredInfants = infants.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = ((row.firstName || "") + " " + (row.surname || "")).toLowerCase();
    const hospNo = (row.infantHospitalNumber || "").toLowerCase();
    return name.includes(term) || hospNo.includes(term);
  });

  return (
    <div>
      <style>
        {`
          .infant-row:hover {
            background-color: #f8fafc !important;
          }
          .infant-row .dropdown-menu.show {
            z-index: 1050 !important;
            position: absolute !important;
          }
        `}
      </style>

      <div style={cardStyle}>
        {/* Header bar */}
        <div style={headerBarStyle}>
          <h6 style={titleStyle}>
            <ChildCareIcon style={iconStyle} />
            List of Infants
            {infants.length > 0 && (
              <span
                style={{
                  backgroundColor: "#014d88",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginLeft: "4px",
                }}
              >
                {infants.length}
              </span>
            )}
          </h6>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or hospital no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "13px",
                width: "220px",
                outline: "none",
              }}
            />
            {delivery && typeof delivery === "string" && delivery !== "" && (
              <button
                style={addBtnStyle}
                onClick={() => LoadPage(delivery, "create")}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#013a66")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#014d88")}
              >
                <PersonAddIcon style={{ fontSize: "16px" }} />
                New Infant
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <CircularProgress size={32} style={{ color: "#014d88" }} />
          </div>
        ) : filteredInfants.length === 0 ? (
          <div style={emptyStateStyle}>
            <ChildCareIcon style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
              {searchTerm ? "No matching infants found" : "No infants registered yet"}
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>
              {searchTerm
                ? "Try adjusting your search term"
                : "Click 'New Infant' to register an infant for this mother"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "visible" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "40px", textAlign: "center" }}>#</th>
                  <th style={thStyle}>Infant Name</th>
                  <th style={thStyle}>Hospital No.</th>
                  <th style={thStyle}>Sex</th>
                  <th style={thStyle}>Date of Birth</th>
                  <th style={thStyle}>Age</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInfants.map((row, index) => (
                  <tr key={row.id || index} className={rowHoverClass} style={{ transition: "background 0.1s ease" }}>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: "600", color: "#94a3b8" }}>
                      {index + 1}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "600", color: "#1e293b" }}>
                      {(row.firstName || "") + " " + (row.surname || "")}
                    </td>
                    <td style={tdStyle}>
                      <code
                        style={{
                          backgroundColor: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12.5px",
                          color: "#475569",
                        }}
                      >
                        {row.infantHospitalNumber || "-"}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(getSexBadgeColor(row.sex))}>
                        {getSexDisplay(row.sex)}
                      </span>
                    </td>
                    <td style={tdStyle}>{row.dateOfDelivery || "-"}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>
                        {calculate_age(row.dateOfDelivery)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap", position: "relative", overflow: "visible" }}>
                      <Dropdown drop="down">
                        <Dropdown.Toggle variant="" id={`dropdown-actions-${row.id || index}`} style={actionBtnStyle}>
                          Actions &#9662;
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ zIndex: 1050 }}>
                          <Dropdown.Item onClick={() => LoadPage(row, "view")}>View</Dropdown.Item>
                          <Dropdown.Item onClick={() => LoadPage(row, "update")}>Edit</Dropdown.Item>
                          <Dropdown.Item onClick={() => LoadVisitPage(row)}>Follow Up Visit</Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => LoadModal(row)} style={{ color: "#dc2626" }}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
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
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Are you Sure you want to delete -{" "}
            <b>{record && record.firstName + " " + record.surname}</b>
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => LoadDeletePage(record)}
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 20px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            disabled={saving}
          >
            {saving === false ? "Yes, Delete" : "Deleting..."}
          </button>
          <button
            onClick={toggle}
            style={{
              backgroundColor: "#014d88",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 20px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            disabled={saving}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InfantInformation;
