import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { Label as FormLabelName } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory, useLocation } from "react-router-dom";
import "react-summernote/dist/react-summernote.css"; // import styles
import { Spinner } from "reactstrap";
import { Message } from "semantic-ui-react";
import { calculateGestationalAge } from "../../utils";
import moment from "moment";
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

const AncPnc = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setSisabledField] = useState(false);
  const [entryPoint, setentryPoint] = useState([]);
  const [entryPointValue, setentryPointValue] = useState("");
  const [timeMotherArt, setTimeMotherArt] = useState([]);
  const [disableHIVStatus, setDisableHIVStatus] = useState(false);
const [autoPostPartumTiming,setAutoPostPartumTiming] = useState(false);

  const [tbStatus, setTbStatus] = useState([]);
  const [artStartTime, setartStartTime] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [entryValueDisplay, setEntryValueDisplay] = useState({});
  const [allNewEntryPoint, setAllNewEntryPoint] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [urinalysisList, setUrinalysisList] = useState([]);
  const [timeHivDiagnosis, setTimeHivDiagnosis] = useState([]);
  const [timeHivInitiation, setTimeHivInitiation] = useState([]);
  const [maxARTDate, setMaxARTDate]=useState(moment(new Date()).format("YYYY-MM-DD"));
  const [minARTDate, setMinARTDate]=useState("");
  const [minPmtctEnrollmentDate, setMinPmtctEnrollmentDate] = useState(null);
  const [minDeliveryDate, setMinDeliveryDate] = useState(null);

  // Get canProceedWithEnrollment from props (controlled by parent)
  const canProceedWithEnrollment = props.canProceedWithEnrollment ?? true;

// Extract hivStatus calculation outside
const getInitialHivStatus = () => {
  const statusMap = {
    'reactive': 'Positive',
    'non-reactive': 'Negative',
    'Positive': 'Positive',
    'Negative': 'Negative',

  };
  return (
    statusMap[props.lastestConfirmatoryTest] ||
    patientObj?.hivStatus ||
    patientObj?.staticHivStatus ||
    props?.patientObj?.dynamicHivStatus ||
    ""
  );
};

const [enroll, setEnrollDto] = useState({
  hepatitisB: patientObj.hepatitisB || "",
  urinalysis: patientObj.urinalysis || "",
  ancNo: patientObj.ancNo || "",
  pmtctEnrollmentDate: "",
  dateOfDelivery: "",
  expectedDeliveryDate: "",
  entryPoint: entryValueDisplay?.id,
  ga: "",
  gravida: props.patientObj.gravida,
  artStartDate: "",
  artStartTime: patientObj.artStartTime || "",
  id: "",
  timeOfHivDiagnosis: "",
  tbStatus: "",
  hivStatus: getInitialHivStatus(),
  lmp: props?.patientObj?.lmp || "",
  gaweeks: "",
  pmtctType: entryValueDisplay.display,
});
  const [infantMotherArtDto, setInfantMotherArtDto] = useState({
    ancNumber: props.patientObj.ancNo,
    motherArtInitiationTime: "",
    motherArtRegimen: "",
    regimenTypeId: props?.patientObj?.regimenTypeId
      ? props?.patientObj?.regimenTypeId
      : "",
    regimenId: props?.patientObj?.regimenId ? props?.patientObj?.regimenId : "",
  });
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


  const handleInputChangeInfantMotherArtDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    //console.log(e.target.name),
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      [e.target.name]: e.target.value,
    });
  };
  const handleSelecteRegimen = (e) => {
    let regimenID = e.target.value;
    //regimenTypeId regimenId
    setInfantMotherArtDto({
      ...infantMotherArtDto,
      regimenTypeId: regimenID,
    });
    RegimenType(regimenID);
    //setErrors({...temp, [e.target.name]:""})
  };

