import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import EventIcon from "@material-ui/icons/Event";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import TimelineIcon from "@material-ui/icons/Timeline";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import ScheduleIcon from "@material-ui/icons/Schedule";
import SchoolIcon from "@material-ui/icons/School";
import HealingIcon from "@material-ui/icons/Healing";
import AssessmentIcon from "@material-ui/icons/Assessment";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import { GET_CODESETS_IN_BATCH } from "../../../utils";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    flexGrow: 1,
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
      borderColor: "#d2d6dc",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const sectionContainerStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: "0.35rem",
  padding: "15px 10px",
  backgroundColor: "#f8f9fa",
};

const sectionHeaderStyle = {
  backgroundColor: "transparent",
  color: "#2d3748",
  padding: "8px 12px",
  borderRadius: "0.25rem",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const sectionIconStyle = {
  fontSize: "16px",
  color: "#014d88",
  marginRight: "6px",
  verticalAlign: "text-bottom",
};

const ClinicVisit = (props) => {
  let patientObj = props.patientObj ? props.patientObj : {};
  const [activeVisitType, setActiveVisitType] = useState(props.motherVisitType || "MOTHER_VISIT");
  const isAncRevisit = activeVisitType === "ANC_REVISIT";

  // Sync activeVisitType when the submenu toggle changes props.motherVisitType
  useEffect(() => {
    if (props.motherVisitType) {
      setActiveVisitType(props.motherVisitType);
    }
  }, [props.motherVisitType]);

  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);

  // Disable the initial visit date field if patient already has enrollment date
  const [isInitialVisitDisabled, setIsInitialVisitDisabled] = useState(
    patientObj?.pmtctEnrollmentDate ||
      patientObj?.pmtctEnrollmentRespondDto?.pmtctEnrollmentDate
      ? true
      : false,
  );
  let temp = { ...errors };
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [visitStatus, setVisitStatus] = useState([]);
  const [maternalCome, setMaternalCome] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [regimenType, setRegimenType] = useState([]);
  const [selectedRegimenLineId, setSelectedRegimenLineId] = useState("");
  const [cycleClosed, setCycleClosed] = useState(false);

  const [objValues, setObjValues] = useState({
    dateOfViralLoad: "",
    dateOfVlResultReceived: "",
    dateOfInitialVisit: patientObj?.pmtctEnrollmentDate
      ? patientObj.pmtctEnrollmentDate
      : patientObj?.pmtctEnrollmentRespondDto?.pmtctEnrollmentDate
        ? patientObj?.pmtctEnrollmentRespondDto.pmtctEnrollmentDate
        : "",
    currentStatus: "",
    weight: "",
    sfhLength: "",
    currentArtStatus: "",
    mothersArtRegimen: "",
    regimenLineId: "",
    currentHbvStatus: "",
    nameOfHbvDrug: "",
    currentSyphilisStatus: "",
    nameOfSyphilisDrug: "",
    infantFeedingPractice: "",
    infantOnCtx: "",
    referredToTreatment: "",
    dateOfVisit: "",
    dateOfmeternalOutcome: "",
    gaOfViralLoad: "",
    id: "",
    maternalOutcome: "",
    nextAppointmentDate: "",
    patientUuid: patientObj.patient_uuid
      ? patientObj.patient_uuid
      : patientObj.patientUuid,
    resultOfViralLoad: "",
    visitStatus: "",
    timeOfViralLoad: "",
    signature: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    source: "WEB",
    visitType: activeVisitType,
    // Shared fields (Mother Visit & ANC Revisit)
    height: "",
    systolic: "",
    diastolic: "",
    gaWeeks: "",
    numberOfAncVisits: "",
    ancAttendance: "",
    counsellingHts: "",
    counsellingFgm: "",
    counsellingFp: "",
    counsellingMaternalNutrition: "",
    counsellingEarlyBf: "",
    counsellingExclusiveBf: "",
    hbPcv: "",
    bloodSugarGdm: "",
    urinalysisSugar: "",
    urinalysisProteins: "",
    llinGiven: "",
    iptDose: "",
    hematinicsGiven: "",
    tdImmunization: "",
    associatedProblems: "",
    referralReason: "",
    transportationOut: "",
    hepatitisCTestResult: "",
    referredForHcv: "",
    outcomeOfVisit: "",
  });

  const getInitialVisitDate = () => {
    const pmtctCycleUuid =
      props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;
    const patientUuid = props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid;

    if (!pmtctCycleUuid || !patientUuid) {
      return;
    }

    axios
      .get(
        `${baseUrl}pmtct/anc/get-initial-visit-date/${patientUuid}?pmtctCycleUuid=${pmtctCycleUuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((response) => {
        if (response.data) {
          setObjValues((prevValues) => ({
            ...prevValues,
            dateOfInitialVisit: response.data,
          }));
          setIsInitialVisitDisabled(true);
        }
      })
      .catch((error) => {
      });
  };

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "VISIT_STATUS_PMTCT",
      "MATERNAL_OUTCOME",
    ).then((response) => {
      setVisitStatus(response.data.VISIT_STATUS_PMTCT);
      setMaternalCome(response.data.MATERNAL_OUTCOME);
    });
  };


  const checkCycleClosed = () => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;
    if (!pmtctCycleUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/is-cycle-closed/${pmtctCycleUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data === true) {
          setCycleClosed(true);
        }
      })
      .catch((error) => {});
  };

  const getLatestArtRegimen = () => {
    const patientUuid = props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid;
    if (!patientUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/get-latest-art-regimen/${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && response.data !== "") {
          // Only auto-populate if creating a new visit (not editing)
          if (!props.activeContent?.id || props.activeContent?.actionType === "create") {
            setObjValues((prev) => ({
              ...prev,
              mothersArtRegimen: prev.mothersArtRegimen || response.data,
            }));
          }
        }
      })
      .catch((error) => {});
  };

  const AdultRegimenLine = () => {
    axios
      .get(`${baseUrl}hiv/regimen/arv/adult`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const artRegimen = response.data.filter(
          (x) => x.id === 1 || x.id === 2 || x.id === 14
        );
        setAdultRegimenLine(artRegimen);
      })
      .catch((error) => {});
  };

  const RegimenType = (id) => {
    if (!id) return;
    axios
      .get(`${baseUrl}hiv/regimen/types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRegimenType(response.data);
      })
      .catch((error) => {});
  };

  const handleSelectRegimenLine = (e) => {
    const lineId = e.target.value;
    setSelectedRegimenLineId(lineId);
    setObjValues({ ...objValues, mothersArtRegimen: "", regimenLineId: lineId });
    if (lineId) {
      RegimenType(lineId);
    } else {
      setRegimenType([]);
    }
  };

  const handleSelectRegimen = (e) => {
    const selectedValue = e.target.value;
    setErrors({ ...temp, mothersArtRegimen: "" });
    setObjValues({ ...objValues, mothersArtRegimen: selectedValue });
  };

  useEffect(() => {
    GET_CODESETS();
    getInitialVisitDate();
    AdultRegimenLine();
    getLatestArtRegimen();
    checkCycleClosed();

    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null &&
      props.activeContent.activeTab === "home" &&
      props.activeContent.actionType !== "create"
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false,
      );
    }
  }, [props.activeContent]);

  // Re-check cycle closure when latestPmtctCycle is populated asynchronously
  useEffect(() => {
    if (props.latestPmtctCycle?.uuid) {
      checkCycleClosed();
    }
  }, [props.latestPmtctCycle?.uuid]);


  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-mother-visit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Convert null values to empty strings so controlled inputs display properly
        const data = response.data;
        const sanitized = {};
        Object.keys(data).forEach((key) => {
          sanitized[key] = data[key] !== null && data[key] !== undefined ? data[key] : "";
        });
        setObjValues({
          ...sanitized,
          pmtctCycleUuid:
            sanitized.pmtctCycleUuid || props?.latestPmtctCycle?.uuid,
          source: sanitized.source || "WEB",
        });
        if (sanitized.visitType) {
          setActiveVisitType(sanitized.visitType);
        }
        // Restore regimen line selection and fetch its regimen types
        if (sanitized.regimenLineId) {
          setSelectedRegimenLineId(sanitized.regimenLineId);
          RegimenType(sanitized.regimenLineId);
        }
      })
      .catch((error) => {
      });
  };

  const handleInputChange = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "dateOfViralLoad" && e.target.value !== "") {
      async function getGa() {
        const dateOfViralLoad = e.target.value;
        //?ancNo=001&visitDate=2023-02-01
        const pmtctCycleUuid =
          props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;

        if (!pmtctCycleUuid) {
          console.error(
            "pmtctCycleUuid is required for gestational age calculation",
          );
          return;
        }

        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga-from-person?patientUuid=${
            props.patientObj.patient_uuid
              ? props.patientObj.patient_uuid
              : props.patientObj.patientUuid
          }&visitDate=${dateOfViralLoad}&pmtctCycleUuid=${pmtctCycleUuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          },
        );
        if (response.data > 0) {
          objValues.gaOfViralLoad = response.data;
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        } else {
          //toast.error("Please select a valid date")
          setObjValues({ ...objValues, [e.target.name]: e.target.value });
        }
      }
      getGa();

      // get the value of the viral load according to the viral load date
      async function getViralLoadValue() {
        const dateOfViralLoad = e.target.value;
        //?ancNo=001&visitDate=2023-02-01
        const response = await axios.get(
          `${baseUrl}pmtct/anc/vl-result/?PersonUuid=${
            props.patientObj.patient_uuid
              ? props.patientObj.patient_uuid
              : props.patientObj.patientUuid
          }&dateResultReceived=${dateOfViralLoad}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.length > 0 && response.data[0]) {
          setObjValues({
            ...objValues,
            resultOfViralLoad: response.data[0].currentViralLoad,
          });
        }
        // else {
        //   setObjValues({ ...objValues, [e.target.name]: e.target.value });
        // }
      }
      getViralLoadValue();

      //
    }
    if (
      e.target.name === "visitStatus" &&
      e.target.value !== "VISIT_STATUS_PMTCT_TRANSFER_OUT"
    ) {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
    if (e.target.name === "maternalOutcome" &&
      e.target.value === "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT"
    ) {
      setObjValues({ ...objValues, dateOfmeternalOutcome: "", [e.target.name]: e.target.value });
      return;
    }
    if (e.target.name === "currentHbvStatus" &&
      e.target.value !== "Positive on Treatment" &&
      e.target.value !== "Positive on Prophylaxis"
    ) {
      setObjValues({ ...objValues, nameOfHbvDrug: "", [e.target.name]: e.target.value });
      return;
    }
    if (e.target.name === "currentSyphilisStatus" &&
      e.target.value !== "Positive on Treatment"
    ) {
      setObjValues({ ...objValues, nameOfSyphilisDrug: "", [e.target.name]: e.target.value });
      return;
    }
    if (e.target.name === "hepatitisCTestResult" &&
      e.target.value !== "Positive"
    ) {
      setObjValues({ ...objValues, referredForHcv: "", [e.target.name]: e.target.value });
      return;
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  //Validations of the forms
  const validate = () => {
    temp.dateOfVisit = objValues.dateOfVisit ? "" : "This field is required";
    temp.weight = objValues.weight ? "" : "This field is required";
    if (objValues.weight && (objValues.weight < 30 || objValues.weight > 180)) {
      temp.weight = "Weight must be between 30 and 180 kg";
    }
    temp.nextAppointmentDate = objValues.nextAppointmentDate ? "" : "This field is required";
    if (objValues.nextAppointmentDate && objValues.dateOfVisit &&
      objValues.nextAppointmentDate < objValues.dateOfVisit) {
      temp.nextAppointmentDate = "Next Appointment Date must be on or after the current visit date";
    }

    if (isAncRevisit) {
      // ANC Revisit validation
      temp.sfhLength = objValues.sfhLength ? "" : "This field is required";
    } else {
      // Mother Visit validation
      temp.currentStatus = objValues.currentStatus ? "" : "This field is required";
      temp.sfhLength = objValues.sfhLength ? "" : "This field is required";
      temp.currentArtStatus = objValues.currentArtStatus ? "" : "This field is required";
      temp.mothersArtRegimen = objValues.mothersArtRegimen ? "" : "This field is required";
      if (
        (objValues.currentHbvStatus === "Positive on Treatment" ||
          objValues.currentHbvStatus === "Positive on Prophylaxis") &&
        !objValues.nameOfHbvDrug
      ) {
        temp.nameOfHbvDrug = "This field is required";
      }
      if (
        objValues.currentSyphilisStatus === "Positive on Treatment" &&
        !objValues.nameOfSyphilisDrug
      ) {
        temp.nameOfSyphilisDrug = "This field is required";
      }
      // Conditional VL group validation: if any VL field is filled, all become mandatory
      const hasAnyVlField = objValues.dateOfViralLoad || objValues.resultOfViralLoad || objValues.dateOfVlResultReceived;
      if (hasAnyVlField) {
        temp.dateOfViralLoad = objValues.dateOfViralLoad ? "" : "This field is required when any VL field is filled";
        temp.resultOfViralLoad = objValues.resultOfViralLoad ? "" : "This field is required when any VL field is filled";
        temp.dateOfVlResultReceived = objValues.dateOfVlResultReceived ? "" : "This field is required when any VL field is filled";
        if (objValues.dateOfVlResultReceived && objValues.dateOfViralLoad &&
          objValues.dateOfVlResultReceived < objValues.dateOfViralLoad) {
          temp.dateOfVlResultReceived = "Date VL Result Received cannot be before the Sample Collection Date";
        }
      }
      temp.infantFeedingPractice = objValues.infantFeedingPractice ? "" : "This field is required";
      temp.infantOnCtx = objValues.infantOnCtx ? "" : "This field is required";
      temp.referredToTreatment = objValues.referredToTreatment ? "" : "This field is required";
      temp.visitStatus = objValues.visitStatus ? "" : "This field is required";
      temp.maternalOutcome = objValues.maternalOutcome
        ? ""
        : "This field is required";
      if (objValues.maternalOutcome && objValues.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT") {
        temp.dateOfmeternalOutcome = objValues.dateOfmeternalOutcome
          ? ""
          : "This field is required";
      }
      temp.signature = objValues.signature ? "" : "This field is required";
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-mother-visit/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .then((response) => {
            setSaving(false);
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              toast.error(errorMessage, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            } else {
              toast.error("Something went wrong. Please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      } else {
        axios
          .post(`${baseUrl}pmtct/anc/pmtct-visit`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              toast.error(errorMessage, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            } else {
              toast.error("Something went wrong. Please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    }
  };

  const handleReopenCycle = () => {
    const pmtctCycleUuid = props.latestPmtctCycle?.uuid || props.patientObj?.pmtctCycleUuid;
    if (!pmtctCycleUuid) return;
    axios
      .put(`${baseUrl}pmtct/anc/reopen-cycle/${pmtctCycleUuid}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success("Cycle re-opened successfully");
        setCycleClosed(false);
      })
      .catch((error) => {
        toast.error("Failed to re-open cycle");
        console.log("Error re-opening cycle:", error);
      });
  };

  // If cycle is closed and this is a new visit (not edit/view), block the form
  if (cycleClosed && (!props.activeContent?.id || props.activeContent?.actionType === "create")) {
    return (
      <div>
        <div style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "center",
          marginTop: "20px",
        }}>
          <h3 style={{ color: "#721c24", marginBottom: "10px" }}>MIP Card Closed</h3>
          <p style={{ color: "#721c24", fontSize: "14px" }}>
            This MIP Card has been closed due to a terminal maternal outcome (Transferred Out, Died, Lost to Follow-Up, or Completed PMTCT).
            No further visit records can be created on this cycle.
          </p>
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <MatButton
              variant="contained"
              style={{ backgroundColor: "#014d88" }}
              onClick={() => props.setActiveContent({ ...props.activeContent, route: "recent-history" })}
            >
              <span style={{ textTransform: "capitalize", color: "#fff" }}>Back to History</span>
            </MatButton>
            <MatButton
              variant="contained"
              style={{ backgroundColor: "#28a745" }}
              onClick={handleReopenCycle}
            >
              <span style={{ textTransform: "capitalize", color: "#fff" }}>Re-open Cycle</span>
            </MatButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card className={classes.root}>
        <CardBody style={{ paddingTop: "0" }}>
          <form>
            <div className="row">
              <div
                className="card-header mb-3"
                style={{
                  background: "#fff",
                  borderRadius: "0",
                  padding: "14px 20px",
                  marginTop: "0",
                  border: "none",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
                }}
              >
                <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
                  {isAncRevisit ? "ANC Revisit" : "Mother Follow-up Visit"}
                </h5>
                {objValues.dateOfInitialVisit && (
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}>
                    Date of Initial Visit:{" "}
                    <b style={{ color: "#0f172a" }}>{moment(objValues.dateOfInitialVisit).format("DD-MM-YYYY")}</b>
                  </span>
                )}
              </div>

              {/* === Visit Information === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <EventIcon style={sectionIconStyle} />Visit Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of Visit <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfVisit"
                            id="dateOfVisit"
                            value={objValues.dateOfVisit}
                            onChange={handleInputChange}
                            min={props.patientObj.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfVisit !== "" ? (
                          <span className={classes.error}>{errors.dateOfVisit}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    {!isAncRevisit && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Current Status <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="currentStatus"
                            id="currentStatus"
                            value={objValues.currentStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Pregnant">Pregnant</option>
                            <option value="Breastfeeding">Breastfeeding</option>
                          </Input>
                        </InputGroup>
                        {errors.currentStatus !== "" ? (
                          <span className={classes.error}>
                            {errors.currentStatus}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    )}

                    {isAncRevisit && (
                    <>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>ANC Visit Number</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="numberOfAncVisits"
                              id="numberOfAncVisits"
                              value={objValues.numberOfAncVisits}
                              onChange={handleInputChange}
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>ANC Attendance Type</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="ancAttendance"
                              id="ancAttendance"
                              value={objValues.ancAttendance}
                              onChange={handleInputChange}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Unscheduled">Unscheduled</option>
                              <option value="Walk-in">Walk-in</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    </>
                    )}
                  </div>
                </div>
              </div>
              {/* === Vital Signs === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <FitnessCenterIcon style={sectionIconStyle} />Vital Signs
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Weight (kg) <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="weight"
                            id="weight"
                            value={objValues.weight}
                            onChange={handleInputChange}
                            step="0.1"
                            min="30"
                            max="180"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.weight !== "" ? (
                          <span className={classes.error}>{errors.weight}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Height (cm)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="height"
                            id="height"
                            value={objValues.height}
                            onChange={handleInputChange}
                            step="0.1"
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          SFH / Length (cm) <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="sfhLength"
                            id="sfhLength"
                            value={objValues.sfhLength}
                            onChange={handleInputChange}
                            step="0.1"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.sfhLength !== "" ? (
                          <span className={classes.error}>{errors.sfhLength}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Blood Pressure - Systolic (mmHg)</Label>
                          <InputGroup>
                            <Input
                              type="number"
                              name="systolic"
                              id="systolic"
                              value={objValues.systolic}
                              onChange={handleInputChange}
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Blood Pressure - Diastolic (mmHg)</Label>
                          <InputGroup>
                            <Input
                              type="number"
                              name="diastolic"
                              id="diastolic"
                              value={objValues.diastolic}
                              onChange={handleInputChange}
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                      {isAncRevisit && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Gestational Age (weeks)</Label>
                          <InputGroup>
                            <Input
                              type="number"
                              name="gaWeeks"
                              id="gaWeeks"
                              value={objValues.gaWeeks}
                              onChange={handleInputChange}
                              min="1"
                              max="45"
                              disabled={disabledField}
                            />
                          </InputGroup>
                        </FormGroup>
                      </div>
                      )}
                  </div>
                </div>
              </div>
              {/* === Counselling === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <SchoolIcon style={sectionIconStyle} />Counselling
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>HTS Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingHts"
                            id="counsellingHts"
                            value={objValues.counsellingHts}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>FGM Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingFgm"
                            id="counsellingFgm"
                            value={objValues.counsellingFgm}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Family Planning Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingFp"
                            id="counsellingFp"
                            value={objValues.counsellingFp}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Maternal Nutrition Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingMaternalNutrition"
                            id="counsellingMaternalNutrition"
                            value={objValues.counsellingMaternalNutrition}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Early Breastfeeding Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingEarlyBf"
                            id="counsellingEarlyBf"
                            value={objValues.counsellingEarlyBf}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Exclusive Breastfeeding Counselling</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="counsellingExclusiveBf"
                            id="counsellingExclusiveBf"
                            value={objValues.counsellingExclusiveBf}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Lab Tests === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssessmentIcon style={sectionIconStyle} />Lab Tests
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Haemoglobin / PCV</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="hbPcv"
                            id="hbPcv"
                            value={objValues.hbPcv}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Blood Sugar / GDM</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="bloodSugarGdm"
                            id="bloodSugarGdm"
                            value={objValues.bloodSugarGdm}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Urinalysis - Sugar</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="urinalysisSugar"
                            id="urinalysisSugar"
                            value={objValues.urinalysisSugar}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Urinalysis - Proteins</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="urinalysisProteins"
                            id="urinalysisProteins"
                            value={objValues.urinalysisProteins}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Interventions === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <HealingIcon style={sectionIconStyle} />Interventions
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>LLIN Given</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="llinGiven"
                            id="llinGiven"
                            value={objValues.llinGiven}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>IPT Dose</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="iptDose"
                            id="iptDose"
                            value={objValues.iptDose}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="IPT1">IPT1</option>
                            <option value="IPT2">IPT2</option>
                            <option value="IPT3">IPT3</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>Hematinics Given</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hematinicsGiven"
                            id="hematinicsGiven"
                            value={objValues.hematinicsGiven}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>TD Immunization</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="tdImmunization"
                            id="tdImmunization"
                            value={objValues.tdImmunization}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="TD1">TD1</option>
                            <option value="TD2">TD2</option>
                            <option value="TD3">TD3</option>
                            <option value="TD4">TD4</option>
                            <option value="TD5">TD5</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>Associated Problems</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="associatedProblems"
                            id="associatedProblems"
                            value={objValues.associatedProblems}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-3">
                      <FormGroup>
                        <Label>Outcome of Visit</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="outcomeOfVisit"
                            id="outcomeOfVisit"
                            value={objValues.outcomeOfVisit}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Not Treated">Not Treated (NT)</option>
                            <option value="Treated">Treated (T)</option>
                            <option value="Admitted">Admitted (A)</option>
                            <option value="Referred Out">Referred Out (RO)</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === ANC Revisit: Outcome & Referral === */}
              {isAncRevisit && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssignmentTurnedInIcon style={sectionIconStyle} />Outcome & Referral
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Visit Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="visitStatus"
                            id="visitStatus"
                            value={objValues.visitStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Satisfactory">Satisfactory</option>
                            <option value="Referred">Referred</option>
                            <option value="Admitted">Admitted</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Referral Reason</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="referralReason"
                            id="referralReason"
                            value={objValues.referralReason}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Transportation Out</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="transportationOut"
                            id="transportationOut"
                            value={objValues.transportationOut}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Ambulance">Ambulance</option>
                            <option value="Private Vehicle">Private Vehicle</option>
                            <option value="Public Transport">Public Transport</option>
                            <option value="On Foot">On Foot</option>
                            <option value="Other">Other</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* === Treatment Status (Mother Visit only) === */}
              {!isAncRevisit && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <LocalHospitalIcon style={sectionIconStyle} />Treatment Status
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Current ART Status <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="currentArtStatus"
                            id="currentArtStatus"
                            value={objValues.currentArtStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="On ART">On ART</option>
                            <option value="Not on ART">Not on ART</option>
                          </Input>
                        </InputGroup>
                        {errors.currentArtStatus !== "" ? (
                          <span className={classes.error}>
                            {errors.currentArtStatus}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Regimen Line <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="regimenLineId"
                            id="regimenLineId"
                            value={selectedRegimenLineId}
                            onChange={handleSelectRegimenLine}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {adultRegimenLine.map((value) => (
                              <option key={value.id} value={value.id}>
                                {value.description}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Mother's ART Regimen <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="mothersArtRegimen"
                            id="mothersArtRegimen"
                            value={objValues.mothersArtRegimen}
                            onChange={handleSelectRegimen}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {regimenType.map((value) => (
                              <option key={value.id} value={value.description}>
                                {value.description}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.mothersArtRegimen !== "" ? (
                          <span className={classes.error}>
                            {errors.mothersArtRegimen}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Current HBV Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="currentHbvStatus"
                            id="currentHbvStatus"
                            value={objValues.currentHbvStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Positive on Treatment">
                              Positive on Treatment
                            </option>
                            <option value="Positive on Prophylaxis">
                              Positive on Prophylaxis
                            </option>
                            <option value="Positive not on Treatment">
                              Positive not on Treatment
                            </option>
                            <option value="Negative">Negative</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {(objValues.currentHbvStatus === "Positive on Treatment" ||
                      objValues.currentHbvStatus === "Positive on Prophylaxis") && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            Name of Current HBV Drug <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="nameOfHbvDrug"
                              id="nameOfHbvDrug"
                              value={objValues.nameOfHbvDrug}
                              onChange={handleInputChange}
                              maxLength="100"
                              disabled={disabledField}
                            />
                          </InputGroup>
                          {errors.nameOfHbvDrug !== "" ? (
                            <span className={classes.error}>
                              {errors.nameOfHbvDrug}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Mother's Current Syphilis Status</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="currentSyphilisStatus"
                            id="currentSyphilisStatus"
                            value={objValues.currentSyphilisStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Positive on Treatment">
                              Positive on Treatment
                            </option>
                            <option value="Positive not on Treatment">
                              Positive not on Treatment
                            </option>
                            <option value="Negative">Negative</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {objValues.currentSyphilisStatus === "Positive on Treatment" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            Name of Syphilis Drug Administered <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="text"
                              name="nameOfSyphilisDrug"
                              id="nameOfSyphilisDrug"
                              value={objValues.nameOfSyphilisDrug}
                              onChange={handleInputChange}
                              maxLength="100"
                              disabled={disabledField}
                            />
                          </InputGroup>
                          {errors.nameOfSyphilisDrug !== "" ? (
                            <span className={classes.error}>
                              {errors.nameOfSyphilisDrug}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Hepatitis C Test Result</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hepatitisCTestResult"
                            id="hepatitisCTestResult"
                            value={objValues.hepatitisCTestResult}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Not Tested">Not Tested</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {objValues.hepatitisCTestResult === "Positive" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Referred for HCV Treatment</Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="referredForHcv"
                              id="referredForHcv"
                              value={objValues.referredForHcv}
                              onChange={handleInputChange}
                              disabled={disabledField}
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </Input>
                          </InputGroup>
                        </FormGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* === HIV Viral Load Test (Mother Visit only) === */}
              {!isAncRevisit && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <TimelineIcon style={sectionIconStyle} />HIV Viral Load Test
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Date VL Sample Collected</Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfViralLoad"
                            id="dateOfViralLoad"
                            value={objValues.dateOfViralLoad}
                            onChange={handleInputChange}
                            min={props.patientObj.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfViralLoad !== "" ? (
                          <span className={classes.error}>
                            {errors.dateOfViralLoad}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>GA at VL Collection</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gaOfViralLoad"
                            id="gaOfViralLoad"
                            value={objValues.gaOfViralLoad}
                            onChange={handleInputChange}
                            min={props.patientObj.dateOfEnrollment}
                            disabled={disabledField === false ? true : disabledField}
                          />
                        </InputGroup>
                        {errors.gaOfViralLoad !== "" ? (
                          <span className={classes.error}>
                            {errors.gaOfViralLoad}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Viral Load Result (copies per ml)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="resultOfViralLoad"
                            id="resultOfViralLoad"
                            value={objValues.resultOfViralLoad}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.resultOfViralLoad !== "" ? (
                          <span className={classes.error}>
                            {errors.resultOfViralLoad}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Date VL Result Received</Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfVlResultReceived"
                            id="dateOfVlResultReceived"
                            value={objValues.dateOfVlResultReceived}
                            onChange={handleInputChange}
                            min={objValues.dateOfViralLoad || props.patientObj.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfVlResultReceived !== "" ? (
                          <span className={classes.error}>
                            {errors.dateOfVlResultReceived}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>
                  {objValues.resultOfViralLoad && Number(objValues.resultOfViralLoad) >= 1000 && (
                    <div className="row">
                      <div className="col-md-12">
                        <p style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}>
                          WARNING: Unsuppressed Viral Load detected (&gt;= 1,000 copies/ml). Please ensure enhanced adherence counselling is initiated.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* === Infant Details (Mother Visit only) === */}
              {!isAncRevisit && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ChildCareIcon style={sectionIconStyle} />Infant Details
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Infant Feeding Practice at Present <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="infantFeedingPractice"
                            id="infantFeedingPractice"
                            value={objValues.infantFeedingPractice}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Exclusive Breastfeeding (EBF)">
                              Exclusive Breastfeeding (EBF)
                            </option>
                            <option value="Mixed Feeding (MF)">
                              Mixed Feeding (MF)
                            </option>
                            <option value="Exclusive Formula Feeding (EFF)">
                              Exclusive Formula Feeding (EFF)
                            </option>
                            <option value="Weaned">Weaned</option>
                          </Input>
                        </InputGroup>
                        {errors.infantFeedingPractice !== "" ? (
                          <span className={classes.error}>
                            {errors.infantFeedingPractice}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Infant on CTX <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="infantOnCtx"
                            id="infantOnCtx"
                            value={objValues.infantOnCtx}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.infantOnCtx !== "" ? (
                          <span className={classes.error}>
                            {errors.infantOnCtx}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Referred To Treatment <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="referredToTreatment"
                            id="referredToTreatment"
                            value={objValues.referredToTreatment}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="HIV treatment">HIV treatment</option>
                            <option value="Syphilis treatment">
                              Syphilis treatment
                            </option>
                            <option value="HBV treatment">HBV treatment</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                        {errors.referredToTreatment !== "" ? (
                          <span className={classes.error}>
                            {errors.referredToTreatment}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* === Visit Outcome & Status (Mother Visit only) === */}
              {!isAncRevisit && (
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssignmentTurnedInIcon style={sectionIconStyle} />Visit Outcome & Status
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Maternal Outcome <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="maternalOutcome"
                            id="maternalOutcome"
                            value={objValues.maternalOutcome}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {maternalCome.map((value) => (
                              <option key={value.code} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.maternalOutcome !== "" ? (
                          <span className={classes.error}>{errors.maternalOutcome}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {objValues.maternalOutcome && objValues.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT" && (
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of Outcome <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfmeternalOutcome"
                            id="dateOfmeternalOutcome"
                            value={objValues.dateOfmeternalOutcome}
                            onChange={handleInputChange}
                            min={props.patientObj.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.dateOfmeternalOutcome !== "" ? (
                          <span className={classes.error}>
                            {errors.dateOfmeternalOutcome}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    )}

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Client Visit Status <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="visitStatus"
                            id="visitStatus"
                            value={objValues.visitStatus}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {visitStatus.map((value) => (
                              <option key={value.code} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.visitStatus !== "" ? (
                          <span className={classes.error}>{errors.visitStatus}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>
                  {/* Display notification when maternal outcome is IIT */}
                  {objValues.maternalOutcome !== "" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_ACTIVE_IN_PMTCT" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_ALIVE" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_TRANSFERRED_OUT" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_DIED" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_DEAD" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP" &&
                  objValues.maternalOutcome !== "MATERNAL_OUTCOME_COMPLETED_PMTCT" ? (
                    <h2 style={{ color: "red" }}>Kindly fill tracking form</h2>
                  ) : (
                    ""
                  )}
                  {/* MIP Card closure prompt */}
                  {(objValues.maternalOutcome === "MATERNAL_OUTCOME_TRANSFERRED_OUT" ||
                    objValues.maternalOutcome === "MATERNAL_OUTCOME_DIED" ||
                    objValues.maternalOutcome === "MATERNAL_OUTCOME_DEAD" ||
                    objValues.maternalOutcome === "MATERNAL_OUTCOME_LOST_TO_FOLLOW-UP" ||
                    objValues.maternalOutcome === "MATERNAL_OUTCOME_LOST_TO_FOLLOW_UP" ||
                    objValues.maternalOutcome === "MATERNAL_OUTCOME_COMPLETED_PMTCT") && (
                    <div style={{
                      backgroundColor: "#fff3cd",
                      border: "1px solid #ffc107",
                      borderRadius: "4px",
                      padding: "12px",
                      marginTop: "8px",
                    }}>
                      <p style={{ color: "#856404", fontWeight: "bold", fontSize: "14px", margin: 0 }}>
                        NOTE: This maternal outcome will close the MIP Card record. No further visit records can be created after this save.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* === Next Appointment === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ScheduleIcon style={sectionIconStyle} />{isAncRevisit ? "Next Appointment" : "Next Appointment & Signature"}
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>Next Appointment Date <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="nextAppointmentDate"
                            id="nextAppointmentDate"
                            value={objValues.nextAppointmentDate}
                            onChange={handleInputChange}
                            min={objValues.dateOfVisit || moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.nextAppointmentDate !== "" ? (
                          <span className={classes.error}>{errors.nextAppointmentDate}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    {!isAncRevisit && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Signature <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="signature"
                            id="signature"
                            value={objValues.signature}
                            onChange={handleInputChange}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.signature !== "" ? (
                          <span className={classes.error}>{errors.signature}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <br />

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              {props.activeContent &&
              props.activeContent.actionType === "update" ? (
                <MatButton
                  type="button"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Updating...
                    </span>
                  )}
                </MatButton>
              ) : props.activeContent?.actionType !== "view" ? (
                <MatButton
                  type="button"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Saving...
                    </span>
                  )}
                </MatButton>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ClinicVisit;
