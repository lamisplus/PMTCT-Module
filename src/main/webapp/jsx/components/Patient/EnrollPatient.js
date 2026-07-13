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
import AssignmentIcon from "@material-ui/icons/Assignment";
import PeopleIcon from "@material-ui/icons/People";
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
import { GET_CODESETS_IN_BATCH } from "../../../utils";
import AncFormFields from "../PmtctServices/AncFormFields";
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
  
  const [skipHtsForm, setSkipHtsForm] = useState(false);
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
  const objValuesRef = useRef(objValues);
  useEffect(() => { objValuesRef.current = objValues; }, [objValues]);
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

 const checkSkipHtsForm = async (patientUuid) => {
    if (!patientUuid) return;
    try {
      const [htsPositiveRes, onArtRes] = await Promise.all([
        axios.get(`${baseUrl}pmtct/anc/check/hts-positive/${patientUuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}pmtct/anc/check/on-art/${patientUuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSkipHtsForm(htsPositiveRes.data === true || onArtRes.data === true);
    } catch (error) {
      console.log("Error checking HTS-positive / on-ART status:", error);
      // On failure, fall back to the default flow (show the HTS form)
      setSkipHtsForm(false);
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
      checkSkipHtsForm(patientObj?.uuid);

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
      "PREGNANCY_STATUS",
      "SOURCE_REFERRAL_PMTCT"
    ).then((response) => {
      setANCSetting(response.data.ENROLLMENT_SETTING);
      setCommunitySetting(response.data.COMMUNITY_PMTCT);
      getSex(response.data.SEX);
      setPregnancyStatus(response.data.PREGNANCY_STATUS);
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
    temp.ancNo = objValues.ancNo ? "" : "This field is required";

    // Counselling mandatory validation
    if (!objValues.counsellingHts) temp.counsellingHts = "HIV Testing Services is required";

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
    return Object.values(temp).every((x) => x === "" || x === undefined);
  };
  //Handle Input Change for Basic Infor
  const handleInputChangeBasic = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const checkAncNumber = async (ancNo) => {
    try {
      const response = await axios.post(
        `${baseUrl}pmtct/anc/exist/anc-number?ancNo=${ancNo}`,
        { ancNo },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" } }
      );
      if (response.data === true) {
        toast.error("ANC number already exist");
        setAncNumberCheck(true);
      } else {
        setAncNumberCheck(false);
      }
    } catch (e) {}
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
          const current = objValuesRef.current;
          const payload = {
            ancNo: current.ancNo,
            ancAttendance: current.ancAttendance,
            referredFromSpokesSite: current.referredFromSpokesSite,
            dateOfEnrollment: current.dateOfEnrollment,
            gravida: current.gravida,
            parity: current.parity,
            lmp: current.lmp,
            gaweeks: current.gaweeks,
            labTest: {
              hbPcv: current.hbPcv,
              pcv: current.pcv,
              bloodSugarGdm: current.bloodSugarGdm,
            },
            interventions: {
              llinGiven: current.llinGiven,
              iptDose: current.iptDose,
              hematinicsGiven: current.hematinicsGiven,
              tdImmunization: current.tdImmunization,
              associatedProblems: current.associatedProblems,
            },
            outcomeOfVisit: current.outcomeOfVisit,
            referralReason: current.referralReason,
            transportationOut: current.transportationOut,
            // Nested objects matching backend DTOs
            vitalSigns: {
              weight: current.weight ? parseFloat(current.weight) : null,
              height: current.height ? parseFloat(current.height) : null,
              systolic: current.systolic ? parseFloat(current.systolic) : null,
              diastolic: current.diastolic ? parseFloat(current.diastolic) : null,
            },
            counselling: {
              hts: current.counsellingHts,
              fgm: current.counsellingFgm,
              fp: current.counsellingFp,
              maternalNutrition: current.counsellingMaternalNutrition,
              earlyBf: current.counsellingEarlyBf,
              exclusiveBf: current.counsellingExclusiveBf,
            },
            syphilisInfo: {
              testedSyphilis: current.testedSyphilis,
              testResultSyphilis: current.testResultSyphilis,
              treatedSyphilis: current.treatedSyphilis,
              referredSyphilisTreatment: current.referredSyphilisTreatment,
            },
            hepatitisBInfo: {
              testedHepatitisB: current.testedHepatitisB,
              dateOfHepatitisB: current.dateOfHepatitisB,
              hepatitisB: current.hepatitisB,
              treatedHepatitisB: current.treatedHepatitisB,
              referredHepatitisB: current.referredHepatitisB,
            },
            hepatitisCInfo: {
              testedHepatitisC: current.testedHepatitisC,
              dateOfHepatitisC: current.dateOfHepatitisC,
              hepatitisC: current.hepatitisC,
              treatedHepatitisC: current.treatedHepatitisC,
              referredHepatitisC: current.referredHepatitisC,
            },
            urinalysis: {
              sugar: current.urinalysisSugar,
              proteins: current.urinalysisProteins,
            },
            entryPoint: locationState.entrypointValue,
            patient_uuid: patientObj.patientUuid || patientObj?.uuid,
            pmtctCycleUuid: checkIfCycleIsCreated?.response?.uuid,
            source: "WEB",
          };
          let url = "";
          if (locationState.showANC) {
            // ANC ENTRY POINT
            url = `${baseUrl}pmtct/anc/anc-enrollement`;
          } else {
            // LD OR POSTPARTUM ENTRY POINT
            url = `${baseUrl}pmtct/anc/pmtct-enrollment`;
          }

          const response = await axios.post(url, payload, {
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
              autoOpenRoute: "pmtct-hts",
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

                    <AncFormFields
                      values={objValues}
                      errors={errors}
                      onChange={handleFieldChange}
                      showHivFields={false}
                      showAncSetting={false}
                      showFacilityField={false}
                      ancNoValidator={checkAncNumber}
                      minDates={minAncDates}
                    />
                    {ancNumberCheck === true ? (<span className={classes.error}>{"ANC number already exist"}</span>) : ""}

                  </div>
                </div>
              ) :(
                <>
                  {/* L&D entry: ALWAYS show Labour & Delivery first, regardless of HIV status */}
                  {locationState.entrypointValue === "PMTCT_ENTRY_POINT_L&D" ? (
                    <LabourDelivery
                      patientObj={patientObj}
                      setActiveContent={setActiveContent}
                      activeContent={activeContent}
                      latestPmtctCycle={latestPmtctCycle}
                      handleRoute={handleRoute}
                      onEnrollPatient={true}
                      entrypointValue={locationState.entrypointValue}
                    />
                  ) : patientObj.dynamicHivStatus === "Positive" ||
                  lastPmtctHtsRecord?.finalResult === "Positive" ||
                  skipHtsForm ? (
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
                  {ancNumberCheck !== true && (
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
