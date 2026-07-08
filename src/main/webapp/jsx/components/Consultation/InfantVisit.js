import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label as FormLabelName,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import HealingIcon from "@material-ui/icons/Healing";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import EventIcon from "@material-ui/icons/Event";
import AssessmentIcon from "@material-ui/icons/Assessment";
import FavoriteIcon from "@material-ui/icons/Favorite";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
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



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: 'none',
  borderRadius: "5px",
  boxShadow: 24,
  pt: "40px",
  px: 4,
  pb: 3,
};

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
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const cancelClose = () => {
    setInfantPCRTestDto({
      ...infantPCRTestDto,
      testType: "",
    });
    setOpen(false);

  };
  //console.log(patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate)
  const [errors, setErrors] = useState({});
  const [infantHospitalNumber, setInfantHospitalNumber] = useState();
  let temp = { ...errors };
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [infants, setInfants] = useState([]);
  const [formFilter, setFormFilter] = useState({
    infantArv: false,
    motherArt: false,
    outCome: false,
  });
  const [visitDateStatus, setVisitDateStatus] = useState(false);
  const [showRapidTest, setshowRapidTest] = useState(false);
  const [disableRapidField, setDisableRapidField] = useState(false);
  const [infantRecordClosed, setInfantRecordClosed] = useState(false);
  const [infantClosedOutcome, setInfantClosedOutcome] = useState("");
  const [arvFilledAtRegistration, setArvFilledAtRegistration] = useState(false);
  const [registrationArvData, setRegistrationArvData] = useState(null);
  const [registrationCtxStatus, setRegistrationCtxStatus] = useState("");

  const [ageAtTestList, setAtTestList] = useState([]);
  const [genders, setGenders] = useState([]);
  const [timingOfArtInitiation, setTimingOfArtInitiation] = useState([]);
  const [childStatus, setChildStatus] = useState([]);
  const [timeMotherArt, setTimeMotherArt] = useState([]);
  const [regimenType, setRegimenType] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [choosenInfant, setChoosenInfant] = useState({});
  const [infantArv, setInfantArv] = useState([]);
  const [agectx, setAgeCTX] = useState([]);
  const [pcrResult, setPcrResult] = useState([]);
  const [infantOutcome, setInfantOutcome] = useState([]);
  const [disabledField, setDisabledField] = useState(false);
  const [objValues, setObjValues] = useState({
    source: "WEB",

    infantVisitRequestDto: "",
    infantArvDto: {
      ageAtCtx: "",
      ancNumber: "",
      arvDeliveryPoint: "",
      infantArvTime: "",
      infantArvType: "",
      infantHospitalNumber: "",
      timingOfAvrWithin72Hours: "",
      timingOfAvrAfter72Hours: "",
      otherProphylaxisType: "",
      id: "",
      uuid: "",
      uniqueUuid: "",
      dateOfCtx: "",
    },
    // infantMotherArtDto: "",
    infantPCRTestDto: {
      ageAtTest: "",
      ancNumber: "",
      dateResultReceivedAtFacility: "",
      dateResultReceivedByCaregiver: "",
      dateSampleCollected: "",
      dateSampleSent: "",
      infantHospitalNumber: "",
      results: "",
      testType: "",
      id: "",
      uuid: "",
      uniqueUuid: "",
    },
  });
  const [rapidResultMessage, setRapidResultMessage] = useState("Kindly fill ART form");

  const [timingProphylaxisList, setTimingProphylaxisList] = useState([]);
  const [weeksValues, setWeeksValue] = useState(0);
  const [referToART, setReferToART] = useState(false);
  const [placeOfDelivery, setPlaceOfDelivery] = useState([]);
  const [pcrType, setPcrType] = useState([]);
  const pcrTypeFullRef = useRef([]);
  const currentVisitPCRTypeRef = useRef(null);
  const visitHasOwnArvRef = useRef(false);
  const [latestPCR, setLatestPCR] = useState({});
  const [latestRapidTest, setLatestRapidTest] = useState({});
  const [showInfantVist, setShowInfantVist] = useState(true);

 const [HEIprompt, setHEIPrompt] = useState(true);
 const [duePCR, setDuePCR] = useState('');

  const [PCRValidity, setPCRValidilty] = useState({nextPCR: "", childAge: ""});

  const [infantVisitRequestDto, setInfantVisitRequestDto] = useState({
    // ageAtCtx: "",
    patientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid
      ? props.patientObj.patientUuid
      : "",
    ancNumber: props.patientObj.ancNo,
    bodyWeight: "",
    breastFeeding: "",
    // ctxStatus: "",
    infantHospitalNumber: "",
    visitDate: "",
    visitStatus: "",
    infantOutcomeAt18Months: "",
    dateLinkedToArtClinic: "",
    artEnrollmentNo: "",
    comments: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
    ctxStatus:  "" ,
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
  });
  const [infantArvDto, setInfantArvDto] = useState({
    ageAtCtx: "" ,
    ancNumber: "",
    arvDeliveryPoint: "",
    infantArvTime: "",
    infantArvType: "",
    infantHospitalNumber: "",
    timingOfAvrWithin72Hours: "",
    timingOfAvrAfter72Hours: "",
    otherProphylaxisType: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
    dateOfCtx: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
  });
  const [infantMotherArtDto, setInfantMotherArtDto] = useState({
    ancNumber: props.patientObj.ancNo,
    motherArtInitiationTime: "",
    motherCurrentArtStatus: "",
    // motherArtRegimen: "",
    regimenTypeId: "",
    regimenId: "",
    whyArtUnknown: "",
    syphilisTreatmentReferral: "",
    syphilisTreatmentStartDate: "",
    hbvTreatmentProphylaxis: "",
    hbvTreatmentStartDate: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
  });

  const [infantPCRTestDto, setInfantPCRTestDto] = useState({
    ageAtTest: "",
    ancNumber: props.patientObj.ancNo,
    dateResultReceivedAtFacility: "",
    dateResultReceivedByCaregiver: "",
    dateSampleCollected: "",
    dateSampleSent: "",
    infantHospitalNumber: "",
    results: "",
    testType: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
  });

  const [infantRapidTestDTO, setInfantRapidTestDTO] = useState({
    rapidTestType: "",
    ageAtTest: "",
    dateOfTest: "",
    result: "",
    ancNumber: props.patientObj.ancNo,
    uniqueUuid: "",
    uuid: "",
    pmtctCycleUuid: props?.latestPmtctCycle?.uuid,
    motherPatientUuid: props.patientObj.patient_uuid
      ? props.patientObj.patient_uuid
      : props.patientObj.patientUuid,
  });

  const [hbvVaccinationDto, setHbvVaccinationDto] = useState({
    firstDoseBirthDoseDate: "",
    timingOfVaccination: "",
    secondDoseDate: "",
    thirdDoseDate: "",
  });

  const [hbvFromRegistration, setHbvFromRegistration] = useState({
    firstDoseBirthDoseDate: false,
    timingOfVaccination: false,
    secondDoseDate: false,
    thirdDoseDate: false,
  });

  const mapRegistrationHbvToVisit = (hbvVaccinations) => {
    const prefilled = { firstDoseBirthDoseDate: "", timingOfVaccination: "", secondDoseDate: "", thirdDoseDate: "" };
    const fromReg = { firstDoseBirthDoseDate: false, timingOfVaccination: false, secondDoseDate: false, thirdDoseDate: false };
    if (!hbvVaccinations || hbvVaccinations.length === 0) return { prefilled, fromReg };
    hbvVaccinations.forEach((vac) => {
      if (vac.doseNumber === 1 || vac.dose === "First Dose (Birth Dose)") {
        if (vac.dateOfVaccination) { prefilled.firstDoseBirthDoseDate = vac.dateOfVaccination; fromReg.firstDoseBirthDoseDate = true; }
        if (vac.timing) { prefilled.timingOfVaccination = vac.timing; fromReg.timingOfVaccination = true; }
      } else if (vac.doseNumber === 2 || vac.dose === "Second Dose") {
        if (vac.dateOfVaccination) { prefilled.secondDoseDate = vac.dateOfVaccination; fromReg.secondDoseDate = true; }
      } else if (vac.doseNumber === 3 || vac.dose === "Third Dose") {
        if (vac.dateOfVaccination) { prefilled.thirdDoseDate = vac.dateOfVaccination; fromReg.thirdDoseDate = true; }
      }
    });
    return { prefilled, fromReg };
  };

  const handleInputChangeHbvVaccinationDto = (e) => {
    setHbvVaccinationDto({
      ...hbvVaccinationDto,
      [e.target.name]: e.target.value,
    });
  };

  const [motherSyphilisPositive, setMotherSyphilisPositive] = useState(false);
  const [motherSyphilisTestResult, setMotherSyphilisTestResult] = useState("");
  const [motherSyphilisTreatment, setMotherSyphilisTreatment] = useState("");
  const [syphilisData, setSyphilisData] = useState({
    dateOfInitiation: "",
    ageAtInitiation: "",
    typeOfProphylaxis: "",
  });

  const handleInputChangeSyphilis = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "dateOfInitiation") {
      const deliveryDate = moment(choosenInfant.dateOfDelivery);
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

  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
  });

  const [expectedPCR, setExpectedPCR] = useState("");
  const [pcrMessage, setPcrMessage] = useState("");

  const [infantRapidTestList, setInfantRapidTestList] = useState(["First Rapid Antibody", "Second Rapid Antibody"]);



   
   // BATCH API
  const GET_CODESETS = () => {
 
    GET_CODESETS_IN_BATCH("SEX", "TIME_ART_INITIATION_PMTCT", "CHILD_FOLLOW_UP_VISIT_STATUS", "TIMING_MOTHERS_ART_INITIATION", "AGE_CTX_INITIATION",  "INFANT_ARV_PROPHYLAXIS_TYPE", "INFANT_PCR_RESULT", "INFANT_OUTCOME_AT_18_MONTHS", "PLACE_OF_DELIVERY", "INFANT_TESTING_PCR", "TIMING_PROPHYLAXIS_WITHIN_72HRS").then((response)=>{
        setGenders(response.data.SEX);
        setTimingOfArtInitiation(response.data.TIME_ART_INITIATION_PMTCT);
        setChildStatus(response.data.CHILD_FOLLOW_UP_VISIT_STATUS);
        setTimeMotherArt(response.data.TIMING_MOTHERS_ART_INITIATION);
        setAgeCTX(response.data.AGE_CTX_INITIATION);
        setInfantArv(response.data.INFANT_ARV_PROPHYLAXIS_TYPE);
        setPcrResult(response.data.INFANT_PCR_RESULT);
        setInfantOutcome(response.data.INFANT_OUTCOME_AT_18_MONTHS);
        setPlaceOfDelivery(response.data.PLACE_OF_DELIVERY);
        // Only store the full PCR list in the ref — do NOT call setPcrType here.
        // setPcrType is called by getLatestPCR() after filtering to the correct next type.
        // Calling it here would override the filtered list due to a race condition.
        pcrTypeFullRef.current = response.data.INFANT_TESTING_PCR;
        setTimingProphylaxisList(response.data.TIMING_PROPHYLAXIS_WITHIN_72HRS);


    })
   
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

  const calculateAgeAtTestMonth = (weeks) => {
    if (weeks < 7) {
      // setInfantPCRTestDto({ ...infantPCRTestDto, testType: "First PCR" });
      axios
        .get(`${baseUrl}application-codesets/v2/1ST PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {});
    }
    if (weeks > 11) {
      // setInfantPCRTestDto({ ...infantPCRTestDto, testType: "Second PCR" });
      axios
        .get(`${baseUrl}application-codesets/v2/2ND_3RD_PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
    }
  };
  const filterOutTheChosenChildForView = (child) => {
    let patientUuid= props.patientObj.patient_uuid
            ? props.patientObj.patient_uuid
            : props.patientObj.patientUuid
            ? props.patientObj.patientUuid
            : props.patientObj.uuid
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${patientUuid}?pmtctCycleUuid=${props?.latestPmtctCycle?.uuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        let resultInfo = response.data.filter((each) => {
          return each.hospitalNumber.toString() === child.toString();
        });

        let weeks = calculateAgeInWeek(resultInfo[0].dateOfDelivery);

        calculateAgeAtTestMonth(weeks);
        getLatestPCR(resultInfo[0].hospitalNumber);
        getLatestRapidTest(
          resultInfo[0].hospitalNumber,
          resultInfo[0].patientUuid
        );
        setChoosenInfant(resultInfo[0]);
        // For view/update: if the visit didn't save its own ARV but registration has it, show as read-only
        const infant = resultInfo[0];
        if (infant.infantArvDto && infant.infantArvDto.infantArvType && !visitHasOwnArvRef.current) {
          setArvFilledAtRegistration(true);
          setRegistrationArvData(infant.infantArvDto);
          setRegistrationCtxStatus(infant.ctxStatus || "");
        }
        // Mark HBV doses from registration as read-only
        const { fromReg } = mapRegistrationHbvToVisit(infant.hbvVaccinations);
        setHbvFromRegistration(fromReg);
      })

      .catch((error) => {
        //console.log(error);
      });
  };

  const validateChildPCRAge =(inputedPCR)=>{

      let deliveryDate = moment(choosenInfant.dateOfDelivery);
      let vistDate  = moment(infantVisitRequestDto.visitDate);

    // if(inputedPCR === PCRValidity.nextPCR.code){
    //     console.log(inputedPCR, PCRValidity.nextPCR)
    // }else{
    //   handleOpen()
    // }

    if(inputedPCR ===  "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT"){
        // child age should less than 72 hours 
          if(vistDate.diff(deliveryDate, 'days') > 72){
            setPcrMessage("Child’s age exceeds recommended range for 1st PCR. Confirm documentation?")
            handleOpen()
          }
    }else if(inputedPCR ===  "INFANT_TESTING_PCR_2ND_PCR_12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED"){
      if(vistDate.diff(deliveryDate, 'weeks') > 6 ){
        setPcrMessage("Child’s age exceeds recommended range for 2nd PCR. Confirm documentation?")
        handleOpen()
      }else if(vistDate.diff(deliveryDate, 'weeks') < 4){
        setPcrMessage("Child’s age is below recommended range for 2nd PCR. Confirm documentation?")
        handleOpen()
      }
    }
    else if(inputedPCR ===   "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE"){
      if(vistDate.diff(deliveryDate, 'months') > 9){
        setPcrMessage("Child’s age exceeds recommended range for 3rd PCR. Confirm documentation?")
        handleOpen()
      }
    }
    else if(inputedPCR ===  "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)"){
        if(vistDate.diff(deliveryDate, 'weeks') > 52){
          setPcrMessage("Child’s age is below recommended range for 4th PCR. Confirm documentation?")
          handleOpen()
        }else if(vistDate.diff(deliveryDate, 'weeks') > 46){

        }

    }
    else if(inputedPCR ===  "INFANT_TESTING_PCR_CONFIRMATORY_PCR"){


      if(latestPCR?.results !== "INFANT_PCR_RESULT_POSITIVE"){
        let pcrRes= latestPCR?.results?.includes("POSITIVE")? "Positive": latestPCR?.results?.includes("NEGATIVE")? "Negative": "Indeterminate"
        setPcrMessage(`Last PCR test result is ${pcrRes}, reconfirm input`)
        handleOpen()
      }

    }

  }
  const validateChildRapidTest =(visitDate)=>{
    let deliveryDate = moment(choosenInfant.dateOfDelivery);
    let vistDate  = moment(visitDate);

    // If rapid test is positive, prompt for 3rd PCR (per PCR flow diagram)
    if(vistDate.diff(deliveryDate, 'months') >= 9 &&  latestRapidTest?.result === "INFANT_PCR_RESULT_POSITIVE"  && !latestPCR?.results){
      setRapidResultMessage("Rapid Antibody Test is Positive. Kindly complete a 3rd PCR (DNA PCR @ 9 months).")
      // Re-activate 3rd PCR in dropdown
      const newPCRList = pcrTypeFullRef.current || [];
      const thirdPCR = newPCRList.filter(each => each.code === "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE");
      if (thirdPCR.length > 0) {
        setPcrType(thirdPCR);
      }
    }
    // If rapid test is negative, show 4th PCR
    if(vistDate.diff(deliveryDate, 'months') >= 9 &&  latestRapidTest?.result === "INFANT_PCR_RESULT_NEGATIVE"){
      const newPCRList = pcrTypeFullRef.current || [];
      const fourthPCR = newPCRList.filter(each => each.code === "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)");
      if (fourthPCR.length > 0) {
        setPcrType(fourthPCR);
      }
    }

  }
  const calculateAgeAtCTX  =(dateaOfCTX)=>{
    let deliveryDate = moment(choosenInfant.dateOfDelivery);
    let lastCTX  = moment(dateaOfCTX);
        if(lastCTX.diff(deliveryDate, 'months')  < 2){
          return "AGE_CTX_INITIATION_<_2__MONTHS";        
        }else{

          return "AGE_CTX_INITIATION_≥_2__MONTHS";           
        
        }

  }


  const checkRapidTestValidity  =(dateOfVisit)=>{
    let deliveryDate = moment(choosenInfant.dateOfDelivery);
    let vistDate  = moment(dateOfVisit);

    let childAge = vistDate.diff(deliveryDate, 'months')

    let hasDonePCRTest = choosenInfant?.infantPCRTestDto?.id ? true : false

        if(childAge  >= 9 && hasDonePCRTest){
          setshowRapidTest(true)

          // Per PCR flow diagram:
          // 1st Rapid @9mo: after 2nd PCR negative
          // 2nd Rapid @18mo: after 4th PCR negative
          if(childAge >= 18 && latestPCR?.testType?.includes("4TH_PCR") && latestPCR?.results?.includes("NEGATIVE")){
            setInfantRapidTestList(["Second Rapid Antibody"])
          } else if(latestPCR?.testType?.includes("2ND_PCR") && latestPCR?.results?.includes("NEGATIVE")){
            setInfantRapidTestList(["First Rapid Antibody"])
          } else {
            // Default: show based on age
            if(childAge >= 18){
              setInfantRapidTestList(["First Rapid Antibody", "Second Rapid Antibody"])
            } else {
              setInfantRapidTestList(["First Rapid Antibody"])
            }
          }

        }else{
          setshowRapidTest(false)

  }}

  const checkPCRValidity  =(dateOfVisit)=>{
    let deliveryDate = moment(choosenInfant.dateOfDelivery);
    let vistDate  = moment(dateOfVisit);

    let childAge = vistDate.diff(deliveryDate, 'months')


    let nextPCR ;
    let orderOfPCR= ["1ST_PCR", "2ND_PCR","IF_PREVIOUS_TEST_POSITIVE","4TH_PCR" ] 
    // check if the child has PCR
    if(choosenInfant?.infantPCRTestDto?.id){

      let lastPCR = latestPCR?.testType
   
      // check next expected PCR 

      //checking for confirmatory
    if(latestPCR?.results === "INFANT_PCR_RESULT_POSITIVE"){
 
              pcrType.map((each, index )=>{

                if(each.code ===  "INFANT_TESTING_PCR_CONFIRMATORY_PCR"){
                  nextPCR =each  
                  setExpectedPCR(each.code)
                }

              })
                  
        }else{
      
        orderOfPCR.map((each, index)=>{

          if(lastPCR && lastPCR.includes(each)){
              let theindex = index + 1
            //get the index and next pcr
                if(theindex < orderOfPCR.length  ){
                  pcrType.map((each, index )=>{

                    if(each.code?.includes( orderOfPCR[theindex])){
                      nextPCR =each
                      setExpectedPCR(each.code)
                    }

                  })

                }else{
                  //when  the pcr is the 4th
                }
          }else{
            // when it is out of the box  // 4th pcr
          }
        })
      }


    }else{
        pcrType.map((each, index )=>{
          if(each.display?.includes("1ST_PCR")){
            nextPCR =each
            setExpectedPCR(each.code)
          }
    })

    }

      setPCRValidilty({nextPCR: nextPCR, childAge: childAge})

        }



  const calculateArvProphylaxis  =(dateaOfCTX)=>{
   
    const deliveryDate = moment(choosenInfant.dateOfDelivery)
    const lastCTX  = moment(dateaOfCTX)
        if(lastCTX.diff(deliveryDate, 'hours')  < 72){

            return "Within 72 hour";   
                 
        }else{

          return "After 72 hour";        }
  }


  useEffect(() => {
   GET_CODESETS();

    AdultRegimenLine();

    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null &&
      props.activeContent.activeTab === "child" && props?.activeContent?.actionType !== "create"
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }

    // Auto-select infant when coming from "Follow Up Visit" in infant list
    if (
      props.activeContent.actionType === "create" &&
      props.activeContent.obj &&
      props.activeContent.obj.infantHospitalNumber
    ) {
      const infantObj = {
        ...props.activeContent.obj,
        hospitalNumber: props.activeContent.obj.infantHospitalNumber,
      };
      GetInfantDetail(infantObj);
    }
  }, [props.patientObj.hospitalNumber, props.activeContent]);

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
              setInfantMotherArtDto((prev) => prev.syphilisTreatmentReferral ? prev : { ...prev, syphilisTreatmentReferral: "Treated" });
            } else if (treatment === "Not Treated") {
              setMotherSyphilisTreatment("No");
              setInfantMotherArtDto((prev) => prev.syphilisTreatmentReferral ? prev : { ...prev, syphilisTreatmentReferral: "Not Treated" });
            }
          }
        }
      })
      .catch(() => {});
  }, [props.patientObj.id]);

  //GEt visit information
  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-infantvisit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        filterOutTheChosenChildForView(
          response.data.infantVisitRequestDto.infantHospitalNumber
        );
        setObjValues({...response.data, source: "WEB"});
        setInfantVisitRequestDto({ ...response.data.infantVisitRequestDto });
        if (response.data.infantArvDto) {
          setInfantArvDto({ ...response.data.infantArvDto });
          setArvFilledAtRegistration(false);
          visitHasOwnArvRef.current = true;
        } else {
          // No ARV record on this visit - clear ctxStatus so ARV section appears empty
          setInfantVisitRequestDto(prev => ({ ...prev, ctxStatus: "" }));
          visitHasOwnArvRef.current = false;
          // Registration ARV check will happen in filterOutTheChosenChildForView
        }
        if (response.data.infantMotherArtDto) {
          setInfantMotherArtDto({ ...response.data.infantMotherArtDto });
          RegimenType(response.data.infantMotherArtDto.regimenTypeId);
        }
        if (response.data.infantPCRTestDto) {
          setInfantPCRTestDto({ ...response.data.infantPCRTestDto });
          currentVisitPCRTypeRef.current = response.data.infantPCRTestDto.testType;
        }
        if (response.data.infantRapidAntiBodyTestDto) {
          setInfantRapidTestDTO({ ...response.data.infantRapidAntiBodyTestDto });
          // Ensure rapid test section is visible when viewing/updating a visit that has rapid test data
          setshowRapidTest(true);
        }
        if (response.data.infantVisitHbvVaccinationDto) {
          setHbvVaccinationDto({ ...response.data.infantVisitHbvVaccinationDto });
        }
        if (response.data.syphilisProphylaxisDto) {
          setSyphilisData({ ...response.data.syphilisProphylaxisDto });
        }
        GetInfantDetail2({ ...response.data.infantVisitRequestDto });

        if (
          (response.data.infantPCRTestDto && response.data.infantPCRTestDto.results === "INFANT_PCR_RESULT_POSITIVE") ||
          (response.data.infantRapidAntiBodyTestDto && response.data.infantRapidAntiBodyTestDto.result === "INFANT_PCR_RESULT_POSITIVE")
        ) {
          setReferToART(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  //This is to get infant hospital numbet when viewing or updating infant
  const GetInfantDetail2 = (obj) => {
    setInfantHospitalNumber(obj.infantHospitalNumber);
    const InfantVisit = () => {
      //setLoading(true)
      axios
        .get(
          `${baseUrl}pmtct/anc/get-form-filter?hospitalNumber=${obj.infantHospitalNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          infantVisitRequestDto.infantHospitalNumber = obj.infantHospitalNumber;
          setFormFilter(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    };
    InfantVisit();
  };
  ///GET LIST OF Infants
  const InfantInfo = () => {
    let patientUuid= props.patientObj.patient_uuid
            ? props.patientObj.patient_uuid
            : props.patientObj.patientUuid
            ? props.patientObj.patientUuid
            : props.patientObj.uuid
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${patientUuid}?pmtctCycleUuid=${props?.latestPmtctCycle.uuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        //setLoading(false)

        setInfants(response.data);
      })

      .catch((error) => {
        //console.log(error);
      });
    // }
  };
  const checkFirstPCRExist= async(infantHospitalNo)=>{
  
      await axios
              .get(`${baseUrl}pmtct/anc/first-pcr-exist?infantHospitalNo=${infantHospitalNo}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((response) => {

                return response.data
              }).catch((e)=>{

                  console.log(e)
              })
  }

    const filterAndSetPcrType = (latestPCRData) => {
        let newPCRList = pcrTypeFullRef.current || [];

        // If codesets haven't loaded yet, retry after a short delay
        if (newPCRList.length === 0) {
          setTimeout(() => filterAndSetPcrType(latestPCRData), 300);
          return;
        }

        // check if the last PCR is Confirmatory and positive
        if(latestPCRData && latestPCRData?.results?.includes("POSITIVE") && latestPCRData?.testType === "INFANT_TESTING_PCR_CONFIRMATORY_PCR" ){
          setShowInfantVist(false)
        }else{
          setShowInfantVist(true)
        }

        // Determine the next PCR type based on the order sequence
        let pcrOrder = [
          "INFANT_TESTING_PCR_1ST_PCR_4-6_WEEKS_OF_AGE_OR_1ST_CONTACT",
          "INFANT_TESTING_PCR_2ND_PCR_12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED",
          "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE",
          "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)"
        ];

        let filteredPCRList = [];

        if (latestPCRData && latestPCRData.testType) {
          // If latest PCR is positive, next should be Confirmatory
          if (latestPCRData.results?.includes("POSITIVE")) {
            filteredPCRList = newPCRList.filter(each => each.code === "INFANT_TESTING_PCR_CONFIRMATORY_PCR");
          } else {
            // Find the next PCR in sequence after the latest
            let currentIndex = pcrOrder.indexOf(latestPCRData.testType);
            if (currentIndex !== -1 && currentIndex + 1 < pcrOrder.length) {
              let nextType = pcrOrder[currentIndex + 1];
              filteredPCRList = newPCRList.filter(each => each.code === nextType);
            }
          }
        } else {
          // No PCR documented yet, show 1st PCR
          filteredPCRList = newPCRList.filter(each => each.code === pcrOrder[0]);
        }

        // On update/view, keep the current visit's PCR type in the dropdown
        if (props?.activeContent?.actionType !== "create" && currentVisitPCRTypeRef.current) {
          const currentType = currentVisitPCRTypeRef.current;
          if (!filteredPCRList.some(item => item.code === currentType)) {
            const fullType = newPCRList.find(item => item.code === currentType);
            if (fullType) {
              filteredPCRList.push(fullType);
            }
          }
        }

        setPcrType(filteredPCRList)
    };

    const getLatestPCR=(infantHospitalNo)=>{

              // Fetch only the latest PCR test for this infant
              axios
              .get(`${baseUrl}pmtct/anc/get-latest-pcr?infantHospitalNumber=${infantHospitalNo}&pmtctCycleUuid=${props?.latestPmtctCycle?.uuid}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((response) => {
            const latestPCRData = response.data || null;
            setLatestPCR(latestPCRData)
            filterAndSetPcrType(latestPCRData);
              })
              .catch((error) => {
              console.log(error)
              });
    }

    const getLatestRapidTest=(infantHospitalNo, motherUuid)=>{
          axios
          .get(`${baseUrl}pmtct/anc/get-latest-rapid-test?infantHospitalNumber=${infantHospitalNo}&motherUuid=${motherUuid}&pmtctCycleUuid=${props?.latestPmtctCycle?.uuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setLatestRapidTest(response.data)
            if(response?.data?.id){
              // Only prefill form state in create mode; for view/update, form state comes from GetVisit()
              if (props?.activeContent?.actionType === "create") {
                setInfantRapidTestDTO({...response.data})
              }
              setDisableRapidField(true)
            }
          })
          .catch((error) => {
          console.log(error)

          });
        }






  








  const handleInputValueCheckweight = (e) => {
    if (
      e.target.name === "bodyWeight" &&
      (e.target.value < 3 || e.target.value > 150)
    ) {
      const message =
        "Body weight must not be greater than 150 and less than 3";
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: "" });
    }
  };
  //GET AdultRegimenLine
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
      .catch((error) => {
        //console.log(error);
      });
  };

  const handleInputChangeInfantVisitRequestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name)
    if (e.target.name === "visitDate" && e.target.value !== "") {
      async function checkForVisitDate() {
        let url = `${baseUrl}pmtct/anc/is-infant-visit-date-exists?hospitalNumber=${infantHospitalNumber}&visitDate=${e.target.value}`;
        // On update, exclude the current record so its own date doesn't trigger duplicate
        if (props?.activeContent?.actionType === "update" && props?.activeContent?.id) {
          url += `&excludeId=${props.activeContent.id}`;
        }
        const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data) {
          errors.visitDate = "";
          toast.error("Visit Date already exists for this infant. Please select a different date.");

          setVisitDateStatus(true);
        } else {
          setVisitDateStatus(false);
        }
      }

      async function getGa() {
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/calculate-ga3?hospitalNumber=${infantHospitalNumber}&visitDate=${ga}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data >= 0) {
          infantPCRTestDto.ageAtTest = response.data;
          setInfantVisitRequestDto({
            ...infantVisitRequestDto,
            [e.target.name]: e.target.value,
          });
        }
      }
      getGa();
      checkForVisitDate();
      checkRapidTestValidity(e.target.value)
      checkPCRValidity(e.target.value)
      validateChildRapidTest(e.target.value)
    
