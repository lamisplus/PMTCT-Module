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
import AssignmentIcon from "@material-ui/icons/Assignment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import "./patient.css";
import { Modal } from "react-bootstrap";
import { GET_CODESETS_IN_BATCH } from "../../../utils";
import { scrollToFirstError } from "../../utils";
import AncFormFields from "../PmtctServices/AncFormFields";


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
    ancNo: "",
    referredFromSpokesSite: "",
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
    ancAttendance: "New ANC",
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
    pcv: "",
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
        const d = response.data;
        // Convert Boolean values from API to "Yes"/"No" strings for dropdown compatibility
        const boolToYesNo = (val) => val === true ? "Yes" : val === false ? "No" : val || "";
        setObjValues((prev) => ({
          ...prev,
          ancNo: d.ancNo || "",
          ancAttendance: d.ancAttendance || prev.ancAttendance,
          referredFromSpokesSite: d.referredFromSpokesSite || "",
          dateOfEnrollment: d.dateOfEnrollment || "",
          gravida: d.gravida != null ? d.gravida : "",
          parity: d.parity != null ? d.parity : "",
          lmp: d.lmp || "",
          gaweeks: d.gaweeks != null ? d.gaweeks : "",
          ancSetting: d.ancSetting || "",
          communitySetting: d.communitySetting || "",
          staticHivStatus: d.staticHivStatus || "",
          previouslyKnownHivStatus: d.previouslyKnownHivStatus || "",
          currentlyOnArt: d.currentlyOnArt || "",
          facilityEnrolledIn: d.facilityEnrolledIn || "",
          hbPcv: d.labTest?.hbPcv || "",
          pcv: d.labTest?.pcv || "",
          bloodSugarGdm: d.labTest?.bloodSugarGdm || "",
          llinGiven: d.interventions?.llinGiven || "",
          iptDose: d.interventions?.iptDose || "",
          hematinicsGiven: d.interventions?.hematinicsGiven || "",
          tdImmunization: d.interventions?.tdImmunization || "",
          associatedProblems: d.interventions?.associatedProblems || "",
          outcomeOfVisit: d.outcomeOfVisit || "",
          referralReason: d.referralReason || "",
          transportationOut: d.transportationOut || "",
          // Flatten nested JSONB objects to flat keys for AncFormFields
          weight: d.vitalSigns?.weight != null ? String(d.vitalSigns.weight) : "",
          height: d.vitalSigns?.height != null ? String(d.vitalSigns.height) : "",
          systolic: d.vitalSigns?.systolic != null ? String(d.vitalSigns.systolic) : "",
          diastolic: d.vitalSigns?.diastolic != null ? String(d.vitalSigns.diastolic) : "",
          counsellingHts: d.counselling?.counsellingHts || d.counselling?.hts || "",
          counsellingFgm: d.counselling?.counsellingFgm || d.counselling?.fgm || "",
          counsellingFp: d.counselling?.counsellingFp || d.counselling?.fp || "",
          counsellingMaternalNutrition: d.counselling?.counsellingMaternalNutrition || d.counselling?.maternalNutrition || "",
          counsellingEarlyBf: d.counselling?.counsellingEarlyBf || d.counselling?.earlyBf || "",
          counsellingExclusiveBf: d.counselling?.counsellingExclusiveBf || d.counselling?.exclusiveBf || "",
          testedSyphilis: d.syphilisInfo?.testedSyphilis || "",
          testResultSyphilis: d.syphilisInfo?.testResultSyphilis || "",
          treatedSyphilis: d.syphilisInfo?.treatedSyphilis || "",
          referredSyphilisTreatment: d.syphilisInfo?.referredSyphilisTreatment || "",
          testedHepatitisB: boolToYesNo(d.hepatitisBInfo?.testedHepatitisB),
          dateOfHepatitisB: d.hepatitisBInfo?.dateOfHepatitisB || "",
          hepatitisB: d.hepatitisBInfo?.hepatitisB || "",
          treatedHepatitisB: boolToYesNo(d.hepatitisBInfo?.treatedHepatitisB),
          referredHepatitisB: boolToYesNo(d.hepatitisBInfo?.referredHepatitisB),
          testedHepatitisC: boolToYesNo(d.hepatitisCInfo?.testedHepatitisC),
          dateOfHepatitisC: d.hepatitisCInfo?.dateOfHepatitisC || "",
          hepatitisC: d.hepatitisCInfo?.hepatitisC || "",
          treatedHepatitisC: boolToYesNo(d.hepatitisCInfo?.treatedHepatitisC),
          referredHepatitisC: boolToYesNo(d.hepatitisCInfo?.referredHepatitisC),
          urinalysisSugar: d.urinalysis?.sugar || "",
          urinalysisProteins: d.urinalysis?.proteins || "",
        }));
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
       "PREGNANCY_STATUS",
       "SOURCE_REFERRAL_PMTCT"
     ).then((response) => {
       setANCSetting(response.data.ENROLLMENT_SETTING || []);
       setCommunitySetting(response.data.COMMUNITY_PMTCT);
       getSex(response.data.SEX);
       setPregnancyStatus(response.data.PREGNANCY_STATUS);
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

    temp.dateOfEnrollment = objValues.dateOfEnrollment ? "" : "This field is required"
    temp.gaweeks = objValues.gaweeks ? "" : "This field is required";
    temp.gravida = objValues.gravida ? "" : "This field is required";
    temp.lmp = objValues.lmp ? "" : "This field is required";
    temp.parity = objValues.parity !== "" ? "" : "This field is required";
    temp.testedSyphilis = objValues.testedSyphilis
      ? ""
      : "This field is required";
    temp.testedHepatitisB = objValues.testedHepatitisB
      ? ""
      : "This field is required";
    objValues.testResultSyphilis === "Positive" &&
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

    // Vital signs range validation
    if (objValues.weight && (parseFloat(objValues.weight) < 30 || parseFloat(objValues.weight) > 150)) {
      temp.weight = "Weight must be between 30 and 150 kg";
    }
    if (objValues.height && (parseFloat(objValues.height) < 48.26 || parseFloat(objValues.height) > 216.408)) {
      temp.height = "Height must be between 48.26 and 216.408 cm";
    }
    if (objValues.systolic && (parseFloat(objValues.systolic) < 90 || parseFloat(objValues.systolic) > 240)) {
      temp.systolic = "Systolic BP must be between 90 and 240";
    }
    if (objValues.diastolic && (parseFloat(objValues.diastolic) < 60 || parseFloat(objValues.diastolic) > 140)) {
      temp.diastolic = "Diastolic BP must be between 60 and 140";
    }

    // HB and PCV range validation
    if (objValues.hbPcv && (parseFloat(objValues.hbPcv) < 4 || parseFloat(objValues.hbPcv) > 20)) {
      temp.hbPcv = "HB must be between 4 and 20 g/dl";
    }
    if (objValues.pcv && (parseFloat(objValues.pcv) < 0 || parseFloat(objValues.pcv) > 100)) {
      temp.pcv = "PCV must be between 0 and 100%";
    }

    setErrors({ ...temp });
    const isValid = Object.values(temp).every((x) => x === "" || x === undefined);
    if (!isValid) {
      toast.error("Please fill all required fields and correct validation errors");
      // Take the user straight to the topmost field with an error instead of leaving them
      // to hunt a long form for it.
      scrollToFirstError(Object.keys(temp).filter((key) => temp[key]));
    }
    return isValid;
  };
  //Handle Input Change for Basic Infor
  const handleInputChangeBasic = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  //Get list of KP
  const PregnancyStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
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
  // Adapter for AncFormFields: receives (fieldName, value) and updates flat state
  const handleFieldChange = (name, value) => {
    if (name === "__clearError__") {
      setErrors((prev) => ({ ...prev, [value]: "" }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setObjValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    history.push({ pathname: "/" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const payload = {
          ancNo: objValues.ancNo,
          ancAttendance: objValues.ancAttendance,
          referredFromSpokesSite: objValues.referredFromSpokesSite,
          dateOfEnrollment: objValues.dateOfEnrollment,
          gravida: objValues.gravida,
          parity: objValues.parity,
          lmp: objValues.lmp,
          gaweeks: objValues.gaweeks,
          labTest: {
            hbPcv: objValues.hbPcv,
            pcv: objValues.pcv,
            bloodSugarGdm: objValues.bloodSugarGdm,
          },
          interventions: {
            llinGiven: objValues.llinGiven,
            iptDose: objValues.iptDose,
            hematinicsGiven: objValues.hematinicsGiven,
            tdImmunization: objValues.tdImmunization,
            associatedProblems: objValues.associatedProblems,
          },
          outcomeOfVisit: objValues.outcomeOfVisit,
          referralReason: objValues.referralReason,
          transportationOut: objValues.transportationOut,
          vitalSigns: {
            weight: objValues.weight ? parseFloat(objValues.weight) : null,
            height: objValues.height ? parseFloat(objValues.height) : null,
            systolic: objValues.systolic ? parseFloat(objValues.systolic) : null,
            diastolic: objValues.diastolic ? parseFloat(objValues.diastolic) : null,
          },
          counselling: {
            hts: objValues.counsellingHts,
            fgm: objValues.counsellingFgm,
            fp: objValues.counsellingFp,
            maternalNutrition: objValues.counsellingMaternalNutrition,
            earlyBf: objValues.counsellingEarlyBf,
            exclusiveBf: objValues.counsellingExclusiveBf,
          },
          syphilisInfo: {
            testedSyphilis: objValues.testedSyphilis,
            testResultSyphilis: objValues.testResultSyphilis,
            treatedSyphilis: objValues.treatedSyphilis,
            referredSyphilisTreatment: objValues.referredSyphilisTreatment,
          },
          hepatitisBInfo: {
            testedHepatitisB: objValues.testedHepatitisB,
            dateOfHepatitisB: objValues.dateOfHepatitisB,
            hepatitisB: objValues.hepatitisB,
            treatedHepatitisB: objValues.treatedHepatitisB,
            referredHepatitisB: objValues.referredHepatitisB,
          },
          hepatitisCInfo: {
            testedHepatitisC: objValues.testedHepatitisC,
            dateOfHepatitisC: objValues.dateOfHepatitisC,
            hepatitisC: objValues.hepatitisC,
            treatedHepatitisC: objValues.treatedHepatitisC,
            referredHepatitisC: objValues.referredHepatitisC,
          },
          urinalysis: {
            sugar: objValues.urinalysisSugar,
            proteins: objValues.urinalysisProteins,
          },
          patient_uuid: patientObj.uuid,
          pmtctCycleUuid: objValues.pmtctCycleUuid,
          source: "WEB",
        };
        const response = await axios.put(
          `${baseUrl}pmtct/anc/update-anc/${recordId}`,
          payload,
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

              {/* ANC ENROLLMENT FORM */}
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
                  <AncFormFields
                    values={objValues}
                    errors={errors}
                    onChange={handleFieldChange}
                    disabled={disabledField}
                    showHivFields={false}
                    showAncSetting={false}
                    showFacilityField={false}
                    ancNoDisabled={true}
                    ancSettings={ANCSetting}
                    communitySettings={communitySetting}
                    disableHIVStatus={disableHIVStatus}
                  />
                </div>
              </div>
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
