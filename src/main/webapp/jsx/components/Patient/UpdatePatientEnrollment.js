import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";
import { FormGroup, Label, Spinner, Input, Form, InputGroup } from "reactstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckSquare,
  faCoffee,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import * as moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import "./patient.css";
// import Form from 'react-bootstrap/Form';
import { Modal } from "react-bootstrap";
import { calculateGestationalAge } from "../../utils";
import FacilitySearchDropdown from "./FacilitySearchDropdown";
import { GET_CODESETS_IN_BATCH } from "../../../utils";


library.add(faCheckSquare, faCoffee, faEdit, faTrash);

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
    width: 300,
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
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: "inline",
  },
  error: {
    color: "#f85032",
    fontSize: "12.8px",
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

const UserRegistration = (props) => {
  const [basicInfo, setBasicInfo] = useState({
    fullname: "",
    sex: "",
    age: "",
    hospitalNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [disabledAgeBaseOnAge, setDisabledAgeBaseOnAge] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [genders, setGenders] = useState([]);
  const [ancNumberCheck, setAncNumberCheck] = useState(false);
  const [errors, setErrors] = useState({});
  const userDetail =
    props.location && props.location.state ? props.location.state.user : null;
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [ANCSetting, setANCSetting] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);

  //const [values, setValues] = useState([]);
  const [objValues, setObjValues] = useState({
    ancSetting: "",
    communitySetting: "",
    ancNo: "",
    gaweeks: "",
    gravida: "",
    expectedDeliveryDate: "",
    dateOfEnrollment: "",
    lmp: "",
    parity: "",
    patient_uuid: "",
    hivDiognosicTime: "",
    referredSyphilisTreatment: "",
    testResultSyphilis: "",
    testedSyphilis: "",
    treatedSyphilis: "",
    personDto: {},
    pmtctHtsInfo: {},
    syphilisInfo: {},
    partnerNotification: {},
    previouslyKnownHivStatus: "",
    staticHivStatus: "",
    testedHepatitisB: "",
    treatedHepatitisB: "",
    referredHepatitisB: "",
    testedHepatitisC: "",
    treatedHepatitisC: "",
    referredHepatitisC: "",
    //
    dateOfHepatitisB: "",
    hepatitisB: "",
    dateOfHepatitisC: "",
    hepatitisC: "",
    facilityEnrolledIn: "",
    // NHMIS fields
    ancAttendance: "",
    weight: "",
    height: "",
    systolic: "",
    diastolic: "",
    numberOfAncVisits: "",
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
    outcomeOfVisit: "",
    referralReason: "",
    transportationOut: "",
  });
  const [pregnancyStatus, setPregnancyStatus] = useState([]);
  //set ro show the facility name field if is transfer in
  const [disableHIVStatus, setDisableHIVStatus] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const locationState = location.state;
  let patientId = null;
  let actionType = null;
  let recordId = null;
  let patientObj = {};
  patientId = locationState ? locationState.patientId : null;
  recordId = locationState ? locationState.id : null;
  actionType = locationState ? locationState.actionType : null;
  patientObj = locationState ? locationState.patientObj : {};
  const [sourceOfReferral, setSourceOfReferral] = useState([]);
  const [disabledField, setDisabledField] = useState(false);
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [entryValueDisplay, setEntryValueDisplay] = useState({});


  const getPatientEntryType = (id) => {
    allNewEntryPoint.map((each, i) => {
      if (each.code === locationState.entrypointValue) {
        setEntryValueDisplay(each);
      }
    });
  };

  useEffect(() => {
    GET_CODESETS()


    //console.log(patientObj)
    if (patientObj) {
      setDisabledField(actionType === "view" ? true : false);
      setObjValues({
        ...patientObj,
        staticHivStatus: patientObj?.dynamicHivStatus || ""
      });
      basicInfo.fullname = patientObj.fullname;
      basicInfo.age = patientObj.age;
      basicInfo.hospitalNumber = patientObj.hospitalNumber;
      basicInfo.sex = patientObj.sex;
      //syphilisInfo
    }

    // if (patientObj?.dynamicHivStatus) {
    //   getHIVStatus(
    //     patientObj?.identifier?.identifier[0]?.value,
    //     patientObj.uuid
    //   );
    // }

    // SOURCE_REFERRAL_PMTCT();
  }, [patientObj, patientId, actionType]);

  useEffect(() => {
    GET_CODESETS();

    viewANCInfo();
    if (locationState.entrypointValue) {
      getPatientEntryType();
    }
  }, []);

  const viewANCInfo = () => {
    axios
      .get(`${baseUrl}pmtct/anc/view-anc/${location.state.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setObjValues({ ...response.data });
      })
      .catch((error) => {
        //console.log(error);
      });
  };



     const GET_CODESETS = () => {

     GET_CODESETS_IN_BATCH(
       "ENROLLMENT_SETTING",
       "COMMUNITY_PMTCT",
       "SEX",
       "PREGANACY_STATUS",
       "SOURCE_REFERRAL_PMTCT"
     ).then((response) => {
       setANCSetting(response.data.ENROLLMENT_SETTING || []);
       setCommunitySetting(response.data.COMMUNITY_PMTCT);
       getSex(response.data.SEX);
       setPregnancyStatus(response.data.PREGANACY_STATUS);
       setGenders(response.data.SEX);
       setSourceOfReferral(response.data.SOURCE_REFERRAL_PMTCT);
     });

    };



  const getSex = (sexCodeSet) => {
        let patientSex = "";
        if (
          patientObj.sex === "female" ||
          patientObj.sex === "Female" ||
          patientObj.sex === "FEMALE"
        ) {
          patientSex = "Female";
        }
        if (
          patientObj.sex === "Male" ||
          patientObj.sex === "male" ||
          patientObj.sex === "MALE"
        ) {
          patientSex = "Male";
        }
        const getSexId = sexCodeSet.find((x) => x.display === patientSex); //get patient sex ID by filtering the request
        basicInfo.sexId = getSexId.display;
;
  };
  const loadGenders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/SEX`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGenders(response.data);
    } catch (e) {}
  }, []);

  const handleAgeChange = (e) => {
    const ageNumber = e.target.value.replace(/\D/g, "");
    if (!ageDisabled && ageNumber) {
      if (ageNumber !== "" && ageNumber >= 60) {
        toggle();
      }
      if (ageNumber <= 1) {
        setDisabledAgeBaseOnAge(true);
      } else {
        setDisabledAgeBaseOnAge(false);
      }
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate.toISOString());
      const dobNew = estDob.add(ageNumber * -1, "years");
      //setBasicInfo({...basicInfo, dob: moment(dobNew).format("YYYY-MM-DD")});
      basicInfo.dob = moment(dobNew).format("YYYY-MM-DD");
    }
    setBasicInfo({ ...basicInfo, age: ageNumber });
  };
  //End of Date of Birth and Age handling
  /*****  Validation  */
  const validate = () => {
    let temp = { ...errors };

    //temp.dateOfEnrollment = objValues.dateOfEnrollment ? "" : "This field is required"
    temp.gaweeks = objValues.gaweeks ? "" : "This field is required";
    temp.gravida = objValues.gravida ? "" : "This field is required";
    objValues.testResultSyphilis === "Yes" &&
      (temp.referredSyphilisTreatment = objValues.referredSyphilisTreatment
        ? ""
        : "This field is required");
    temp.lmp = objValues.lmp ? "" : "This field is required";
    temp.parity = objValues.parity !== "" ? "" : "This field is required";
    temp.testedSyphilis = objValues.testedSyphilis
      ? ""
      : "This field is required";
    objValues.testResultSyphilis === "Yes" &&
      (temp.treatedSyphilis = objValues.treatedSyphilis
        ? ""
        : "This field is required");
    // temp.sourceOfReferral = objValues.sourceOfReferral
    //   ? ""
    //   : "This field is required";
    objValues.testedSyphilis === "Yes" &&
      (temp.testResultSyphilis = objValues.testResultSyphilis
        ? ""
        : "This field is required");
    // temp.staticHivStatus = objValues.staticHivStatus
    //   ? ""
    //   : "This field is required";

    objValues.previouslyKnownHivStatus === "Yes" &&
      (temp.currentlyOnArt = objValues.currentlyOnArt
        ? ""
        : "This field is required");

    objValues.currentlyOnArt === "Yes" &&
      (temp.facilityEnrolledIn = objValues.facilityEnrolledIn
        ? ""
        : "This field is required");

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };
  //Handle Input Change for Basic Infor
  const handleInputChangeBasic = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  //Get list of KP
  const PregnancyStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGANACY_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setPregnancyStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "ancNo" && e.target.value !== "") {
      async function getAncNumber() {
        const ancNumber = e.target.value;
        const ancNo = {
          ancNo: ancNumber,
        };
        const response = await axios.post(
          `${baseUrl}pmtct/anc/exist/anc-number?ancNo=${ancNumber}`,
          ancNo,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data === true) {
          toast.error("ANC number already exist");
          setAncNumberCheck(response.data);
        } else {
          setAncNumberCheck(false);
        }
      }
      getAncNumber();
    }

    //   getGa();
    // }
    if (
      e.target.name === "parity" &&
      e.target.value !== "" &&
      e.target.value < 0
    ) {
      //The field will  not accept zero as a value
      return;
    } //gravida
    if (
      e.target.name === "gravida" &&
      e.target.value !== "" &&
      e.target.value <= 0
    ) {
      //The field will  not accept zero as a value
      return;
    }
    if (
      e.target.name === "testedSyphilis" &&
      e.target.value !== "" &&
      e.target.value === "Yes"
    ) {
      //The field will  not accept zero as a value
      objValues.testResultSyphilis = "";
      objValues.referredSyphilisTreatment = "";
      objValues.treatedSyphilis = "";
      setObjValues({ ...objValues, ["testResultSyphilis"]: "" });
      setObjValues({ ...objValues, ["referredSyphilisTreatment"]: "" });
      setObjValues({ ...objValues, ["treatedSyphilis"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
    if (
      e.target.name === "testResultSyphilis" &&
      e.target.value !== "" &&
      e.target.value === "Positive"
    ) {
      //The field will  not accept zero as a value
      objValues.treatedSyphilis = "";
      objValues.referredSyphilisTreatment = "";
      setObjValues({ ...objValues, ["treatedSyphilis"]: "" });
      setObjValues({ ...objValues, ["referredSyphilisTreatment"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }

    if (e.target.name === "ancSetting") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        communitySetting: "",
      });
    } else if (e.target.name === "testedHepatitisB") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        dateOfHepatitisB: "",
        hepatitisB: "",
      });
    } else if (e.target.name === "hepatitisB") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        treatedHepatitisB: "",
        referredHepatitisB: "",
      });
    } else if (e.target.name === "testedHepatitisC") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        dateOfHepatitisC: "",
        hepatitisC: "",
      });
    } else if (e.target.name === "hepatitisC") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        treatedHepatitisC: "",
        referredHepatitisC: "",
      });
    } else if (
      e.target.name === "dateOfEnrollment" &&
      e.target.value !== "" &&
      objValues.lmp !== ""
    ) {
      let response = calculateGestationalAge(e.target.value, objValues.lmp);

      if (response > 0) {
        objValues.gaweeks = response;
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      } else {
        // objValues.gaweeks = response;
        toast.error("Please select a valid date ");
        setObjValues({ ...objValues, [e.target.name]: "" });
      }
    } else if (e.target.name === "lmp" && e.target.value !== "") {
      // async function getGa() {
      //   const ga = e.target.value;
      //   const response = await axios.get(
      //     `${baseUrl}pmtct/anc/calculate-ga/${ga}`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //         "Content-Type": "text/plain",
      //       },
      //     }
      //   );

      let response = calculateGestationalAge(
        objValues.dateOfEnrollment,
        e.target.value
      );

      if (response > 0) {
        objValues.gaweeks = response;
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      } else {
        // objValues.gaweeks = response;
        toast.error("Please select a valid date");
        setObjValues({ ...objValues, [e.target.name]: "" });
      }
    } else if (e.target.name === "previouslyKnownHivStatus") {
      let newStaticHivStatus = "";
      if (e.target.value === "Yes") {
        newStaticHivStatus = "Positive";
      } else if (e.target.value === "No") {
        // Auto-populate from patientObj?.dynamicHivStatus if available
        newStaticHivStatus = patientObj?.dynamicHivStatus || "";
      } else if (e.target.value === "Not tested") {
        // Auto-populate from patientObj?.dynamicHivStatus if available
        newStaticHivStatus = patientObj?.dynamicHivStatus || "";
      }
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        staticHivStatus: newStaticHivStatus,
      });
    } else if (e.target.name === "currentlyOnArt") {
      // Reset facility field when ART status changes
      const newObjValues = { ...objValues, [e.target.name]: e.target.value };
      if (e.target.value !== "Yes") {
        newObjValues.facilityEnrolledIn = "";
      }
      setObjValues(newObjValues);
      setErrors({ ...errors, facilityEnrolledIn: "" });
    } else {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
  };

  //Handle CheckBox

  const handleCancel = () => {
    history.push({ pathname: "/" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        objValues.patient_uuid = patientObj.uuid;
        objValues.source = "WEB";
        const response = await axios.put(
          `${baseUrl}pmtct/anc/update-anc/${recordId}`,
          objValues,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Record updated  successful", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        history.push({
          pathname: "/patient-history",
          state: {
            patientObj: patientObj,
            postValue: entryValueDisplay.display,
            entrypointValue: entryValueDisplay.code,
          },
        });
      } catch (error) {
        if (error.response && error.response.data) {
          let errorMessage =
            error.response.data.apierror &&
            error.response.data.apierror.message !== ""
              ? error.response.data.apierror.message
              : "Something went wrong, please try again";
          if (
            error.response.data.apierror &&
            error.response.data.apierror.message !== "" &&
            error.response.data.apierror &&
            error.response.data.apierror.subErrors[0].message !== ""
          ) {
            toast.error(
              error.response.data.apierror.message +
                " : " +
                error.response.data.apierror.subErrors[0].field +
                " " +
                error.response.data.apierror.subErrors[0].message,
              { position: toast.POSITION.BOTTOM_CENTER }
            );
          } else {
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          }
        } else {
          toast.error("Something went wrong. Please try again...", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
      }
    }
  };
  return (
    <>
      <div style={{ padding: "10px 24px 6px", marginBottom: "4px" }}>
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Link to={"/"} style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
            PMTCT
          </Link>
          <span style={{ color: "#cbd5e1", fontSize: "11px" }}>/</span>
          <span style={{ color: "#0f172a", fontWeight: "600" }}>Patient Enrollment</span>
        </nav>
      </div>
      <ToastContainer autoClose={3000} hideProgressBar />
      <Card className={classes.root}>
        <CardContent>
          <Link
            to={{
              pathname: "/patient-history",
              state: { patientObj: patientObj },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              className=" float-end ms-1"
              style={{ background: "linear-gradient(135deg, #014d88 0%, #0168b3 100%)", fontWeight: "600", borderRadius: "0.35rem", padding: "6px 16px", boxShadow: "0 1px 3px rgba(1,77,136,0.3)" }}
              startIcon={<TiArrowBack />}
            >
              <span style={{ textTransform: "capitalize", color: "#fff" }}>
                Back{" "}
              </span>
            </Button>
          </Link>
          <br />
          <br />
          <div className="col-xl-12 col-lg-12">
            <Form>
              <div className="card" style={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 1px 4px rgba(1,77,136,0.12)" }}>
                <div
                  className="card-header"
                  style={{
                    background: "linear-gradient(135deg, #014d88 0%, #0168b3 100%)",
                    color: "#fff",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    padding: "14px 20px",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff", fontWeight: "600", marginBottom: "0", fontSize: "1rem", letterSpacing: "0.3px", display: "flex", alignItems: "center" }}>
                    <PersonIcon style={{ marginRight: "8px", fontSize: "20px" }} />
                    {userDetail === null
                      ? "Basic Information"
                      : "Edit User Information"}
                  </h5>
                </div>

                <div className="card-body" style={{ backgroundColor: "rgb(248, 249, 250)" }}>
                  <div className="basic-form">
                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="firstName">Name</Label>
                          <Input
                            className="form-control"
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={
                              location.state?.patientObj?.fullName
                                ? location?.state.patientObj?.fullName
                                : location?.state?.patientObj?.fullname
                            }
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              outline: "none",
                            }}
                          />
                          {errors.firstName !== "" ? (
                            <span className={classes.error}>
                              {errors.firstName}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-3">
                        <FormGroup>
                          <Label for="patientId">Hospital Number </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="hospitalNumber"
                            id="hospitalNumber"
                            value={basicInfo.hospitalNumber}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              outline: "none",
                            }}
                            //disabled
                          />
                        </FormGroup>
                      </div>

                      <div className="form-group  col-md-2">
                        <FormGroup>
                          <Label>Sex </Label>
                          <Input
                            className="form-control"
                            name="sexId"
                            id="sexId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.sex}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              outline: "none",
                            }}
                          />
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-2">
                        <FormGroup>
                          <Label>Age</Label>
                          <input
                            className="form-control"
                            type="text"
                            name="age"
                            id="age"
                            value={basicInfo.age}
                            disabled={ageDisabled}
                            onChange={handleAgeChange}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              outline: "none",
                            }}
                          />
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adding  ENROLLEMENT FORM HERE */}
              <div className="card" style={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 1px 4px rgba(1,77,136,0.12)", marginTop: "20px" }}>
                <div
                  className="card-header"
                  style={{
                    background: "linear-gradient(135deg, #014d88 0%, #0168b3 100%)",
                    color: "#fff",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    padding: "14px 20px",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff", fontWeight: "600", marginBottom: "0", fontSize: "1rem", letterSpacing: "0.3px", display: "flex", alignItems: "center" }}>
                    <AssignmentIcon style={{ marginRight: "8px", fontSize: "20px" }} />
                    ANC Enrollment
                  </h5>
                </div>
                <div className="card-body" style={{ backgroundColor: "rgb(248, 249, 250)" }}>

                  {/* === Registration Information === */}
                  <div className="col-md-12 mb-3 mt-3">
                    <div style={sectionContainerStyle}>
                      <h6 style={sectionHeaderStyle}>
                        <PersonIcon style={sectionIconStyle} />Registration Information
                      </h6>
                      <div className="row">
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>ANC Setting</Label>
                            <InputGroup>
                              <Input type="select" name="ancSetting" id="ancSetting" onChange={handleInputChange} value={objValues.ancSetting} disabled={disabledField}>
                                <option value="">Select</option>
                                {ANCSetting && ANCSetting.length > 0 && ANCSetting.map((each) => (<option key={each.id} value={each.code}>{each.display}</option>))}
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {objValues.ancSetting && (
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>{objValues.ancSetting === "ENROLLMENT_SETTING_COMMUNITY" ? "Community Setting" : "Facility Setting"}</Label>
                              <InputGroup>
                                <Input type="select" name="communitySetting" id="communitySetting" onChange={handleInputChange} value={objValues.communitySetting} disabled={disabledField}>
                                  <option value="">Select</option>
                                  {objValues.ancSetting === "ENROLLMENT_SETTING_COMMUNITY" ? (
                                    <>{communitySetting && communitySetting.length > 0 && communitySetting.map((each) => (<option key={each.id} value={each.code}>{each.display}</option>))}</>
                                  ) : (
                                    <option value={"PMTCT (ANC1 Only)"}>PMTCT (ANC1 Only)</option>
                                  )}
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                        )}
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>ANC No <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="text" name="ancNo" id="ancNo" onChange={handleInputChange} value={objValues.ancNo} disabled />
                            </InputGroup>
                            {errors.ancNo !== "" ? (<span className={classes.error}>{errors.ancNo}</span>) : ""}
                            {ancNumberCheck === true ? (<span className={classes.error}>{"ANC number already exist"}</span>) : ""}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Date of Enrollment <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="dateOfEnrollment" id="dateOfEnrollment" onChange={handleInputChange} value={objValues.dateOfEnrollment} max={moment(new Date()).format("YYYY-MM-DD")} disabled={disabledField} />
                            </InputGroup>
                            {errors.dateOfEnrollment !== "" ? (<span className={classes.error}>{errors.dateOfEnrollment}</span>) : ""}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>ANC Attendance</Label>
                            <InputGroup>
                              <Input type="select" name="ancAttendance" id="ancAttendance" onChange={handleInputChange} value={objValues.ancAttendance} disabled={disabledField}>
                                <option value="">Select</option>
                                <option value="New">New</option>
                                <option value="Revisit">Revisit</option>
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
                              <Input type="number" name="parity" id="parity" onChange={handleInputChange} value={objValues.parity} min={0} disabled={disabledField} />
                            </InputGroup>
                            {errors.parity !== "" ? (<span className={classes.error}>{errors.parity}</span>) : ""}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Gravida <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="number" name="gravida" id="gravida" onChange={handleInputChange} value={objValues.gravida} min="1" disabled={disabledField} />
                            </InputGroup>
                            {errors.gravida !== "" ? (<span className={classes.error}>{errors.gravida}</span>) : ""}
                            {objValues.gravida < objValues.parity ? (<span className={classes.error}>Gravida should not be less Parity</span>) : ""}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Date Of Last Menstrual Period <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="lmp" id="lmp" onChange={handleInputChange} value={objValues.lmp} max={objValues.dateOfEnrollment ? objValues.dateOfEnrollment : moment(new Date()).format("YYYY-MM-DD")} disabled={disabledField} />
                            </InputGroup>
                            {errors.lmp !== "" ? (<span className={classes.error}>{errors.lmp}</span>) : ""}
                            {objValues.gaweeks === 0 ? (<span className={classes.error}>Invalid date</span>) : ""}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Gestational Age (Weeks) <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="text" name="gaweeks" id="gaweeks" onChange={handleInputChange} value={objValues.gaweeks} disabled />
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
                              <Input type="number" name="weight" id="weight" onChange={handleInputChange} value={objValues.weight} step="0.1" min="0" disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Height (m)</Label>
                            <InputGroup>
                              <Input type="number" name="height" id="height" onChange={handleInputChange} value={objValues.height} step="0.01" min="0" disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Blood Pressure (Systolic)</Label>
                            <InputGroup>
                              <Input type="number" name="systolic" id="systolic" onChange={handleInputChange} value={objValues.systolic} min="0" disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Blood Pressure (Diastolic)</Label>
                            <InputGroup>
                              <Input type="number" name="diastolic" id="diastolic" onChange={handleInputChange} value={objValues.diastolic} min="0" disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>No. of ANC Visits to Date</Label>
                            <InputGroup>
                              <Input type="number" name="numberOfAncVisits" id="numberOfAncVisits" onChange={handleInputChange} value={objValues.numberOfAncVisits} min="0" disabled={disabledField} />
                            </InputGroup>
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
                            <Label>HIV Testing Services</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingHts" id="counsellingHts" onChange={handleInputChange} value={objValues.counsellingHts} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Female Genital Mutilation (FGM)</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingFgm" id="counsellingFgm" onChange={handleInputChange} value={objValues.counsellingFgm} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Family Planning</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingFp" id="counsellingFp" onChange={handleInputChange} value={objValues.counsellingFp} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Maternal Nutrition</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingMaternalNutrition" id="counsellingMaternalNutrition" onChange={handleInputChange} value={objValues.counsellingMaternalNutrition} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Early Initiation of Breastfeeding</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingEarlyBf" id="counsellingEarlyBf" onChange={handleInputChange} value={objValues.counsellingEarlyBf} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Exclusive Breastfeeding</Label>
                            <InputGroup>
                              <Input type="select" name="counsellingExclusiveBf" id="counsellingExclusiveBf" onChange={handleInputChange} value={objValues.counsellingExclusiveBf} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
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
                              <Input type="select" name="testedSyphilis" id="testedSyphilis" onChange={handleInputChange} value={objValues.testedSyphilis} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                            {errors.testedSyphilis !== "" ? (<span className={classes.error}>{errors.testedSyphilis}</span>) : ""}
                          </FormGroup>
                        </div>
                        {objValues.testedSyphilis === "Yes" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Syphilis Test Result <span style={{ color: "red" }}> *</span></Label>
                                <InputGroup>
                                  <Input type="select" name="testResultSyphilis" id="testResultSyphilis" onChange={handleInputChange} value={objValues.testResultSyphilis} disabled={disabledField}>
                                    <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                                  </Input>
                                </InputGroup>
                                {errors.testResultSyphilis !== "" ? (<span className={classes.error}>{errors.testResultSyphilis}</span>) : ""}
                              </FormGroup>
                            </div>
                            {objValues.testResultSyphilis === "Positive" && (
                              <>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Treated for Syphilis (penicillin) <span style={{ color: "red" }}> *</span></Label>
                                    <InputGroup>
                                      <Input type="select" name="treatedSyphilis" id="treatedSyphilis" onChange={handleInputChange} value={objValues.treatedSyphilis} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                    {errors.treatedSyphilis !== "" ? (<span className={classes.error}>{errors.treatedSyphilis}</span>) : ""}
                                  </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Referred Syphilis +ve Client <span style={{ color: "red" }}> *</span></Label>
                                    <InputGroup>
                                      <Input type="select" name="referredSyphilisTreatment" id="referredSyphilisTreatment" onChange={handleInputChange} value={objValues.referredSyphilisTreatment} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                    {errors.referredSyphilisTreatment !== "" ? (<span className={classes.error}>{errors.referredSyphilisTreatment}</span>) : ""}
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
                              <Input type="select" name="testedHepatitisB" id="testedHepatitisB" onChange={handleInputChange} value={objValues.testedHepatitisB} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {objValues.testedHepatitisB === "Yes" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Date Test Done</Label>
                                <InputGroup>
                                  <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="dateOfHepatitisB" id="dateOfHepatitisB" onChange={handleInputChange} value={objValues.dateOfHepatitisB} min={patientObj.dateOfRegistration} max={moment(new Date()).format("YYYY-MM-DD")} disabled={disabledField} />
                                </InputGroup>
                              </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Hepatitis B Test Result</Label>
                                <InputGroup>
                                  <Input type="select" name="hepatitisB" id="hepatitisB" onChange={handleInputChange} value={objValues.hepatitisB} disabled={disabledField}>
                                    <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                                  </Input>
                                </InputGroup>
                              </FormGroup>
                            </div>
                            {objValues.hepatitisB === "Positive" && (
                              <>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Treated for Hepatitis B</Label>
                                    <InputGroup>
                                      <Input type="select" name="treatedHepatitisB" id="treatedHepatitisB" onChange={handleInputChange} value={objValues.treatedHepatitisB} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                  </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Referred Hepatitis B +ve Client</Label>
                                    <InputGroup>
                                      <Input type="select" name="referredHepatitisB" id="referredHepatitisB" onChange={handleInputChange} value={objValues.referredHepatitisB} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
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
                              <Input type="select" name="testedHepatitisC" id="testedHepatitisC" onChange={handleInputChange} value={objValues.testedHepatitisC} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        {objValues.testedHepatitisC === "Yes" && (
                          <>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Date Test Done</Label>
                                <InputGroup>
                                  <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="dateOfHepatitisC" id="dateOfHepatitisC" onChange={handleInputChange} value={objValues.dateOfHepatitisC} min={patientObj.dateOfRegistration} max={moment(new Date()).format("YYYY-MM-DD")} disabled={disabledField} />
                                </InputGroup>
                              </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Hepatitis C Test Result</Label>
                                <InputGroup>
                                  <Input type="select" name="hepatitisC" id="hepatitisC" onChange={handleInputChange} value={objValues.hepatitisC} disabled={disabledField}>
                                    <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                                  </Input>
                                </InputGroup>
                              </FormGroup>
                            </div>
                            {objValues.hepatitisC === "Positive" && (
                              <>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Treated for Hepatitis C</Label>
                                    <InputGroup>
                                      <Input type="select" name="treatedHepatitisC" id="treatedHepatitisC" onChange={handleInputChange} value={objValues.treatedHepatitisC} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                  </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Referred Hepatitis C +ve Client</Label>
                                    <InputGroup>
                                      <Input type="select" name="referredHepatitisC" id="referredHepatitisC" onChange={handleInputChange} value={objValues.referredHepatitisC} disabled={disabledField}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
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
                            <Label>HB/PCV (g/dl or %)</Label>
                            <InputGroup>
                              <Input type="text" name="hbPcv" id="hbPcv" onChange={handleInputChange} value={objValues.hbPcv} disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Blood Sugar (Gestational Diabetes)</Label>
                            <InputGroup>
                              <Input type="select" name="bloodSugarGdm" id="bloodSugarGdm" onChange={handleInputChange} value={objValues.bloodSugarGdm} disabled={disabledField}>
                                <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Urinalysis - Sugar</Label>
                            <InputGroup>
                              <Input type="select" name="urinalysisSugar" id="urinalysisSugar" onChange={handleInputChange} value={objValues.urinalysisSugar} disabled={disabledField}>
                                <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Urinalysis - Proteins</Label>
                            <InputGroup>
                              <Input type="select" name="urinalysisProteins" id="urinalysisProteins" onChange={handleInputChange} value={objValues.urinalysisProteins} disabled={disabledField}>
                                <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
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
                              <Input type="select" name="llinGiven" id="llinGiven" onChange={handleInputChange} value={objValues.llinGiven} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Dose of IPT Given</Label>
                            <InputGroup>
                              <Input type="select" name="iptDose" id="iptDose" onChange={handleInputChange} value={objValues.iptDose} disabled={disabledField}>
                                <option value="">Select</option><option value="IPT1">IPT 1</option><option value="IPT2">IPT 2</option><option value="IPT3">IPT 3</option><option value="IPT4">IPT 4</option><option value="None">None</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Hematinics Given (Iron & Folic Acid)?</Label>
                            <InputGroup>
                              <Input type="select" name="hematinicsGiven" id="hematinicsGiven" onChange={handleInputChange} value={objValues.hematinicsGiven} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>TD Immunization</Label>
                            <InputGroup>
                              <Input type="select" name="tdImmunization" id="tdImmunization" onChange={handleInputChange} value={objValues.tdImmunization} disabled={disabledField}>
                                <option value="">Select</option><option value="Td1">Td1</option><option value="Td2">Td2</option><option value="Td3">Td3</option><option value="Td4">Td4</option><option value="Td5">Td5</option><option value="None">None</option>
                              </Input>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === HIV Status === */}
                  <div className="col-md-12 mb-3">
                    <div style={sectionContainerStyle}>
                      <h6 style={sectionHeaderStyle}>
                        <AssignmentIcon style={sectionIconStyle} />HIV Status
                      </h6>
                      <div className="row">
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Previously Known HIV +ve Status <span style={{ color: "red" }}> *</span></Label>
                            <InputGroup>
                              <Input type="select" name="previouslyKnownHivStatus" id="previouslyKnownHivStatus" onChange={handleInputChange} value={objValues.previouslyKnownHivStatus} disabled={disabledField}>
                                <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option><option value="Not tested">Not tested</option>
                              </Input>
                            </InputGroup>
                            {errors.previouslyKnownHivStatus !== "" ? (<span className={classes.error}>{errors.previouslyKnownHivStatus}</span>) : ""}
                          </FormGroup>
                        </div>
                        {objValues.previouslyKnownHivStatus === "Yes" && (
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Are You Currently on ART? <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="currentlyOnArt" id="currentlyOnArt" onChange={handleInputChange} value={objValues.currentlyOnArt} disabled={disabledField}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                              {errors.currentlyOnArt !== "" ? (<span className={classes.error}>{errors.currentlyOnArt}</span>) : ""}
                            </FormGroup>
                          </div>
                        )}
                        {objValues.previouslyKnownHivStatus === "Yes" && objValues.currentlyOnArt === "Yes" && (
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Facility Enrolled In <span style={{ color: "red" }}> *</span></Label>
                              <FacilitySearchDropdown name="facilityEnrolledIn" value={objValues.facilityEnrolledIn} onChange={handleInputChange} placeholder="Search for a facility..." error={errors.facilityEnrolledIn} disabled={disabledField} />
                              {errors.facilityEnrolledIn !== "" ? (<span className={classes.error}>{errors.facilityEnrolledIn}</span>) : ""}
                            </FormGroup>
                          </div>
                        )}
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>HIV Status</Label>
                            <InputGroup>
                              <Input type="select" name="staticHivStatus" id="staticHivStatus" onChange={handleInputChange} value={objValues.staticHivStatus} disabled={objValues.previouslyKnownHivStatus === "Yes" || disableHIVStatus || disabledField ? true : false}>
                                <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option><option value="Not tested">Not Tested</option>
                              </Input>
                            </InputGroup>
                            {errors.staticHivStatus !== "" ? (<span className={classes.error}>{errors.staticHivStatus}</span>) : ""}
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>

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
                              <Input type="textarea" name="associatedProblems" id="associatedProblems" onChange={handleInputChange} value={objValues.associatedProblems} style={{ height: "41px" }} disabled={disabledField} />
                            </InputGroup>
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <Label>Outcome of Visit</Label>
                            <InputGroup>
                              <Input type="select" name="outcomeOfVisit" id="outcomeOfVisit" onChange={handleInputChange} value={objValues.outcomeOfVisit} disabled={disabledField}>
                                <option value="">Select</option><option value="Not Treated">Not Treated (NT)</option><option value="Treated">Treated (T)</option><option value="Admitted">Admitted (A)</option><option value="Referred Out">Referred Out (RO)</option>
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
                                  <Input type="text" name="referralReason" id="referralReason" onChange={handleInputChange} value={objValues.referralReason} disabled={disabledField} />
                                </InputGroup>
                              </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                              <FormGroup>
                                <Label>Transportation Out</Label>
                                <InputGroup>
                                  <Input type="select" name="transportationOut" id="transportationOut" onChange={handleInputChange} value={objValues.transportationOut} disabled={disabledField}>
                                    <option value="">Select</option><option value="Ambulance">Ambulance</option><option value="Others">Others</option>
                                  </Input>
                                </InputGroup>
                              </FormGroup>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              {/* END OF HIV ENROLLEMENT FORM */}
              {saving ? <Spinner /> : ""}

              <br />

              {objValues.gaweeks > 0 &&
                ancNumberCheck !== true &&
                objValues.gravida >= objValues.parity && (
                  <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    hidden={disabledField}
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    disabled={disabledAgeBaseOnAge}
                    onClick={handleSubmit}
                  >
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>
                        Update
                      </span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Updating...
                      </span>
                    )}
                  </MatButton>
                )}
              <MatButton
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                style={{ backgroundColor: "#992E62" }}
              >
                <span style={{ textTransform: "capitalize", color: "#fff" }}>
                  Cancel
                </span>
              </MatButton>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="sm"
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
          <h4>Are you Sure of the Age entered?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserRegistration;
