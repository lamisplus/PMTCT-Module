import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
} from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import PersonIcon from "@material-ui/icons/Person";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HealingIcon from "@material-ui/icons/Healing";
import TimelineIcon from "@material-ui/icons/Timeline";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { Spinner } from "reactstrap";
import moment from "moment";
import { calculateGestationalAge } from "../../utils";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
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

const AncEnrollement = (props) => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);

  const [objValues, setObjValues] = useState({
    // Registration Info
    ancNo: "",
    dateOfEnrollment: "",
    ancAttendance: "New",
    referredFromSpokesSite: "",
    // Obstetric History
    gravida: "",
    parity: "",
    lmp: "",
    gaweeks: "",
    // Vital Signs (JSONB)
    vitalSigns: {
      weight: "",
      height: "",
      systolicBp: "",
      diastolicBp: "",
    },
    // Counselling (JSONB)
    counselling: {
      hts: "",
      fgm: "",
      fp: "",
      maternalNutrition: "",
      earlyBf: "",
      exclusiveBf: "",
    },
    // Syphilis (JSONB)
    syphilisInfo: {
      testedSyphilis: "",
      testResultSyphilis: "",
      treatedSyphilis: "",
      referredSyphilisTreatment: "",
    },
    // Hepatitis B (JSONB)
    hepatitisBInfo: {
      testedHepatitisB: "",
      hepatitisB: "",
      referredHepatitisB: "",
    },
    // Hepatitis C (JSONB)
    hepatitisCInfo: {
      testedHepatitisC: "",
      hepatitisC: "",
      referredHepatitisC: "",
    },
    // Lab Tests
    hbPcv: "",
    pcv: "",
    bloodSugarGdm: "",
    // Urinalysis (JSONB)
    urinalysis: {
      sugar: "",
      proteins: "",
    },
    // Preventive Services
    llinGiven: "",
    iptDose: "",
    hematinicsGiven: "",
    tdImmunization: "",
    // Visit Outcome
    associatedProblems: "",
    outcomeOfVisit: "",
    referralReason: "",
    transportationOut: "",
    // System
    patientUuid: patientObj?.patient_uuid || patientObj?.patientUuid || patientObj?.uuid || "",
    source: "WEB",
  });

  const handleInputChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    // Gestational age calculation when dateOfEnrollment changes
    if (
      e.target.name === "dateOfEnrollment" &&
      e.target.value !== "" &&
      objValues.lmp !== ""
    ) {
      let response = calculateGestationalAge(e.target.value, objValues.lmp);
      if (response > 0) {
        setObjValues({ ...objValues, [e.target.name]: e.target.value, gaweeks: response });
      } else {
        toast.error("Please select a valid date");
        setObjValues({ ...objValues, [e.target.name]: "" });
      }
      return;
    }

    // Gestational age calculation when lmp changes
    if (e.target.name === "lmp" && e.target.value !== "") {
      let response = calculateGestationalAge(objValues.dateOfEnrollment, e.target.value);
      if (response > 0) {
        setObjValues({ ...objValues, [e.target.name]: e.target.value, gaweeks: response });
      } else {
        toast.error("Please select a valid date");
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      }
      return;
    }

    // Parity validation
    if (e.target.name === "parity" && e.target.value !== "" && e.target.value < 0) {
      return;
    }

    // Gravida validation
    if (e.target.name === "gravida" && e.target.value !== "" && e.target.value <= 0) {
      return;
    }

    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const handleVitalSignsChange = (e) => {
    const { name, value } = e.target;
    setObjValues({
      ...objValues,
      vitalSigns: { ...objValues.vitalSigns, [name]: value },
    });
    // Validate vital signs ranges
    const val = parseFloat(value);
    if (name === "weight" && value !== "") {
      if (val < 30 || val > 150) {
        setErrors({ ...errors, weight: "Weight must be between 30 and 150 kg" });
      } else {
        setErrors({ ...errors, weight: "" });
      }
    } else if (name === "height" && value !== "") {
      if (val < 48 || val > 216) {
        setErrors({ ...errors, height: "Height must be between 48 and 216 cm" });
      } else {
        setErrors({ ...errors, height: "" });
      }
    } else if (name === "systolicBp" && value !== "") {
      if (val < 90 || val > 240) {
        setErrors({ ...errors, systolicBp: "Systolic BP must be between 90 and 240" });
      } else {
        setErrors({ ...errors, systolicBp: "" });
      }
    } else if (name === "diastolicBp" && value !== "") {
      if (val < 60 || val > 140) {
        setErrors({ ...errors, diastolicBp: "Diastolic BP must be between 60 and 140" });
      } else {
        setErrors({ ...errors, diastolicBp: "" });
      }
    }
  };

  const handleCounsellingChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setObjValues({
      ...objValues,
      counselling: { ...objValues.counselling, [e.target.name]: e.target.value },
    });
  };

  const handleSyphilisChange = (e) => {
    // Syphilis cascade resets
    if (e.target.name === "testedSyphilis" && e.target.value === "Yes") {
      setObjValues({
        ...objValues,
        syphilisInfo: {
          ...objValues.syphilisInfo,
          testedSyphilis: e.target.value,
          testResultSyphilis: "",
          treatedSyphilis: "",
          referredSyphilisTreatment: "",
        },
      });
      return;
    }
    if (e.target.name === "testResultSyphilis" && e.target.value === "Positive") {
      setObjValues({
        ...objValues,
        syphilisInfo: {
          ...objValues.syphilisInfo,
          testResultSyphilis: e.target.value,
          treatedSyphilis: "",
          referredSyphilisTreatment: "",
        },
      });
      return;
    }
    setObjValues({
      ...objValues,
      syphilisInfo: { ...objValues.syphilisInfo, [e.target.name]: e.target.value },
    });
  };

  const handleHepatitisBChange = (e) => {
    if (e.target.name === "testedHepatitisB") {
      setObjValues({
        ...objValues,
        hepatitisBInfo: {
          ...objValues.hepatitisBInfo,
          testedHepatitisB: e.target.value,
          hepatitisB: "",
          referredHepatitisB: "",
        },
      });
      return;
    }
    if (e.target.name === "hepatitisB") {
      setObjValues({
        ...objValues,
        hepatitisBInfo: {
          ...objValues.hepatitisBInfo,
          hepatitisB: e.target.value,
          referredHepatitisB: "",
        },
      });
      return;
    }
    setObjValues({
      ...objValues,
      hepatitisBInfo: { ...objValues.hepatitisBInfo, [e.target.name]: e.target.value },
    });
  };

  const handleHepatitisCChange = (e) => {
    if (e.target.name === "testedHepatitisC") {
      setObjValues({
        ...objValues,
        hepatitisCInfo: {
          ...objValues.hepatitisCInfo,
          testedHepatitisC: e.target.value,
          hepatitisC: "",
          referredHepatitisC: "",
        },
      });
      return;
    }
    if (e.target.name === "hepatitisC") {
      setObjValues({
        ...objValues,
        hepatitisCInfo: {
          ...objValues.hepatitisCInfo,
          hepatitisC: e.target.value,
          referredHepatitisC: "",
        },
      });
      return;
    }
    setObjValues({
      ...objValues,
      hepatitisCInfo: { ...objValues.hepatitisCInfo, [e.target.name]: e.target.value },
    });
  };

  const handleUrinalysisChange = (e) => {
    setObjValues({
      ...objValues,
      urinalysis: { ...objValues.urinalysis, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate counselling fields
    const counsellingFields = [
      { key: "hts", label: "HIV Testing Services" },
      { key: "fgm", label: "Female Genital Mutilation (FGM)" },
      { key: "fp", label: "Family Planning" },
      { key: "maternalNutrition", label: "Maternal Nutrition" },
      { key: "earlyBf", label: "Early Initiation of Breastfeeding" },
      { key: "exclusiveBf", label: "Exclusive Breastfeeding" },
    ];
    const newErrors = { ...errors };
    let hasError = false;
    counsellingFields.forEach(({ key, label }) => {
      if (!objValues.counselling[key]) {
        newErrors[key] = `${label} is required`;
        hasError = true;
      }
    });
    // Validate vital signs ranges
    const vs = objValues.vitalSigns;
    if (vs.weight && (parseFloat(vs.weight) < 30 || parseFloat(vs.weight) > 150)) {
      newErrors.weight = "Weight must be between 30 and 150 kg";
      hasError = true;
    }
    if (vs.height && (parseFloat(vs.height) < 48 || parseFloat(vs.height) > 216)) {
      newErrors.height = "Height must be between 48 and 216 cm";
      hasError = true;
    }
    if (vs.systolicBp && (parseFloat(vs.systolicBp) < 90 || parseFloat(vs.systolicBp) > 240)) {
      newErrors.systolicBp = "Systolic BP must be between 90 and 240";
      hasError = true;
    }
    if (vs.diastolicBp && (parseFloat(vs.diastolicBp) < 60 || parseFloat(vs.diastolicBp) > 140)) {
      newErrors.diastolicBp = "Diastolic BP must be between 60 and 140";
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      toast.error("Please fill all required fields and correct validation errors");
      return;
    }
    setSaving(true);
    const payload = {
      ...objValues,
      patient_uuid: objValues.patientUuid,
      pmtctCycleUuid: props?.latestPmtctCycle?.uuid || props?.selectedCycleId,
    };
    axios
      .post(`${baseUrl}pmtct/anc/anc-enrollement`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSaving(false);
        toast.success("ANC Enrollment saved successfully");
        if (props.setPmtctHtsRetestingType) {
          props.setPmtctHtsRetestingType("pmtct-hts");
        }
        props.setActiveContent({
          ...props.activeContent,
          route: "pmtct-hts",
          actionType: "create",
          id: "",
          obj: {},
        });
      })
      .catch((error) => {
        setSaving(false);
        const apiError = error.response?.data?.apierror;
        const subError = apiError?.subErrors?.[0];
        let errorMessage =
          apiError?.message ||
          subError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Something went wrong, please try again";
        if (apiError?.message && subError?.field && subError?.message) {
          errorMessage = `${apiError.message}: ${subError.field} ${subError.message}`;
        }
        toast.error(errorMessage);
      });
  };

  useEffect(() => {
    if (
      props.activeContent?.id &&
      props.activeContent?.actionType !== "create"
    ) {
      setDisabledField(props.activeContent.actionType === "view");
    }
  }, []);

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <div>
            <form>
              <div
                className="card-header mb-3"
                style={{
                  background: "#fff",
                  borderRadius: "0",
                  padding: "14px 20px",
                  border: "none",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "none",
                }}
              >
                <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
                  ANC Enrollment
                </h5>
              </div>

              {/* === Registration Information === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <PersonIcon style={sectionIconStyle} />Registration Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          ANC No <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="ancNo"
                            id="ancNo"
                            onChange={handleInputChange}
                            value={objValues.ancNo}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.ancNo !== "" ? (<span className={classes.error}>{errors.ancNo}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date of Enrollment <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="dateOfEnrollment"
                            id="dateOfEnrollment"
                            onChange={handleInputChange}
                            value={objValues.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>ANC Attendance</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="ancAttendance"
                            id="ancAttendance"
                            onChange={handleInputChange}
                            value={objValues.ancAttendance}
                            disabled={true}
                          >
                            <option value="">Select</option>
                            <option value="New">New</option>
                            <option value="Revisit">Revisit</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Referred from Spokes Site</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="referredFromSpokesSite"
                            id="referredFromSpokesSite"
                            onChange={handleInputChange}
                            value={objValues.referredFromSpokesSite}
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

              {/* === Obstetric History === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ChildCareIcon style={sectionIconStyle} />Obstetric History
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Parity <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="parity"
                            id="parity"
                            onChange={handleInputChange}
                            value={objValues.parity}
                            min={0}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.parity !== "" ? (<span className={classes.error}>{errors.parity}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Gravida <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gravida"
                            id="gravida"
                            onChange={handleInputChange}
                            value={objValues.gravida}
                            min="1"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.gravida !== "" ? (<span className={classes.error}>{errors.gravida}</span>) : ""}
                        {objValues.gravida && objValues.parity &&
                          parseInt(objValues.gravida) < parseInt(objValues.parity) && (
                          <span className={classes.error}>Gravida should not be less than Parity</span>
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          Date Of Last Menstrual Period <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => { e.preventDefault(); }}
                            name="lmp"
                            id="lmp"
                            onChange={handleInputChange}
                            value={objValues.lmp}
                            max={objValues.dateOfEnrollment ? objValues.dateOfEnrollment : moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.lmp !== "" ? (<span className={classes.error}>{errors.lmp}</span>) : ""}
                        {objValues.gaweeks === 0 ? (<span className={classes.error}>Invalid date</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Gestational Age (Weeks) <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="gaweeks"
                            id="gaweeks"
                            value={objValues.gaweeks}
                            disabled
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (<span className={classes.error}>{errors.gaweeks}</span>) : ""}
                      </FormGroup>
                    </div>
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
                        <Label>Weight (kg)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="weight"
                            id="weight"
                            onChange={handleVitalSignsChange}
                            value={objValues.vitalSigns.weight}
                            step="0.1"
                            min="30"
                            max="150"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.weight !== "" ? (<span className={classes.error}>{errors.weight}</span>) : ""}
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
                            onChange={handleVitalSignsChange}
                            value={objValues.vitalSigns.height}
                            step="0.1"
                            min="48"
                            max="216"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.height !== "" ? (<span className={classes.error}>{errors.height}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Blood Pressure (Systolic)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="systolicBp"
                            id="systolicBp"
                            onChange={handleVitalSignsChange}
                            value={objValues.vitalSigns.systolicBp}
                            min="90"
                            max="240"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.systolicBp !== "" ? (<span className={classes.error}>{errors.systolicBp}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Blood Pressure (Diastolic)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="diastolicBp"
                            id="diastolicBp"
                            onChange={handleVitalSignsChange}
                            value={objValues.vitalSigns.diastolicBp}
                            min="60"
                            max="140"
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.diastolicBp !== "" ? (<span className={classes.error}>{errors.diastolicBp}</span>) : ""}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Counselling === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <TimelineIcon style={sectionIconStyle} />Counselling
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>HIV Testing Services <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hts"
                            id="hts"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.hts}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.hts !== "" ? (<span className={classes.error}>{errors.hts}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Female Genital Mutilation (FGM) <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="fgm"
                            id="fgm"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.fgm}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.fgm !== "" ? (<span className={classes.error}>{errors.fgm}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Family Planning <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="fp"
                            id="fp"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.fp}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.fp !== "" ? (<span className={classes.error}>{errors.fp}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Maternal Nutrition <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="maternalNutrition"
                            id="maternalNutrition"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.maternalNutrition}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.maternalNutrition !== "" ? (<span className={classes.error}>{errors.maternalNutrition}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Early Initiation of Breastfeeding <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="earlyBf"
                            id="earlyBf"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.earlyBf}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.earlyBf !== "" ? (<span className={classes.error}>{errors.earlyBf}</span>) : ""}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Exclusive Breastfeeding <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="exclusiveBf"
                            id="exclusiveBf"
                            onChange={handleCounsellingChange}
                            value={objValues.counselling.exclusiveBf}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.exclusiveBf !== "" ? (<span className={classes.error}>{errors.exclusiveBf}</span>) : ""}
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Syphilis Information === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <LocalHospitalIcon style={sectionIconStyle} />Syphilis Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Tested for Syphilis <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedSyphilis"
                            id="testedSyphilis"
                            onChange={handleSyphilisChange}
                            value={objValues.syphilisInfo.testedSyphilis}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.testedSyphilis !== "" ? (<span className={classes.error}>{errors.testedSyphilis}</span>) : ""}
                      </FormGroup>
                    </div>
                    {objValues.syphilisInfo.testedSyphilis === "Yes" && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Syphilis Test Result <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="testResultSyphilis"
                                id="testResultSyphilis"
                                onChange={handleSyphilisChange}
                                value={objValues.syphilisInfo.testResultSyphilis}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                            {errors.testResultSyphilis !== "" ? (<span className={classes.error}>{errors.testResultSyphilis}</span>) : ""}
                          </FormGroup>
                        </div>
                        {objValues.syphilisInfo.testResultSyphilis === "Positive" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Treated for Syphilis <span style={{ color: "red" }}> *</span></Label>
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="treatedSyphilis"
                                    id="treatedSyphilis"
                                    onChange={handleSyphilisChange}
                                    value={objValues.syphilisInfo.treatedSyphilis}
                                    disabled={disabledField}
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </Input>
                                </InputGroup>
                                {errors.treatedSyphilis !== "" ? (<span className={classes.error}>{errors.treatedSyphilis}</span>) : ""}
                              </FormGroup>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* === Hepatitis Information === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <LocalHospitalIcon style={sectionIconStyle} />Hepatitis Information
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Tested for Hepatitis B <span style={{ color: "red" }}> *</span></Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedHepatitisB"
                            id="testedHepatitisB"
                            onChange={handleHepatitisBChange}
                            value={objValues.hepatitisBInfo.testedHepatitisB}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {objValues.hepatitisBInfo.testedHepatitisB === "Yes" && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Hepatitis B Test Result</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="hepatitisB"
                                id="hepatitisB"
                                onChange={handleHepatitisBChange}
                                value={objValues.hepatitisBInfo.hepatitisB}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {objValues.hepatitisBInfo.hepatitisB === "Positive" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Referred Hepatitis B +ve Client</Label>
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="referredHepatitisB"
                                    id="referredHepatitisB"
                                    onChange={handleHepatitisBChange}
                                    value={objValues.hepatitisBInfo.referredHepatitisB}
                                    disabled={disabledField}
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </Input>
                                </InputGroup>
                              </FormGroup>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Tested for Hepatitis C</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedHepatitisC"
                            id="testedHepatitisC"
                            onChange={handleHepatitisCChange}
                            value={objValues.hepatitisCInfo.testedHepatitisC}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {objValues.hepatitisCInfo.testedHepatitisC === "Yes" && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Hepatitis C Test Result</Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="hepatitisC"
                                id="hepatitisC"
                                onChange={handleHepatitisCChange}
                                value={objValues.hepatitisCInfo.hepatitisC}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {objValues.hepatitisCInfo.hepatitisC === "Positive" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Referred Hepatitis C +ve Client</Label>
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="referredHepatitisC"
                                    id="referredHepatitisC"
                                    onChange={handleHepatitisCChange}
                                    value={objValues.hepatitisCInfo.referredHepatitisC}
                                    disabled={disabledField}
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </Input>
                                </InputGroup>
                              </FormGroup>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* === Haematology & Lab Tests === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <HealingIcon style={sectionIconStyle} />Haematology & Lab Tests
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>HB (g/dl)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="hbPcv"
                            id="hbPcv"
                            step="1"
                            min="0"
                            onChange={handleInputChange}
                            value={objValues.hbPcv}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>PCV (%)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="pcv"
                            id="pcv"
                            step="1"
                            min="0"
                            max="100"
                            onChange={handleInputChange}
                            value={objValues.pcv}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Blood Sugar (Gestational Diabetes)</Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="bloodSugarGdm"
                            id="bloodSugarGdm"
                            step="1"
                            min="0"
                            onChange={handleInputChange}
                            value={objValues.bloodSugarGdm}
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
                            type="select"
                            name="sugar"
                            id="urinalysisSugar"
                            onChange={handleUrinalysisChange}
                            value={objValues.urinalysis.sugar}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Normal">Normal</option>
                            <option value="Abnormal">Abnormal</option>
                            <option value="Not Done">Not Done</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Urinalysis - Proteins</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="proteins"
                            id="urinalysisProteins"
                            onChange={handleUrinalysisChange}
                            value={objValues.urinalysis.proteins}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Normal">Normal</option>
                            <option value="Abnormal">Abnormal</option>
                            <option value="Not Done">Not Done</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Preventive Services === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <HealingIcon style={sectionIconStyle} />Preventive Services
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>LLIN Given (Mosquito Net)?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="llinGiven"
                            id="llinGiven"
                            onChange={handleInputChange}
                            value={objValues.llinGiven}
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
                        <Label>Dose of IPT Given</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="iptDose"
                            id="iptDose"
                            onChange={handleInputChange}
                            value={objValues.iptDose}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="IPT1">IPT 1</option>
                            <option value="IPT2">IPT 2</option>
                            <option value="IPT3">IPT 3</option>
                            <option value="IPT4">IPT 4</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Hematinics Given (Iron & Folic Acid)?</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="hematinicsGiven"
                            id="hematinicsGiven"
                            onChange={handleInputChange}
                            value={objValues.hematinicsGiven}
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
                        <Label>TD Immunization</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="tdImmunization"
                            id="tdImmunization"
                            onChange={handleInputChange}
                            value={objValues.tdImmunization}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            <option value="Td1">Td1</option>
                            <option value="Td2">Td2</option>
                            <option value="Td3">Td3</option>
                            <option value="Td4">Td4</option>
                            <option value="Td5">Td5</option>
                            <option value="None">None</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* === HIV Status === (hidden per feedback F2) */}

              {/* === Visit Outcome === */}
              <div className="col-md-12 mb-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <AssignmentTurnedInIcon style={sectionIconStyle} />Visit Outcome
                  </h6>
                  <div className="row">
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Associated Problems</Label>
                        <InputGroup>
                          <Input
                            type="textarea"
                            name="associatedProblems"
                            id="associatedProblems"
                            onChange={handleInputChange}
                            value={objValues.associatedProblems}
                            style={{ height: "41px" }}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>Outcome of Visit</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="outcomeOfVisit"
                            id="outcomeOfVisit"
                            onChange={handleInputChange}
                            value={objValues.outcomeOfVisit}
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
                    {objValues.outcomeOfVisit === "Referred Out" && (
                      <>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Reason for Referral</Label>
                            <InputGroup>
                              <Input
                                type="text"
                                name="referralReason"
                                id="referralReason"
                                onChange={handleInputChange}
                                value={objValues.referralReason}
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
                                onChange={handleInputChange}
                                value={objValues.transportationOut}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                <option value="Ambulance">Ambulance</option>
                                <option value="Others">Others</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {saving ? <Spinner /> : ""}
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
                  type="submit"
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
                    <span style={{ textTransform: "capitalize" }}>Updating...</span>
                  )}
                </MatButton>
              ) : props.activeContent?.actionType !== "view" ? (
                <MatButton
                  type="submit"
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
                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                  )}
                </MatButton>
              ) : null}
            </div>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AncEnrollement;