console.log('fddd', enroll.hivStatus)
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



  const getPatientEntryType = (id) => {
    if (locationState.entrypointValue) {
      allNewEntryPoint.map((each, i) => {
        if (each.code === locationState.entrypointValue) {
          setEntryValueDisplay(each);
        }

        
      });
    } else if (props.entrypointValue) {
      props.allEntryPoint.map((each, i) => {
        if (each.code === props.entrypointValue) {
          setEntryValueDisplay(each);
        }
      });
    } else {
    }

  };

    const createCycle = async () => {

      console.log("createCycle", props);
   if (props.onEnrollPatient) {

      let payload2 = {
        personUuid: patientObj.uuid ? patientObj.uuid : patientObj?.personUuid,
        maternalOutcome: "",
        entryPoint: locationState.entrypointValue,
        hivStatus: patientObj?.dynamicHivStatus,
        pregnancyOutcome: "",
        numberOfInfants: 0,
        pmtctStatus: "INACTIVE",
      };
      try {
        const response = await axios.post(
          `${baseUrl}pmtct/anc/pregnancy-cycle`,
          payload2,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response?.data) {
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
        console.log(e);
        toast.error(
          `${e?.response?.status}: New pmtct cycle not created: ${e?.response?.data}`
        );
        return {
          status: false,
          response: null,
        };
      }

   }
   

    };












  const checkPMTCTValidationDates = async (personUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/check-pmtct-validation-dates?personUuid=${personUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        if (response.data.hasPreviousEnrollment && response.data.previousEnrollmentDate) {
          setMinPmtctEnrollmentDate(response.data.previousEnrollmentDate);
        }
        if (response.data.hasPreviousDelivery && response.data.previousDeliveryDate) {
          setMinDeliveryDate(response.data.previousDeliveryDate);
        }
      }
    } catch (error) {
      console.log("Error checking PMTCT validation dates:", error);
    }
  };

  const getHistoricalHivStatus = async (personUuid) => {
    try {
      const response = await axios.get(
        `${baseUrl}pmtct/anc/get-historical-hiv-status`,
        {
          params: { personUuid },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data === "POSITIVE") {
        // Auto-populate HIV status field
        setEnrollDto((prev) => ({
          ...prev,
          hivStatus: "Positive",
        }));
        toast.info("Patient has a previous HIV positive record. HIV status auto-populated.", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Error fetching historical HIV status:", error);
    }
  };

  useEffect(() => {
   GET_CODESETS();
    checkTimingOfART(0)
    AdultRegimenLine();
;

    if (props?.patientObj.id) {
      getARTStartDate();
      // getHIVStatus(props?.patientObj?.identifier?.identifier[0]?.value,  props?.patientObj.uuid);
    }

    // Check validation dates for PMTCT enrollment and delivery
    const personUuid = props?.patientObj?.uuid || props?.patientObj?.person_uuid || locationState?.patientObj?.uuid || locationState?.patientObj?.person_uuid;
    if (personUuid) {
      checkPMTCTValidationDates(personUuid);
      getHistoricalHivStatus(personUuid);
    }
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null && props?.activeContent?.actionType !== "create"
    ) {
      GetPatientPMTCT(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
    if(!props.activeContent.id && props.htsHivStatus){
      let result= getInitialHivStatus()
        setEnrollDto({...enroll, hivStatus: result? result: props.htsHivStatus})
    }
    if (
      props?.patientObj?.person_uuid ||
      locationState?.patientObj?.person_uuid
    ) {
 

      setEnrollDto({
        ...enroll,
        personUuid: locationState.patientObj.person_uuid,
      });
    } else if (props?.patientObj?.uuid || locationState?.patientObj?.uuid) {
      setEnrollDto({
        ...enroll,
        personUuid: locationState.patientObj.uuid,
      });
    }


    if(props.showLastHivTestMessage){

     toast.info("Last HIV test was Positive", {
      position: toast.POSITION.BOTTOM_CENTER,
});


    }


    


  }, []);

  useEffect(() => {
    // if (props?.allEntryPoint) {
    getPatientEntryType();
    // }
  }, [allNewEntryPoint]);

  useEffect(() => {
    if (props.getPMTCTInfo && canProceedWithEnrollment) {
      props.getPMTCTInfo(enroll);
    }
  }, [enroll, canProceedWithEnrollment]);


    useEffect(() => {
      console.log('props.lastestConfirmatoryTest', props.lastestConfirmatoryTest, props.htsHivStatus)
    if(props.lastestConfirmatoryTest){
       setEnrollDto({...enroll, hivStatus:  getInitialHivStatus()})
       

    }
  }, [props.lastestConfirmatoryTest]);


  const calculateExpectedDate=(lmp)=>{
    let LastPeriod = moment(lmp)
    let expectedDeliveryDate = LastPeriod.add(40, 'weeks')
    // enroll.expectedDeliveryDate = expectedDeliveryDate.format('YYYY-MM-DD')
  
    // console.log("EED Calculation",LastPeriod, expectedDeliveryDate, expectedDeliveryDate.format('YYYY-MM-DD') )
    return expectedDeliveryDate.format('YYYY-MM-DD')

  }

const isHivStatusDisabled = () => {
  return (
    disableHIVStatus ||
    props.lastestConfirmatoryTest ||
    patientObj?.ancNo ||
    props?.patientObj?.dynamicHivStatus
  );
};

    // BATCH API
   const GET_CODESETS = () => {
  
     GET_CODESETS_IN_BATCH("TIMING_MOTHERS_ART_INITIATION", "PMTCT_URINALYSIS_RESULT", "TIME_HIV_DIAGNOSIS", "PMTCT_ENTRY_POINT", "POINT_ENTRY_PMTCT","TIMING_MOTHERS_ART_INITIATION", "TB_STATUS").then((response)=>{

        setTimeHivInitiation(response.data.TIMING_MOTHERS_ART_INITIATION);
        setUrinalysisList(response.data.PMTCT_URINALYSIS_RESULT);
         setTimeHivDiagnosis(response.data.TIME_HIV_DIAGNOSIS)
         setAllNewEntryPoint(response.data.PMTCT_ENTRY_POINT);
         setartStartTime(response.data.TIMING_MOTHERS_ART_INITIATION);
         setTbStatus(response.data.TB_STATUS);


      })}
      //END OF BATCH API

  const GetPatientPMTCT = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-enrollment/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
      

        setEnrollDto({ ...enroll, ...response.data });
        if(entryValueDisplay.code === "PMTCT_ENTRY_POINT_ANC"){

          calculateExpectedDate(response.data.lmp)    // this console should be autocalculated by adding 40wks to the "date of the Last Menstrual Period"
        }
        setInfantMotherArtDto({
          ...infantMotherArtDto,
          regimenTypeId: response.data.regimenTypeId,
          regimenId: response.data.regimenId,
          motherArtInitiationTime: response.data.motherArtInitiationTime,
        });
        RegimenType(response.data.regimenTypeId);
        //regimenTypeId
      })
      .catch((error) => {
        //console.log(error);
      });
  };

//   public int calculateGaFromPmtct(String personUuid, LocalDate visitDate) {
//     LocalDate lmp = getLMPFromPMTCT(personUuid);
//     int ga = (int) ChronoUnit.WEEKS.between(lmp, visitDate);
//     if (ga < 0) ga = 0;
//     return ga;
// }

const updateMaxARTDate=(action)=>{
  if(action === "pp" || action === "ld" ){
    let MAT = enroll.pmtctEnrollmentDate? enroll.pmtctEnrollmentDate: ""
    setMinARTDate(MAT)

  }else if(action === "prior"){
    let MAT = ""
    setMinARTDate(MAT)

  }else if(action === "ga"){

    let MAT = enroll.lmp? enroll.lmp: ""

    setMinARTDate(MAT)

  }
}
const checkTimingOfART=(ga)=>{ 

  setAutoPostPartumTiming(true)
   let GA = parseInt(ga)

   if(locationState.entrypointValue  === "PMTCT_ENTRY_POINT_POST-PARTUM" || props.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"){
    enroll.artStartTime =  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)";
    updateMaxARTDate("pp")
   }else if(locationState.entrypointValue  === "PMTCT_ENTRY_POINT_L&D" || props.entrypointValue === "PMTCT_ENTRY_POINT_L&D"){
    enroll.artStartTime =  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D";
    updateMaxARTDate("pp")
   }else{

    if(GA < 36){
      enroll.artStartTime =  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_<_36_WEEKS_GESTATION_PERIOD";
      updateMaxARTDate("ga")


    }else if(GA >= 36){
      updateMaxARTDate("ga")

      enroll.artStartTime =  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD";

    }else{
      updateMaxARTDate("prior")

    }

   }

    // if(locationState.entrypointValue  === "PMTCT_ENTRY_POINT_POST-PARTUM" || props.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"){
    //   setAutoPostPartumTiming(true)
    // setEnrollDto({...enroll, artStartTime: "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)"})
    // }

   


  }



