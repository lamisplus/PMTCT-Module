import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, List } from "semantic-ui-react";
// Page titie
import {
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
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
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
    "& > *": {
      margin: theme.spacing(1),
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
    infantVisitRequestDto: "",
    // infantArvDto: "",
    // infantMotherArtDto: "",
    // infantPCRTestDto: "",
  });
  const [rapidResultMessage, setRapidResultMessage] = useState("Kindly fill ART form");

  const [timingProphylaxisList, setTimingProphylaxisList] = useState([]);
  const [weeksValues, setWeeksValue] = useState(0);
  const [referToART, setReferToART] = useState(false);
  const [placeOfDelivery, setPlaceOfDelivery] = useState([]);
  const [pcrType, setPcrType] = useState([]);
  const [latestPCR, setLatestPCR] = useState({});
  const [latestRapidTest, setLatestRapidTest] = useState({});

  const [PCRValidity, setPCRValidilty] = useState({nextPCR: "", childAge: ""});

  const [infantVisitRequestDto, setInfantVisitRequestDto] = useState({
    // ageAtCtx: "",
    personUuid: props.patientObj.person_uuid
      ? props.patientObj.person_uuid
      : props.patientObj.personUuid
      ? props.patientObj.personUuid
      : "",
    ancNumber: props.patientObj.ancNo,
    bodyWeight: "",
    breastFeeding: "",
    // ctxStatus: "",
    infantHospitalNumber: "",
    visitDate: "",
    visitStatus: "",
    infantOutcomeAt18Months: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
    ctxStatus:  "" ,
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
  });
  const [infantMotherArtDto, setInfantMotherArtDto] = useState({
    ancNumber: props.patientObj.ancNo,
    motherArtInitiationTime: "",
    // motherArtRegimen: "",
    regimenTypeId: "",
    regimenId: "",
    id: "",
    uuid: "",
    uniqueUuid: "",
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
  });

  const [infantRapidTestDTO, setInfantRapidTestDTO] = useState({
    rapidTestType: "",
    ageAtTest: "",
    dateOfTest: "",
    result: "",
    ancNumber: props.patientObj.ancNo,
    uniqueUuid: "",
    uuid: "",
  });

  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
  });

  const [expectedPCR, setExpectedPCR] = useState("");
  const [pcrMessage, setPcrMessage] = useState("");

  const [infantRapidTestList, setInfantRapidTestList] = useState([]);
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
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${
          props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : props.patientObj.personUuid
            ? props.patientObj.personUuid
            : props.patientObj.uuid
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      .then((response) => {
        let resultInfo = response.data.filter((each) => {
          return each.hospitalNumber.toString() === child.toString();
        });

        let weeks = calculateAgeInWeek(resultInfo[0].dateOfDelivery);

        calculateAgeAtTestMonth(weeks);
        getLatestPCR(resultInfo[0].hospitalNumber)
        getLatestRapidTest(resultInfo[0].hospitalNumber, resultInfo[0].personUuid)
        setChoosenInfant(resultInfo[0]);
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
        let pcrRes= latestPCR.results.includes("POSITIVE")? "Positive": latestPCR.results.includes("NEGATIVE")? "Negtive": "Indeterminate"
        setPcrMessage(`Last PCR test result is ${pcrRes}, reconfirm input`)
        handleOpen()
      }

    }

  }
  const validateChildRapidTest =(visitDate)=>{
    let deliveryDate = moment(choosenInfant.dateOfDelivery);
    let vistDate  = moment(visitDate);

    //child is 9 month, rapid test = +ve
    if(vistDate.diff(deliveryDate, 'months') === 9 &&  latestRapidTest?.result === "INFANT_PCR_RESULT_POSITIVE"  && !latestPCR?.results){
      setRapidResultMessage("Kindly undergo PCR for confirmation ")
      
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

            if(childAge >= 18){
          setInfantRapidTestList(["First Rapid Antibody", "Second Rapid Antibody"])
            }else{
            setInfantRapidTestList(["First Rapid Antibody"])

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

                    if(each.code.includes( orderOfPCR[theindex])){
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
          if(each.display.includes("1ST_PCR")){
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
    SEX();
    InfantInfo();
    TIME_ART_INITIATION_PMTCT();
    CHILD_FOLLOW_UP_VISIT_STATUS();
    TIMING_MOTHERS_ART_INITIATION();
    AdultRegimenLine();
    AGE_CTX_INITIATION();
    INFANT_ARV_PROPHYLAXIS_TYPE();
    INFANT_PCR_RESULT();
    INFANT_OUTCOME_AT_18_MONTHS();
    PLACE_OF_DELIVERY();
    GET_PCR_SAMPLE_TYPE();
    getTimingARVType();



    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null &&
      props.activeContent.activeTab === "child"
    ) {
      GetVisit(props.activeContent.id);
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, [props.patientObj.hospitalNumber, props.activeContent]);
  //GEt visit information
  const GetVisit = (id) => {
    axios
      .get(`${baseUrl}pmtct/anc/view-infantvisit/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // getTypeOfTimingOfARV(response.data.infantArvDto.arvDeliveryPoint);
        filterOutTheChosenChildForView(
          response.data.infantVisitRequestDto.infantHospitalNumber
        );
        setObjValues(response.data);
        setInfantVisitRequestDto({ ...response.data.infantVisitRequestDto });
        setInfantArvDto({ ...response.data.infantArvDto });
        setInfantMotherArtDto({ ...response.data.infantMotherArtDto });
        setInfantPCRTestDto({ ...response.data.infantPCRTestDto });
        setInfantRapidTestDTO({ ...response.data.infantRapidAntiBodyTestDto });
        GetInfantDetail2({ ...response.data.infantVisitRequestDto });
        RegimenType(response.data.infantMotherArtDto.regimenTypeId);
        // getTimingARVType(response.data.infantArvDto.arvDeliveryPoint);

        if (
          response.data.infantPCRTestDto.results ===
            "INFANT_PCR_RESULT_POSITIVE" ||
          response.data.infantRapidTestDTO.result ===
            "INFANT_PCR_RESULT_POSITIVE"
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
          `${baseUrl}pmtct/anc/get-form-filter/${obj.infantHospitalNumber}`,
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
    axios
      .get(
        `${baseUrl}pmtct/anc/get-infant-by-mother-person-uuid/${
          props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : props.patientObj.personUuid
            ? props.patientObj.personUuid
            : props.patientObj.uuid
        }`,
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

    const getLatestPCR=(infantHospitalNo)=>{
              axios
              .get(`${baseUrl}pmtct/anc/get-latest-pcr?infantHospitalNumber=${infantHospitalNo}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((response) => {
            setLatestPCR(response.data)
              })
              .catch((error) => {
              console.log(error)
              });
    }

    const getLatestRapidTest=(infantHospitalNo, motherUuid)=>{
          axios
          .get(`${baseUrl}pmtct/anc/get-latest-rapid-test?infantHospitalNumber=${infantHospitalNo}&motherUuid=${motherUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setLatestRapidTest(response.data)
            if(response.data){

              setInfantRapidTestDTO({...response.data})
              setDisableRapidField(true)
            }
          })
          .catch((error) => {
          console.log(error)

          });
        }



  const TIME_ART_INITIATION_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIME_ART_INITIATION_PMTCT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTimingOfArtInitiation(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };


  
  const GET_PCR_SAMPLE_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_TESTING_PCR`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPcrType(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const PLACE_OF_DELIVERY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PLACE_OF_DELIVERY`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPlaceOfDelivery(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const INFANT_OUTCOME_AT_18_MONTHS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_OUTCOME_AT_18_MONTHS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInfantOutcome(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const INFANT_PCR_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_PCR_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPcrResult(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const INFANT_ARV_PROPHYLAXIS_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/INFANT_ARV_PROPHYLAXIS_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInfantArv(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const AGE_CTX_INITIATION = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/AGE_CTX_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAgeCTX(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const TIMING_MOTHERS_ART_INITIATION = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIMING_MOTHERS_ART_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTimeMotherArt(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const CHILD_FOLLOW_UP_VISIT_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CHILD_FOLLOW_UP_VISIT_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setChildStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
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
  const SEX = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SEX`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //console.log(response.data);
        setGenders(response.data);
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
        const ga = e.target.value;
        const response = await axios.get(
          `${baseUrl}pmtct/anc/is-infant-visit-date-exists?hospitalNumber=${infantHospitalNumber}&visitDate=${e.target.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
          }
        );
        if (response.data) {
          errors.visitDate = "";
          toast.error("Visit Date already exist");

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

      setErrors({ ...temp, [e.target.name]: "" , dateOfCtx: ""});

    }else{
      setInfantVisitRequestDto({
        ...infantVisitRequestDto,
        [e.target.name]: e.target.value,
      });
    }
 
  };

  const getTimingARVType = (value) => {
  
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
    
  };
  const handleInputChangeInfantArvDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),

    if(e.target.name === "dateOfCtx"){
      let result =calculateAgeAtCTX(e.target.value)

      setInfantArvDto({...infantArvDto,[e.target.name]: e.target.value , ageAtCtx:  result })

    }else if(e.target.name === "dateOfArv"){

      let result =calculateArvProphylaxis(e.target.value)

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
    //console.log(e.target.name),
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeRapidTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantRapidTestDTO({
      ...infantRapidTestDTO,
      [e.target.name]: e.target.value,
    });
  };
  const handleInputChangeInfantPCRTestDto = (e) => {
    setErrors({ ...temp, [e.target.name]: "" });

    if(e.target.name ===  "testType" &&  e.target.value){

      validateChildPCRAge(e.target.value)
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
      infantVisitRequestDto.ctxStatus === "YES" &&   (temp.dateOfCtx =  infantArvDto.dateOfCtx? "" : "This field is required");
      infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE"  && infantArvDto.infantArvType  && ( temp.dateOfArv = infantArvDto.dateOfArv? "" : "This field is required");

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.infantArvDto = infantArvDto;
      objValues.infantArvDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantMotherArtDto = infantMotherArtDto;
      objValues.infantMotherArtDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantPCRTestDto = infantPCRTestDto;
      objValues.infantPCRTestDto.visitDate = infantVisitRequestDto.visitDate;
      objValues.infantPCRTestDto.infantHospitalNumber =
        infantArvDto.infantHospitalNumber;

      objValues.infantRapidAntiBodyTestDto = infantRapidTestDTO;
      objValues.infantVisitRequestDto = infantVisitRequestDto;

      if (props.activeContent && props.activeContent.actionType) {
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
  function GetInfantDetail(obj) {

    setChoosenInfant(obj);
    getLatestPCR(obj.hospitalNumber)
    getLatestRapidTest(obj.hospitalNumber, obj.personUuid)
    setInfantArvDto({...infantArvDto,ageAtCtx: obj.infantArvDto.ageAtCtx , dateOfCtx: obj.infantArvDto.dateOfCtx})
    // setInfantVisitRequestDto({...infantVisitRequestDto, ctxStatus: obj.ctxStatus})
    let weeks = calculateAgeInWeek(obj.dateOfDelivery);
    setWeeksValue(weeks);

    calculateAgeAtTestMonth(weeks);
    if (obj?.infantPCRTestDto?.results === "INFANT_PCR_RESULT_POSITIVE") {
      setInfantPCRTestDto({
        ...infantPCRTestDto,
        testType: "Confirmatory PCR",
      });
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

    const InfantVisit = () => {
      //setLoading(true)
      axios
        .get(`${baseUrl}pmtct/anc/get-form-filter/${obj.hospitalNumber}`, {
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
      <h2>Clinic Follow-up Visit</h2>
      <Grid columns="equal">
        <Grid.Column>
          <Segment>
            <Label as="a" color="blue" ribbon>
              Infant's
            </Label>
            <br />
            <List celled>
              <List.Item>
                Given Name
                <span className="float-end">
                  <b>Hospital Number</b>
                </span>
              </List.Item>
            </List>
            {infants &&
              infants.map((row) => (
                <List celled>
                  <List.Item
                    onClick={() => GetInfantDetail(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <Label as="a" color="blue">
                      {row.firstName}
                    </Label>
                    <Label as="a" color="teal" className="float-end" tag>
                      {row.hospitalNumber}
                    </Label>
                  </List.Item>
                </List>
              ))}
          </Segment>
        </Grid.Column>
        <Grid.Column width={12}>
          <Segment>
            <Label
              as="a"
              color="blue"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>
                Infant Clinic Visit -{" "}
                {infantVisitRequestDto &&
                infantVisitRequestDto.infantHospitalNumber
                  ? infantVisitRequestDto.infantHospitalNumber
                  : " "}
              </h4>
            </Label>
            <br />
            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"                     
                      onKeyPress={(e)=>{e.preventDefault()}}
                    name="visitDate"
                    id="visitDate"
                    value={infantVisitRequestDto.visitDate}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    // min={props.patientObj.firstAncDate}
                    min={choosenInfant.dateOfDelivery}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    
                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                    disabled={disabledField}
                  />
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
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Birth <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"             
                     onKeyPress={(e)=>{e.preventDefault()}}
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={choosenInfant.dateOfDelivery}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                    required
                  />
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Infant Hospital Number{" "}
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="text"
                    name="infantHospitalNumber"
                    id="infantHospitalNumber"
                    value={infantVisitRequestDto.infantHospitalNumber}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                  {errors.infantHospitalNumber !== "" ? (
                    <span className={classes.error}>
                      {errors.infantHospitalNumber}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Surname
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="text"
                    name="surname"
                    id="surname"
                    value={choosenInfant.surname}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                </FormGroup>
              </div>
              {choosenInfant.firstName && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>
                      Firstname
                      <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <Input
                      type="text"
                      name="surname"
                      id="surname"
                      value={choosenInfant.firstName}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      onChange={handleInputChangeInfantVisitRequestDto}
                      disabled
                    />
                  </FormGroup>
                </div>
              )}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Sex <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <InputGroup>
                    <Input
                      type="select"
                      name="sex"
                      id="sex"
                      onChange={handleInputChangeInfantVisitRequestDto}
                      value={choosenInfant.sex}
                      disabled
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

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Mother ANC number
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </FormLabelName>
                  <Input
                    type="text"
                    name="ancNumber"
                    id="ancNumber"
                    value={props.patientObj.ancNo}
                    // value={infantVisitRequestDto.ancNumber}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                  {errors.ancNumber !== "" ? (
                    <span className={classes.error}>{errors.ancNumber}</span>
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

                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0rem",
                      }}
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
                  <Input
                    type="select"
                    name="breastFeeding"
                    id="breastFeeding"
                    value={infantVisitRequestDto.breastFeeding}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                  </Input>
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
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
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
                  <Input
                    type="select"
                    name="visitStatus"
                    id="visitStatus"
                    value={infantVisitRequestDto.visitStatus}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
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
                    <FormLabelName>Infant outcome at 18 months</FormLabelName>
                    <Input
                      type="select"
                      name="infantOutcomeAt18Months"
                      id="infantOutcomeAt18Months"
                      value={infantVisitRequestDto.infantOutcomeAt18Months}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      onChange={handleInputChangeInfantVisitRequestDto}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      {infantOutcome.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
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
            </div>

            <br />
            {/* {formFilter && formFilter.motherArt === false && ( */}
            <>
              <Label
                as="a"
                color="teal"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h4 style={{ color: "#fff" }}> Mother's ART </h4>
              </Label>
              <br />
              <br />
              <div className="row">
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>
                      Timing of mother's ART Initiation{" "}
                    </FormLabelName>
                    <Input
                      type="select"
                      name="motherArtInitiationTime"
                      id="motherArtInitiationTime"
                      value={infantMotherArtDto.motherArtInitiationTime}
                      onChange={handleInputChangeInfantMotherArtDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="select">Select </option>
                      {timeMotherArt.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                    {errors.motherArtInitiationTime !== "" ? (
                      <span className={classes.error}>
                        {errors.motherArtInitiationTime}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Original Regimen Line </FormLabelName>
                    <Input
                      type="select"
                      name="regimenTypeId"
                      id="regimenTypeId"
                      value={infantMotherArtDto.regimenTypeId}
                      onChange={handleSelecteRegimen}
                      required
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value=""> Select</option>

                      {adultRegimenLine.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.description}
                        </option>
                      ))}
                    </Input>
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
                    <Input
                      type="select"
                      name="regimenId"
                      id="regimenId"
                      value={infantMotherArtDto.regimenId}
                      onChange={handleInputChangeInfantMotherArtDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value=""> Select</option>
                      {regimenType.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.description}
                        </option>
                      ))}
                    </Input>
                    {errors.regimenId !== "" ? (
                      <span className={classes.error}>{errors.regimenId}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              </div>
            </>
            {/* )} */}
            <br />
            {/* {formFilter && formFilter.infantArv === false && ( */}
            <>
              <Label
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h4 style={{ color: "#fff" }}> Infant ARV & CTX</h4>
              </Label>
              <br />
              <br />
              <div className="row">
              <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>CTX </FormLabelName>
                      <Input
                        type="select"
                        name="ctxStatus"
                        id="ctxStatus"
                        value={ choosenInfant?.ctxStatus}

                        // value={infantVisitRequestDto.ctxStatus}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        onChange={handleInputChangeInfantVisitRequestDto}
                        // disabled={disabledField}
                        disabled={true}

                      >
                        <option value="">Select </option>
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                      </Input>
                      {/* {errors.ctxStatus !== "" ? (
                        <span className={classes.error}>
                          {errors.ctxStatus}
                        </span>
                      ) : (
                        ""
                      )} */}
                    </FormGroup>
                  </div>
               { choosenInfant?.ctxStatus === "YES" &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of CTX initiation</FormLabelName>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfCtx"
                        id="dateOfCtx"
                        // value={infantArvDto.dateOfCtx}

                        value={choosenInfant?.infantArvDto?.dateOfCtx}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={choosenInfant.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        // disabled={disabledField}
                        disabled={true}

                      />
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
                    <Input
                      type="select"
                      name="ageAtCtx"
                      id="ageAtCtx"
                      value={choosenInfant?.infantArvDto?.ageAtCtx}

                      // value={infantArvDto.ageAtCtx}
                      onChange={handleInputChangeInfantArvDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      // disabled={disabledField}
                      disabled={true}

                    >
                      <option value="select">Select </option>
                      {agectx.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
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
                    <Input
                      type="select"
                      name="infantArvType"
                      id="infantArvType"
                      value={infantArvDto.infantArvType}
                      onChange={handleInputChangeInfantArvDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
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

                {infantArvDto.infantArvType === "INFANT_ARV_PROPHYLAXIS_TYPE_OTHER_(SPECIFY)"&& ( <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName>
                    Other Infant ARV Prophylaxis Type
                  </FormLabelName>
                  <Input
                    type="text"
                    name="otherProphylaxisType"
                    id="otherProphylaxisType"
                    value={infantArvDto.otherProphylaxisType}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChangeInfantArvDto}
                    
                  />
                </FormGroup>
              </div>)}
                { infantArvDto.infantArvType &&  infantArvDto.infantArvType !== "INFANT_ARV_PROPHYLAXIS_TYPE_NONE"  &&<div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>Date of ARV Prophylaxis</FormLabelName>
                      <Input
                        type="date"                  
                         onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfArv"
                        id="dateOfArv"
                        value={infantArvDto.dateOfArv}
                        onChange={handleInputChangeInfantArvDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={choosenInfant.dateOfDelivery}
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
                  </div>}   
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName> Timing of ARV Prophylaxis </FormLabelName>
                    <Input
                      type="select"
                      name="arvDeliveryPoint"
                      id="arvDeliveryPoint"
                      value={infantArvDto.arvDeliveryPoint}
                      onChange={handleInputChangeInfantArvDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      <option value="Within 72 hour">Within 72 hour </option>
                      <option value="After 72 hour">After 72 hour </option>
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
                {infantArvDto.arvDeliveryPoint && (
                  <div className=" mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        {" "}
                        {infantArvDto.arvDeliveryPoint === "Within 72 hour"
                          ? "Timing Of ARV Prophylaxis Withn 72 hrs"
                          : "Timing Of ARV Prophylaxis After 72 hrs"}
                      </FormLabelName>
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
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select </option>

                        {timingProphylaxisList.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
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
                )}
 

                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName> Place of Delivery </FormLabelName>
                    <Input
                      type="select"
                      name="infantArvTime"
                      id="infantArvTime"
                      value={infantArvDto.infantArvTime}
                      onChange={handleInputChangeInfantArvDto}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select </option>
                      {placeOfDelivery.length > 0 && placeOfDelivery.map((each, index)=>{
                        return  <option value={each.code}>{each.display}</option>

                      })}
                    </Input>
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
            </>
            {/* )} */}
            <br />
            <Label
              as="a"
              color="black"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>
                {" "}
                Infant PCR/HIV test 
                {/* {infantPCRTestDto.testType}{" "} */}
              </h4>
            </Label>
            <br />
            <br />
            {/* LAB Screening Form */}
            <div className="row">
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName> PCR testing Type</FormLabelName>
                  <Input
                    type="select"
                    name="testType"
                    id="testType"
                    value={infantPCRTestDto.testType}
                    onChange={handleInputChangeInfantPCRTestDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {pcrType.length > 0 && pcrType.map((each, index)=>{
                        return  <option value={each.code}>{each.display}</option>

                      })}
                  </Input>
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
                  <Input
                    type="select"
                    name="ageAtTest"
                    id="ageAtTest"
                    value={infantPCRTestDto.ageAtTest}
                    onChange={handleInputChangeInfantPCRTestDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="select">Select </option>
                    {ageAtTestList.length > 0 &&
                      ageAtTestList.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                  </Input>
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
                  <Input
                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                    name="dateSampleCollected"
                    id="dateSampleCollected"
                    value={infantPCRTestDto.dateSampleCollected}
                    onChange={handleInputChangeInfantPCRTestDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    min={choosenInfant.dateOfDelivery}
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
              {weeksValues < 7 &&
                choosenInfant?.infantPCRTestDto?.results !==
                  "INFANT_PCR_RESULT_POSITIVE" && (
                  <>
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Date Sample Sent</FormLabelName>
                        <Input
                          type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateSampleSent"
                          id="dateSampleSent"
                          value={infantPCRTestDto.dateSampleSent}
                          onChange={handleInputChangeInfantPCRTestDto}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          min={infantPCRTestDto.dateSampleCollected}
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

                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date Result Received at Facility
                        </FormLabelName>
                        <Input
                          type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateResultReceivedAtFacility"
                          id="dateResultReceivedAtFacility"
                          value={infantPCRTestDto.dateResultReceivedAtFacility}
                          onChange={handleInputChangeInfantPCRTestDto}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          min={infantPCRTestDto.dateSampleCollected}
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
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date Caregiver Given Result
                        </FormLabelName>
                        <Input
                          type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                          name="dateResultReceivedByCaregiver"
                          id="dateResultReceivedByCaregiver"
                          value={infantPCRTestDto.dateResultReceivedByCaregiver}
                          onChange={handleInputChangeInfantPCRTestDto}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          min={infantPCRTestDto.dateSampleCollected}
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
                  </>
                )}
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Result</FormLabelName>
                  <Input
                    type="select"
                    name="results"
                    id="results"
                    value={infantPCRTestDto.results}
                    onChange={handleInputChangeInfantPCRTestDto}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
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
            <br />
            <br />
            <br />
         
            {showRapidTest && (
              <>
                <Label
                  as="a"
                  color="teal"
                  style={{ width: "106%", height: "35px" }}
                  ribbon
                >
                  <h4 style={{ color: "#fff" }}> Rapid Antibody Test</h4>
                </Label>
                <br />
                <br />
                {/* Infant testing  Form */}
                <div className="row">
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Infant Test (Rapid Test)</FormLabelName>
                      <Input
                        type="select"
                        name="rapidTestType"
                        id="rapidTestType"
                        value={infantRapidTestDTO.rapidTestType}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField? disabledField: disableRapidField}
                      >
                        <option value="">Select </option>
                       { infantRapidTestList && infantRapidTestList.map((each, index)=>{

                        return   <option value={each} key={index}>{each}</option>
                       })}
                     
                    
                      </Input>
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
                      <Input
                        type="select"
                        name="ageAtTest"
                        id="ageAtTest"
                        value={infantRapidTestDTO.ageAtTest}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
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
                      <Input
                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                        name="dateOfTest"
                        id="dateOfTest"
                        value={infantRapidTestDTO.dateOfTest}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={choosenInfant.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField? disabledField: disableRapidField}
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
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Result *</FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={infantRapidTestDTO.result}
                        onChange={handleInputChangeRapidTestDto}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField? disabledField: disableRapidField}
                      >
                        <option value="select">Select </option>
                        {pcrResult.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
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
              </>
            )}
            <br />


            {infantVisitRequestDto &&
            infantVisitRequestDto.infantHospitalNumber ? (
              <>
                {props.activeContent && props.activeContent.actionType ? (
                  <>
                    <MatButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      hidden={disabledField}
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
                ) : (
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
                )}
              </>
            ) : (
              ""
            )}
          </Segment>
        </Grid.Column>
      </Grid>

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
