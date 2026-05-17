import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";
import {
  Alert,
  FormGroup,
  Label,
  Spinner,
  Input,
  Form,
  InputGroup,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import AddIcon from "@material-ui/icons/Add";
import CancelIcon from "@material-ui/icons/Cancel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";
import { token, url as baseUrl } from "../../../api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./patient.css";
import { Modal } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
import { DateTimePicker } from "react-widgets";
import PmtctEnrollment from "../PmtctServices/PmtctEnrollment";
import { calculateGestationalAge } from "../../utils";
import FacilitySearchDropdown from "./FacilitySearchDropdown";

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
    "& > *": {
      margin: theme.spacing(1),
    },
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
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const UserRegistration = (props) => {
  const { state } = useLocation();

  const [basicInfo, setBasicInfo] = useState({
    active: true,
    address: "",
    contact: [],
    contactPoint: [],
    dateOfBirth: "",
    deceased: false,
    deceasedDateTime: null,
    hospitalNumber: "",
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
    countryId: 1,
    stateId: "",
    district: "",
    sexId: 377,
    ninNumber: "",
  });
  const [relatives, setRelatives] = useState({
    address: "",
    phone: "",
    firstName: "",
    email: "",
    relationshipId: "",
    lastName: "",
    middleName: "",
  });
  const [contacts, setContacts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [disabledAgeBaseOnAge, setDisabledAgeBaseOnAge] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(true);
  const [showRelative, setShowRelative] = useState(false);
  const [genders, setGenders] = useState([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [occupationOptions, setOccupationOptions] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [errors, setErrors] = useState({});
  const [topLevelUnitCountryOptions, settopLevelUnitCountryOptions] = useState(
    []
  );
  const [activeContent, setActiveContent] = useState({
    route: "recent-history",
    id: "",
    activeTab: "home",
    actionType: "",
    obj: {},
  });
  const [retrievedPatient, setRetrievedPatient] = useState({
    status: false,
  });

  const userDetail =
    props.location && props.location.state ? props.location.state.user : null;
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  //HIV INFORMATION
  const [femaleStatus, setfemaleStatus] = useState(false);
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
    hivDiognosicTime: "",
    referredSyphilisTreatment: "",
    testResultSyphilis: "",
    testedSyphilis: "",
    treatedSyphilis: "",
    personDto: {},
    pmtctHtsInfo: {},
    syphilisInfo: {},
    partnerNotification: {},
    staticHivStatus: patientObj?.dynamicHivStatus || "",
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
  });
  const [enroll, setEnrollDto] = useState({
    // ancNo: patientObj.ancNo,
    pmtctEnrollmentDate: "",
    entryPoint: "",
    // ga: props.patientObj.gaweeks,
    // gravida: props.patientObj.gravida,
    artStartDate: "",
    artStartTime: "",
    id: "",
    tbStatus: "",
    personDto: {},
  });
  const [carePoints, setCarePoints] = useState([]);
  const [sourceReferral, setSourceReferral] = useState([]);
  const [pregnancyStatus, setPregnancyStatus] = useState([]);
  //set ro show the facility name field if is transfer in
  const [ancNumberCheck, setAncNumberCheck] = useState(false);
  //status for hospital Number
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [PMTCTObj, setPMTCTObj] = useState({});
  const [ANCSetting, setANCSetting] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
  const [confirmHTSRecord, setConfirmHTSRecord] = useState({
    clientOnHTS: "",
    clientCode: "",
  });
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showRegistrationAnc, setShowRegistrationAnc] = useState(false);
  const [showRegistrationButton, setShowRegistrationButton] = useState(false);
  const [htsHivStatus, setHtsHivStatus] = useState("");

  const toggleConfirmation = () => setModalConfirmation(!modalConfirmation);

  const toggle = () => setModal(!modal);
  const locationState = location.state;
  let patientId = null;
  patientId = locationState ? locationState.patientId : null;

  let temp = { ...errors };

  useEffect(() => {
    getANCSetting();
    getCommunitySetting();
    loadGenders();
    loadMaritalStatus();
    loadEducation();
    loadOccupation();
    loadRelationships();
    loadTopLevelCountry();
    CareEntryPoint();
    // SourceReferral();
    PregnancyStatus();
    GetCountry();
    setStateByCountryId();
    if (basicInfo.dateOfRegistration < basicInfo.dob) {
      alert("Date of registration can not be earlier than date of birth");
    }
  }, [basicInfo.dateOfRegistration]);

  const loadGenders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/SEX`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGenders(response.data);
    } catch (e) {}
  }, []);
  const loadMaritalStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/MARITAL_STATUS`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaritalStatusOptions(response.data);
    } catch (e) {}
  }, []);
  const loadEducation = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/EDUCATION`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEducationOptions(response.data);
    } catch (e) {}
  }, []);
  const loadOccupation = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/OCCUPATION`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOccupationOptions(response.data);
    } catch (e) {}
  }, []);
  const loadRelationships = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/RELATIONSHIP`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRelationshipOptions(response.data);
    } catch (e) {}
  }, []);
  const loadTopLevelCountry = useCallback(async () => {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    settopLevelUnitCountryOptions(response.data);
  }, []);
  //Country List
  const GetCountry = () => {
    axios
      .get(`${baseUrl}organisation-units/parent-organisation-units/0`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {});
  };

  //Get list of State
  const setStateByCountryId = () => {
    axios
      .get(`${baseUrl}organisation-units/parent-organisation-units/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // console.log(response.data);
        setStates(response.data);
      })
      .catch((error) => {});
  };
  //fetch province
  const getProvinces = (e) => {
    const stateId = e.target.value;
    if (e.target.value) {
      setErrors({ ...errors, stateId: "" });
    }
    setBasicInfo({ ...basicInfo, stateId: e.target.value });
    axios
      .get(
        `${baseUrl}organisation-units/parent-organisation-units/${stateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setProvinces(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //get ANC setting
  const getANCSetting = (e) => {
    axios
      .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // console.log(response);
        setANCSetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //get Community setting
  const getCommunitySetting = (e) => {
    axios
      .get(`${baseUrl}application-codesets/v2/COMMUNITY_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // console.log(response);
        setCommunitySetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Date of Birth and Age handle
  const handleDobChange = (e) => {
    if (e.target.value) {
      setErrors({ ...errors, dob: "" });

      const today = new Date();
      const birthDate = new Date(e.target.value);
      let age_now = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age_now--;
      }
      basicInfo.age = age_now;
      //setBasicInfo({...basicInfo, age: age_now});
    } else {
      setBasicInfo({ ...basicInfo, age: "" });
    }
    setBasicInfo({ ...basicInfo, dob: e.target.value });
    if (basicInfo.age !== "" && basicInfo.age >= 60) {
      toggle();
    }
  };
  const handleDateOfBirthChange = (e) => {
    if (e.target.value == "Actual") {
      setAgeDisabled(true);
    } else if (e.target.value == "Estimated") {
      setAgeDisabled(false);
    }
  };
  const handleAgeChange = (e) => {
    if (!ageDisabled && e.target.value) {
      if (e.target.value !== "" && e.target.value >= 60) {
        toggle();
      }
      if (e.target.value <= 1) {
        setDisabledAgeBaseOnAge(true);
      } else {
        setDisabledAgeBaseOnAge(false);
      }
      const currentDate = new Date();
      currentDate.setDate(15);
      currentDate.setMonth(5);
      const estDob = moment(currentDate.toISOString());
      const dobNew = estDob.add(e.target.value * -1, "years");
      //setBasicInfo({...basicInfo, dob: moment(dobNew).format("YYYY-MM-DD")});
      basicInfo.dob = moment(dobNew).format("YYYY-MM-DD");
    }
    setBasicInfo({ ...basicInfo, age: Math.abs(e.target.value) });
  };
  //End of Date of Birth and Age handling
  //Handle Input Change for Basic Infor
  const handleInputChangeBasic = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //manupulate inpute fields base on gender/sex
    if (e.target.name === "sexId" && e.target.value === "377") {
      setfemaleStatus(true);
    } else if (e.target.name === "firstName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setBasicInfo({ ...basicInfo, [e.target.name]: name });
    } else if (e.target.name === "lastName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setBasicInfo({ ...basicInfo, [e.target.name]: name });
    } else if (e.target.name === "middleName" && e.target.value !== "") {
      const name = alphabetOnly(e.target.value);
      setBasicInfo({ ...basicInfo, [e.target.name]: name });
    } else if (e.target.name === "ninNumber" && e.target.value !== "") {
      const ninNumberValue = checkNINLimit(e.target.value);
      setBasicInfo({ ...basicInfo, [e.target.name]: ninNumberValue });
    } else if (e.target.name === "ancNo" && e.target.value !== "") {
      async function getAncNumber() {
        const ancNumber = e.target.value;
        const response = await axios.post(
          `${baseUrl}pmtct/anc/exist/anc-number?ancNo=${ancNumber}`,
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
    } else if (e.target.name === "hospitalNumber" && e.target.value !== "") {
      setBasicInfo({
        ...basicInfo,
        hospitalNumber: e.target.value,
      });
      async function getHosiptalNumber() {
        const hosiptalNumber = e.target.value;
        const response = await axios.post(
          `${baseUrl}patient/exist/hospital-number`,
          hosiptalNumber,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data !== true) {
          setHospitalNumStatus(false);
          errors.hospitalNumber = "";
        } else {
          errors.hospitalNumber = "";
          toast.error("Error! Hosiptal Number already exist");
          setHospitalNumStatus(true);
        }
      }
      getHosiptalNumber();
    } else {
      setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    }
  };
  //Function to show relatives
  const handleAddRelative = () => {
    setShowRelative(true);
  };
  //Function to cancel the relatives form
  const handleCancelSaveRelationship = () => {
    setShowRelative(false);
  };
  /*****  Validation  Relationship Input*/
  const validateRelatives = () => {
    let temp = { ...errors };
    temp.firstName = relatives.firstName ? "" : "First Name is required";
    temp.lastName = relatives.lastName ? "" : "Last Name  is required.";
    temp.phone = relatives.phone ? "" : "Phone Number  is required.";
    temp.relationshipId = relatives.relationshipId
      ? ""
      : "Relationship Type is required.";
    setErrors({ ...temp });
    return Object.values(temp).every((x) => x == "");
  };

  // GET PMTCT INPUT FROM THE PMTCT COMPONENT
  const getPMTCTInfo = (info) => {
    // console.log(info);
    setPMTCTObj(info);
    return info;
  };

  //Function to add relatives
  // const handleSaveRelationship = (e) => {
  //   if (validateRelatives()) {
  //     setContacts([...contacts, relatives]);
  //     setRelatives({
  //       address: "",
  //       phone: "",
  //       firstName: "",
  //       email: "",
  //       relationshipId: "",
  //       lastName: "",
  //       middleName: "",
  //     });
  //   }
  // };
  const handleConfirmation = (e) => {
    if (e.target.name === "clientOnHTS") {
      setConfirmHTSRecord({ ...confirmHTSRecord, clientOnHTS: e.target.value });

      if (e.target.value === "no") {
        toggleConfirmation();
      }
    }

    if (e.target.name === "clientCode") {
      setConfirmHTSRecord({ ...confirmHTSRecord, clientCode: e.target.value });
      //check if the client is on HTS
    }
  };
  const handleSubmitConfirmation = (e) => {
    let userCode = confirmHTSRecord.clientCode;
    e.preventDefault();
    if (confirmHTSRecord.clientCode.includes("&")) {
      // userCode = userCode.replace(/&/g, "%26");
      userCode = encodeURIComponent(userCode);
    }
    axios
      .get(`${baseUrl}pmtct/anc/is-on-hts?clientCode=${userCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data.status) {
          setRetrievedPatient(response.data);
          setHtsHivStatus(response.data.hivResult);
          if (response.data.testingSetting !== "") {
            if (
              response.data.testingSetting ===
                "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" ||
              response.data.testingSetting ===
                "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
              response.data.testingSetting ===
                "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
              response.data.testingSetting ===
                "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
              response.data.testingSetting ===
                "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
            ) {
              if (state.showANC) {
                setShowRegistrationAnc(true);
                setShowRegistrationButton(true);
                setShowRegistration(true);
                setObjValues({
                  ...objValues,
                  staticHivStatus: response.data.hivResult,
                });
              } else {
                if (
                  response.data.hivResult &&
                  response.data.hivResult.toLowerCase() === "positive"
                ) {
                  setShowRegistrationButton(true);
                  setShowRegistration(true);
                } else {
                  toast.error(
                    "User has negative HTS result, can't enroll user on PMTCT"
                  );
                }
              }
            } else if (
              response.data.testingSetting === "FACILITY_HTS_TEST_SETTING_ANC"
            ) {
              //if entry point is diff from ANC
              if (!state.showANC) {
                toast.error(
                  "Mismatch between the entry point selected for PMTCT and the setting recorded in HTS setting. Re-confirm the entry point"
                );
              } else {
                // if(response.data.hivResult && response.data.hivResult.toLowerCase() === "positive"){
                setShowRegistrationAnc(true);
                setShowRegistrationButton(true);
                setShowRegistration(true);
                setObjValues({
                  ...objValues,
                  staticHivStatus: response.data.hivResult,
                });

                // }else{

                //   toast.error("User has negative HTS result, can't enroll user on PMTCT")

                // }
              }
            } else if (
              response.data.testingSetting === "FACILITY_HTS_TEST_SETTING_L&D"
            ) {
              // state.postValue
              if (state.postValue === "L&D") {
                if (
                  response.data.hivResult &&
                  response.data.hivResult.toLowerCase() === "positive"
                ) {
                  setShowRegistrationButton(true);
                  setShowRegistration(true);
                } else {
                  toast.error(
                    "User has negative HTS result, can't enroll user on PMTCT"
                  );
                }
              } else {
                toast.error(
                  "Mismatch between the entry point selected for PMTCT and the setting recorded in HTS setting. Re-confirm the entry point"
                );
              }
            } else if (
              response.data.testingSetting ===
              "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING"
            ) {
              if (state.postValue === "Post-Partum") {
                if (
                  response.data.hivResult &&
                  response.data.hivResult.toLowerCase() === "positive"
                ) {
                  setShowRegistrationButton(true);
                  setShowRegistration(true);
                } else {
                  toast.error(
                    "User has negative HTS result, can't enroll user on PMTCT"
                  );
                }
              } else {
                toast.error(
                  "Mismatch between the entry point selected for PMTCT and the setting recorded in HTS setting. Re-confirm the entry point"
                );
              }
            } else if (
              response.data.testingSetting !==
                "FACILITY_HTS_TEST_SETTING_L&D" ||
              response.data.testingSetting !==
                "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING" ||
              response.data.testingSetting !==
                "FACILITY_HTS_TEST_SETTING_ANC" ||
              response.data.testingSetting !==
                "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY" ||
              response.data.testingSetting !==
                "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING" ||
              response.data.testingSetting !==
                "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES" ||
              response.data.testingSetting !==
                "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX" ||
              response.data.testingSetting !==
                "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
            ) {
              // setShowRegistrationButton(true)
              // setShowRegistration(true)
              // setShowRegistrationAnc(true)

              toast.error("User has HTS record but it is not PMTCT setting !");
            }

            // if(response.data.testingSetting === "FACILITY_HTS_TEST_SETTING_L&D" || response.data.testingSetting ===  "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING" || response.data.testingSetting === "FACILITY_HTS_TEST_SETTING_ANC"){
            //   setShowRegistrationButton(true)
            // }
          }
        } else {
          let resp = response.data.message;
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error("User does not have HTS record !");
      });
  };

  const handleDeleteRelative = (index) => {
    contacts.splice(index, 1);
    setContacts([...contacts]);
  };

  const handleEditRelative = (relative, index) => {
    setRelatives(relative);
    setShowRelative(true);
    contacts.splice(index, 1);
  };
  const getRelationship = (relationshipId) => {
    const relationship = relationshipOptions.find(
      (obj) => obj.id === relationshipId
    );
    return relationship ? relationship.display : "";
  };
  const handleInputChangeRelatives = (e) => {
    setRelatives({ ...relatives, [e.target.name]: e.target.value });
  };
  const handleInputChangeANC = (e) => {
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
          toast.error("ANC number already exist", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          setAncNumberCheck(response.data);
        } else {
          setAncNumberCheck(false);
        }
      }
      getAncNumber();
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
        hepatitisB: "",
      });
    } else if (e.target.name === "hepatitisB") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        referredHepatitisB: "",
      });
    } else if (e.target.name === "testedHepatitisC") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        hepatitisC: "",
      });
    } else if (e.target.name === "hepatitisC") {
      setObjValues({
        ...objValues,
        [e.target.name]: e.target.value,
        referredHepatitisC: "",
      });
    } else {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
  };
  /*****  Validation  */
  const validate = () => {
    // ANC FORM VALIDATION
    if (state.showANC) {
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
          // temp.staticHivStatus = objValues.staticHivStatus
    //   ? ""
    //   : "This field is required";
      temp.ancNo = objValues.ancNo ? "" : "This field is required";
    }

    setErrors({ ...temp });

    return Object.values(temp).every((x) => x == "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      // basicInfo.age > 4
      if (true) {
        setSaving(true);
        let newConatctsInfo = [];
        //Manipulate relatives contact  address:"",
        const actualcontacts =
          contacts &&
          contacts.length > 0 &&
          contacts.map((x) => {
            const contactInfo = {
              address: {
                line: [x.address],
              },
              contactPoint: {
                type: "phone",
                value: x.phone,
              },
              firstName: x.firstName,
              fullName: x.firstName + " " + x.middleName + " " + x.lastName,
              relationshipId: x.relationshipId,
              surname: x.lastName,
              otherName: x.middleName,
            };

            newConatctsInfo.push(contactInfo);
          });

        // ANC ENTRY POINT
        if (state.showANC) {
          try {
            // const patientForm = {
            //   active: true,
            //   address: [
            //     {
            //       city: basicInfo.address,
            //       countryId: basicInfo.countryId,
            //       district: basicInfo.district,
            //       line: [basicInfo.landmark],
            //       organisationUnitId: 0,
            //       postalCode: "",
            //       stateId: basicInfo.stateId,
            //     },
            //   ],
            //   contact: newConatctsInfo,
            //   contactPoint: [],
            //   dateOfBirth: basicInfo.dob,
            //   deceased: false,
            //   deceasedDateTime: null,
            //   firstName: basicInfo.firstName,
            //   genderId: basicInfo.sexId,
            //   sexId: basicInfo.sexId,
            //   identifier: [
            //     {
            //       assignerId: 1,
            //       type: "HospitalNumber",
            //       value: basicInfo.hospitalNumber,
            //     },
            //   ],
            //   otherName: basicInfo.middleName,
            //   maritalStatusId: basicInfo.maritalStatusId,
            //   surname: basicInfo.lastName,
            //   educationId: basicInfo.educationId,
            //   employmentStatusId: basicInfo.employmentStatusId,
            //   dateOfRegistration: basicInfo.dateOfRegistration,
            //   isDateOfBirthEstimated:
            //     basicInfo.dateOfBirth == "Actual" ? false : true,
            //   ninNumber: basicInfo.ninNumber,
            // };
            // const phone = {
            //   type: "phone",
            //   value: basicInfo.phoneNumber,
            // };
            // if (basicInfo.email) {
            //   const email = {
            //     type: "email",
            //     value: basicInfo.email,
            //   };
            //   patientForm.contactPoint.push(email);
            // }
            // if (basicInfo.altPhonenumber) {
            //   const altPhonenumber = {
            //     type: "altphone",
            //     value: basicInfo.altPhonenumber,
            //   };
            //   patientForm.contactPoint.push(altPhonenumber);
            // }
            // patientForm.contactPoint.push(phone);
            // patientForm.id = patientId;
            // objValues.personDto = patientForm;
            // //patientDTO.personDto=objValues;
            // console.log(objValues);

            //
            objValues.patient_uuid = retrievedPatient.patientUuid;
            objValues.source = "WEB";

            const response = await axios.post(
              `${baseUrl}pmtct/anc/anc-enrollement`,
              objValues,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Patient Register successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            //
            history.push({
              pathname: "/patient-history",
              state: {
                patientObj: response.data,
                postValue: locationState.postValue,
                entrypointValue: locationState.entrypointValue,
              },
            });
            // history.push("/");
            setSaving(false);
          } catch (error) {
            setSaving(false);
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
        } else {
          // NOT ANC ENTRY POINT

          // console.log("here");
          try {
            // const patientForm = {
            //   active: true,
            //   address: [
            //     {
            //       city: basicInfo.address,
            //       countryId: basicInfo.countryId,
            //       district: basicInfo.district,
            //       line: [basicInfo.landmark],
            //       organisationUnitId: 0,
            //       postalCode: "",
            //       stateId: basicInfo.stateId,
            //     },
            //   ],
            //   contact: newConatctsInfo,
            //   contactPoint: [],
            //   dateOfBirth: basicInfo.dob,
            //   deceased: false,
            //   deceasedDateTime: null,
            //   firstName: basicInfo.firstName,
            //   genderId: basicInfo.sexId,
            //   sexId: basicInfo.sexId,
            //   identifier: [
            //     {
            //       assignerId: 1,
            //       type: "HospitalNumber",
            //       value: basicInfo.hospitalNumber,
            //     },
            //   ],
            //   otherName: basicInfo.middleName,
            //   maritalStatusId: basicInfo.maritalStatusId,
            //   surname: basicInfo.lastName,
            //   educationId: basicInfo.educationId,
            //   employmentStatusId: basicInfo.employmentStatusId,
            //   dateOfRegistration: basicInfo.dateOfRegistration,
            //   isDateOfBirthEstimated:
            //     basicInfo.dateOfBirth == "Actual" ? false : true,
            //   ninNumber: basicInfo.ninNumber,
            // };
            // const phone = {
            //   type: "phone",
            //   value: basicInfo.phoneNumber,
            // };
            // if (basicInfo.email) {
            //   const email = {
            //     type: "email",
            //     value: basicInfo.email,
            //   };
            //   patientForm.contactPoint.push(email);
            // }
            // if (basicInfo.altPhonenumber) {
            //   const altPhonenumber = {
            //     type: "altphone",
            //     value: basicInfo.altPhonenumber,
            //   };
            //   patientForm.contactPoint.push(altPhonenumber);
            // }
            // patientForm.contactPoint.push(phone);
            // patientForm.id = patientId;
            // enroll.personDto = patientForm;
            // enroll.entryPoint = locationState.entrypointValue;
            //patientDTO.personDto=objValues;
            //console.log(objValues)

            // let payload = {
            //   ...PMTCTObj,
            //   personDto: patientForm,
            //   entryPoint: locationState.entrypointValue,
            // };

            let payload = {
              ...PMTCTObj,
              entryPoint: locationState.entrypointValue
                ? locationState.entrypointValue
                : props.entrypointValue,
              patientUuid: retrievedPatient.patientUuid,
              source: "WEB",
            };
            const response = await axios.post(
              `${baseUrl}pmtct/anc/pmtct-enrollment`,
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Patient Register successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            history.push({
              pathname: "/patient-history",
              state: {
                patientObj: response.data,
                postValue: locationState.postValue,
                entrypointValue: locationState.entrypointValue,
              },
            });

            // history.push("/");
            setSaving(false);
          } catch (error) {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
              if (
                error?.response?.data?.apierror &&
                error?.response?.data?.apierror?.message !== "" &&
                error?.response?.data?.apierror &&
                error?.response?.data?.apierror?.subErrors[0]?.message !== ""
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
      }
    }
  };

  // end of submit
  const alphabetOnly = (value) => {
    const result = value.replace(/[^a-z]/gi, "");
    return result;
  };

  const CareEntryPoint = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/POINT_ENTRY`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setCarePoints(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  //Get list of Source of Referral
  const SourceReferral = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SOURCE_REFERRAL_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setSourceReferral(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
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
    setErrors({ ...temp, [e.target.name]: "" });
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
      //The field will  not accept less zero as a value
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
      objValues.treatedSyphilis = "";
      setObjValues({ ...objValues, ["testResultSyphilis"]: "" });
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
      setObjValues({ ...objValues, ["treatedSyphilis"]: "" });
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
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
    } else if (e.target.name === "lmp" && e.target.value !== "") {
      let response = calculateGestationalAge(
        objValues.dateOfEnrollment,
        e.target.value
      );

      if (response > 0) {
        objValues.gaweeks = response;
        setObjValues({ ...objValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, gaweeks: "" });
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
  const checkPhoneNumber = (e, inputName) => {
    const limit = 10;
    setRelatives({ ...relatives, [inputName]: e.slice(0, limit) });
  };
  const checkPhoneNumberBasic = (e, inputName) => {
    console.log(e, inputName);
    if (inputName === "phoneNumber") {
      if (e) {
        setErrors({ ...errors, phoneNumber: "" });
      }
      const limit = 10;
      setBasicInfo({ ...basicInfo, phoneNumber: e.slice(0, limit) });
    }
    if (inputName === "altPhonenumber") {
      const limit = 10;
      setBasicInfo({ ...basicInfo, altPhonenumber: e.slice(0, limit) });
    }
  };
  const checkNINLimit = (e) => {
    const limit = 11;
    const acceptedNumber = e.slice(0, limit);
    return acceptedNumber;
  };
  //Handle CheckBox
  // const handleCheckBox =e =>{
  //     if(e.target.checked){
  //         setOvcEnrolled(true)
  //     }else{
  //         setOvcEnrolled(false)
  //     }
  // }
  const handleCancel = () => {
    history.push({ pathname: "/" });
  };

  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar />
      <div style={{ padding: "10px 24px 6px", marginBottom: "4px" }}>
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Link to={"/"} style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
            PMTCT
          </Link>
          <span style={{ color: "#cbd5e1", fontSize: "11px" }}>/</span>
          <span style={{ color: "#0f172a", fontWeight: "600" }}>Patient Registration</span>
        </nav>
      </div>
      <Link
        to={{
          pathname: "/",
          state: "users",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          className=" float-end mr-10 pr-10"
          style={{
            backgroundColor: "#014d88",
            fontWeight: "bolder",
            margingRight: "-40px",
          }}
          startIcon={<TiArrowBack />}
        >
          <span style={{ textTransform: "capitalize", color: "#fff" }}>
            Back{" "}
          </span>
        </Button>
      </Link>
      <br />
      <br />

      <Card className={classes.root}>
        <CardContent>
          {/* form to confirm if the patient has HTS record  */}
          {showRegistration === false && (
            <div className="card">
              <div
                className="card-header"
                style={{
                  backgroundColor: "#014d88",
                  color: "#fff",
                  fontWeight: "bolder",
                  borderRadius: "0.2rem",
                }}
              >
                <h5 className="card-title" style={{ color: "#fff" }}>
                  User Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="form-group  col-md-4">
                    <FormGroup>
                      <Label>
                        Was Client tested at HTS ?{" "}
                        <span style={{ color: "red" }}> *</span>
                      </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="clientOnHTS"
                          id="clientOnHTS"
                          onChange={handleConfirmation}
                          value={confirmHTSRecord.clientOnHTS}
                        >
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>
                  {confirmHTSRecord.clientOnHTS === "yes" && (
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>HTS client code</Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="clientCode"
                            id="clientCode"
                            onChange={handleConfirmation}
                            value={confirmHTSRecord.clientCode}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  )}
                  {/* confirmHTSRecord.clientOnHTS === "no" */}
                </div>
                {confirmHTSRecord.clientOnHTS === "yes" && (
                  <div style={{ display: "flex", justifyContent: "right" }}>
                    {" "}
                    <MatButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      startIcon={<SaveIcon />}
                      onClick={handleSubmitConfirmation}
                      disabled={saving}
                      style={{
                        backgroundColor: "#014d88",
                        fontWeight: "bolder",
                      }}
                    >
                      Confirm
                    </MatButton>
                  </div>
                )}
              </div>
            </div>
          )}
          {/*Profile confirmation card  */}

          {showRegistration && (
            <div className="card">
              <div
                className="card-header"
                style={{
                  backgroundColor: "#014d88",
                  color: "#fff",
                  fontWeight: "bolder",
                  borderRadius: "0.2rem",
                }}
              >
                <h5 className="card-title" style={{ color: "#fff" }}>
                  User Information
                </h5>
              </div>
              <div className="card-body">
                <div className="basic-form" style={{ color: "#114d88" }}>
                  <div className="row">
                    <div className=" mb-3 col-md-4">
                      <div>
                        Name: <b>{retrievedPatient.fullname}</b>
                      </div>
                    </div>

                    <div className=" mb-3 col-md-4">
                      <div>
                        Hospital Number <b>{retrievedPatient.hospitalNumber}</b>
                      </div>
                    </div>
                    <div className=" mb-3 col-md-4">
                      <div>
                        Date of birth: <b>{retrievedPatient.dateOfBirth}</b>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className=" mb-3 col-md-4">
                      <div>
                        Hiv status: <b>{retrievedPatient.hivResult}</b>
                      </div>
                    </div>

                    <div className=" mb-3 col-md-4">
                      <div>
                        Gender: <b>{retrievedPatient.gender}</b>
                      </div>
                    </div>
                    <div className=" mb-3 col-md-4">
                      <div>
                        Pregnancy status: <b>Pregnant</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/*end od Profile confirmation card  */}
          <Form>
            {/* commenting the basic info */}
            {/* <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    {userDetail === null
                      ? "Basic Information"
                      : "Edit User Information"}
                  </h5>
                </div>

                <div className="card-body">
                  <div className="basic-form">
                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="dateOfRegistration">
                            Date of Registration{" "}
                            <span style={{ color: "red" }}> *</span>{" "}
                          </Label>
                          <Input
                            className="form-control"
                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                            name="dateOfRegistration"
                            id="dateOfRegistration"
                            min="1983-12-31"
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            value={basicInfo.dateOfRegistration}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.dateOfRegistration !== "" ? (
                            <span className={classes.error}>
                              {errors.dateOfRegistration}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="patientId">
                            Hospital Number{" "}
                            <span style={{ color: "red" }}> *</span>{" "}
                          </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="hospitalNumber"
                            id="hospitalNumber"
                            value={basicInfo.hospitalNumber}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.hospitalNumber !== "" ? (
                            <span className={classes.error}>
                              {errors.hospitalNumber}
                            </span>
                          ) : (
                            ""
                          )}
                          {hospitalNumStatus === true ? (
                            <span className={classes.error}>
                              {"Hospital number already exist"}
                            </span>
                          ) : (
                            ""
                          )}
                         
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="ninNumber">
                            National Identity Number (NIN){" "}
                          </Label>
                          <input
                            className="form-control"
                            type="number"
                            name="ninNumber"
                            value={basicInfo.ninNumber}
                            id="ninNumber"
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                      </div>

                      
                    </div>

                    <div className="row">
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label for="firstName">
                            First Names <span style={{ color: "red" }}> *</span>
                          </Label>
                          <Input
                            className="form-control"
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={basicInfo.firstName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
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

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Middle Name</Label>
                          <Input
                            className="form-control"
                            type="text"
                            name="middleName"
                            id="middleName"
                            value={basicInfo.middleName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            Last Name <span style={{ color: "red" }}> *</span>
                          </Label>
                          <input
                            className="form-control"
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={basicInfo.lastName}
                            onChange={handleInputChangeBasic}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                          {errors.lastName !== "" ? (
                            <span className={classes.error}>
                              {errors.lastName}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Sex <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="sexId"
                            id="sexId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.sexId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                            disabled
                          >
                            <option value={""}>Select</option>
                            {genders.map((gender, index) => (
                              <option key={gender.id} value={gender.id}>
                                {gender.display}
                              </option>
                            ))}
                          </select>
                          {errors.sexId !== "" ? (
                            <span className={classes.error}>
                              {errors.sexId}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                      <div className="form-group mb-2 col-md-2">
                        <FormGroup>
                          <Label>Date Of Birth</Label>
                          <div className="radio">
                            <label>
                              <input
                                type="radio"
                                value="Actual"
                                name="dateOfBirth"
                                defaultChecked
                                onChange={(e) => handleDateOfBirthChange(e)}
                                style={{
                                  border: "1px solid #014D88",
                                  borderRadius: "0.2rem",
                                }}
                              />{" "}
                              Actual
                            </label>
                          </div>
                          <div className="radio">
                            <label>
                              <input
                                type="radio"
                                value="Estimated"
                                name="dateOfBirth"
                                onChange={(e) => handleDateOfBirthChange(e)}
                                style={{
                                  border: "1px solid #014D88",
                                  borderRadius: "0.2rem",
                                }}
                              />{" "}
                              Estimated
                            </label>
                          </div>
                        </FormGroup>
                      </div>

                      <div className="form-group mb-3 col-md-2">
                        <FormGroup>
                          <Label>
                            Date <span style={{ color: "red" }}> *</span>
                          </Label>
                          <input
                            className="form-control"
                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                            name="dob"
                            min="1940-01-01"
                            id="dob"
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            value={basicInfo.dob}
                            onChange={handleDobChange}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                        {errors.dob !== "" ? (
                          <span className={classes.error}>{errors.dob}</span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Age</Label>
                          <input
                            type="number"
                            name="age"
                            className="form-control"
                            id="age"
                            min="5"
                            value={basicInfo.age}
                            disabled={ageDisabled}
                            onChange={handleAgeChange}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          />
                        </FormGroup>
                        <p>
                          <b style={{ color: "red" }}>
                            {basicInfo.age !== "" && basicInfo.age < 5
                              ? "Minimum age for PMTCT enrolment is 5 years"
                              : " "}{" "}
                          </b>
                        </p>
                      </div>
                    </div>

                    <div className={"row"}>
                 
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>Marital Status</Label>
                          <select
                            className="form-control"
                            name="maritalStatusId"
                            id="maritalStatusId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.maritalStatusId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value={""}>Select</option>
                            {maritalStatusOptions.map(
                              (maritalStatusOption, index) => (
                                <option
                                  key={maritalStatusOption.id}
                                  value={maritalStatusOption.id}
                                >
                                  {maritalStatusOption.display}
                                </option>
                              )
                            )}
                          </select>
                        </FormGroup>
                      </div>

                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Employment Status{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="employmentStatusId"
                            id="employmentStatusId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.employmentStatusId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value={""}>Select</option>
                            {occupationOptions.map(
                              (occupationOption, index) => (
                                <option
                                  key={occupationOption.id}
                                  value={occupationOption.id}
                                >
                                  {occupationOption.display}
                                </option>
                              )
                            )}
                          </select>
                          {errors.employmentStatusId !== "" ? (
                            <span className={classes.error}>
                              {errors.employmentStatusId}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                      <div className="form-group  col-md-4">
                        <FormGroup>
                          <Label>
                            Education Level{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <select
                            className="form-control"
                            name="educationId"
                            id="educationId"
                            onChange={handleInputChangeBasic}
                            value={basicInfo.educationId}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                            }}
                          >
                            <option value={""}>Select</option>
                            {educationOptions.map((educationOption, index) => (
                              <option
                                key={educationOption.id}
                                value={educationOption.id}
                              >
                                {educationOption.display}
                              </option>
                            ))}
                          </select>
                          {errors.educationId !== "" ? (
                            <span className={classes.error}>
                              {errors.educationId}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    Contact Details
                  </h5>
                </div>

                <div className="card-body">
                  <div className={"row"}>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Phone Number <span style={{ color: "red" }}> *</span>
                        </Label>
                        <PhoneInput
                          containerStyle={{
                            width: "100%",
                            border: "1px solid #014D88",
                          }}
                          inputStyle={{ width: "100%", borderRadius: "0px" }}
                          country={"ng"}
                          placeholder="(234)7099999999"
                          maxLength={5}
                          name="phoneNumber"
                          id="phoneNumber"
                          masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                          value={basicInfo.phoneNumber}
                          onChange={(e) => {
                            checkPhoneNumberBasic(e, "phoneNumber");
                          }}
                        />

                        {errors.phoneNumber !== "" ? (
                          <span className={classes.error}>
                            {errors.phoneNumber}
                          </span>
                        ) : (
                          ""
                        )}
                       
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label>Alt. Phone Number</Label>
                        <PhoneInput
                          containerStyle={{
                            width: "100%",
                            border: "1px solid #014D88",
                          }}
                          inputStyle={{ width: "100%", borderRadius: "0px" }}
                          country={"ng"}
                          placeholder="(234)7099999999"
                          value={basicInfo.altPhonenumber}
                          masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                          onChange={(e) => {
                            checkPhoneNumberBasic(e, "altPhonenumber");
                          }}
                        />
                       
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4">
                      <FormGroup>
                        <Label>Email</Label>
                        <input
                          className="form-control"
                          type="email"
                          name="email"
                          id="email"
                          onChange={handleInputChangeBasic}
                          value={basicInfo.email}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          required
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="row">
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Country <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          type="text"
                          name="countryId"
                          id="countryId"
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          value={basicInfo.countryId}
                          disabled
                        >
                          <option value={""}>Select</option>
                          {countries.map((value, index) => (
                            <option key={index} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.countryId !== "" ? (
                          <span className={classes.error}>
                            {errors.countryId}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          State <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          type="text"
                          name="stateId"
                          id="stateId"
                          value={basicInfo.stateId}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          onChange={getProvinces}
                        >
                          <option value="">Select</option>
                          {states.map((value, index) => (
                            <option key={index} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.stateId !== "" ? (
                          <span className={classes.error}>
                            {errors.stateId}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Province/District/LGA{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <select
                          className="form-control"
                          type="text"
                          name="district"
                          id="district"
                          value={basicInfo.district}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          onChange={handleInputChangeBasic}
                        >
                          <option value="">Select</option>
                          {provinces.map((value, index) => (
                            <option key={index} value={value.id}>
                              {value.name}
                            </option>
                          ))}
                        </select>
                        {errors.district !== "" ? (
                          <span className={classes.error}>
                            {errors.district}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </div>

                  <div className={"row"}>
                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>
                          Street Address{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <input
                          className="form-control"
                          type="text"
                          name="address"
                          id="address"
                          value={basicInfo.address}
                          onChange={handleInputChangeBasic}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                        {errors.address !== "" ? (
                          <span className={classes.error}>
                            {errors.address}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group  col-md-4">
                      <FormGroup>
                        <Label>Landmark</Label>
                        <input
                          className="form-control"
                          type="text"
                          name="landmark"
                          id="landmark"
                          value={basicInfo.landmark}
                          onChange={handleInputChangeBasic}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    Relationship / Next Of Kin
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {contacts && contacts.length > 0 && (
                      <div className="col-xl-12 col-lg-12">
                        <table style={{ width: "100%" }} className="mb-3">
                          <thead className="mb-3">
                            <tr>
                              <th>Relationship Type</th>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Address</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody className="mb-3">
                            {contacts.map((item, index) => {
                              return (
                                <tr key={item.index} className="mb-3">
                                  <td>
                                    {getRelationship(item.relationshipId)}
                                  </td>
                                  <td>
                                    {item.firstName +
                                      " " +
                                      item.middleName +
                                      " " +
                                      item.lastName}
                                  </td>
                                  <td>{item.phone}</td>
                                  <td>{item.address}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-default btn-light btn-sm editRow"
                                      onClick={() =>
                                        handleEditRelative(item, index)
                                      }
                                    >
                                      <FontAwesomeIcon icon="edit" />
                                    </button>
                                    &nbsp;&nbsp;
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm removeRow"
                                      onClick={(e) =>
                                        handleDeleteRelative(index)
                                      }
                                    >
                                      <FontAwesomeIcon icon="trash" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="col-xl-12 col-lg-12">
                      {showRelative && (
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="relationshipType">
                                    Relationship Type{" "}
                                    <span style={{ color: "red" }}> *</span>
                                  </Label>
                                  <select
                                    className="form-control"
                                    name="relationshipId"
                                    id="relationshipId"
                                    value={relatives.relationshipId}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  >
                                    <option value={""}>Select</option>
                                    {relationshipOptions.map(
                                      (relative, index) => (
                                        <option
                                          key={relative.id}
                                          value={relative.id}
                                        >
                                          {relative.display}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  {errors.relationshipId !== "" ? (
                                    <span className={classes.error}>
                                      {errors.relationshipId}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="cfirstName">
                                    First Name{" "}
                                    <span style={{ color: "red" }}> *</span>
                                  </Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="firstName"
                                    value={relatives.firstName}
                                    id="firstName"
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
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
                                  <Label>Middle Name</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="middleName"
                                    id="middleName"
                                    value={relatives.middleName}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label>
                                    Last Name{" "}
                                    <span style={{ color: "red" }}> *</span>
                                  </Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={relatives.lastName}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                  {errors.lastName !== "" ? (
                                    <span className={classes.error}>
                                      {errors.lastName}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </FormGroup>
                              </div>
                            </div>

                            <div className="row">
                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactPhoneNumber">
                                    Phone Number
                                  </Label>
                                  <PhoneInput
                                    containerStyle={{
                                      width: "100%",
                                      border: "1px solid #014D88",
                                    }}
                                    inputStyle={{
                                      width: "100%",
                                      borderRadius: "0px",
                                    }}
                                    country={"ng"}
                                    placeholder="(234)7099999999"
                                    name="phone"
                                    value={relatives.phone}
                                    masks={{
                                      ng: "...-...-....",
                                      at: "(....) ...-....",
                                    }}
                                    id="phone"
                                    onChange={(e) => {
                                      checkPhoneNumber(e, "phone");
                                    }}
                                  />
                                  {errors.phone !== "" ? (
                                    <span className={classes.error}>
                                      {errors.phone}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactEmail">Email</Label>
                                  <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={relatives.email}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                    required
                                  />
                                </FormGroup>
                              </div>

                              <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                  <Label for="contactAddress">Address</Label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={relatives.address}
                                    style={{
                                      border: "1px solid #014D88",
                                      borderRadius: "0.2rem",
                                    }}
                                    onChange={handleInputChangeRelatives}
                                  />
                                </FormGroup>
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-1">
                                <MatButton
                                  type="button"
                                  variant="contained"
                                  color="primary"
                                  className={classes.button}
                                  onClick={handleSaveRelationship}
                                >
                                  Add
                                </MatButton>
                              </div>

                              <div className="col-1">
                                <MatButton
                                  type="button"
                                  variant="contained"
                                  color="secondary"
                                  className={classes.button}
                                  onClick={handleCancelSaveRelationship}
                                >
                                  Cancel
                                </MatButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row"></div>
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<AddIcon />}
                    onClick={handleAddRelative}
                    style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                  >
                    Add a Relative/Next Of Kin
                  </MatButton>
                </div>
              </div> */}

            {state.showANC && showRegistrationAnc && (
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#014d88",
                    color: "#fff",
                    fontWeight: "bolder",
                    borderRadius: "0.2rem",
                  }}
                >
                  <h5 className="card-title" style={{ color: "#fff" }}>
                    ANC Enrollment
                  </h5>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          ANC No <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="ancNo"
                            id="ancNo"
                            onChange={handleInputChangeANC}
                            value={objValues.ancNo}
                          />
                        </InputGroup>
                        {errors.ancNo !== "" ? (
                          <span className={classes.error}>{errors.ancNo}</span>
                        ) : (
                          ""
                        )}
                        {ancNumberCheck === true ? (
                          <span className={classes.error}>
                            {"ANC number already exist"}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Date of Enrollment{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfEnrollment"
                            id="dateOfEnrollment"
                            onChange={handleInputChange}
                            value={objValues.dateOfEnrollment}
                            min={basicInfo.dateOfRegistration}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                          />
                        </InputGroup>
                        {errors.dateOfEnrollment !== "" ? (
                          <span className={classes.error}>
                            {errors.dateOfEnrollment}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Parity <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="parity"
                            id="parity"
                            onChange={handleInputChange}
                            value={objValues.parity}
                            min="0"
                          />
                        </InputGroup>
                        {errors.parity !== "" ? (
                          <span className={classes.error}>{errors.parity}</span>
                        ) : (
                          ""
                        )}
                        {/* {objValues.parity !== "" && objValues.parity < 0 ? (
                            <span className={classes.error}>
                              Parity should not be less than 1
                            </span>
                          ) : (
                            ""
                          )} */}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Gravida <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gravida"
                            id="gravida"
                            onChange={handleInputChange}
                            value={objValues.gravida}
                            min={objValues.parity}
                          />
                        </InputGroup>
                        {errors.gravida !== "" ? (
                          <span className={classes.error}>
                            {errors.gravida}
                          </span>
                        ) : (
                          ""
                        )}
                        {objValues.gravida < objValues.parity ? (
                          <span className={classes.error}>
                            Gravida should not be less Parity
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Date Of Last Menstrual Period{" "}
                          <span style={{ color: "red" }}> *</span>{" "}
                        </Label>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="lmp"
                            id="lmp"
                            onChange={handleInputChange}
                            value={objValues.lmp}
                            // max={moment(new Date()).format("YYYY-MM-DD")}
                            max={
                              objValues.dateOfEnrollment
                                ? objValues.dateOfEnrollment
                                : moment(new Date()).format("YYYY-MM-DD")
                            }
                          />
                        </InputGroup>
                        {errors.lmp !== "" ? (
                          <span className={classes.error}>{errors.lmp}</span>
                        ) : (
                          ""
                        )}
                        {objValues.gaweeks === 0 ? (
                          <span className={classes.error}>Invalid date </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Gestational Age (Weeks){" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="number"
                            name="gaweeks"
                            id="gaweeks"
                            onChange={handleInputChange}
                            value={objValues.gaweeks}
                            disabled
                          />
                        </InputGroup>
                        {errors.gaweeks !== "" ? (
                          <span className={classes.error}>
                            {errors.gaweeks}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    {/* <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <Label>
                            Source of Referral{" "}
                            <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="sourceOfReferral"
                              id="sourceOfReferral"
                              onChange={handleInputChange}
                              value={objValues.sourceOfReferral}
                            >
                          
                              <option value="">Select</option>
                              {sourceReferral.map((value, index) => (
                                <option key={index} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                          </InputGroup>
                          {errors.sourceOfReferral !== "" ? (
                            <span className={classes.error}>
                              {errors.sourceOfReferral}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div> */}

                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Tested for syphilis{" "}
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedSyphilis"
                            id="testedSyphilis"
                            onChange={handleInputChange}
                            value={objValues.testedSyphilis}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {errors.testedSyphilis !== "" ? (
                          <span className={classes.error}>
                            {errors.testedSyphilis}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    {objValues.testedSyphilis === "Yes" && (
                      <>
                        <div className="form-group mb-3 col-md-6">
                          <FormGroup>
                            <Label>
                              Syphilis test result{" "}
                              <span style={{ color: "red" }}> *</span>
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="testResultSyphilis"
                                id="testResultSyphilis"
                                onChange={handleInputChange}
                                value={objValues.testResultSyphilis}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                            {errors.testResultSyphilis !== "" ? (
                              <span className={classes.error}>
                                {errors.testResultSyphilis}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        {objValues.testedSyphilis === "Yes" &&
                          objValues.testResultSyphilis === "Positive" && (
                            <>
                              <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                  <Label>
                                    Treated for Syphilis{" "}
                                  </Label>
                                  <InputGroup>
                                    <Input
                                      type="select"
                                      name="treatedSyphilis"
                                      id="treatedSyphilis"
                                      onChange={handleInputChange}
                                      value={objValues.encounterDate}
                                    >
                                      <option value="">Select</option>
                                      <option value="Yes">Yes</option>
                                      <option value="No">No</option>
                                    </Input>
                                  </InputGroup>
                                  {errors.treatedSyphilis !== "" ? (
                                    <span className={classes.error}>
                                      {errors.treatedSyphilis}
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </FormGroup>
                              </div>
                            </>
                          )}
                      </>
                    )}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Tested for Hepatitis B
                          <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedHepatitisB"
                            id="testedHepatitisB"
                            onChange={handleInputChange}
                            value={objValues.testedHepatitisB}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                      </FormGroup>
                    </div>
                    {objValues.testedHepatitisB === "Yes" && (
                      <>
                        {" "}
                        <div className="form-group mb-3 col-md-6">
                          <FormGroup>
                            <Label>
                              Hepatitis B test result{" "}
                              {/* <span style={{ color: "red" }}> *</span>{" "} */}
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="hepatitisB"
                                id="hepatitisB"
                                onChange={handleInputChange}
                                value={objValues.hepatitisB}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                            {/* {errors.hepatitisB !== "" ? (
                                <span className={classes.error}>
                                  {errors.hepatitisB}
                                </span>
                              ) : (
                                ""
                              )} */}
                          </FormGroup>
                        </div>
                        {objValues.hepatitisB === "Positive" && (
                          <>
                            <div className="form-group mb-3 col-md-6">
                              <FormGroup>
                                <Label>
                                  Referred Hepatitis B +ve client
                                  {/* <span style={{ color: "red" }}> *</span> */}
                                </Label>
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="referredHepatitisB"
                                    id="referredHepatitisB"
                                    onChange={handleInputChange}
                                    value={objValues.referredHepatitisB}
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

                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Tested for Hepatitis C
                          {/* <span style={{ color: "red" }}> *</span> */}
                        </Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="testedHepatitisC"
                            id="testedHepatitisC"
                            onChange={handleInputChange}
                            value={objValues.testedHepatitisC}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Input>
                        </InputGroup>
                        {/* {errors.testedSyphilis !== "" ? (
                            <span className={classes.error}>
                              {errors.testedSyphilis}
                            </span>
                          ) : (
                            ""
                          )} */}
                      </FormGroup>
                    </div>
                    {objValues.testedHepatitisC === "Yes" && (
                      <>
                        <div className="form-group mb-3 col-md-6">
                          <FormGroup>
                            <Label>
                              Hepatitis C test result{" "}
                              {/* <span style={{ color: "red" }}> *</span>{" "} */}
                            </Label>
                            <InputGroup>
                              <Input
                                type="select"
                                name="hepatitisC"
                                id="hepatitisC"
                                onChange={handleInputChange}
                                value={objValues.hepatitisC}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </Input>
                            </InputGroup>
                            {/* {errors.hepatitisB !== "" ? (
                                <span className={classes.error}>
                                  {errors.hepatitisB}
                                </span>
                              ) : (
                                ""
                              )} */}
                          </FormGroup>
                        </div>
                        {objValues.hepatitisC === "Positive" && (
                          <>
                            <div className="form-group mb-3 col-md-6">
                              <FormGroup>
                                <Label>
                                  Referred Hepatitis C +ve client
                                  {/* <span style={{ color: "red" }}> *</span> */}
                                </Label>
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="referredHepatitisC"
                                    id="referredHepatitisC"
                                    onChange={handleInputChange}
                                    value={objValues.referredHepatitisC}
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
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>Referred from Spokes Site</Label>
                        <InputGroup>
                          <Input
                            type="select"
                            name="referredFromSpokesSite"
                            id="referredFromSpokesSite"
                            onChange={handleInputChange}
                            value={objValues.referredFromSpokesSite}
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
            )}

            {/* PMTCT FORM FOR L&D AND POST PARTUM  */}
            {!state.showANC && showRegistration && (
              <PmtctEnrollment
                // entryPoint={}
                newRegDate={basicInfo.dateOfRegistration}
                getPMTCTInfo={getPMTCTInfo}
                patientObj={{}}
                showANC={state.showANC}
                setActiveContent={setActiveContent}
                activeContent={activeContent}
                hideUpdateButton={false}
                ancEntryType={false}
                htsHivStatus={htsHivStatus}
               showLastHivTestMessage={false}

              />
            )}
            {saving ? <Spinner /> : ""}
            <br />
            {/* { 
                basicInfo.age >= 10 &&
                objValues.gaweeks > 0 &&
                ancNumberCheck !== true &&
                objValues.gravida >= objValues.parity && (
                  <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    hidden={disabledAgeBaseOnAge || hospitalNumStatus}
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                  >
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                )} */}
            {showRegistrationButton && (
              <>
                {" "}
                {
                  <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    hidden={disabledAgeBaseOnAge || hospitalNumStatus}
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                  >
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                }
                <MatButton
                  variant="contained"
                  className={classes.button}
                  startIcon={<CancelIcon />}
                  style={{ backgroundColor: "#992E62" }}
                  onClick={handleCancel}
                >
                  <span style={{ textTransform: "capitalize", color: "#fff" }}>
                    Cancel
                  </span>
                </MatButton>
              </>
            )}
          </Form>
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

      <Modal
        show={modalConfirmation}
        toggle={toggleConfirmation}
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
          <h4>Patient has no HTS record. Please refer for testing... </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={toggleConfirmation}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserRegistration;
