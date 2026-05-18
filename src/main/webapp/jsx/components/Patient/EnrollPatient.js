import React, { useCallback, useEffect, useRef, useState } from "react";
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
import PeopleIcon from "@material-ui/icons/People";
import TimelineIcon from "@material-ui/icons/Timeline";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import "./patient.css";
import PmtctEnrollment from "../PmtctServices/PmtctEnrollment";
// import Form from 'react-bootstrap/Form';
import { Modal } from "react-bootstrap";
import { calculateGestationalAge } from "../../utils";
import FacilitySearchDropdown from "./FacilitySearchDropdown";
import { GET_CODESETS_IN_BATCH } from "../../../utils";
import PmtctHtsForm from "../PmtctServices/PmtctHtsForm";
import LabourDelivery from "../PmtctServices/LabourDelivery";
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
    active: true,
    address: [],
    contact: [],
    contactPoint: [],
    dateOfBirth: "",
    deceased: false,
    deceasedDateTime: null,
    firstName: "",
    genderId: "",
    identifier: "",
    otherName: "",
    maritalStatusId: "",
    educationId: "",
    employmentStatusId: "",
    dateOfRegistration: "",
    isDateOfBirthEstimated: null,
    age: "",
    phoneNumber: "",
    altPhonenumber: "",
    dob: "",
    countryId: "",
    stateId: "",
    district: "",
    landmark: "",
    sexId: "",
    ninNumber: "",
  });
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const locationState = location.state;
  let patientId = null;
  let patientObj = {};
  patientId = locationState ? locationState.patientId : null;
  patientObj = locationState ? locationState.patientObj : {};

  const [saving, setSaving] = useState(false);
  const [disabledAgeBaseOnAge, setDisabledAgeBaseOnAge] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [genders, setGenders] = useState([]);
  const [ancNumberCheck, setAncNumberCheck] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeContent, setActiveContent] = useState({
    route: "recent-history",
    id: "",
    activeTab: "home",
    actionType: "",
    obj: {},
  });

  const userDetail =
    props.location && props.location.state ? props.location.state.user : null;

  const [ANCSetting, setANCSetting] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
  const [lastPmtctHtsRecord, setLastPmtctHtsRecord] = useState({
    confirmatoryHivTest: "",
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    stageOfPregnancy: "",
    id: "",
  });
  const [latestPmtctCycle, setLatestPmtctCycle] = useState(null);
  const [pmtctCycleCreated, setPmtctCycleCreated] = useState({
    patientUuid: patientObj.patientUuid ? patientObj.patientUuid : patientObj?.uuid,
    maternalOutcome: "",
    entryPoint: locationState.entrypointValue,
    hivStatus: patientObj?.dynamicHivStatus || "",
    pregnancyOutcome: "",
    numberOfInfants: 0,
    pmtctStatus: "INACTIVE",
  });

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
    // sourceOfReferral: "",
    staticHivStatus: patientObj?.dynamicHivStatus || "",
    previouslyKnownHivStatus:
      patientObj.dynamicHivStatus === "Positive"
        ? "Yes"
        : patientObj.dynamicHivStatus === "Negative"
        ? "No"
        : "",
    currentlyOnArt: "",

    dateOfHepatitisB: "",
    hepatitisB: "",
    testedHepatitisB: "",
    treatedHepatitisB: "",
    referredHepatitisB: "",

    dateOfHepatitisC: "",
    hepatitisC: "",
    testedHepatitisC: "",
    treatedHepatitisC: "",
    referredHepatitisC: "",
    facilityEnrolledIn: "",
    pmtctCycleUuid: "",
    referredFromSpokesSite: "",
    // NHMIS fields
    ancAttendance: "New",
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
  const [retrievedPatient, setRetrievedPatient] = useState({});
  const [htsHivStatus, setHtsHivStatus] = useState("");

  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  const [sourceOfReferral, setSourceOfReferral] = useState([]);
  const [minAncDates, setMinAncDates] = useState({
    minDateOfEnrollment: null,
    minLmp: null,
  });
  const [showEnrollmentConfirmation, setShowEnrollmentConfirmation] = useState(false);
  const [enrollmentValidation, setEnrollmentValidation] = useState(null);
  const [canProceedWithEnrollment, setCanProceedWithEnrollment] = useState(true);
  const hasValidatedRef = useRef(false);
  const hasCheckedHivStatusRef = useRef(false);
  const [pendingHivPositiveToast, setPendingHivPositiveToast] = useState(false);

  const validateEnrollment = async (patientUuid) => {
    // Prevent duplicate validation calls within the same patient
    if (hasValidatedRef.current) return;

    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/validate-enrollment?patientUuid=${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setEnrollmentValidation(response.data);
        hasValidatedRef.current = true;

        // List of negative outcomes that should NOT show the modal
        const negativeOutcomes = [
          "MATERNAL_OUTCOME_DEAD",
          "MATERNAL_OUTCOME_TRANSFERRED_OUT"
        ];

        // Check if the last maternal outcome is a negative outcome
        const lastOutcome = response.data.lastMaternalOutcome?.trim().toUpperCase() || "";
        const isNegativeOutcome = negativeOutcomes.some(
          outcome => outcome.toUpperCase() === lastOutcome
        );

        if (isNegativeOutcome || response.data.canEnrollDirectly) {
          // Allow direct enrollment without showing modal
          setCanProceedWithEnrollment(true);
          setShowEnrollmentConfirmation(false);
        } else if (response.data.requiresConfirmation) {
          // Show confirmation dialog only if not a negative outcome
          setShowEnrollmentConfirmation(true);
          setCanProceedWithEnrollment(false);
        }
      }
    } catch (error) {
      console.log("Error validating enrollment:", error);
      // On error, allow enrollment to proceed
      setCanProceedWithEnrollment(true);
      hasValidatedRef.current = true;
    }
  };

  const checkANCEnrollment = async (patientUuid, cycleId) => {
    if (!cycleId) return;
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/check-anc-enrollment?patientUuid=${patientUuid}&pmtctCycleUuid=${cycleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.hasAncEnrollment) {
        // Set minimum dates if patient has previous ANC enrollment
        setMinAncDates({
          minDateOfEnrollment: response.data.dateOfEnrollment,
          minLmp: response.data.lmp,
        });
      }
    } catch (error) {
      console.log("Error checking ANC enrollment:", error);
    }
  };

  const getLastPmtctHtsRecord = async (patientUuid) => {
    try {
      // Get the latest HTS record by patient_uuid only
      const htsResponse = await axios.get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-by-person-uuid/${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (htsResponse.data) {
        setLastPmtctHtsRecord(htsResponse.data);
      }

      // Also get the latest pregnancy cycle if needed
      const cyclesResponse = await axios.get(
        `${baseUrl}pmtct/anc/pregnancy-cycles?patientUuid=${patientUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (cyclesResponse.data && cyclesResponse.data.length > 0) {
        const latestCycle = cyclesResponse.data[0];
        setLatestPmtctCycle(latestCycle);
        checkANCEnrollment(patientUuid, latestCycle.uuid);
      }
    } catch (error) {
      console.log("Error fetching PMTCT HTS record:", error);
    }
  };

  const getHistoricalHivStatus = async (patientUuid) => {
    // Prevent duplicate calls - ref updates synchronously across all renders
    if (hasCheckedHivStatusRef.current) return;
    hasCheckedHivStatusRef.current = true;

    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-historical-hiv-status`,
        {
          params: { patientUuid },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data === "POSITIVE") {
        // Auto-populate HIV status fields
        setObjValues((prev) => ({
          ...prev,
          staticHivStatus: "Positive",
          previouslyKnownHivStatus: "Yes",
        }));
        setDisableHIVStatus(true);
        setPendingHivPositiveToast(true);
      }
    } catch (error) {
      console.log("Error fetching historical HIV status:", error);
    }
  };

  useEffect(() => {
    GET_CODESETS();

    // Reset enrollment validation state when patient changes
    hasValidatedRef.current = false;
    setEnrollmentValidation(null);
    setShowEnrollmentConfirmation(false);
    setCanProceedWithEnrollment(true);

    let hospitalNumber;

    if (patientObj) {
      getLastPmtctHtsRecord(patientObj?.uuid);
      getHistoricalHivStatus(patientObj?.uuid);

      // Only validate enrollment if patient is not already enrolled via ANC
      if (!patientObj?.ancNo) {
        validateEnrollment(patientObj?.uuid);
      }

      if (patientObj?.identifier) {
        const identifiers = patientObj.identifier;
        hospitalNumber = identifiers.identifier.find(
          (obj) => obj.type === "HospitalNumber"
        );
      } else {
        hospitalNumber = patientObj?.hospitalNumber;
      }
      basicInfo.dob = patientObj.dateOfBirth;
      basicInfo.firstName = patientObj.firstName;
      basicInfo.dateOfRegistration = patientObj.dateOfRegistration;
      basicInfo.middleName = patientObj.otherName;
      basicInfo.lastName = patientObj.surname;
      basicInfo.dateOfRegistration = patientObj.dateOfRegistration;
      basicInfo.hospitalNumber =
        hospitalNumber && typeof hospitalNumber === "string"
          ? hospitalNumber
          : hospitalNumber?.value;
      setObjValues({
        ...objValues,
        uniqueId: hospitalNumber ? hospitalNumber.value : "",
      });
      basicInfo.genderId =
        patientObj && patientObj.gender ? patientObj.gender.id : null;
      const patientAge = calculate_age(
        moment(patientObj.dateOfBirth).format("DD-MM-YYYY")
      );
      basicInfo.age = patientAge;
      objValues.personId = patientObj.id;
      basicInfo.ninNumber = patientObj.ninNumber;
    }
    if (basicInfo.dateOfRegistration < basicInfo.dob) {
      alert("Date of registration can not be earlier than date of birth");
    }
  }, [patientObj?.uuid, patientId]);

  // Show HIV positive toast after confirmation modal is accepted (or if no modal needed)
  useEffect(() => {
    if (pendingHivPositiveToast && canProceedWithEnrollment && !showEnrollmentConfirmation) {
      toast.info("Patient has a previous HIV positive record. HIV status auto-populated.", {
        toastId: "hiv-positive-alert",
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        style: { background: "#f0f0f0", color: "#2d3748", fontWeight: "500", fontSize: "0.88rem", borderRadius: "0.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", lineHeight: "1.5" },
        progressStyle: { background: "linear-gradient(90deg, #014d88, #0168b3)" },
      });
      setPendingHivPositiveToast(false);
    }
  }, [pendingHivPositiveToast, canProceedWithEnrollment, showEnrollmentConfirmation]);

  // BATCH API
  const GET_CODESETS = () => {
    GET_CODESETS_IN_BATCH(
      "ENROLLMENT_SETTING",
      "COMMUNITY_PMTCT",
      "SEX",
      "PREGANACY_STATUS",
      "SOURCE_REFERRAL_PMTCT"
    ).then((response) => {
      setANCSetting(response.data.ENROLLMENT_SETTING);
      setCommunitySetting(response.data.COMMUNITY_PMTCT);
      getSex(response.data.SEX);
      setPregnancyStatus(response.data.PREGANACY_STATUS);
      setGenders(response.data.SEX);
      setSourceOfReferral(response.data.SOURCE_REFERRAL_PMTCT);
    });
  };

  const createCycle = async () => {
    let payload = {
      patientUuid: patientObj.patientUuid ? patientObj.patientUuid : patientObj?.uuid,
      maternalOutcome: "",
      entryPoint: locationState.entrypointValue,
      hivStatus: objValues.staticHivStatus,
      pregnancyOutcome: "",
      numberOfInfants: 0,
      pmtctStatus: "INACTIVE",
      source: "WEB",
    };

    try {

     const response = await axios.post(
       `${baseUrl}pmtct/anc/pregnancy-cycle`,
       payload,
       {
         headers: { Authorization: `Bearer ${token}` },
       }
     );
      if (response?.data) {
        setPmtctCycleCreated(response.data);
        return {
          status: true,
          response: response.data,
        };
      } else {
        toast.error("Failed to create new PMTCT cycle: no data returned");
        return {
          status: false,
          response: null,
        };      
     }

    } catch (e) {
      console.log(e)
      toast.error(
        `${e?.response?.status}: New pmtct cycle not created: ${e?.response?.data}`
      );
        return {
          status: false,
          response: null,
        }; 
    }
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
  //Calculate Date of birth
  const calculate_age = (dob) => {
    var today = new Date();
    var dateParts = dob.split("-");
    var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
    var age_now = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age_now--;
    }
    if (age_now === 0) {
      return m + " month(s)";
    }
    return age_now;
  };

  //   handle routing

  const handleRoute = (data, options) => {
    history.push({
      pathname: "/patient-history",
      state: {
        patientObj: data,
        postValue: "L&D",
        entrypointValue: locationState.entrypointValue,
        ...(options || {}),
      },
    });
  };
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
    temp.gaweeks = objValues.gaweeks ? "" : "This field is required";
    temp.gravida = objValues.gravida ? "" : "This field is required";
    temp.lmp = objValues.lmp ? "" : "This field is required";
    temp.parity = objValues.parity !== "" ? "" : "This field is required";
    temp.testedSyphilis = objValues.testedSyphilis
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
    temp.ancNo = objValues.ancNo ? "" : "This field is required";

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x === "");
  };
  //Handle Input Change for Basic Infor
  const handleInputChangeBasic = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
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
    if (
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
        toast.error("Please select a valid date");
        setObjValues({ ...objValues, [e.target.name]: "" });
      }
    }

    //Check for lmp and make an API call
    if (e.target.name === "lmp" && e.target.value !== "") {
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
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
      }
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

    // Check if enrollment is allowed
    if (!canProceedWithEnrollment) {
      toast.error("Enrollment not allowed. Please confirm enrollment first.");
      return;
    }

    setSaving(true);

    if (validate()) {
      try {
        // Wait for createCycle() to complete
        const checkIfCycleIsCreated = await createCycle();

        if (checkIfCycleIsCreated?.status) {
          objValues.entryPoint = locationState.entrypointValue;
          objValues.patient_uuid = patientObj.patientUuid || patientObj?.uuid;
          objValues.pmtctCycleUuid = checkIfCycleIsCreated?.response?.uuid;
          objValues.source = "WEB";
          let url = "";
          if (locationState.showANC) {
            // ANC ENTRY POINT
            url = `${baseUrl}pmtct/anc/anc-enrollement`;
          } else {
            // LD OR POSTPARTUM ENTRY POINT
            url = `${baseUrl}pmtct/anc/pmtct-enrollment`;
          }

          const response = await axios.post(url, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          });

          toast.success("Patient registered successfully");

          history.push({
            pathname: "/patient-history",
            state: {
              patientObj: {
                ...response.data,
                pmtctCycleUuid: checkIfCycleIsCreated?.response?.uuid,
              },
              postValue: locationState.postValue,
              entrypointValue: locationState.entrypointValue,
            },
          });
        } else {
          toast.error("Failed to create PMTCT cycle.");
        }
      } catch (error) {
       setSaving(false);

       console.error("Error response:", error.response);

       //  More robust error extraction
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
      } finally {
        setSaving(false);
      }
    } else {
      setSaving(false);
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
      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        style={{ fontSize: "0.9rem" }}
      />

      {/* Enrollment Confirmation Modal */}
      <Modal
        show={showEnrollmentConfirmation}
        onHide={() => {}}
        backdrop="static"
        centered
        size="md"
      >
        <Modal.Header style={{ background: "linear-gradient(135deg, #014d88 0%, #0168b3 100%)", color: "#fff", borderBottom: "none", borderRadius: "0.3rem 0.3rem 0 0", padding: "16px 24px" }}>
          <Modal.Title style={{ fontSize: "1.05rem", fontWeight: "600", display: "flex", alignItems: "center", color: "#fff" }}>
            <HelpOutlineIcon style={{ marginRight: "10px", fontSize: "22px", color: "#fff" }} />
            Confirm Enrollment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px 28px", backgroundColor: "rgb(248, 249, 250)" }}>
          <p style={{ fontSize: "0.95rem", color: "#2d3748", margin: 0, lineHeight: "1.6" }}>{enrollmentValidation?.message}</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e2e8f0", padding: "14px 24px", backgroundColor: "#fff" }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowEnrollmentConfirmation(false);
              setCanProceedWithEnrollment(false);
              history.push("/");
            }}
            style={{ backgroundColor: "#e53e3e", color: "#fff", fontWeight: "600", borderRadius: "0.3rem", padding: "6px 20px", textTransform: "capitalize", marginRight: "10px" }}
          >
            No
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowEnrollmentConfirmation(false);
              setCanProceedWithEnrollment(true);
            }}
            style={{ background: "linear-gradient(135deg, #014d88 0%, #0168b3 100%)", color: "#fff", fontWeight: "600", borderRadius: "0.3rem", padding: "6px 20px", textTransform: "capitalize" }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className={classes.root}>
        <CardContent>
          <Link
            to={{
              pathname: "/",
              state: "users",
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
                Back
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
                              basicInfo?.fullname
                                ? basicInfo?.fullname
                                : `${basicInfo.firstName} ${basicInfo.lastName}`
                            }
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "none",
                              backgroundColor: "transparent",
                              outline: "none",
                            }}
                            //disabled
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
                            value={basicInfo.sexId}
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
              {locationState.showANC ? (
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
                              <Label>ANC No <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="text" name="ancNo" id="ancNo" onChange={handleInputChange} value={objValues.ancNo} />
                              </InputGroup>
                              {errors.ancNo !== "" ? (<span className={classes.error}>{errors.ancNo}</span>) : ""}
                              {ancNumberCheck === true ? (<span className={classes.error}>{"ANC number already exist"}</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Date of Enrollment <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="dateOfEnrollment" id="dateOfEnrollment" onChange={handleInputChange} value={objValues.dateOfEnrollment} min={minAncDates.minDateOfEnrollment ? minAncDates.minDateOfEnrollment : patientObj.dateOfRegistration} max={moment(new Date()).format("YYYY-MM-DD")} />
                              </InputGroup>
                              {errors.dateOfEnrollment !== "" ? (<span className={classes.error}>{errors.dateOfEnrollment}</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>ANC Attendance</Label>
                              <InputGroup>
                                <Input type="select" name="ancAttendance" id="ancAttendance" onChange={handleInputChange} value={objValues.ancAttendance} disabled={true}>
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
                                <Input type="select" name="referredFromSpokesSite" id="referredFromSpokesSite" onChange={handleInputChange} value={objValues.referredFromSpokesSite}>
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
                                <Input type="number" name="parity" id="parity" onChange={handleInputChange} value={objValues.parity} min={0} />
                              </InputGroup>
                              {errors.parity !== "" ? (<span className={classes.error}>{errors.parity}</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Gravida <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="number" name="gravida" id="gravida" onChange={handleInputChange} value={objValues.gravida} min="1" />
                              </InputGroup>
                              {errors.gravida !== "" ? (<span className={classes.error}>{errors.gravida}</span>) : ""}
                              {objValues.gravida < objValues.parity ? (<span className={classes.error}>Gravida should not be less Parity</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Date Of Last Menstrual Period <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="lmp" id="lmp" onChange={handleInputChange} value={objValues.lmp} min={minAncDates.minLmp ? minAncDates.minLmp : undefined} max={objValues.dateOfEnrollment ? objValues.dateOfEnrollment : moment(new Date()).format("YYYY-MM-DD")} />
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
                                <Input type="number" name="weight" id="weight" onChange={handleInputChange} value={objValues.weight} step="0.1" min="30" max="150" />
                              </InputGroup>
                              {objValues.weight && (objValues.weight < 30 || objValues.weight > 150) ? (<span className={classes.error}>Body weight must not be greater than 150 and less than 30</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Height (cm)</Label>
                              <InputGroup>
                                <Input type="number" name="height" id="height" onChange={handleInputChange} value={objValues.height} step="0.1" min="48" max="216" />
                              </InputGroup>
                              {objValues.height && (objValues.height < 48 || objValues.height > 216) ? (<span className={classes.error}>Height must be between 48 and 216 cm</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Blood Pressure (Systolic)</Label>
                              <InputGroup>
                                <Input type="number" name="systolic" id="systolic" onChange={handleInputChange} value={objValues.systolic} min="90" max="240" />
                              </InputGroup>
                              {objValues.systolic && (objValues.systolic < 90 || objValues.systolic > 240) ? (<span className={classes.error}>Systolic BP must be between 90 and 240</span>) : ""}
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Blood Pressure (Diastolic)</Label>
                              <InputGroup>
                                <Input type="number" name="diastolic" id="diastolic" onChange={handleInputChange} value={objValues.diastolic} min="60" max="140" />
                              </InputGroup>
                              {objValues.diastolic && (objValues.diastolic < 60 || objValues.diastolic > 140) ? (<span className={classes.error}>Diastolic BP must be between 60 and 140</span>) : ""}
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
                                <Input type="select" name="counsellingHts" id="counsellingHts" onChange={handleInputChange} value={objValues.counsellingHts}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Female Genital Mutilation (FGM) <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="counsellingFgm" id="counsellingFgm" onChange={handleInputChange} value={objValues.counsellingFgm}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Family Planning <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="counsellingFp" id="counsellingFp" onChange={handleInputChange} value={objValues.counsellingFp}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Maternal Nutrition <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="counsellingMaternalNutrition" id="counsellingMaternalNutrition" onChange={handleInputChange} value={objValues.counsellingMaternalNutrition}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Early Initiation of Breastfeeding <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="counsellingEarlyBf" id="counsellingEarlyBf" onChange={handleInputChange} value={objValues.counsellingEarlyBf}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Exclusive Breastfeeding <span style={{ color: "red" }}> *</span></Label>
                              <InputGroup>
                                <Input type="select" name="counsellingExclusiveBf" id="counsellingExclusiveBf" onChange={handleInputChange} value={objValues.counsellingExclusiveBf}>
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
                                <Input type="select" name="testedSyphilis" id="testedSyphilis" onChange={handleInputChange} value={objValues.testedSyphilis}>
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
                                    <Input type="select" name="testResultSyphilis" id="testResultSyphilis" onChange={handleInputChange} value={objValues.testResultSyphilis}>
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
                                      <Label>Treated for Syphilis <span style={{ color: "red" }}> *</span></Label>
                                      <InputGroup>
                                        <Input type="select" name="treatedSyphilis" id="treatedSyphilis" onChange={handleInputChange} value={objValues.treatedSyphilis}>
                                          <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
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
                                <Input type="select" name="testedHepatitisB" id="testedHepatitisB" onChange={handleInputChange} value={objValues.testedHepatitisB}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          {objValues.testedHepatitisB === "Yes" && (
                            <>
                              <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                  <Label>Hepatitis B Test Result</Label>
                                  <InputGroup>
                                    <Input type="select" name="hepatitisB" id="hepatitisB" onChange={handleInputChange} value={objValues.hepatitisB}>
                                      <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                                    </Input>
                                  </InputGroup>
                                </FormGroup>
                              </div>
                              {objValues.hepatitisB === "Positive" && (
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Referred Hepatitis B +ve Client</Label>
                                    <InputGroup>
                                      <Input type="select" name="referredHepatitisB" id="referredHepatitisB" onChange={handleInputChange} value={objValues.referredHepatitisB}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                  </FormGroup>
                                </div>
                              )}
                            </>
                          )}
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Tested for Hepatitis C</Label>
                              <InputGroup>
                                <Input type="select" name="testedHepatitisC" id="testedHepatitisC" onChange={handleInputChange} value={objValues.testedHepatitisC}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          {objValues.testedHepatitisC === "Yes" && (
                            <>
                              <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                  <Label>Hepatitis C Test Result</Label>
                                  <InputGroup>
                                    <Input type="select" name="hepatitisC" id="hepatitisC" onChange={handleInputChange} value={objValues.hepatitisC}>
                                      <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                                    </Input>
                                  </InputGroup>
                                </FormGroup>
                              </div>
                              {objValues.hepatitisC === "Positive" && (
                                <div className="form-group mb-3 col-md-4">
                                  <FormGroup>
                                    <Label>Referred Hepatitis C +ve Client</Label>
                                    <InputGroup>
                                      <Input type="select" name="referredHepatitisC" id="referredHepatitisC" onChange={handleInputChange} value={objValues.referredHepatitisC}>
                                        <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                      </Input>
                                    </InputGroup>
                                  </FormGroup>
                                </div>
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
                                <Input type="number" name="hbPcv" id="hbPcv" onChange={handleInputChange} value={objValues.hbPcv} min="0" />
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>PCV (%)</Label>
                              <InputGroup>
                                <Input type="number" name="pcv" id="pcv" onChange={handleInputChange} value={objValues.pcv} min="0" max="100" />
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Blood Sugar (Gestational Diabetes)</Label>
                              <InputGroup>
                                <Input type="number" name="bloodSugarGdm" id="bloodSugarGdm" onChange={handleInputChange} value={objValues.bloodSugarGdm} min="0" />
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Urinalysis - Sugar</Label>
                              <InputGroup>
                                <Input type="select" name="urinalysisSugar" id="urinalysisSugar" onChange={handleInputChange} value={objValues.urinalysisSugar}>
                                  <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Urinalysis - Proteins</Label>
                              <InputGroup>
                                <Input type="select" name="urinalysisProteins" id="urinalysisProteins" onChange={handleInputChange} value={objValues.urinalysisProteins}>
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
                                <Input type="select" name="llinGiven" id="llinGiven" onChange={handleInputChange} value={objValues.llinGiven}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Dose of IPT Given</Label>
                              <InputGroup>
                                <Input type="select" name="iptDose" id="iptDose" onChange={handleInputChange} value={objValues.iptDose}>
                                  <option value="">Select</option><option value="IPT1">IPT 1</option><option value="IPT2">IPT 2</option><option value="IPT3">IPT 3</option><option value="IPT4">IPT 4</option><option value="None">None</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Hematinics Given (Iron & Folic Acid)?</Label>
                              <InputGroup>
                                <Input type="select" name="hematinicsGiven" id="hematinicsGiven" onChange={handleInputChange} value={objValues.hematinicsGiven}>
                                  <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                </Input>
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>TD Immunization</Label>
                              <InputGroup>
                                <Input type="select" name="tdImmunization" id="tdImmunization" onChange={handleInputChange} value={objValues.tdImmunization}>
                                  <option value="">Select</option><option value="Td1">Td1</option><option value="Td2">Td2</option><option value="Td3">Td3</option><option value="Td4">Td4</option><option value="Td5">Td5</option><option value="None">None</option>
                                </Input>
                              </InputGroup>
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
                                <Input type="textarea" name="associatedProblems" id="associatedProblems" onChange={handleInputChange} value={objValues.associatedProblems} style={{ height: "41px" }} />
                              </InputGroup>
                            </FormGroup>
                          </div>
                          <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                              <Label>Outcome of Visit</Label>
                              <InputGroup>
                                <Input type="select" name="outcomeOfVisit" id="outcomeOfVisit" onChange={handleInputChange} value={objValues.outcomeOfVisit}>
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
                                    <Input type="text" name="referralReason" id="referralReason" onChange={handleInputChange} value={objValues.referralReason} />
                                  </InputGroup>
                                </FormGroup>
                              </div>
                              <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                  <Label>Transportation Out</Label>
                                  <InputGroup>
                                    <Input type="select" name="transportationOut" id="transportationOut" onChange={handleInputChange} value={objValues.transportationOut}>
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
              ) :(
                <>
                  {/* lastPmtctHtsRecord?.finalResult === "Positive" */}
                  {patientObj.dynamicHivStatus === "Positive" ||
                  lastPmtctHtsRecord?.finalResult === "Positive" ? (
                    <PmtctEnrollment
                      newRegDate={""}
                      patientObj={patientObj}
                      setActiveContent={setActiveContent}
                      activeContent={activeContent}
                      hideUpdateButton={true}
                      entrypointValue={locationState.entrypointValue}
                      ancEntryType={patientObj.ancNo ? true : false}
                      handleRoute={handleRoute}
                      onEnrollPatient={true}
                      htsHivStatus={lastPmtctHtsRecord?.finalResult}
                      hasPmtctHtsRecord={
                        lastPmtctHtsRecord?.finalResult ? true : false
                      }
                      showLastHivTestMessage={
                        lastPmtctHtsRecord?.finalResult === "Positive"
                          ? true
                          : false
                      }
                      lastestConfirmatoryTest={lastPmtctHtsRecord?.finalResult}
                      canProceedWithEnrollment={canProceedWithEnrollment}
                      latestPmtctCycle={latestPmtctCycle}
                    />
                  ) : locationState.entrypointValue === "PMTCT_ENTRY_POINT_L&D" ? (
                    <LabourDelivery
                      patientObj={patientObj}
                      setActiveContent={setActiveContent}
                      activeContent={activeContent}
                      latestPmtctCycle={latestPmtctCycle}
                      handleRoute={handleRoute}
                      onEnrollPatient={true}
                      entrypointValue={locationState.entrypointValue}
                    />
                  ) : (
                    <PmtctHtsForm
                      patientObj={patientObj}
                      setActiveContent={setActiveContent}
                      activeContent={activeContent}
                      PmtctHtsRetestingType={"pmtct-hts"}
                      handleRoute={handleRoute}
                      onEnrollPatient={true}
                      entrypointValue={locationState.entrypointValue}
                      patientAge={basicInfo.age}
                      patientUuid={patientObj.uuid}
                      hasPmtctHtsRecord={
                        lastPmtctHtsRecord?.finalResult ? true : false
                      }
                      latestPmtctCycle={latestPmtctCycle}
                    />
                  )}
                </>
              )}
              {/* END OF HIV ENROLLEMENT FORM */}
              {saving ? <Spinner /> : ""}

              <br />

              {locationState.showANC && (
                <>
                  {objValues.gaweeks > 0 &&
                    ancNumberCheck !== true &&
                    objValues.gravida >= objValues.parity && (
                      <MatButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        startIcon={<SaveIcon />}
                        hidden={ancNumberCheck}
                        disabled={disabledAgeBaseOnAge}
                        onClick={handleSubmit}
                      >
                        {!saving ? (
                          <span style={{ textTransform: "capitalize" }}>
                            Save
                          </span>
                        ) : (
                          <span style={{ textTransform: "capitalize" }}>
                            Saving...
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
                    <span
                      style={{ textTransform: "capitalize", color: "#fff" }}
                    >
                      Cancel
                    </span>
                  </MatButton>
                </>
              )}
            </Form>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UserRegistration;