// onchange of date of visit, rapid test should be cleared incase they pick a date that the child is ineligible  for  rapid test
      // setInfantRapidTestDTO({
      //    rapidTestType: "",
      //   ageAtTest: "",
      //   dateOfTest: "",
      //   result: "",
      //   ancNumber: props.patientObj.ancNo,
      //   uniqueUuid: "",
      //   uuid: "",})


 //end of rapid test eligiblity
      setInfantVisitRequestDto({
        ...infantVisitRequestDto,
        [e.target.name]: e.target.value,
      });
    }else if(e.target.name === "ctxStatus"){
      setInfantVisitRequestDto({
        ...infantVisitRequestDto,
        [e.target.name]: e.target.value,
      });

      setInfantArvDto({...infantArvDto, dateOfCtx: ""})
      setChoosenInfant({...choosenInfant,ctxStatus:  e.target.value})
      setErrors({ ...temp, [e.target.name]: "" , dateOfCtx: ""});

    }else if(e.target.name === "infantOutcomeAt18Months"){
      setInfantVisitRequestDto({
        ...infantVisitRequestDto,
        [e.target.name]: e.target.value,
        dateLinkedToArtClinic: "",
        artEnrollmentNo: "",
      });
      setErrors({ ...temp, dateLinkedToArtClinic: "", artEnrollmentNo: "", artEnrollmentNoDuplicate: "" });
    }else{
      setInfantVisitRequestDto({
        ...infantVisitRequestDto,
        [e.target.name]: e.target.value,
      });
    }

  };


  const handleInputChangeInfantArvDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),

    if(e.target.name === "dateOfCtx"){
      let result =calculateAgeAtCTX(e.target.value)

      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , ageAtCtx:  result })
      setChoosenInfant({...choosenInfant, infantArvDto: {...choosenInfant.infantArvDto,dateOfCtx:  e.target.value }})

    }else if(e.target.name === "ageAtCtx"){
      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });
      setChoosenInfant({...choosenInfant, infantArvDto: {...choosenInfant.infantArvDto,ageAtCtx:  e.target.value }})


    }else if(e.target.name === "dateOfArv"){
      const dob = choosenInfant.dateOfDelivery;
      if (dob && e.target.value < dob) {
        setErrors({ ...errors, dateOfArv: "Date of Initiation must be on or after Date of Birth" });
        return;
      }
      let result =calculateArvProphylaxis(e.target.value)
      setErrors({ ...errors, dateOfArv: "" });
      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , arvDeliveryPoint:  result })
  
    }else if(e.target.name ===  "infantArvType"){

      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value, dateOfArv: "" , arvDeliveryPoint: ""});

      setErrors({ ...errors, [e.target.name]: "", dateOfArv: "" });

    }else{
      setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });

    }


  };

  const handleInputChangeInfantMotherArtDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (e.target.name === "syphilisTreatmentReferral" && e.target.value !== "Treated") {
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        [e.target.name]: e.target.value,
        syphilisTreatmentStartDate: "",
      });
    } else if (e.target.name === "hbvTreatmentProphylaxis" && e.target.value !== "New on Prophylaxis" && e.target.value !== "Prior on HBV treatment") {
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        [e.target.name]: e.target.value,
        hbvTreatmentStartDate: "",
      });
    } else if (e.target.name === "motherArtInitiationTime" && e.target.value && e.target.value.includes("NONE")) {
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        [e.target.name]: e.target.value,
      });
    } else {
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleInputChangeRapidTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    setInfantRapidTestDTO({
      ...infantRapidTestDTO,
      [e.target.name]: e.target.value,
    });
    // Per PCR flow diagram:
    // Rapid Positive → show 3rd PCR @9months (not Confirmatory directly)
    // Rapid Negative → show 4th PCR (skip 3rd PCR)
    if (e.target.name === "result" && e.target.value === "INFANT_PCR_RESULT_POSITIVE") {
      setRapidResultMessage("Rapid Antibody Test is Positive. Kindly complete a 3rd PCR (DNA PCR @ 9 months).");
      const newPCRList = pcrTypeFullRef.current || [];
      const thirdPCR = newPCRList.filter(each => each.code === "INFANT_TESTING_PCR_CONFIRMATORY_PCR___IF_PREVIOUS_TEST_POSITIVE");
      if (thirdPCR.length > 0) {
        setPcrType(thirdPCR);
      }
    } else if (e.target.name === "result" && e.target.value === "INFANT_PCR_RESULT_NEGATIVE") {
      // Rapid Negative → next step is 4th PCR
      const newPCRList = pcrTypeFullRef.current || [];
      const fourthPCR = newPCRList.filter(each => each.code === "INFANT_TESTING_PCR_4TH_PCR_(12_WEEKS_AFTER_CESSATION_OF_BREASTFEEDING_OR_AS_INDICATED)");
      if (fourthPCR.length > 0) {
        setPcrType(fourthPCR);
      }
    }
  };
  const handleInputChangeInfantPCRTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });

    if(e.target.name ===  "testType" &&  e.target.value){

      validateChildPCRAge(e.target.value)
    }

    if(e.target.name === "dateSampleCollected" && e.target.value !== ""){
      const deliveryDate = moment(choosenInfant.dateOfDelivery);
      const sampleDate = moment(e.target.value);
      const timeDiffinHrs = sampleDate.diff(deliveryDate, 'hours');
      const timeDiffinMonth = sampleDate.diff(deliveryDate, 'months');
      let ageAtTestVal = "";
      if(timeDiffinHrs < 72){
        ageAtTestVal = "CHILD_TEST_AGE_<_72_HRS";
      }else if(timeDiffinMonth > 12){
        ageAtTestVal = "CHILD_TEST_AGE_>12_MONTHS";
      }else if(timeDiffinHrs >= 72 && timeDiffinMonth < 2){
        ageAtTestVal = "CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS";
      }else if(timeDiffinMonth >= 2 && timeDiffinMonth <= 12){
        ageAtTestVal = "CHILD_TEST_AGE_2-12_MONTHS";
      }
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        [e.target.name]: e.target.value,
        ageAtTest: ageAtTestVal,
        dateResultReceivedAtFacility: "",
        dateSampleSent: "",
        dateResultReceivedByCaregiver: "",
      });
      return;
    }

    //console.log(e.target.name)infantPCRTestDto, setInfantPCRTestDto
    setInfantPCRTestDto({
      ...infantPCRTestDto,
      [e.target.name]: e.target.value,
    });
  };

  //Validations of the forms
  const validate = () => {
    temp.visitDate = infantVisitRequestDto.visitDate
      ? ""
      : "This field is required";
    temp.bodyWeight = infantVisitRequestDto.bodyWeight
      ? ""
      : "This field is required";
      if (!arvFilledAtRegistration) {
        infantVisitRequestDto.ctxStatus === "YES" &&   (temp.dateOfCtx =  infantArvDto.dateOfCtx? "" : "This field is required");
        infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE" &&
          infantArvDto.infantArvType &&
          infantArvDto.infantArvType !==
            "" && (
              (temp.dateOfArv = infantArvDto.dateOfArv
                ? ""
                : "This field is required")
            );
        if (infantArvDto.dateOfArv && choosenInfant.dateOfDelivery && infantArvDto.dateOfArv < choosenInfant.dateOfDelivery) {
          temp.dateOfArv = "Date of Initiation must be on or after Date of Birth";
        }
      }


   infantPCRTestDto.testType !== "" && ( temp.dateSampleCollected =infantPCRTestDto.dateSampleCollected ? "" : "This field is required");
    infantPCRTestDto.testType !== "" && ( temp.dateSampleSent =infantPCRTestDto.dateSampleSent ? "" : "This field is required");

    // Validate ART fields when outcome is HIV-Positive (Linked to ART)
    if (formFilter.outCome === true && infantVisitRequestDto.infantOutcomeAt18Months && infantVisitRequestDto.infantOutcomeAt18Months.includes("HIV-POSITIVE_LINKED")) {
      temp.dateLinkedToArtClinic = infantVisitRequestDto.dateLinkedToArtClinic ? "" : "This field is required";
      temp.artEnrollmentNo = infantVisitRequestDto.artEnrollmentNo ? "" : "This field is required";
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (visitDateStatus) {
      toast.error("Visit Date already exists for this infant. Please select a different date.");
      return;
    }
    console.log("validate()", validate(), errors);
    if (validate()) {
      setSaving(true);
      objValues.infantMotherArtDto = infantMotherArtDto;
      objValues.infantMotherArtDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantMotherArtDto.source = objValues.source;


      if(!arvFilledAtRegistration && infantArvDto.infantArvType){
      objValues.infantArvDto = infantArvDto;
      objValues.infantArvDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantArvDto.source = objValues.source;
      }
     if(infantPCRTestDto.testType &&  infantPCRTestDto.dateSampleCollected && infantPCRTestDto.dateSampleSent ){

        objValues.infantPCRTestDto = infantPCRTestDto;
      objValues.infantPCRTestDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantPCRTestDto.infantHospitalNumber =
        infantArvDto.infantHospitalNumber;
      objValues.infantPCRTestDto.source = objValues.source;
      }


      objValues.infantRapidAntiBodyTestDto = infantRapidTestDTO;
      objValues.infantRapidAntiBodyTestDto.source = objValues.source;
      objValues.infantVisitRequestDto = infantVisitRequestDto;
      objValues.infantVisitRequestDto.source = objValues.source;
      objValues.infantVisitHbvVaccinationDto = hbvVaccinationDto;
      if (motherSyphilisPositive) {
        objValues.syphilisProphylaxisDto = syphilisData;
      }

      if (props.activeContent && props.activeContent.actionType  === "update") {
        //Perform operation for updation action
        //`${baseUrl}pmtct/anc/update-infant-visit/${props.activeContent.id}`,

        axios
          .put(`${baseUrl}pmtct/anc/update-infant-visit`, objValues, {
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

            console.log('Something went wrong',error )
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : error.response.data.message && error.response.data.message !== ""
                    ? error.response.data.message
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
          .post(`${baseUrl}pmtct/anc/infant-visit-consolidated`, objValues, {
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
             console.log('Something went wrong',error )

            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : error.response.data.message && error.response.data.message !== ""
                    ? error.response.data.message
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

  const getTypeOfTimingOfARV = (type) => {
    if (type === "Within 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_After_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    } else if (type === "After 72 hour") {
      axios
        .get(
          `${baseUrl}application-codesets/v2/TIMING_PROPHYLAXIS_WITHIN_72HRS`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTimingProphylaxisList(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    }
  };
  const handleSelecteRegimen = (e) => {
    let regimenID = e.target.value;
    //regimenTypeId regimenId
    setInfantMotherArtDto({ ...infantMotherArtDto, regimenTypeId: regimenID });
    RegimenType(regimenID);
    //setErrors({...temp, [e.target.name]:""})
  };
  //Get list of RegimenLine
  const RegimenType = (id) => {
    if (!id) return;
    axios
      .get(`${baseUrl}hiv/regimen/types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setRegimenType(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  // Define final outcome values that close the record
  const FINAL_OUTCOMES_THAT_CLOSE = [
    "INFANT_OUTCOME_AT_18_MONTHS_HIV-POSITIVE_LINKED",
    "INFANT_OUTCOME_AT_18_MONTHS_HIV-POSITIVE_NOT_LINKED_TO_ART",
    "INFANT_OUTCOME_AT_18_MONTHS_HIV_NEGATIVE,_NO_LONGER_BREASTFEEDING",
    "INFANT_OUTCOME_AT_18_MONTHS_HIV_STATUS_UNKNOWN_DIED",
    "INFANT_OUTCOME_AT_18_MONTHS_HIV_STATUS_UNKNOWN_LOST_TO_FOLLOW_UP",
    "INFANT_OUTCOME_AT_18_MONTHS_HIV_STATUS_UNKNOWN_TRANSFER_OUT",
  ];

  function GetInfantDetail(obj) {

    setChoosenInfant(obj);
    getLatestPCR(obj.hospitalNumber)
    getLatestRapidTest(obj.hospitalNumber, obj.patientUuid)
    visitHasOwnArvRef.current = false;

    // Check if the infant record has a final outcome (record closure)
    const outcome = obj.infantOutcomeAt18Months || obj.infantOutcomeAt18_months || "";
    if (outcome && FINAL_OUTCOMES_THAT_CLOSE.includes(outcome)) {
      setInfantRecordClosed(true);
      setInfantClosedOutcome(outcome);
      setShowInfantVist(false);
    } else {
      setInfantRecordClosed(false);
      setInfantClosedOutcome("");
    }
    // Check if ARV/CTX was already filled at infant registration
    if (obj.infantArvDto && obj.infantArvDto.infantArvType) {
      setArvFilledAtRegistration(true);
      setRegistrationArvData(obj.infantArvDto);
      setRegistrationCtxStatus(obj.ctxStatus || "");
    } else {
      setArvFilledAtRegistration(false);
      setRegistrationArvData(null);
      setRegistrationCtxStatus("");
    }
    let weeks = calculateAgeInWeek(obj.dateOfDelivery);
    setWeeksValue(weeks);

    calculateAgeAtTestMonth(weeks);
    // PCR fields should come from backend (infant visit response), not prefilled from registration
    if (obj?.infantPCRTestDto?.results === "INFANT_PCR_RESULT_POSITIVE") {
      axios
        .get(`${baseUrl}application-codesets/v2/2ND_3RD_PCR_CHILD_TEST_AGE`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAtTestList(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
    }
    // setInfantVisitRequestDto({
    //   ...infantVisitRequestDto,
    //   bodyWeight: obj.bodyWeight,
    // });
    setInfantHospitalNumber(obj.hospitalNumber);

    // Pre-fill HBV vaccination data from infant registration
    const { prefilled, fromReg } = mapRegistrationHbvToVisit(obj.hbvVaccinations);
    setHbvVaccinationDto(prefilled);
    setHbvFromRegistration(fromReg);

    // Pre-fill syphilis prophylaxis data from infant registration
    if (obj.syphilisProphylaxis) {
      setSyphilisData(obj.syphilisProphylaxis);
    } else {
      setSyphilisData({ dateOfInitiation: "", ageAtInitiation: "", typeOfProphylaxis: "" });
    }

    const InfantVisit = () => {
      //setLoading(true)
      axios
        .get(`${baseUrl}pmtct/anc/get-form-filter?hospitalNumber=${obj.hospitalNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          infantVisitRequestDto.infantHospitalNumber = obj.hospitalNumber;
          infantArvDto.infantHospitalNumber = obj.hospitalNumber;
          infantPCRTestDto.infantHospitalNumber = obj.hospitalNumber;

          setFormFilter(response.data);
        })

        .catch((error) => {
          //console.log(error);
        });
    };
    InfantVisit();
  }
  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <div className="card-header mb-3" style={{
            background: "#fff",
            borderRadius: "0",
            padding: "14px 20px",
            marginTop: "-20px",
            border: "none",
            borderBottom: "2px solid #e2e8f0",
            boxShadow: "none",
          }}>
            <h5 style={{ color: "#0f172a", fontWeight: "700", marginBottom: "0", fontSize: "15px" }}>
              Clinic Follow-up Visit
            </h5>
          </div>

          {/* === Infant Demographics Card === */}
          {choosenInfant && choosenInfant.hospitalNumber && (
            <div style={{
              padding: "16px 20px",
              marginBottom: "20px",
              backgroundColor: "#eef2ff",
            }}>
              <h6 style={{ color: "#014d88", fontWeight: "bold", marginBottom: "12px", fontSize: "14px" }}>
                <ChildCareIcon style={{ fontSize: "16px", color: "#014d88", marginRight: "6px", verticalAlign: "text-bottom" }} />
                Infant Information
              </h6>
              <div className="row">
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Hospital No.</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{infantVisitRequestDto.infantHospitalNumber || "---"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Surname</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{choosenInfant.surname || "---"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Firstname</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{choosenInfant.firstName || "---"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Sex</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                    {choosenInfant.sex === "SEX_FEMALE" ? "Female" : choosenInfant.sex === "SEX_MALE" ? "Male" : choosenInfant.sex || "---"}
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Date of Birth</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                    {choosenInfant.dateOfDelivery ? moment(choosenInfant.dateOfDelivery).format("DD-MM-YYYY") : "---"}
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Mother ANC No.</span>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{props.patientObj.ancNo || "---"}</div>
                </div>
              </div>
            </div>
          )}

            {infantRecordClosed && (
              <div style={{ backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px", padding: "15px", marginBottom: "20px" }}>
                <h4 style={{ color: "#721c24", margin: 0 }}>
                  This infant record has been closed.
                </h4>
                <p style={{ color: "#721c24", margin: "5px 0 0 0" }}>
                  A final outcome has been recorded for this infant. No further updates to prophylaxis, PCR, or outcome fields are permitted.
                </p>
              </div>
            )}
            {!showInfantVist && !infantRecordClosed && <div style={{ marginBottom: "30px" }}>
              <p style={{ fontSize: "16px" }}>Child's HIV Status: <span style={{ color: "red" }}>Positive</span></p>

              <div style={{ color: "red" , display: 'flex', alignItems: 'center', fontSize: '25px'}}><div style={{  display: "flex", justifyContent: "center",alignItems: "center",width: "50px", height: "50px" , borderRadius: "50%", textAlign: "center", fontSize: "30px", padding: '10px', marginRight: '10px', backgroundColor: "pink"}}>!</div>Kindly fill ART form</div>
            </div>
          }

          <div className="row">

          {/* === Visit Information === */}
          { showInfantVist &&  <>
          <div className="col-md-12 mb-3 mt-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <EventIcon style={sectionIconStyle} />Visit Information
              </h6>
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <InputGroup>
                  <Input
                    type="date"
                      onKeyPress={(e)=>{e.preventDefault()}}
                    name="visitDate"
                    id="visitDate"
                    value={infantVisitRequestDto.visitDate}

                    onChange={handleInputChangeInfantVisitRequestDto}
                    // min={props.patientObj.dateOfEnrollment}
                    min={choosenInfant.dateOfDelivery}
                    max={moment(new Date()).format("YYYY-MM-DD")}

                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                    disabled={disabledField}
                  />
                  </InputGroup>
                  {errors.visitDate !== "" ? (
                    <span className={classes.error}>{errors.visitDate}</span>
                  ) : (
                    ""
                  )}
                  {visitDateStatus === true ? (
                    <span className={classes.error}>
                      {"Visit Date already exist"}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Body Weight <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <InputGroup>
                    <Input
                      type="number"
                      name="bodyWeight"
                      id="bodyWeight"
                      onChange={handleInputChangeInfantVisitRequestDto}
                      min="1"
                      max="150"
                      onKeyUp={handleInputValueCheckweight}
                      value={infantVisitRequestDto.bodyWeight}
                      // value={infantVisitRequestDto.bodyWeight}

                      disabled={disabledField}
                    />
                    <InputGroupText
                      addonType="append"
                      style={{
                        backgroundColor: "#014D88",
                        color: "#fff",
                      }}
                    >
                      kg
                    </InputGroupText>
                  </InputGroup>
                  {errors.bodyWeight !== "" ? (
                    <span className={classes.error}>{errors.bodyWeight}</span>
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
                  {infantVisitRequestDto.bodyWeight !== "" &&
                  infantVisitRequestDto.bodyWeight <= 0 ? (
                    <span className={classes.error}>Invalid Body Weight </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Breast Feeding ?</FormLabelName>
                  <InputGroup>
                  <Input
                    type="select"
                    name="breastFeeding"
                    id="breastFeeding"
                    value={infantVisitRequestDto.breastFeeding}

                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                  </Input>
                  </InputGroup>
                  {errors.breastFeeding !== "" ? (
                    <span className={classes.error}>
                      {errors.breastFeeding}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {/* uncomment after when you are done  */}
              {/* <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>CTX </FormLabelName>
                  <Input
                    type="select"
                    name="ctxStatus"
                    id="ctxStatus"
                    value={infantVisitRequestDto.ctxStatus}

                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                  </Input>
                  {errors.ctxStatus !== "" ? (
                    <span className={classes.error}>{errors.ctxStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div> */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Visit Status</FormLabelName>
                  <InputGroup>
                  <Input
                    type="select"
                    name="visitStatus"
                    id="visitStatus"
                    value={infantVisitRequestDto.visitStatus}

                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {childStatus.map((value, index) => (
                      <option key={index} value={value.code}>
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
              {formFilter && formFilter.outCome === true && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Child Outcome</FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="infantOutcomeAt18Months"
                      id="infantOutcomeAt18Months"
                      value={infantVisitRequestDto.infantOutcomeAt18Months}

                      onChange={handleInputChangeInfantVisitRequestDto}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      {(() => {
                        const isConfirmatoryPositive = latestPCR?.testType?.includes("CONFIRMATORY") && latestPCR?.results?.includes("POSITIVE");
                        const isConfirmatoryNegative = latestPCR?.testType?.includes("CONFIRMATORY") && latestPCR?.results?.includes("NEGATIVE");

                        let filteredOutcome = infantOutcome;
                        if (isConfirmatoryPositive) {
                          filteredOutcome = infantOutcome.filter(v =>
                            v.code.includes("HIV-POSITIVE_LINKED") ||
                            v.code.includes("HIV-POSITIVE_NOT_LINKED") ||
                            v.code.includes("STILL_BREASTFEEDING") ||
                            v.code.includes("DIED") ||
                            v.code.includes("LOST_TO_FOLLOW_UP") ||
                            v.code.includes("TRANSFER_OUT")
                          );
                        } else if (isConfirmatoryNegative) {
                          filteredOutcome = infantOutcome.filter(v =>
                            v.code.includes("HIV_NEGATIVE") ||
                            v.code.includes("STILL_BREASTFEEDING") ||
                            v.code.includes("DIED") ||
                            v.code.includes("LOST_TO_FOLLOW_UP") ||
                            v.code.includes("TRANSFER_OUT")
                          );
                        }
                        return filteredOutcome.map((value, index) => (
                          <option key={index} value={value.code}>
                            {value.display}
                          </option>
                        ));
                      })()}
                    </Input>
                    </InputGroup>
                    {errors.infantOutcomeAt18Months !== "" ? (
                      <span className={classes.error}>
                        {errors.infantOutcomeAt18Months}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {/* ART fields when HIV-positive (Linked to ART) */}
              {formFilter && formFilter.outCome === true && infantVisitRequestDto.infantOutcomeAt18Months && infantVisitRequestDto.infantOutcomeAt18Months.includes("HIV-POSITIVE_LINKED") && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Date Linked to ART Clinic <span style={{ color: "red" }}> *</span></FormLabelName>
                      <InputGroup>
                      <Input
                        type="date"
                        onKeyPress={(e) => { e.preventDefault() }}
                        name="dateLinkedToArtClinic"
                        id="dateLinkedToArtClinic"
                        value={infantVisitRequestDto.dateLinkedToArtClinic}

                        onChange={handleInputChangeInfantVisitRequestDto}
                        min={latestPCR?.dateSampleCollected || ""}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      </InputGroup>
                      {errors.dateLinkedToArtClinic !== "" ? (
                        <span className={classes.error}>{errors.dateLinkedToArtClinic}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Child's ART Unique ID <span style={{ color: "red" }}> *</span></FormLabelName>
                      <InputGroup>
                      <Input
                        type="text"
                        name="artEnrollmentNo"
                        id="artEnrollmentNo"
                        value={infantVisitRequestDto.artEnrollmentNo}

                        onChange={(e) => {
                          handleInputChangeInfantVisitRequestDto(e);
                          // Check for duplicate ART enrollment number
                          const val = e.target.value.trim();
                          if (val) {
                            axios.get(`${baseUrl}pmtct/anc/check-art-enrollment-duplicate?artEnrollmentNo=${val}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            }).then((resp) => {
                              if (resp.data === true) {
                                setErrors(prev => ({ ...prev, artEnrollmentNoDuplicate: "This ART Enrollment No already exists" }));
                              } else {
                                setErrors(prev => ({ ...prev, artEnrollmentNoDuplicate: "" }));
                              }
                            }).catch(() => {});
                          } else {
                            setErrors(prev => ({ ...prev, artEnrollmentNoDuplicate: "" }));
                          }
                        }}
                        disabled={disabledField}
                      />
                      </InputGroup>
                      {errors.artEnrollmentNo !== "" ? (
                        <span className={classes.error}>{errors.artEnrollmentNo}</span>
                      ) : (
                        ""
                      )}
                      {errors.artEnrollmentNoDuplicate !== "" ? (
                        <span className={classes.error}>{errors.artEnrollmentNoDuplicate}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {/* Still breastfeeding note */}
              {infantVisitRequestDto.infantOutcomeAt18Months && infantVisitRequestDto.infantOutcomeAt18Months.includes("STILL_BREASTFEEDING") && (
                <div className="col-md-12 mb-3">
                  <div style={{ backgroundColor: "#d1ecf1", border: "1px solid #bee5eb", borderRadius: "4px", padding: "10px" }}>
                    <p style={{ color: "#0c5460", margin: 0 }}>
                      <strong>Note:</strong> Record remains open. Please schedule a follow-up PCR test 6 weeks after cessation of breastfeeding.
                    </p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* === Mother's ART === */}
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <LocalHospitalIcon style={sectionIconStyle} />Mother's ART
              </h6>
              <div className="row">
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Mother's Current ART Status</FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="motherCurrentArtStatus"
                      id="motherCurrentArtStatus"
                      value={infantMotherArtDto.motherCurrentArtStatus}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="HIV+">HIV+</option>
                      <option value="Syphilis+">Syphilis+</option>
                      <option value="Hepatitis B+">Hepatitis B+</option>
                      <option value="HIV/Syphilis+">HIV/Syphilis+</option>
                      <option value="HIV/HBV+">HIV/HBV+</option>
                      <option value="Syphilis/HBV+">Syphilis/HBV+</option>
                    </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>
                      Timing of mother's ART Initiation{" "}
                    </FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="motherArtInitiationTime"
                      id="motherArtInitiationTime"
                      value={infantMotherArtDto.motherArtInitiationTime}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    >
                      <option value="select">Select </option>
                      {timeMotherArt.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                    </InputGroup>
                    {errors.motherArtInitiationTime !== "" ? (
                      <span className={classes.error}>
                        {errors.motherArtInitiationTime}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                {infantMotherArtDto.motherArtInitiationTime && infantMotherArtDto.motherArtInitiationTime.includes("NONE") && (
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Why ART Unknown</FormLabelName>
                    <InputGroup>
                    <Input
                      type="text"
                      name="whyArtUnknown"
                      id="whyArtUnknown"
                      value={infantMotherArtDto.whyArtUnknown}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
                )}

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Original Regimen Line </FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="regimenTypeId"
                      id="regimenTypeId"
                      value={infantMotherArtDto.regimenTypeId}
                      onChange={handleSelecteRegimen}
                      required

                      disabled={disabledField}
                    >
                      <option value=""> Select</option>

                      {adultRegimenLine.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.description}
                        </option>
                      ))}
                    </Input>
                    </InputGroup>
                    {errors.regimenTypeId !== "" ? (
                      <span className={classes.error}>
                        {errors.regimenTypeId}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Original Regimen </FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="regimenId"
                      id="regimenId"
                      value={infantMotherArtDto.regimenId}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    >
                      <option value=""> Select</option>
                      {regimenType.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.description}
                        </option>
                      ))}
                    </Input>
                    </InputGroup>
                    {errors.regimenId !== "" ? (
                      <span className={classes.error}>{errors.regimenId}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>

          {/* === Syphilis & HBV Treatment === */}
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <HealingIcon style={sectionIconStyle} />Syphilis & HBV Treatment
              </h6>
              <div className="row">
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Syphilis Treatment/Referral</FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="syphilisTreatmentReferral"
                      id="syphilisTreatmentReferral"
                      value={infantMotherArtDto.syphilisTreatmentReferral}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="Not Treated">Not Treated</option>
                      <option value="Treated">Treated</option>
                      <option value="Referred">Referred</option>
                    </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                {infantMotherArtDto.syphilisTreatmentReferral === "Treated" && (
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Syphilis Treatment Start Date</FormLabelName>
                    <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="syphilisTreatmentStartDate"
                      id="syphilisTreatmentStartDate"
                      value={infantMotherArtDto.syphilisTreatmentStartDate}
                      onChange={handleInputChangeInfantMotherArtDto}

                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
                )}
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>HBV Treatment/Prophylaxis</FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="hbvTreatmentProphylaxis"
                      id="hbvTreatmentProphylaxis"
                      value={infantMotherArtDto.hbvTreatmentProphylaxis}
                      onChange={handleInputChangeInfantMotherArtDto}

                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="Not Treated">Not Treated</option>
                      <option value="New on Prophylaxis">New on Prophylaxis</option>
                      <option value="Referred">Referred</option>
                      <option value="Prior on HBV treatment">Prior on HBV treatment</option>
                    </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                {(infantMotherArtDto.hbvTreatmentProphylaxis === "New on Prophylaxis" || infantMotherArtDto.hbvTreatmentProphylaxis === "Prior on HBV treatment") && (
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>HBV Treatment Start Date</FormLabelName>
                    <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="hbvTreatmentStartDate"
                      id="hbvTreatmentStartDate"
                      value={infantMotherArtDto.hbvTreatmentStartDate}
                      onChange={handleInputChangeInfantMotherArtDto}

                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* === Infant Prophylaxis === */}
          {arvFilledAtRegistration && registrationArvData ? (
            <div className="col-md-12 mb-3">
              <div style={{
                ...sectionContainerStyle,
                backgroundColor: "#f0fdf4",
              }}>
                <h6 style={sectionHeaderStyle}>
                  <FavoriteIcon style={sectionIconStyle} />Infant Prophylaxis
                  <span style={{ fontSize: "11px", fontWeight: "normal", color: "#15803d", marginLeft: "10px" }}>
                    (Captured at Infant Registration)
                  </span>
                </h6>
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>CTX</span>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{registrationCtxStatus || "---"}</div>
                  </div>
                  {registrationCtxStatus === "YES" && (
                    <>
                      <div className="col-md-3 mb-2">
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Date of CTX Initiation</span>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                          {registrationArvData.dateOfCtx ? moment(registrationArvData.dateOfCtx).format("DD-MM-YYYY") : "---"}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Age at CTX Initiation</span>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                          {(agectx.find(a => a.code === registrationArvData.ageAtCtx) || {}).display || registrationArvData.ageAtCtx || "---"}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-md-3 mb-2">
                    <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>ARV Prophylaxis Type</span>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      {(infantArv.find(a => a.code === registrationArvData.infantArvType) || {}).display || registrationArvData.infantArvType || "---"}
                    </div>
                  </div>
                  {registrationArvData.infantArvType === "INFANT_ARV_PROPHYLAXIS_TYPE_OTHER_(SPECIFY)" && (
                    <div className="col-md-3 mb-2">
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Other Prophylaxis Type</span>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{registrationArvData.otherProphylaxisType || "---"}</div>
                    </div>
                  )}
                  {registrationArvData.infantArvType && registrationArvData.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE" && (
                    <div className="col-md-3 mb-2">
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Date of ARV Prophylaxis</span>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                        {registrationArvData.dateOfArv ? moment(registrationArvData.dateOfArv).format("DD-MM-YYYY") : "---"}
                      </div>
                    </div>
                  )}
                  <div className="col-md-3 mb-2">
                    <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Timing of ARV Prophylaxis</span>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{registrationArvData.arvDeliveryPoint || "---"}</div>
                  </div>
                  {registrationArvData.arvDeliveryPoint && (
                    <div className="col-md-3 mb-2">
                      <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
                        {registrationArvData.arvDeliveryPoint === "Within 72 hour" ? "Timing Within 72 hrs" : "Timing After 72 hrs"}
                      </span>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                        {(() => {
                          const timingValue = registrationArvData.arvDeliveryPoint === "Within 72 hour"
                            ? registrationArvData.timingOfAvrWithin72Hours
                            : registrationArvData.timingOfAvrAfter72Hours;
                          return (timingProphylaxisList.find(t => t.code === timingValue) || {}).display || timingValue || "---";
                        })()}
                      </div>
                    </div>
                  )}
                  <div className="col-md-3 mb-2">
                    <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Place of Delivery</span>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                      {(placeOfDelivery.find(p => p.code === registrationArvData.infantArvTime) || {}).display || registrationArvData.infantArvTime || "---"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <FavoriteIcon style={sectionIconStyle} />Infant Prophylaxis
              </h6>
              <div className="row">
              <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>CTX </FormLabelName>
                      <InputGroup>
                      <Input
                        type="select"
                        name="ctxStatus"
                        id="ctxStatus"
                        value={infantVisitRequestDto.ctxStatus}

                        onChange={handleInputChangeInfantVisitRequestDto}
                         disabled={disabledField}
                        // disabled={true}

                      >
                        <option value="">Select </option>
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                      </Input>
                      </InputGroup>
                      {/* {errors.ctxStatus !== "" ? (
                        <span className={classes.error}>
                          {errors.ctxStatus}
                        </span>
                      ) : (
                        ""
                      )} */}
                    </FormGroup>
                  </div>
               { infantVisitRequestDto.ctxStatus === "YES" &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of CTX initiation</FormLabelName>
                      <InputGroup>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfCtx"
                        id="dateOfCtx"
                        value={infantArvDto.dateOfCtx}
                        onChange={handleInputChangeInfantArvDto}

                        min={choosenInfant.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                        // disabled={true}

                      />
                      </InputGroup>
                      {errors.dateOfCtx !== "" ? (
                        <span className={classes.error}>
                          {errors.dateOfCtx}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>}
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Age at CTX Initiation </FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="ageAtCtx"
                      id="ageAtCtx"
                      value={infantArvDto.ageAtCtx}
                      onChange={handleInputChangeInfantArvDto}

                     disabled={disabledField}
                      // disabled={true}

                    >
                      <option value="select">Select </option>
                      {agectx.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                    </InputGroup>
                    {errors.ageAtCtx !== "" ? (
                      <span className={classes.error}>{errors.ageAtCtx}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Infant ARV Prophylaxis Type </FormLabelName>
                    <InputGroup>
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
                    </InputGroup>
                    {errors.infantArvType !== "" ? (
                      <span className={classes.error}>
                        {errors.infantArvType}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                {infantArvDto.infantArvType === "INFANT_ARV_PROPHYLAXIS_TYPE_OTHER_(SPECIFY)"&& ( <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>
                    Other Infant ARV Prophylaxis Type
                  </FormLabelName>
                  <InputGroup>
                  <Input
                    type="text"
                    name="otherProphylaxisType"
                    id="otherProphylaxisType"
                    value={infantArvDto.otherProphylaxisType}

                    onChange={handleInputChangeInfantArvDto}
                    
                  />
                  </InputGroup>
                </FormGroup>
              </div>)}
                { infantArvDto.infantArvType &&  infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE"  &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of ARV Prophylaxis</FormLabelName>
                      <InputGroup>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfArv"
                        id="dateOfArv"
                        value={infantArvDto.dateOfArv}
                        onChange={handleInputChangeInfantArvDto}

                        min={choosenInfant.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      </InputGroup>
                      {errors.dateOfArv !== "" ? (
                        <span className={classes.error}>
                          {errors.dateOfArv}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>}   
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName> Timing of ARV Prophylaxis </FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="arvDeliveryPoint"
                      id="arvDeliveryPoint"
                      value={infantArvDto.arvDeliveryPoint}
                      onChange={handleInputChangeInfantArvDto}

                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="Within 72 hour">Within 72 hour </option>
                      <option value="After 72 hour">After 72 hour </option>
                    </Input>
                    </InputGroup>
                    {errors.arvDeliveryPoint !== "" ? (
                      <span className={classes.error}>
                        {errors.arvDeliveryPoint}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                {infantArvDto.arvDeliveryPoint && (
                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        {" "}
                        {infantArvDto.arvDeliveryPoint === "Within 72 hour"
                          ? "Timing Of ARV Prophylaxis Withn 72 hrs"
                          : "Timing Of ARV Prophylaxis After 72 hrs"}
                      </FormLabelName>
                      <InputGroup>
                      <Input
                        type="select"
                        name={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? "timingOfAvrWithin72Hours"
                            : "timingOfAvrAfter72Hours"
                        }
                        id={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? "timingOfAvrWithin72Hours"
                            : "timingOfAvrAfter72Hours"
                        }
                        value={
                          infantArvDto.arvDeliveryPoint === "Within 72 hour"
                            ? infantArvDto.timingOfAvrWithin72Hours
                            : infantArvDto.timingOfAvrAfter72Hours
                        }
                        onChange={handleInputChangeInfantArvDto}

                        disabled={disabledField}
                      >
                        <option value="">Select </option>

                        {timingProphylaxisList.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      </InputGroup>
                      {errors.arvDeliveryPoint !== "" ? (
                        <span className={classes.error}>
                          {errors.arvDeliveryPoint}
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
                    <InputGroup>
                    <Input
                      type="select"
                      name="infantArvTime"
                      id="infantArvTime"
                      value={infantArvDto.infantArvTime}
                      onChange={handleInputChangeInfantArvDto}

                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      {placeOfDelivery.length > 0 && placeOfDelivery.map((each, index)=>{
                        return  <option value={each.code}>{each.display}</option>

                      })}
                    </Input>
                    </InputGroup>
                    {errors.infantArvTime !== "" ? (
                      <span className={classes.error}>
                        {errors.infantArvTime}
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

          {/* === Syphilis Prophylaxis / Treatment === */}
          {motherSyphilisPositive && (
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <HealingIcon style={sectionIconStyle} />Syphilis Prophylaxis / Treatment
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
                    <FormLabelName>Syphilis Treatment</FormLabelName>
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
                    <FormLabelName>Date of Initiation</FormLabelName>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="dateOfInitiation"
                      id="syphilisVisitDateOfInitiation"
                      value={syphilisData.dateOfInitiation}
                      onChange={handleInputChangeSyphilis}
                      min={choosenInfant.dateOfDelivery}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </FormGroup>
                </div>

                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Age at Initiation (weeks)</FormLabelName>
                    <Input
                      type="text"
                      name="ageAtInitiation"
                      id="syphilisVisitAgeAtInitiation"
                      value={syphilisData.ageAtInitiation}
                      disabled={true}
                      readOnly
                    />
                  </FormGroup>
                </div>

                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Type of Prophylaxis / Treatment</FormLabelName>
                    <Input
                      type="select"
                      name="typeOfProphylaxis"
                      id="syphilisVisitTypeOfProphylaxis"
                      value={syphilisData.typeOfProphylaxis}
                      onChange={handleInputChangeSyphilis}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="BPG (single dose)">BPG (single dose)</option>
                      <option value="BPG (3 doses)">BPG (3 doses)</option>
                      <option value="Procaine Penicillin G">Procaine Penicillin G</option>
                      <option value="Aqueous Crystalline Penicillin G">Aqueous Crystalline Penicillin G</option>
                    </Input>
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* === HBV Vaccination === */}
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssignmentTurnedInIcon style={sectionIconStyle} />HBV Vaccination
              </h6>
              <div className="row">
                <div className=" mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>1st Dose (Birth Dose) Date</FormLabelName>
                    <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="firstDoseBirthDoseDate"
                      id="firstDoseBirthDoseDate"
                      value={hbvVaccinationDto.firstDoseBirthDoseDate}
                      onChange={handleInputChangeHbvVaccinationDto}

                      min={choosenInfant.dateOfDelivery}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField || hbvFromRegistration.firstDoseBirthDoseDate}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>Timing of Vaccination</FormLabelName>
                    <InputGroup>
                    <Input
                      type="select"
                      name="timingOfVaccination"
                      id="timingOfVaccination"
                      value={hbvVaccinationDto.timingOfVaccination}
                      onChange={handleInputChangeHbvVaccinationDto}

                      disabled={disabledField || hbvFromRegistration.timingOfVaccination}
                    >
                      <option value="">Select </option>
                      <option value="Within 24 hours">Within 24 hours</option>
                      <option value="After 24 hours">After 24 hours</option>
                    </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>2nd Dose Date</FormLabelName>
                    <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="secondDoseDate"
                      id="secondDoseDate"
                      value={hbvVaccinationDto.secondDoseDate}
                      onChange={handleInputChangeHbvVaccinationDto}

                      min={hbvVaccinationDto.firstDoseBirthDoseDate || choosenInfant.dateOfDelivery}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField || hbvFromRegistration.secondDoseDate}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-3">
                  <FormGroup>
                    <FormLabelName>3rd Dose Date</FormLabelName>
                    <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => { e.preventDefault() }}
                      name="thirdDoseDate"
                      id="thirdDoseDate"
                      value={hbvVaccinationDto.thirdDoseDate}
                      onChange={handleInputChangeHbvVaccinationDto}

                      min={hbvVaccinationDto.secondDoseDate || choosenInfant.dateOfDelivery}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField || hbvFromRegistration.thirdDoseDate}
                    />
                    </InputGroup>
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>

          {/* === Infant PCR/HIV Test === */}
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssessmentIcon style={sectionIconStyle} />Infant PCR/HIV Test
              </h6>
            {/* LAB Screening Form */}
            <div className="row">
              <div className=" mb-3 col-md-6">
            
                <FormGroup>
                  <FormLabelName> PCR testing Type</FormLabelName>
                  <InputGroup>
                  <Input
                    type="select"
                    name="testType"
                    id="testType"
                    value={infantPCRTestDto.testType}
                    onChange={handleInputChangeInfantPCRTestDto}

                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {pcrType.length > 0 && pcrType.map((each, index)=>{
                        return  <option value={each.code}>{each.display}</option>

                      })}
                  </Input>
                  </InputGroup>
                  {errors.testType !== "" ? (
                    <span className={classes.error}>{errors.testType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Age at Test</FormLabelName>
                  <InputGroup>
                  <Input
                    type="select"
                    name="ageAtTest"
                    id="ageAtTest"
                    value={infantPCRTestDto.ageAtTest}
                    onChange={handleInputChangeInfantPCRTestDto}
                    disabled={true}
                  >
                    <option value="select">Select </option>
                    <option value="CHILD_TEST_AGE_<_72_HRS">&lt;72 hrs</option>
                    <option value="CHILD_TEST_AGE_>72_HRS_-_<_2_MONTHS">&gt;72 hrs - &lt; 2 months</option>
                    <option value="CHILD_TEST_AGE_2-12_MONTHS">2-12 months</option>
                    <option value="CHILD_TEST_AGE_>12_MONTHS">&gt;12 months</option>
                  </Input>
                  </InputGroup>
                  <small style={{ color: "#667", display: "block", marginTop: "4px" }}>
                    Auto-calculated from the date of delivery and sample collection date
                  </small>
                  {errors.ageAtTest !== "" ? (
                    <span className={classes.error}>{errors.ageAtTest}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Date sample collected</FormLabelName>
                  <InputGroup>
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                    name="dateSampleCollected"
                    id="dateSampleCollected"
                    value={infantPCRTestDto.dateSampleCollected}
                    onChange={handleInputChangeInfantPCRTestDto}

                    min={
                      latestPCR && latestPCR.results && latestPCR.results.includes("POSITIVE") && latestPCR.dateSampleCollected
                        ? latestPCR.dateSampleCollected
                        : choosenInfant.dateOfDelivery
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  </InputGroup>
                  {errors.dateSampleCollected !== "" ? (
                    <span className={classes.error}>
                      {errors.dateSampleCollected}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {/* {weeksValues < 7 &&
                choosenInfant?.infantPCRTestDto?.results !==
                  "INFANT_PCR_RESULT_POSITIVE" && ( */}
                  <>
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Date Sample Sent</FormLabelName>
                        <InputGroup>
                        <Input
                          type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateSampleSent"
                          id="dateSampleSent"
                          value={infantPCRTestDto.dateSampleSent}
                          onChange={handleInputChangeInfantPCRTestDto}

                          min={infantPCRTestDto.dateSampleCollected}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField}
                        />
                        </InputGroup>
                        {errors.dateSampleSent !== "" ? (
                          <span className={classes.error}>
                            {errors.dateSampleSent}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date Result Received at Facility
                        </FormLabelName>
                        <InputGroup>
                        <Input
                          type="date"   
                          onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateResultReceivedAtFacility"
                          id="dateResultReceivedAtFacility"
                          value={infantPCRTestDto.dateResultReceivedAtFacility}
                          onChange={handleInputChangeInfantPCRTestDto}

                          min={infantPCRTestDto.dateSampleCollected}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField}
                        />
                        </InputGroup>
                        {errors.dateResultReceivedAtFacility !== "" ? (
                          <span className={classes.error}>
                            {errors.dateResultReceivedAtFacility}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date Caregiver Given Result
                        </FormLabelName>
                        <InputGroup>
                        <Input
                          type="date"       
                                          onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateResultReceivedByCaregiver"
                          id="dateResultReceivedByCaregiver"
                          value={infantPCRTestDto.dateResultReceivedByCaregiver}
                          onChange={handleInputChangeInfantPCRTestDto}

                          min={infantPCRTestDto.dateSampleCollected}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField}
                        />
                        </InputGroup>
                        {errors.dateResultReceivedByCaregiver !== "" ? (
                          <span className={classes.error}>
                            {errors.dateResultReceivedByCaregiver}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                 {/* )} */}
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Result</FormLabelName>
                  <InputGroup>
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
                  </InputGroup>
                  {errors.results !== "" ? (
                    <span className={classes.error}>{errors.results}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* Display notification when maternal outcome is IIT and transfer out */}
              {infantPCRTestDto.results !== "" &&
              infantPCRTestDto.results === "INFANT_PCR_RESULT_POSITIVE" ? (
                <h2 style={{ color: "red" }}>Kindly fill ART form</h2>
              ) : (
                ""
              )}
            </div>
            </div>
          </div>

          {/* === Rapid Antibody Test === */}
          { showRapidTest  && (
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <AssessmentIcon style={sectionIconStyle} />Rapid Antibody Test
              </h6>
                <div className="row">
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Infant Test (Rapid Test)</FormLabelName>
                      <InputGroup>
                      <Input
                        type="select"
                        name="rapidTestType"
                        id="rapidTestType"
                        value={infantRapidTestDTO.rapidTestType}
                        onChange={handleInputChangeRapidTestDto}

                        disabled={disabledField? disabledField: disableRapidField}
                      >
                        <option value="">Select </option>
                       { infantRapidTestList && infantRapidTestList.map((each, index)=>{

                        return   <option value={each} key={index}>{each}</option>
                       })}
                     
                    
                      </Input>
                      </InputGroup>
                      {errors.testType !== "" ? (
                        <span className={classes.error}>{errors.testType}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Age at Test(months)</FormLabelName>
                      <InputGroup>
                      <Input
                        type="select"
                        name="ageAtTest"
                        id="ageAtTest"
                        value={infantRapidTestDTO.ageAtTest}
                        onChange={handleInputChangeRapidTestDto}

                        disabled={disabledField? disabledField: disableRapidField}
                      >
                        <option value="select">Select </option>
                        {ageAtTestList.length > 0 &&
                          ageAtTestList.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                      </Input>
                      </InputGroup>
                      <small style={{ color: "#667", display: "block", marginTop: "4px" }}>
                        Auto-calculated from the date of delivery and sample collection date
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
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Date OF Test</FormLabelName>
                      <InputGroup>
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={infantRapidTestDTO.dateOfTest}
                        onChange={handleInputChangeRapidTestDto}

                        min={choosenInfant.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField? disabledField: disableRapidField}
                      />
                      </InputGroup>
                      {errors.dateSampleCollected !== "" ? (
                        <span className={classes.error}>
                          {errors.dateSampleCollected}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Result *</FormLabelName>
                      <InputGroup>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={infantRapidTestDTO.result}
                        onChange={handleInputChangeRapidTestDto}

                        disabled={disabledField? disabledField: disableRapidField}
                      >
                        <option value="select">Select </option>
                        {pcrResult.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      </InputGroup>
                      {errors.result !== "" ? (
                        <span className={classes.error}>{errors.result}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {/* Display notification when maternal outcome is IIT and transfer out */}
                  {infantRapidTestDTO.result !== "" &&
                  infantRapidTestDTO.result === "INFANT_PCR_RESULT_POSITIVE" ? (
                    <h2 style={{ color: "red" }}>{rapidResultMessage}</h2>
                  ) : (
                    ""
                  )}
                </div>
            </div>
          </div>
          )}

          {/* === Comments === */}
          <div className="col-md-12 mb-3">
            <div style={sectionContainerStyle}>
              <h6 style={sectionHeaderStyle}>
                <EventIcon style={sectionIconStyle} />Comments
              </h6>
            <div className="row">
              <div className="form-group mb-3 col-md-12">
                <FormGroup>
                  <FormLabelName>Comments</FormLabelName>
                  <InputGroup>
                  <Input
                    type="textarea"
                    name="comments"
                    id="comments"
                    value={infantVisitRequestDto.comments}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    style={{
                      minHeight: "80px",
                    }}
                    disabled={disabledField}
                  />
                  </InputGroup>
                </FormGroup>
              </div>
            </div>
            </div>
          </div>

            {infantVisitRequestDto &&
            infantVisitRequestDto.infantHospitalNumber ? (
              <>
                {props.activeContent && props.activeContent.actionType === "update" ? (
                  <>
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
                        <span style={{ textTransform: "capitalize" }}>
                          Update
                        </span>
                      ) : (
                        <span style={{ textTransform: "capitalize" }}>
                          Updating...
                        </span>
                      )}
                    </MatButton>
                  </>
                ) : props.activeContent?.actionType !== "view" ? (
                  <>
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
                        <span style={{ textTransform: "capitalize" }}>
                          Save
                        </span>
                      ) : (
                        <span style={{ textTransform: "capitalize" }}>
                          Saving...
                        </span>
                      )}
                    </MatButton>
                  </>
                ) : null}
              </>
            ) : (
              ""
            )}


        </>}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: "30%" }}>
          <p  style={{fontSize: "17px"}}>{pcrMessage}</p>
            <div style={{display: "flex", justifyContent: "space-between"}}>        
                <button onClick={handleClose} style={{fontSize: "12px",fontWeight: "500", background: "#014d88", color: "white", textTransform: "capitalize", color: "white", padding: "8px 17px", margin: "8px 0px", border: "none", borderRadius: "2px"}}>Confirm </button>
                <button onClick={cancelClose} style={{fontSize: "12px", fontWeight: "500", color: "white", textTransform: "capitalize", color: " #014d88", padding: "8px 17px", margin: "8px 0px", border: "1px solid #014d88", borderRadius: "3px"}}>Cancel </button>


            </div>

        </Box>
      </Modal>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
    </div>
  );
};

export default ClinicVisit;
