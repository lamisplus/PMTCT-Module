import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label as FormLabelName,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";

import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import HealingIcon from "@material-ui/icons/Healing";
import AssignmentIcon from "@material-ui/icons/Assignment";
import EventIcon from "@material-ui/icons/Event";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "./../../../../api";
import { useHistory } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import moment from "moment";
import { GET_CODESETS_IN_BATCH } from "../../../../utils";

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

const LabourinfantInfo = (props) => {
  const patientObj = props.patientObj;
  //let history = useHistory();
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);
  const [genders, setGenders] = useState([]);
  const [newDateOfDelivery, setNewDateOfDelivery] = useState("");
  const [infantHospitalNumber, setInfantHospitalNumber] = useState("");
  const [agectx, setAgeCTX] = useState([]);
  const [ageAtTestList, setAtTestList] = useState([]);
  const [PCRList, setPCRList] = useState([]);
  const [allChildTestAgeOptions, setAllChildTestAgeOptions] = useState([]);

  const [infantArv, setInfantArv] = useState([]);
  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
    length: "",
  });
  const [pcrResult, setPcrResult] = useState([]);
  const [hospitalNumStatus, setHospitalNumStatus] = useState(false);
  const [infantInfo, setInfantInfo] = useState({
    ancNo: patientObj?.ancNo,
    dateOfinfantInfo: "",
    firstName: "",
    middleName: "",
    sex: "",
    surname: "",
    bodyWeight: "",
    length: "",
    birthOutcome: "",
    entryPoint: "",
    entryPointOther: "",
    uuid: patientObj.ancUuid,
    dateOfDelivery: "",
    ctxStatus: "",
    infantHospitalNumber: "",
    patientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid
      ? props.patientObj.patientUuid
      : props.patientObj.uuid,
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
     infantPCRTestDto:  {
              ageAtTest: "",
              ancNumber: '',
              dateResultReceivedAtFacility: "",
              dateResultReceivedByCaregiver: "",
              dateSampleCollected: "",
              dateSampleSent: "",
              infantHospitalNumber: '',
              results: "",
              testType: "",
              pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
              motherPatientUuid: props.patientObj.patient_uuid
                ? props.patientObj.patient_uuid
                : props.patientObj.patientUuid,

  },
      infantArvDto: {
    ageAtCtx: "",
    ancNumber: '',
    arvDeliveryPoint: "",
    infantArvTime: "",
    infantArvType: "",
    infantHospitalNumber:'',
    dateOfCtx: "",
    dateOfArv: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
  },
    source: "WEB",



  });
  const [infantPCRTestDto, setInfantPCRTestDto] = useState({
    ageAtTest: "",
    ancNumber: props.patientObj.ancNo,
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "",
    dateSampleSent: "",
    infantHospitalNumber: infantHospitalNumber,
    results: "",
    testType: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
    source: "WEB",
  });
  const [arvAgeAtInitiation, setArvAgeAtInitiation] = useState("");
  const [motherSyphilisPositive, setMotherSyphilisPositive] = useState(false);
  const [motherSyphilisTestResult, setMotherSyphilisTestResult] = useState("");
  const [motherSyphilisTreatment, setMotherSyphilisTreatment] = useState("");
  const [hbvVaccinations, setHbvVaccinations] = useState([]);
  const [hbvErrors, setHbvErrors] = useState({});
  const [syphilisData, setSyphilisData] = useState({
    dateOfInitiation: "",
    ageAtInitiation: "",
    typeOfProphylaxis: "",
  });
  const [infantArvDto, setInfantArvDto] = useState({
    ageAtCtx: "",
    ancNumber: props.patientObj.ancNo,
    arvDeliveryPoint: "",
    infantArvTime: "",
    infantArvType: "",
    infantHospitalNumber: infantHospitalNumber ? infantHospitalNumber : "",
    dateOfCtx: "",
    dateOfArv: "",
    dateOfArvCompletion: "",
    otherArvType: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
    source: "WEB",
  });

   const getSamplePCRType = (arr) => {
            let newInfantPcrList=[]
            arr.map((each, index)=>{
              if(each.code === "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT"){
                newInfantPcrList.push(each)
              }

            })
        setPCRList(newInfantPcrList);
    
  };



    // BATCH API
 const GET_CODESETS = () => {

   GET_CODESETS_IN_BATCH("CHILD_TEST_AGE", "INFANT_PCR_RESULT", "SEX", "AGE_CTX_INITIATION", "TYPE_PROPHYLAXIS", "INFANT_TESTING_PCR").then((response)=>{
      // Store CHILD_TEST_AGE as fallback but don't overwrite age-specific list
      if (response.data.CHILD_TEST_AGE) {
        setAllChildTestAgeOptions(response.data.CHILD_TEST_AGE);
      }
      setPcrResult(response.data.INFANT_PCR_RESULT)
      setGenders(response.data.SEX);
      setAgeCTX(response.data.AGE_CTX_INITIATION);

      setInfantArv(response.data.TYPE_PROPHYLAXIS)
      getSamplePCRType(response.data.INFANT_TESTING_PCR)

   })
  
  };


  // Load age-at-test options based on infant's age in weeks
  const loadAgeAtTestOptions = (dateOfDelivery) => {
    if (!dateOfDelivery) return;
    let weeks = calculateAgeInWeek(dateOfDelivery);
    if (weeks < 7) {
      axios
        .get(`${baseUrl}application-codesets/v2/1ST PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {});
    } else if (weeks > 11) {
      axios
        .get(`${baseUrl}application-codesets/v2/2ND_3RD_PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {});
    } else {
      // 7-11 weeks gap: load all CHILD_TEST_AGE options as fallback
      axios
        .get(`${baseUrl}application-codesets/v2/CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {});
    }
  };

  // caluculate the PCR
  const calculateAgeInWeek = (dateOfBirth) => {
    // let ex = "2024-01-01";
    let ex = dateOfBirth;
    let splitedInfantDate = ex.split("-");
    let infantYear = Number(splitedInfantDate[0]);
    let infantMonth = Number(splitedInfantDate[1]);
    let infantDate = Number(splitedInfantDate[2]);

    // must be greater than 6 weeks
    let today = moment().format("YYYY-MM-DD");
    let splitedTodayDate = today.split("-");
    let todayYear = Number(splitedTodayDate[0]);
    let todayMonth = Number(splitedTodayDate[1]);
    let todayDate = Number(splitedTodayDate[2]);

    let weekCounts = moment("20240313", "YYYYMMDD").fromNow();

    // compare the year
    if (Number(todayYear) === Number(infantYear)) {
      // compare the month

      if (todayMonth > infantMonth) {
        let monthOld = todayMonth - infantMonth;

        // convert to weeks
        let convertMonthToWeeks = monthOld * 4;
        return convertMonthToWeeks;
      } else if (todayMonth === infantMonth) {
        let dayOld = todayDate - infantDate;
        // convert to weeks
        let calculatingDaysToWeeks = dayOld / 7;
        if (1 > calculatingDaysToWeeks) {
          return 0;
        } else {
          let convertDayToWeeks = calculatingDaysToWeeks;

          return Math.floor(convertDayToWeeks);
        }
      }
    } else if (todayYear > infantYear) {
      let yearOld = todayYear - infantYear;

      let calculateYearInWeeks = yearOld * 52.1429;

      return Math.floor(calculateYearInWeeks);
    }
  };

  const handleInputChangeInfantPCRTestDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name)infantPCRTestDto, setInfantPCRTestDto


    if(e.target.name === "dateSampleCollected" && e.target.value !== ""){
      calculateAgeAtTest(e.target.value, e.target.name)

    }else if(e.target.name === "dateSampleSent" && e.target.value !== ""){
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        [e.target.name]: e.target.value,
        dateResultReceivedAtFacility: "",
        dateResultReceivedByCaregiver: "",

      });

    }else if(e.target.name === "dateResultReceivedAtFacility" && e.target.value !== ""){
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        [e.target.name]: e.target.value,
        dateResultReceivedByCaregiver: "",

      });

    }else{
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleInputChangeInfantArvDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name),
    if(e.target.name === "dateOfCtx"){
      const dob = infantInfo.dateOfDelivery;
      if (dob && e.target.value < dob) {
        setErrors({ ...errors, dateOfCtx: "Date of CTX Initiation must be on or after Date of Birth" });
        return;
      }
      let result =calculateAgeAtCTX(e.target.value)
      setErrors({ ...errors, dateOfCtx: "" });
      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , ageAtCtx:  result })

    }else if(e.target.name === "dateOfArv"){
      const dob = infantInfo.dateOfDelivery;
      if (dob && e.target.value < dob) {
        setErrors({ ...errors, dateOfArv: "Date of Initiation must be on or after Date of Birth" });
        return;
      }
      let result =calculateArvProphylaxis(e.target.value)
      setErrors({ ...errors, dateOfArv: "" });
      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , infantArvTime:  result })

    }else if(e.target.name === "dateOfArvCompletion"){
      const dob = infantInfo.dateOfDelivery;
      if (dob && e.target.value < dob) {
        setErrors({ ...errors, dateOfArvCompletion: "Date of ARV Completion must be on or after Date of Birth" });
        return;
      }
      setErrors({ ...errors, dateOfArvCompletion: "" });
      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value })

    }else if(e.target.name ===  "infantArvType"){

      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

      setErrors({ ...errors, [e.target.name]: "", dateOfArv: "" });

    }else{
      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

    }
  };

  const handleInputChangeSyphilis = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "dateOfInitiation") {
      const deliveryDate = moment(infantInfo.dateOfDelivery ? infantInfo.dateOfDelivery : newDateOfDelivery);
      const initDate = moment(e.target.value);
      const diffDays = initDate.diff(deliveryDate, 'days');
      const weeks = Math.floor(diffDays / 7);
      setSyphilisData({
        ...syphilisData,
        [e.target.name]: e.target.value,
        ageAtInitiation: weeks >= 0 ? String(weeks) : "0",
      });
    } else {
      setSyphilisData({ ...syphilisData, [e.target.name]: e.target.value });
    }
  };

  const addHbvDose = () => {
    const nextDoseNumber = hbvVaccinations.length + 1;
    if (nextDoseNumber > 3) return;
    const doseLabels = ["First Dose (Birth Dose)", "Second Dose", "Third Dose"];
    setHbvVaccinations([
      ...hbvVaccinations,
      {
        dose: doseLabels[nextDoseNumber - 1],
        doseNumber: nextDoseNumber,
        dateOfVaccination: "",
        timing: "",
      },
    ]);
  };

  const handleHbvChange = (index, field, value) => {
    const updated = [...hbvVaccinations];
    updated[index][field] = value;
    // Clear timing error when updating
    setHbvErrors({ ...hbvErrors, [`hbv_${index}_${field}`]: "" });

    // Validate 28-day gap for 2nd and 3rd doses
    if (field === "dateOfVaccination" && value) {
      if (index > 0 && updated[index - 1].dateOfVaccination) {
        const prevDate = moment(updated[index - 1].dateOfVaccination);
        const currDate = moment(value);
        const daysDiff = currDate.diff(prevDate, "days");
        if (daysDiff < 28) {
          setHbvErrors({
            ...hbvErrors,
            [`hbv_${index}_dateOfVaccination`]: `Must be at least 28 days after ${updated[index - 1].dose} date`,
          });
        }
      }
    }

    setHbvVaccinations(updated);
  };

  const removeHbvDose = (index) => {
    // Only allow removing the last dose
    if (index === hbvVaccinations.length - 1) {
      setHbvVaccinations(hbvVaccinations.slice(0, -1));
    }
  };

  const handleInputValueCheckweight = (e) => {
    if (
      e.target.name === "bodyWeight" &&
      (e.target.value < 0.3 || e.target.value > 8)
    ) {
      const message =
        "Birth weight must be between 0.3 and 8.0 kg";
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: message });
    } else if (e.target.name === "bodyWeight") {
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: "" });
    }
    if (
      e.target.name === "length" &&
      (e.target.value < 30 || e.target.value > 70)
    ) {
      const message =
        "Length must be between 30 and 70 cm";
      setVitalClinicalSupport({ ...vitalClinicalSupport, length: message });
    } else if (e.target.name === "length") {
      setVitalClinicalSupport({ ...vitalClinicalSupport, length: "" });
    }
  };




  const populateFormFromObj = (obj) => {
    if (obj.sex === "Female") obj.sex = "SEX_FEMALE";
    else if (obj.sex === "Male") obj.sex = "SEX_MALE";
    setInfantInfo({ ...infantInfo, ...obj, source: obj.source || "WEB" });
    setInfantArvDto({
      ...infantArvDto,
      ...obj.infantArvDto,
      source: obj.infantArvDto?.source || "WEB",
    });
    setInfantPCRTestDto({
      ...infantPCRTestDto,
      ...obj.infantPCRTestDto,
      source: obj.infantPCRTestDto?.source || "WEB",
    });
    setDisabledField(
      props.activeContent.actionType === "view" ? true : false
    );
    if (obj.syphilisProphylaxis) {
      setSyphilisData(obj.syphilisProphylaxis);
    }
    if (obj.hbvVaccinations && obj.hbvVaccinations.length > 0) {
      setHbvVaccinations(obj.hbvVaccinations);
    }
    const existingDateOfDelivery = obj?.dateOfDelivery;
    if (existingDateOfDelivery) {
      loadAgeAtTestOptions(existingDateOfDelivery);
    }
  };

  useEffect(() => {
    GET_CODESETS()

    if (props.activeContent && props.activeContent.actionType === "create") {
      infantInfo.dateOfDelivery = props.activeContent.obj;
      // Load age-specific options using the reusable function
      loadAgeAtTestOptions(infantInfo.dateOfDelivery);
    }
    if (props.activeContent && props.activeContent.id) {
      if (props.activeContent.obj && props.activeContent.obj.firstName) {
        // Data already available from caller (e.g. Infant Index table)
        const obj = { ...props.activeContent.obj };
        populateFormFromObj(obj);
      } else {
        // Data not available (e.g. navigating from Recent Activities) - fetch from API
        axios
          .get(`${baseUrl}pmtct/anc/get-infant-dto/${props.activeContent.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (response.data) {
              const obj = { ...response.data };
              populateFormFromObj(obj);
            }
          })
          .catch((error) => {
            console.log("Error fetching infant data:", error);
          });
      }
    }
  }, [props.patientObj.id, props.activeContent.id]);

  // Pre-fill mother's syphilis status from PMTCT HTS
  useEffect(() => {
    const patientUuid = props.patientObj.patient_uuid
      || props.patientObj.patientUuid
      || props.patientObj.uuid;
    if (!patientUuid) return;

    axios
      .get(`${baseUrl}pmtct/anc/get-latest-pmtct-hts-by-person-uuid/${patientUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && response.data.syphilisInfo) {
          const testResult = (response.data.syphilisInfo.testResult || "").toLowerCase();
          if (testResult === "positive" || testResult === "reactive") {
            setMotherSyphilisPositive(true);
            setMotherSyphilisTestResult(response.data.syphilisInfo.testResult);
            const treatment = response.data.syphilisInfo.treatment || "";
            if (treatment === "Treated") {
              setMotherSyphilisTreatment("Yes");
            } else if (treatment === "Not Treated") {
              setMotherSyphilisTreatment("No");
            }
          }
        }
      })
      .catch(() => {});
  }, [props.patientObj.id]);



  const calculateAgeAtCTX  =(dateaOfCTX)=>{
    const deliveryDate = moment(infantInfo.dateOfDelivery ? infantInfo.dateOfDelivery : newDateOfDelivery)
    const lastCTX  = moment(dateaOfCTX)
    const diffDays = lastCTX.diff(deliveryDate, 'days');
    const weeks = Math.floor(diffDays / 7);
    return weeks >= 0 ? String(weeks) : "0";
  }

  

  const calculateArvProphylaxis  =(dateOfArv)=>{
    const deliveryDate = moment(infantInfo.dateOfDelivery ? infantInfo.dateOfDelivery : newDateOfDelivery)
    const arvDate  = moment(dateOfArv)
    const diffDays = arvDate.diff(deliveryDate, 'days');
    const weeks = Math.floor(diffDays / 7);
    setArvAgeAtInitiation(weeks >= 0 ? weeks : 0);
    // Keep the old timing value for backward compatibility
    if(arvDate.diff(deliveryDate, 'hours')  < 72){
        return "Within 72 hour";
    }else{
      return "After 72 hour";
    }
  }





  const handleInputChangeinfantInfoDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "infantHospitalNumber" && e.target.value !== "") {
      async function getHosiptalNumber() {
        const hosiptalNumber = e.target.value;
        const response = await axios.post(
          `${baseUrl}pmtct/anc/exist/infant-hospital-number`,
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
          errors.infantHospitalNumber = "";
        } else {
          errors.infantHospitalNumber = "";
          toast.error("Error! Hosiptal Number already exist");
          setHospitalNumStatus(true);
        }
      }
      getHosiptalNumber();

      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }else  if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
      loadAgeAtTestOptions(e.target.value);
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }else if(e.target.name === "ctxStatus"){
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value});
      setInfantArvDto({...infantArvDto, dateOfCtx: "" })
      
      
      setErrors({ ...errors, [e.target.name]: "", dateOfCtx: "" });

    }else{
      setInfantInfo({ ...infantInfo, [e.target.name]: e.target.value });

    }

  };

  //FORM VALIDATION
  const validate = () => {
    let temp = {};
    // temp.firstName = infantInfo.firstName ? "" : "This field is required";
    temp.surname = infantInfo.surname ? "" : "This field is required";
    temp.infantHospitalNumber = infantInfo.infantHospitalNumber
      ? ""
      : "This field is required";
    // temp.ageAtTest = infantPCRTestDto.ageAtTest ? "" : "This field is required";
    //temp.dateOfinfantInfo = infantInfo.dateOfinfantInfo ? "" : "This field is required"
    temp.sex = infantInfo.sex ? "" : "This field is required";
    temp.birthOutcome = infantInfo.birthOutcome ? "" : "This field is required";
    temp.entryPoint = infantInfo.entryPoint ? "" : "This field is required";
    infantInfo.entryPoint === "Other Entry Point" && (temp.entryPointOther = infantInfo.entryPointOther ? "" : "This field is required");
    temp.length = infantInfo.length ? "" : "This field is required";
    temp.dateOfDelivery = infantInfo.dateOfDelivery ? "" : "This field is required";
    if (infantInfo.birthOutcome !== "Dead") {
      infantInfo.ctxStatus === "YES" && ( temp.dateOfCtx =infantArvDto.dateOfCtx? "" : "This field is required");
      if (infantArvDto.dateOfCtx && infantInfo.dateOfDelivery && infantArvDto.dateOfCtx < infantInfo.dateOfDelivery) {
        temp.dateOfCtx = "Date of CTX Initiation must be on or after Date of Birth";
      }
      infantArvDto.infantArvType !== "TYPE_PROPHYLAXIS_NONE"  && infantArvDto.infantArvType  && ( temp.dateOfArv = infantArvDto.dateOfArv? "" : "This field is required");
      if (infantArvDto.dateOfArv && infantInfo.dateOfDelivery && infantArvDto.dateOfArv < infantInfo.dateOfDelivery) {
        temp.dateOfArv = "Date of Initiation must be on or after Date of Birth";
      }
      if (infantArvDto.dateOfArvCompletion && infantInfo.dateOfDelivery && infantArvDto.dateOfArvCompletion < infantInfo.dateOfDelivery) {
        temp.dateOfArvCompletion = "Date of ARV Completion must be on or after Date of Birth";
      }
      infantArvDto.infantArvType !== ""  && infantArvDto.infantArvType  && ( temp.infantArvType = infantArvDto.infantArvType? "" : "This field is required");
      infantArvDto.infantArvType === "TYPE_PROPHYLAXIS_OTHER_(SPECIFY)" && (temp.otherArvType = infantArvDto.otherArvType ? "" : "This field is required");

      infantPCRTestDto.testType !== "" && ( temp.dateSampleCollected =infantPCRTestDto.dateSampleCollected ? "" : "This field is required");
      infantPCRTestDto.testType !== "" && ( temp.dateSampleSent =infantPCRTestDto.dateSampleSent ? "" : "This field is required");
      // Date Result Received is mandatory when a test result is entered
      infantPCRTestDto.results && infantPCRTestDto.results !== "select" && (temp.dateResultReceivedAtFacility = infantPCRTestDto.dateResultReceivedAtFacility ? "" : "Date Result Received is required when a result is entered");
    }

    //temp.bookingStatus = infantInfo.bookingStatus ? "" : "This field is required"
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

      if(infantPCRTestDto.testType &&  infantPCRTestDto.dateSampleCollected && infantPCRTestDto.dateSampleSent ){
        const pcrToSend = { ...infantPCRTestDto };
        if (!pcrToSend.dateResultReceivedAtFacility) pcrToSend.dateResultReceivedAtFacility = null;
        if (!pcrToSend.dateResultReceivedByCaregiver) pcrToSend.dateResultReceivedByCaregiver = null;
        infantInfo.infantPCRTestDto = pcrToSend;

      } else if(infantPCRTestDto.testType && (!infantPCRTestDto.dateSampleCollected || !infantPCRTestDto.dateSampleSent)){
        toast.warning("PCR test data incomplete - Sample Collected Date and Sample Sent Date are required. PCR record will not be saved.", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        setSaving(false);
        return;
      }



      if(infantArvDto.infantArvType){
         infantInfo.infantArvDto = infantArvDto;

      }

      // Wire new fields into payload
      infantInfo.syphilisProphylaxis = syphilisData;
      infantInfo.hbvVaccinations = hbvVaccinations;

      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-infant/${props.activeContent.id}`,
            infantInfo,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            //props.patientObj.commenced=true
            toast.success("Record save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "infants",
            });
          })
          .catch((error) => {
            setSaving(false);
            let errorMessage = "Something went wrong";
            if (error.response && error.response.data) {
              errorMessage = error.response.data.apierror?.message
                || error.response.data.message
                || error.response.data
                || errorMessage;
            }
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      } else {
        axios
          .post(`${baseUrl}pmtct/anc/add-infants`, infantInfo, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            toast.success("Record save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "infants",
            });
          })
          .catch((error) => {
            setSaving(false);
            let errorMessage = "Something went wrong";
            if (error.response && error.response.data) {
              errorMessage = error.response.data.apierror?.message
                || error.response.data.message
                || error.response.data
                || errorMessage;
            }
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      }
    } else {
      toast.error("All field are required", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  const LoadPage = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "infants",
      id: "",
      actionType: "",
    });
  };

  const calculateAgeAtTest= (mainSampleDate, nameInput)=>{
    let deliveryDate =   moment( infantInfo.dateOfDelivery? infantInfo.dateOfDelivery : newDateOfDelivery )
    let sampleDate = moment(mainSampleDate)

    let timeDiffinHrs = sampleDate.diff(deliveryDate, 'hours');
    let timeDiffinMonth = sampleDate.diff(deliveryDate, 'months');

    if(timeDiffinHrs < 72){

      setInfantPCRTestDto({...infantPCRTestDto,ageAtTest: "CHILD_TEST_AGE_<_72_HRS", [nameInput]: mainSampleDate, dateResultReceivedAtFacility: "", dateSampleSent: "" , dateResultReceivedByCaregiver: "" })

    }else if(timeDiffinMonth > 12){

      setInfantPCRTestDto({...infantPCRTestDto,ageAtTest: "CHILD_TEST_AGE_>12_MONTHS", [nameInput]: mainSampleDate, dateResultReceivedAtFacility: "", dateSampleSent: "" , dateResultReceivedByCaregiver: "" })

    } else if(timeDiffinHrs >= 72 && timeDiffinMonth < 2){

      setInfantPCRTestDto({...infantPCRTestDto,ageAtTest:  "CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS", [nameInput]: mainSampleDate, dateResultReceivedAtFacility: "", dateSampleSent: "" , dateResultReceivedByCaregiver: "" })

    }else if(timeDiffinMonth >= 2 && timeDiffinMonth <= 12){

      setInfantPCRTestDto({...infantPCRTestDto,ageAtTest: "CHILD_TEST_AGE_2-12_MONTHS", [nameInput]: mainSampleDate, dateResultReceivedAtFacility: "", dateSampleSent: "" , dateResultReceivedByCaregiver: "" })

    }


}

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              {/* Card Header */}
              <div
                className="card-header mb-3"
                style={{
                  background: "#fff",
                  borderRadius: "0",
                  padding: "14px 20px",
                  marginTop: "-20px",
                  border: "none",
                  borderBottom: "2px solid #e2e8f0",
                  boxShadow: "none",
                }}
              >
                <h5
                  style={{
                    color: "#0f172a",
                    fontWeight: "700",
                    marginBottom: "0",
                    fontSize: "15px",
                  }}
                >
                  {props.activeContent?.actionType === "view"
                    ? "View"
                    : props.activeContent?.actionType === "update"
                      ? "Edit"
                      : "New"}{" "}
                  Infant Registration
                </h5>
              </div>

              {/* === Infant Demographics === */}
              <div className="col-md-12 mb-3 mt-3">
                <div style={sectionContainerStyle}>
                  <h6 style={sectionHeaderStyle}>
                    <ChildCareIcon style={sectionIconStyle} />
                    Infant Demographics
                  </h6>
                  <div className="row">
                    {patientObj?.ancNo && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <FormLabelName>ANC Number</FormLabelName>
                          <InputGroup>
                            <Input
                              type="text"
                              name="ancNo"
                              id="ancNo"
                              onChange={handleInputChangeinfantInfoDto}
                              value={patientObj.ancNo}
                              disabled
                            />
                          </InputGroup>
                          {errors.ancNo !== "" ? (
                            <span className={classes.error}>
                              {errors.ancNo}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Child's Hospital ID Number
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="text"
                            name="infantHospitalNumber"
                            id="infantHospitalNumber"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.infantHospitalNumber}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {errors.infantHospitalNumber !== "" ? (
                          <span className={classes.error}>
                            {errors.infantHospitalNumber}
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
                        <FormLabelName>
                          Date of Delivery{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="date"
                            onKeyPress={(e) => {
                              e.preventDefault();
                            }}
                            name="dateOfDelivery"
                            id="dateOfDelivery"
                            onChange={handleInputChangeinfantInfoDto}
                            min={props.patientObj.dateOfEnrollment}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            value={
                              infantInfo.dateOfDelivery
                                ? infantInfo.dateOfDelivery
                                : newDateOfDelivery
                            }
                            disabled={true}
                          />
                        </InputGroup>
                        {errors.dateOfDelivery !== "" ? (
                          <span className={classes.error}>
                            {errors.dateOfDelivery}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>Infant Given Name</FormLabelName>
                        <InputGroup>
                          <Input
                            type="text"
                            name="firstName"
                            id="firstName"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.firstName}
                            disabled={disabledField}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>Infant Surname</FormLabelName>
                        <span style={{ color: "red" }}> *</span>
                        <InputGroup>
                          <Input
                            type="input"
                            name="surname"
                            id="surname"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.surname}
                            disabled={disabledField}
                          ></Input>
                        </InputGroup>

                        {errors.surname !== "" ? (
                          <span className={classes.error}>
                            {errors.surname}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Birth Weight <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="number"
                            name="bodyWeight"
                            id="bodyWeight"
                            onChange={handleInputChangeinfantInfoDto}
                            min="0.3"
                            max="8"
                            step="0.01"
                            onKeyUp={handleInputValueCheckweight}
                            value={infantInfo.bodyWeight}
                            disabled={disabledField}
                          />
                          <InputGroupText
                            addonType="append"
                            style={{
                              backgroundColor: "#014D88",
                              color: "#fff",
                              border: "1px solid #014D88",
                              borderRadius: "0rem",
                            }}
                          >
                            kg
                          </InputGroupText>
                        </InputGroup>
                        {errors.bodyWeight !== "" ? (
                          <span className={classes.error}>
                            {errors.bodyWeight}
                          </span>
                        ) : (
                          ""
                        )}
                        {vitalClinicalSupport.weight !== "" ? (
                          <span className={classes.error}>
                            {vitalClinicalSupport.weight}
                          </span>
                        ) : (
                          ""
                        )}
                        {infantInfo.bodyWeight !== "" &&
                        infantInfo.bodyWeight <= 0 ? (
                          <span className={classes.error}>
                            Invalid Body Weight{" "}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Length <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="number"
                            name="length"
                            id="length"
                            onChange={handleInputChangeinfantInfoDto}
                            min="30"
                            max="70"
                            step="0.1"
                            onKeyUp={handleInputValueCheckweight}
                            value={infantInfo.length}
                            disabled={disabledField}
                          />
                          <InputGroupText
                            addonType="append"
                            style={{
                              backgroundColor: "#014D88",
                              color: "#fff",
                              border: "1px solid #014D88",
                              borderRadius: "0rem",
                            }}
                          >
                            cm
                          </InputGroupText>
                        </InputGroup>
                        {errors.length !== "" ? (
                          <span className={classes.error}>{errors.length}</span>
                        ) : (
                          ""
                        )}
                        {vitalClinicalSupport.length !== "" ? (
                          <span className={classes.error}>
                            {vitalClinicalSupport.length}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Sex <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="select"
                            name="sex"
                            id="sex"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.sex}
                            disabled={disabledField}
                          >
                            <option value="">Select </option>

                            {genders.map((value) => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </InputGroup>
                        {errors.sex !== "" ? (
                          <span className={classes.error}>{errors.sex}</span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Birth Outcome <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="select"
                            name="birthOutcome"
                            id="birthOutcome"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.birthOutcome}
                            disabled={disabledField}
                          >
                            <option value="">Select </option>
                            <option value="Alive">Alive</option>
                            <option value="Dead">Dead</option>
                          </Input>
                        </InputGroup>
                        {errors.birthOutcome !== "" ? (
                          <span className={classes.error}>
                            {errors.birthOutcome}
                          </span>
                        ) : (
                          ""
                        )}
                        {infantInfo.birthOutcome === "Dead" && (
                          <span className={classes.error}>
                            Birth outcome is Dead — prophylaxis, PCR, and
                            outcome fields are disabled.
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <FormLabelName>
                          Child's Entry Point{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="select"
                            name="entryPoint"
                            id="entryPoint"
                            onChange={handleInputChangeinfantInfoDto}
                            value={infantInfo.entryPoint}
                            disabled={disabledField}
                          >
                            <option value="">Select </option>
                            <option value="ANC">ANC</option>
                            <option value="L&D">L&D</option>
                            <option value="Postnatal">Postnatal</option>
                            <option value="Immunization">Immunization</option>
                            <option value="OPD">OPD</option>
                            <option value="Inpatient Department">
                              Inpatient Department
                            </option>
                            <option value="Nutrition">Nutrition</option>
                            <option value="Family Planning">
                              Family Planning
                            </option>
                            <option value="Transfer In">Transfer In</option>
                            <option value="Other Entry Point">
                              Other Entry Point
                            </option>
                          </Input>
                        </InputGroup>
                        {errors.entryPoint !== "" ? (
                          <span className={classes.error}>
                            {errors.entryPoint}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    {infantInfo.entryPoint === "Other Entry Point" && (
                      <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <FormLabelName>
                            Specify <span style={{ color: "red" }}> *</span>
                          </FormLabelName>
                          <InputGroup>
                            <Input
                              type="text"
                              name="entryPointOther"
                              id="entryPointOther"
                              onChange={handleInputChangeinfantInfoDto}
                              value={infantInfo.entryPointOther}
                              disabled={disabledField}
                            />
                          </InputGroup>
                          {errors.entryPointOther !== "" ? (
                            <span className={classes.error}>
                              {errors.entryPointOther}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {infantInfo.birthOutcome !== "Dead" && (
                <>
                  {/* === Infant Prophylaxis === */}
                  <div className="col-md-12 mb-3 mt-3">
                    <div style={sectionContainerStyle}>
                      <h6 style={sectionHeaderStyle}>
                        <LocalHospitalIcon style={sectionIconStyle} />
                        Infant Prophylaxis
                      </h6>
                      <div className="row">
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>CTX </FormLabelName>
                            <Input
                              type="select"
                              name="ctxStatus"
                              id="ctxStatus"
                              value={infantInfo.ctxStatus}
                              onChange={handleInputChangeinfantInfoDto}
                              disabled={disabledField}
                            >
                              <option value="">Select </option>
                              <option value="YES">YES </option>
                              <option value="NO">NO </option>
                            </Input>
                            {errors.ctxStatus !== "" ? (
                              <span className={classes.error}>
                                {errors.ctxStatus}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        {infantInfo.ctxStatus === "YES" && (
                          <div className=" mb-3 col-md-4">
                            <FormGroup>
                              <FormLabelName>
                                Date of CTX initiation
                              </FormLabelName>
                              <Input
                                type="date"
                                onKeyPress={(e) => {
                                  e.preventDefault();
                                }}
                                name="dateOfCtx"
                                id="dateOfCtx"
                                value={infantArvDto.dateOfCtx}
                                onChange={handleInputChangeInfantArvDto}
                                min={infantInfo.dateOfDelivery}
                                max={moment(new Date()).format("YYYY-MM-DD")}
                                disabled={disabledField}
                              />
                              {errors.dateOfCtx !== "" ? (
                                <span className={classes.error}>
                                  {errors.dateOfCtx}
                                </span>
                              ) : (
                                ""
                              )}
                            </FormGroup>
                          </div>
                        )}

                        {infantInfo.ctxStatus === "YES" && (
                          <div className=" mb-3 col-md-4 ">
                            <FormGroup>
                              <FormLabelName>
                                Age at CTX Initiation (weeks)
                              </FormLabelName>
                              <Input
                                type="text"
                                name="ageAtCtx"
                                id="ageAtCtx"
                                value={infantArvDto.ageAtCtx}
                                disabled={true}
                                readOnly
                              />
                            </FormGroup>
                          </div>
                        )}
                        <div className=" mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>
                              Infant ARV Prophylaxis Type{" "}
                            </FormLabelName>
                            <Input
                              type="select"
                              name="infantArvType"
                              id="infantArvType"
                              value={infantArvDto.infantArvType}
                              onChange={handleInputChangeInfantArvDto}
                              disabled={disabledField}
                            >
                              <option value="">Select </option>
                              {infantArv.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                            {errors.infantArvType !== "" ? (
                              <span className={classes.error}>
                                {errors.infantArvType}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>

                        {infantArvDto.infantArvType ===
                          "TYPE_PROPHYLAXIS_OTHER_(SPECIFY)" && (
                          <div className=" mb-3 col-md-4">
                            <FormGroup>
                              <FormLabelName>
                                Specify <span style={{ color: "red" }}> *</span>
                              </FormLabelName>
                              <Input
                                type="text"
                                name="otherArvType"
                                id="otherArvType"
                                value={infantArvDto.otherArvType}
                                onChange={handleInputChangeInfantArvDto}
                                disabled={disabledField}
                              />
                              {errors.otherArvType !== "" ? (
                                <span className={classes.error}>
                                  {errors.otherArvType}
                                </span>
                              ) : (
                                ""
                              )}
                            </FormGroup>
                          </div>
                        )}

                        {infantArvDto.infantArvType &&
                          infantArvDto.infantArvType !==
                            "TYPE_PROPHYLAXIS_NONE" && (
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Date of ARV Prophylaxis
                                </FormLabelName>
                                <Input
                                  type="date"
                                  onKeyPress={(e) => {
                                    e.preventDefault();
                                  }}
                                  name="dateOfArv"
                                  id="dateOfArv"
                                  value={infantArvDto.dateOfArv}
                                  onChange={handleInputChangeInfantArvDto}
                                  min={infantInfo.dateOfDelivery}
                                  max={moment(new Date()).format("YYYY-MM-DD")}
                                  disabled={disabledField}
                                />
                                {errors.dateOfArv !== "" ? (
                                  <span className={classes.error}>
                                    {errors.dateOfArv}
                                  </span>
                                ) : (
                                  ""
                                )}
                              </FormGroup>
                            </div>
                          )}

                        {infantArvDto.infantArvType &&
                          infantArvDto.infantArvType !==
                            "TYPE_PROPHYLAXIS_NONE" && (
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  {" "}
                                  Age at ARV Initiation (weeks){" "}
                                </FormLabelName>
                                <Input
                                  type="text"
                                  name="arvAgeAtInitiation"
                                  id="arvAgeAtInitiation"
                                  value={
                                    arvAgeAtInitiation !== ""
                                      ? arvAgeAtInitiation
                                      : ""
                                  }
                                  disabled={true}
                                  readOnly
                                />
                              </FormGroup>
                            </div>
                          )}

                        {infantArvDto.infantArvType &&
                          infantArvDto.infantArvType !==
                            "TYPE_PROPHYLAXIS_NONE" && (
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  {" "}
                                  Date of ARV Completion{" "}
                                </FormLabelName>
                                <Input
                                  type="date"
                                  onKeyPress={(e) => {
                                    e.preventDefault();
                                  }}
                                  name="dateOfArvCompletion"
                                  id="dateOfArvCompletion"
                                  value={infantArvDto.dateOfArvCompletion}
                                  onChange={handleInputChangeInfantArvDto}
                                  min={infantArvDto.dateOfArv}
                                  max={moment(new Date()).format("YYYY-MM-DD")}
                                  disabled={disabledField}
                                />
                                {errors.dateOfArvCompletion !== "" ? (
                                  <span className={classes.error}>
                                    {errors.dateOfArvCompletion}
                                  </span>
                                ) : (
                                  ""
                                )}
                              </FormGroup>
                            </div>
                          )}
                        <div className=" mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName> Place of Delivery </FormLabelName>
                            <Input
                              type="select"
                              name="arvDeliveryPoint"
                              id="arvDeliveryPoint"
                              value={infantArvDto.arvDeliveryPoint}
                              onChange={handleInputChangeInfantArvDto}
                              disabled={disabledField}
                            >
                              <option value="select">Select </option>
                              <option value="Facility Delivery">
                                Facility Delivery
                              </option>
                              <option value="Delivered outside facility">
                                Delivered outside facility{" "}
                              </option>
                            </Input>
                            {errors.arvDeliveryPoint !== "" ? (
                              <span className={classes.error}>
                                {errors.arvDeliveryPoint}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                  {motherSyphilisPositive && (
                    <>
                      {/* === Syphilis Prophylaxis / Treatment === */}
                      <div className="col-md-12 mb-3 mt-3">
                        <div style={sectionContainerStyle}>
                          <h6 style={sectionHeaderStyle}>
                            <HealingIcon style={sectionIconStyle} />
                            Syphilis Prophylaxis / Treatment
                          </h6>
                          <div className="row">
                            {/* Pre-filled mother's syphilis info from HTS/ANC */}
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>Syphilis Testing</FormLabelName>
                                <Input
                                  type="text"
                                  value={motherSyphilisTestResult}
                                  disabled={true}
                                  readOnly
                                />
                              </FormGroup>
                            </div>
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Syphilis Treatment
                                </FormLabelName>
                                <Input
                                  type="text"
                                  value={motherSyphilisTreatment}
                                  disabled={true}
                                  readOnly
                                />
                              </FormGroup>
                            </div>
                          </div>
                          <div className="row">
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Date of Initiation
                                </FormLabelName>
                                <Input
                                  type="date"
                                  onKeyPress={(e) => {
                                    e.preventDefault();
                                  }}
                                  name="dateOfInitiation"
                                  id="syphilisDateOfInitiation"
                                  value={syphilisData.dateOfInitiation}
                                  onChange={handleInputChangeSyphilis}
                                  min={infantInfo.dateOfDelivery}
                                  max={moment(new Date()).format("YYYY-MM-DD")}
                                  disabled={disabledField}
                                />
                              </FormGroup>
                            </div>

                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Age at Initiation (weeks)
                                </FormLabelName>
                                <Input
                                  type="text"
                                  name="ageAtInitiation"
                                  id="syphilisAgeAtInitiation"
                                  value={syphilisData.ageAtInitiation}
                                  disabled={true}
                                  readOnly
                                />
                              </FormGroup>
                            </div>

                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Type of Prophylaxis / Treatment
                                </FormLabelName>
                                <Input
                                  type="select"
                                  name="typeOfProphylaxis"
                                  id="syphilisTypeOfProphylaxis"
                                  value={syphilisData.typeOfProphylaxis}
                                  onChange={handleInputChangeSyphilis}
                                  disabled={disabledField}
                                >
                                  <option value="">Select </option>
                                  <option value="BPG (single dose)">
                                    BPG (single dose)
                                  </option>
                                  <option value="BPG (3 doses)">
                                    BPG (3 doses)
                                  </option>
                                  <option value="Procaine Penicillin G">
                                    Procaine Penicillin G
                                  </option>
                                  <option value="Aqueous Crystalline Penicillin G">
                                    Aqueous Crystalline Penicillin G
                                  </option>
                                </Input>
                              </FormGroup>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* === HBV Vaccination Schedule === */}
                  <div className="col-md-12 mb-3 mt-3">
                    <div style={sectionContainerStyle}>
                      <h6 style={sectionHeaderStyle}>
                        <EventIcon style={sectionIconStyle} />
                        HBV Vaccination Schedule
                      </h6>
                      <div className="row">
                        {hbvVaccinations.map((vac, index) => (
                          <React.Fragment key={index}>
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>{vac.dose}</FormLabelName>
                                <Input
                                  type="text"
                                  value={vac.dose}
                                  disabled={true}
                                />
                              </FormGroup>
                            </div>
                            <div className=" mb-3 col-md-4">
                              <FormGroup>
                                <FormLabelName>
                                  Date of Vaccination
                                </FormLabelName>
                                <Input
                                  type="date"
                                  onKeyPress={(e) => {
                                    e.preventDefault();
                                  }}
                                  value={vac.dateOfVaccination}
                                  onChange={(e) =>
                                    handleHbvChange(
                                      index,
                                      "dateOfVaccination",
                                      e.target.value,
                                    )
                                  }
                                  min={
                                    index > 0 &&
                                    hbvVaccinations[index - 1].dateOfVaccination
                                      ? moment(
                                          hbvVaccinations[index - 1]
                                            .dateOfVaccination,
                                        )
                                          .add(28, "days")
                                          .format("YYYY-MM-DD")
                                      : infantInfo.dateOfDelivery
                                  }
                                  max={moment(new Date()).format("YYYY-MM-DD")}
                                  disabled={disabledField}
                                />
                                {hbvErrors[`hbv_${index}_dateOfVaccination`] ? (
                                  <span className={classes.error}>
                                    {
                                      hbvErrors[
                                        `hbv_${index}_dateOfVaccination`
                                      ]
                                    }
                                  </span>
                                ) : (
                                  ""
                                )}
                              </FormGroup>
                            </div>
                            {vac.doseNumber === 1 ? (
                              <div className=" mb-3 col-md-4">
                                <FormGroup>
                                  <FormLabelName>Timing</FormLabelName>
                                  <Input
                                    type="select"
                                    value={vac.timing}
                                    onChange={(e) =>
                                      handleHbvChange(
                                        index,
                                        "timing",
                                        e.target.value,
                                      )
                                    }
                                    disabled={disabledField}
                                  >
                                    <option value="">Select </option>
                                    <option value="Within 24 hours">
                                      Within 24 hours
                                    </option>
                                    <option value="After 24 hours">
                                      After 24 hours
                                    </option>
                                  </Input>
                                </FormGroup>
                              </div>
                            ) : (
                              <div
                                className=" mb-3 col-md-4"
                                style={{
                                  display: "flex",
                                  alignItems: "flex-end",
                                  paddingBottom: "16px",
                                }}
                              >
                                {index === hbvVaccinations.length - 1 &&
                                  !disabledField && (
                                    <MatButton
                                      variant="contained"
                                      style={{
                                        backgroundColor: "#992E62",
                                        color: "#fff",
                                        marginRight: "5px",
                                      }}
                                      onClick={() => removeHbvDose(index)}
                                      size="small"
                                    >
                                      Remove
                                    </MatButton>
                                  )}
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                        {hbvVaccinations.length < 3 && !disabledField && (
                          <div className="col-md-12 mb-3">
                            <MatButton
                              variant="contained"
                              style={{
                                backgroundColor: "#014d88",
                                color: "#fff",
                              }}
                              onClick={addHbvDose}
                              size="small"
                            >
                              + Add HBV Dose
                            </MatButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* === Infant PCR / HIV Test === */}
                  <div className="col-md-12 mb-3 mt-3">
                    <div style={sectionContainerStyle}>
                      <h6 style={sectionHeaderStyle}>
                        <AssignmentIcon style={sectionIconStyle} />
                        Infant PCR Testing
                      </h6>
                      <div className="row">
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName> Sample Type</FormLabelName>
                            <Input
                              type="select"
                              name="testType"
                              id="testType"
                              value={infantPCRTestDto.testType}
                              onChange={handleInputChangeInfantPCRTestDto}
                              disabled={disabledField}
                              // disabled
                            >
                              <option value="">Select </option>

                              {PCRList.length > 0 &&
                                PCRList.map((each, index) => {
                                  return (
                                    <option value={each.code}>
                                      {each.display}
                                    </option>
                                  );
                                })}
                            </Input>
                            {errors.testType !== "" ? (
                              <span className={classes.error}>
                                {errors.testType}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>Date sample collected</FormLabelName>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="dateSampleCollected"
                              id="dateSampleCollected"
                              value={infantPCRTestDto.dateSampleCollected}
                              onChange={handleInputChangeInfantPCRTestDto}
                              min={infantInfo.dateOfDelivery}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              disabled={disabledField}
                            />
                            {errors.dateSampleCollected !== "" ? (
                              <span className={classes.error}>
                                {errors.dateSampleCollected}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>Date Sample Sent</FormLabelName>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="dateSampleSent"
                              id="dateSampleSent"
                              value={infantPCRTestDto.dateSampleSent}
                              onChange={handleInputChangeInfantPCRTestDto}
                              min={infantPCRTestDto.dateSampleCollected}
                              // max={infantPCRTestDto.dateResultReceivedAtFacility}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              disabled={disabledField}
                            />
                            {errors.dateSampleSent !== "" ? (
                              <span className={classes.error}>
                                {errors.dateSampleSent}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>

                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>Date Result Received</FormLabelName>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="dateResultReceivedAtFacility"
                              id="dateResultReceivedAtFacility"
                              value={
                                infantPCRTestDto.dateResultReceivedAtFacility
                              }
                              onChange={handleInputChangeInfantPCRTestDto}
                              min={infantPCRTestDto.dateSampleSent}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              disabled={disabledField}
                            />
                            {errors.dateResultReceivedAtFacility !== "" ? (
                              <span className={classes.error}>
                                {errors.dateResultReceivedAtFacility}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>
                              Date Result Received By Caregiver
                            </FormLabelName>
                            <Input
                              type="date"
                              onKeyPress={(e) => {
                                e.preventDefault();
                              }}
                              name="dateResultReceivedByCaregiver"
                              id="dateResultReceivedByCaregiver"
                              value={
                                infantPCRTestDto.dateResultReceivedByCaregiver
                              }
                              onChange={handleInputChangeInfantPCRTestDto}
                              min={
                                infantPCRTestDto.dateResultReceivedAtFacility
                              }
                              max={moment(new Date()).format("YYYY-MM-DD")}
                              disabled={disabledField}
                            />
                            {errors.dateResultReceivedByCaregiver !== "" ? (
                              <span className={classes.error}>
                                {errors.dateResultReceivedByCaregiver}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>

                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>Age at Test</FormLabelName>
                            <Input
                              type="select"
                              name="ageAtTest"
                              id="ageAtTest"
                              value={infantPCRTestDto.ageAtTest}
                              onChange={handleInputChangeInfantPCRTestDto}
                              disabled={true}
                            >
                              <option value="select">Select </option>
                              <option value="CHILD_TEST_AGE_<_72_HRS">
                                &lt;72 hrs
                              </option>
                              <option value="CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS">
                                &gt;72 hrs - &lt; 2 months
                              </option>
                              <option value="CHILD_TEST_AGE_2-12_MONTHS">
                                2-12 months
                              </option>
                              <option value="CHILD_TEST_AGE_>12_MONTHS">
                                &gt;12 months
                              </option>
                            </Input>
                            <small
                              style={{
                                color: "#667",
                                display: "block",
                                marginTop: "4px",
                              }}
                            >
                              Auto-calculated from the date of delivery and
                              sample collection date
                            </small>
                            {errors.ageAtTest !== "" ? (
                              <span className={classes.error}>
                                {errors.ageAtTest}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                          <FormGroup>
                            <FormLabelName>Result *</FormLabelName>
                            <Input
                              type="select"
                              name="results"
                              id="results"
                              value={infantPCRTestDto.results}
                              onChange={handleInputChangeInfantPCRTestDto}
                              disabled={disabledField}
                            >
                              <option value="select">Select </option>
                              {pcrResult.map((value) => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                            </Input>
                            {errors.results !== "" ? (
                              <span className={classes.error}>
                                {errors.results}
                              </span>
                            ) : (
                              ""
                            )}
                          </FormGroup>
                        </div>
                      </div>
                      {/* Display notification based on PCR result */}
                      {infantPCRTestDto.results ===
                        "INFANT_PCR_RESULT_POSITIVE" && (
                        <div
                          style={{
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "4px",
                            padding: "10px",
                            margin: "10px 0",
                          }}
                        >
                          <h4 style={{ color: "#856404", margin: 0 }}>
                            {props.activeContent?.actionType === "create"
                              ? "You have selected a Positive PCR result."
                              : "A positive PCR result has been recorded for this infant."}
                          </h4>
                          <p style={{ color: "#856404", margin: "5px 0 0 0" }}>
                            {props.activeContent?.actionType === "create"
                              ? "After saving this registration, a Confirmatory PCR will need to be documented on the Infant Follow-up Visit form. The infant will not be classified as confirmed HIV-positive until the Confirmatory PCR result is entered."
                              : "A Confirmatory PCR is required. Please document it on the Infant Follow-up Visit form. The infant cannot be classified as confirmed HIV-positive until the Confirmatory PCR result is entered."}
                          </p>
                        </div>
                      )}
                      {infantPCRTestDto.results ===
                        "INFANT_PCR_RESULT_INDETERMINATE" && (
                        <div
                          style={{
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "4px",
                            padding: "10px",
                            margin: "10px 0",
                          }}
                        >
                          <h4 style={{ color: "#856404", margin: 0 }}>
                            {props.activeContent?.actionType === "create"
                              ? "You have selected an Indeterminate PCR result."
                              : "An Indeterminate PCR result has been recorded for this infant."}
                          </h4>
                          <p style={{ color: "#856404", margin: "5px 0 0 0" }}>
                            {props.activeContent?.actionType === "create"
                              ? "After saving, a repeat PCR test will need to be scheduled. The infant record cannot be closed with an Indeterminate result as the final status."
                              : "A repeat PCR test is required. The infant record cannot be closed with an Indeterminate result as the final status. Please schedule a repeat PCR test."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {/* <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >National Identity  Number(NIN)</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="nin"
                                    id="nin"
                                    onChange={handleInputChangeinfantInfoDto}
                                    value={infantInfo.nin} 
                                    disabled={disabledField}
                                />

                            </InputGroup>
                            {errors.nin !=="" ? (
                                    <span className={classes.error}>{errors.nin}</span>
                            ) : "" }
                            </FormGroup>
                    </div> */}
            </div>

            {saving ? <Spinner /> : ""}
            <br />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              {props.activeContent &&
              props.activeContent.actionType === "update" ? (
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
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
                  type="submit"
                  variant="contained"
                  color="primary"
                  hidden={hospitalNumStatus}
                  className={classes.button}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                  style={{ backgroundColor: "#014d88" }}
                  onClick={handleSubmit}
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
              <MatButton
                type="button"
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                style={{ backgroundColor: "#992E62", color: "#fff" }}
                onClick={() => LoadPage()}
              >
                <span style={{ textTransform: "capitalize" }}>Back</span>
              </MatButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LabourinfantInfo;