const calculateGaFromPmtct=(deliveryDate)=>{


// substract lmp - delivery date
let LastPeriod = enroll.lmp

let lmp = moment(enroll.lmp)

if(LastPeriod){
  let dateOfDelivery =moment(deliveryDate)
return dateOfDelivery.diff(lmp, 'weeks')
}else{

  return 0
}

}
  const getARTStartDate = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/art/?PersonUuid=${
          props?.patientObj.person_Uuud
            ? props?.patientObj.person_Uuud
            : props?.patientObj?.personUuud
            ? props?.patientObj?.personUuud
            : props?.patientObj?.person_uuid
            ? props?.patientObj?.person_uuid
            : props?.patientObj?.uuid
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data[0] !== null && response?.data[0]?.artStartDate) {
          setEnrollDto({
            ...enroll,
            artStartDate: response?.data[0]?.artStartDate,
          });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };






  const handleInputChangeEnrollmentDto = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    // artStartTime
    if (e.target.name === "artStartTime" && e.target.value !== "") {
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
   
      setInfantMotherArtDto({
        ...infantMotherArtDto,
        motherArtInitiationTime: e.target.value,
      });

     if(e.target.value === "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)" || e.target.value === "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D"){
        updateMaxARTDate("pp")
      }else if(e.target.value ==="TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD" || e.target.value ===  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_<_36_WEEKS_GESTATION_PERIOD"){
        updateMaxARTDate("ga")

      }else{
        updateMaxARTDate("prior")

      }
      
    }else if(e.target.name === "hivStatus" ){
          if(e.target.value !== "Positive" ){
                  toast.error("Cannot enroll negative client on PMTCT");
          }
        
      }else
    if (e.target.name === "lmp" && e.target.value !== "") {

      let response =   calculateGestationalAge(enroll.pmtctEnrollmentDate, e.target.value)

      if (response > 0) {
        enroll.gaweeks = response;
        setEnrollDto({ ...enroll, [e.target.name]: e.target.value,dateOfDelivery: ""  });
      } else {
        // enroll.gaweeks = response;
        toast.error("Please select a validate date");
         setEnrollDto({ ...enroll, [e.target.name]: "",dateOfDelivery: ""  });
      
      }

      // }
      // getGa();
    }else
    if (e.target.name === "pmtctEnrollmentDate" && e.target.value !== "" && enroll.lmp !== "" ) {

    let response =   calculateGestationalAge( e.target.value,  enroll.lmp )
      if (response > 0) {
        checkTimingOfART(response)

        enroll.gaweeks = response;
      } else {
        // enroll.gaweeks = response;
        toast.error("Please select a validate date");
        // setEnrollDto({ ...enroll, [e.target.name]: e.target.value  });
      }
      if(entryValueDisplay.code === "PMTCT_ENTRY_POINT_ANC"){
       let EDD = calculateExpectedDate(enroll.lmp) 
        setEnrollDto({ ...enroll, [e.target.name]: e.target.value, expectedDeliveryDate:  EDD });

      }else{
        setEnrollDto({ ...enroll, [e.target.name]: e.target.value  });


      }
        
    
    }else
    if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
 
        let Ga =  calculateGaFromPmtct(e.target.value)
     
     if (Ga > 0) {
      enroll.gaweeks = Ga;
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    } else {
      enroll.gaweeks = Ga;
      toast.error("Please select a validate date");
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value , gaweeks: ""});
    }
      
     
    }else{
      setEnrollDto({ ...enroll, [e.target.name]: e.target.value });

    }
  };
  const getHIVStatus = (hospitalNumber, uuid) => {
    axios
  .get(`${baseUrl}pmtct/anc/hiv-status?hospitalNumber=${hospitalNumber}&personUuid=${uuid}`, {
      headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {

        if(response.data){
          setEnrollDto({...enroll, hivStatus: response.data})
          setDisableHIVStatus(true)
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };
            console.log("patientObj", patientObj);

  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate
      ? ""
      : "This field is required";
    //temp.entryPoint = enroll.entryPoint ? "" : "This field is required"
    //temp.ga = enroll.ga ? "" : "This field is required"
    // temp.gravida = enroll.gravida ? "" : "This field is required"
    temp.timeOfHivDiagnosis = enroll.timeOfHivDiagnosis
      ? ""
      : "This field is required";
      temp.gaweeks = enroll.gaweeks
      ? ""
      : "This field is required";
    temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate
      ? ""
      : "This field is required";
    temp.artStartDate = enroll.artStartDate ? "" : "This field is required";
    temp.artStartTime = enroll.artStartTime ? "" : "This field is required";
    temp.tbStatus = enroll.tbStatus ? "" : "This field is required";
    temp.hivStatus = enroll.hivStatus? "" : "This field is required";

    //  enroll.hivStatus === "Positive"

      temp.hivStatus = enroll.hivStatus === "Positive"? "" : "Cannot enroll negative client on PMTCT";

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = async(e) => {
    e.preventDefault();
    enroll.motherArtInitiationTime = infantMotherArtDto.motherArtInitiationTime;
    enroll.regimenTypeId = infantMotherArtDto.regimenTypeId;
    enroll.regimenId = infantMotherArtDto.regimenId;
    enroll.ga = enroll.gaweeks;

    let pmtctCycleId;
    // Create cycle if needed
    if (
      props.onEnrollPatient
    ) {
      const checkIfCycleIsCreated = await createCycle();
      enroll.pmtctCycleId = checkIfCycleIsCreated?.response?.id;
      pmtctCycleId = checkIfCycleIsCreated?.response?.id;

      if (!checkIfCycleIsCreated?.status) {
        toast.error("Failed to create cycle", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return; // Exit if cycle creation fails
      }
    } else {
      enroll.pmtctCycleId = props?.latestPmtctCycle?.id;
    }

    if (validate()) {
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        //Perform operation for update action
        axios
          .put(
            `${baseUrl}pmtct/anc/update-pmtct-enrollment/${props.activeContent.id}`,
            enroll,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
            //props.patientObj.commenced=true
            toast.success("Record updated successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch((error) => {
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      } else {
        //perform operation for save action
        let payload = {
          ...enroll,
          entryPoint: locationState.entrypointValue
            ? locationState.entrypointValue
            : props.entrypointValue,
          personUuid:
            locationState && locationState.patientObj
              ? locationState.patientObj.uuid
              : props.patientObj.uuid,
          personUuid: props.patientObj.person_uuid
            ? props.patientObj.person_uuid
            : locationState.patientObj.uuid,
          pmtctCycleId: pmtctCycleId || props?.latestPmtctCycle?.id,
        };

        axios
          .post(`${baseUrl}pmtct/anc/pmtct-enrollment`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            props.patientObj.pmtctRegStatus = true;
            toast.success("Enrollment save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            if (props.handleRoute) {
              props.handleRoute(response.data);
            } else {
              props.setActiveContent({
                ...props.activeContent,
                route: "recent-history",
              });
            }
          })
          .catch((error) => {
            console.log(error);
            setSaving(false);
            toast.error("Something went wrong", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      }
    }
  };

  return (
    <div>

      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row ">
              <div
                className="card-header mb-3 "
                style={{
                  backgroundColor: "#014d88",
                  color: "#fff",
                  fontWeight: "bolder",
                  borderRadius: "0.2rem",
                  marginTop: "-20px",
                }}
              >
                <h5 className="card-title" style={{ color: "#fff" }}>
                  PMTCT Enrollment
                </h5>
              </div>

              <h3 className="mb-3">
                <span>Point of Entry: </span>

                {entryValueDisplay.display}
              </h3>
<div className="form-group mb-3 col-md-4">
  <FormGroup>
    <Label>
      HIV Status <span style={{ color: "red" }}> *</span>
    </Label>

    <InputGroup>
      <Input
        type="select"
        name="hivStatus"
        id="hivStatus"
        value={enroll.hivStatus}
        onChange={handleInputChangeEnrollmentDto}
        disabled={isHivStatusDisabled()}
      >
        <option value="">Select</option>
        <option value="Positive">Positive</option>
        <option value="Negative">Negative</option>
      </Input>
    </InputGroup>

    {errors.hivStatus && (
      <span className={classes.error}>{errors.hivStatus}</span>
    )}

    {enroll.hivStatus === "Positive" && (
      <div className="mt-3">
        <h3 style={{ color: "red" }}>Kindly refer for ART</h3>
      </div>
    )}
  </FormGroup>
</div>


              {patientObj.ancNo && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      ANC ID
                      {/* <span style={{ color:"red"}}> *</span> */}
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="ancNo"
                        id="ancNo"
                        onChange={handleInputChangeEnrollmentDto}
                        value={patientObj.ancNo}
                        disabled
                      />
                    </InputGroup>
                    {errors.ancNo !== "" ? (
                      <span className={classes.error}>{errors.ancNo}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date of Enrollment <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="pmtctEnrollmentDate"
                      id="pmtctEnrollmentDate"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.pmtctEnrollmentDate}
                      min={
                        minPmtctEnrollmentDate
                          ? minPmtctEnrollmentDate
                          : patientObj.ancNo
                          ? props.patientObj.firstAncDate
                          : props?.newRegDate
                          ? props?.newRegDate
                          : ""
                      }
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </InputGroup>
                  {errors.pmtctEnrollmentDate !== "" ? (
                    <span className={classes.error}>
                      {errors.pmtctEnrollmentDate}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date Of Last Menstrual Period
                    <span style={{ color: "red" }}>*</span>{" "}
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="lmp"
                      id="lmp"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.lmp}
                      max={
                        enroll.pmtctEnrollmentDate
                          ? enroll.pmtctEnrollmentDate
                          : moment(new Date()).format("YYYY-MM-DD")
                      }
                      disabled={props?.ancEntryType}
                    />
                  </InputGroup>
                  {errors.lmp !== "" ? (
                    <span className={classes.error}>{errors.lmp}</span>
                  ) : (
                    ""
                  )}
                  {enroll.gaweeks === 0 ? (
                    <span className={classes.error}>Invalid date </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
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
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.gaweeks}
                      disabled
                    />
                  </InputGroup>
                  {errors.gaweeks !== "" ? (
                    <span className={classes.error}>{errors.gaweeks}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Point of Entry <span style={{ color:"red"}}> *</span></Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="entryPoint"
                                id="entryPoint"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.entryPoint} 
                                disabled={disabledField}
                            >
                                <option value="">Select</option>
                                {entryPoint.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.entryPoint !=="" ? (
                                <span className={classes.error}>{errors.entryPoint}</span>
                        ) : "" }
                        </FormGroup>
                    </div>  */}

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Gravida <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="number"
                      name="gravida"
                      id="gravida"
                      min="1"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.gravida}
                      disabled={disabledField}
                    />
                  </InputGroup>
                  {errors.gravida !== "" ? (
                    <span className={classes.error}>{errors.gravida}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                {/* Post-Partum */}
                <FormGroup>
                  <Label>
                    Timing of ART Initiation{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="artStartTime"
                      id="artStartTime"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.artStartTime}
                      disabled={disabledField}

                      // disabled={disabledField? disabledField : autoPostPartumTiming}
                    >
                      <option value="">Select</option>
                      {artStartTime.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.artStartTime !== "" ? (
                    <span className={classes.error}>{errors.artStartTime}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Art Start Date <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="artStartDate"
                      id="artStartDate"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.artStartDate}
                      max={maxARTDate}
                      min={minARTDate}
                      disabled={disabledField}
                    />
                  </InputGroup>
                  {errors.artStartDate !== "" ? (
                    <span className={classes.error}>{errors.artStartDate}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Time Of HIV Diagnosis{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="timeOfHivDiagnosis"
                      id="timeOfHivDiagnosis"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.timeOfHivDiagnosis}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {timeHivDiagnosis.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.timeHivDiagnosis !== "" ? (
                    <span className={classes.error}>
                      {errors.timeHivDiagnosis}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* <div className=" mb-3 col-md-4">
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
              </div> */}

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
                      <option key={value.id} value={value.code}>
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

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    TB Status <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="tbStatus"
                      id="tbStatus"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.tbStatus}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {tbStatus.map((value, index) => (
                        <option key={index} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                  {errors.tbStatus !== "" ? (
                    <span className={classes.error}>{errors.tbStatus}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Hepatitis B Status
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="hepatitisB"
                      id="hepatitisB"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.hepatitisB}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                    </Input>
                  </InputGroup>
                  {/* {errors.hbstatus !== "" ? (
                    <span className={classes.error}>{errors.hbstatus}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Urinalysis
                    {/* <span style={{ color: "red" }}> *</span> */}
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="urinalysis"
                      id="urinalysis"
                      onChange={handleInputChangeEnrollmentDto}
                      value={enroll.urinalysis}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {urinalysisList.length > 0 &&
                        urinalysisList.map((each) => {
                          return (
                            <option value={each.code} key={each.id}>
                              {each.display}
                            </option>
                          );
                        })}
                    </Input>
                  </InputGroup>
                  {/* {errors.hbstatus !== "" ? (
                    <span className={classes.error}>{errors.hbstatus}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>

              {entryValueDisplay.code === "PMTCT_ENTRY_POINT_ANC" && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Expected date of delivery</Label>
                    <InputGroup>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="expectedDeliveryDate"
                        id="expectedDeliveryDate"
                        onChange={handleInputChangeEnrollmentDto}
                        value={enroll.expectedDeliveryDate}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        min={
                          props?.ancEntryType
                            ? props?.patientObj?.lmp
                            : enroll.lmp
                        }
                        disabled={true}
                      />
                    </InputGroup>
                  </FormGroup>
                </div>
              )}
              {entryValueDisplay.code !== "PMTCT_ENTRY_POINT_ANC" && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Date of Delivery</Label>
                    <InputGroup>
                      <Input
                        type="date"
                        onKeyPress={(e) => {
                          e.preventDefault();
                        }}
                        name="dateOfDelivery"
                        id="dateOfDelivery"
                        onChange={handleInputChangeEnrollmentDto}
                        value={enroll.dateOfDelivery}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        min={
                          minDeliveryDate
                            ? minDeliveryDate
                            : props?.ancEntryType
                            ? props?.patientObj?.lmp
                            : enroll.lmp
                        }
                        disabled={disabledField}
                      />
                    </InputGroup>
                    {errors.artStartDate !== "" ? (
                      <span className={classes.error}>
                        {errors.artStartDate}
                      </span>
                    ) : (
                      ""
                    )}
                    {enroll.gaweeks === 0 && enroll.lmp === "" ? (
                      <span className={classes.error}>
                        Last menstrual period date is empty{" "}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
            </div>
            <div>
              {" "}
              <>
                {/* <Label
                  as="a"
                  color="teal"
                  style={{ width: "106%", height: "35px" }}
                  ribbon
                >
                  <h4 style={{ color: "#fff" }}> Mother's ART </h4>
                </Label>
                <br />
                <br /> */}
                {/* <div className="row">
                </div> */}
              </>
            </div>
            {saving ? <Spinner /> : ""}
            <br />
            {console.log("props", props)}
            {props.hideUpdateButton && (
              <>
                {props.activeContent &&
                props.activeContent.actionType === "update" ? (
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
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AncPnc;
