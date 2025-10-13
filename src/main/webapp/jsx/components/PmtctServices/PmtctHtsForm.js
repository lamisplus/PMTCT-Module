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

const PmtctHtsForm = (props) => {
  const patientObj = props.patientObj;
  let history = useHistory();

  const location = useLocation();
  const locationState = location && location.state ? location.state : null;
  const [regimenType, setRegimenType] = useState([]);
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [entrySetting, setEntrySetting] = useState([]);
  const [testEntryPoint, setTestEntryPoint] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
  const [disableHIVStatus, setDisableHIVStatus] = useState(false);
  const [autoPostPartumTiming, setAutoPostPartumTiming] = useState(false);
  const [disableEntryPoint, setDisableEntryPoint] = useState(false);

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
  const [maxARTDate, setMaxARTDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );
  const [minARTDate, setMinARTDate] = useState("");
  const [lastPmtctHtsRecord, setLastPmtctHtsRecord] = useState({
        confirmatoryHivTest: "",
        dateOfHivTest: "",
        testEntryPoint: "",
        testSetting: "",
        initialHivTest: "",
        stageOfPregnancy: "",
            
          });

 const [dateOfHivTestExist, setDateOfHivTestExist] = useState(false);

  const [checkingForTheDate, setCheckingForTheDate] = useState(false);

  const [existingDate, setExistingDate] = useState('');

  const [validateHIVRetest,setValidateHIVRetest ] = useState({message: '', isValid: true, showError: false});

  const [payload, setPayload] = useState({
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    stageOfPregnancy: "",
    confirmatoryHivTest: "",
    hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value? props?.patientObj?.identifier?.identifier[0]?.value: props?.patientObj?.hospitalNumber ,
    syphilis: "",
    hepatitisB: "",
    hepatitisC: "",
    testingType: props?.PmtctHtsRetestingType.toUpperCase(),
    personUuid: props.personUuid,
    ancNo: props?.patientObj?.ancNo,
   
  });

    console.log("props searching", props)


//get the person last record on PMTCT HTS if exist 

  const getLastPmtctHtsRecord = (personUuid) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/get-latest-pmtct-hts-enrollment/${props.personUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {

          if(response.data){
           setLastPmtctHtsRecord(response.data)

          }
      })
      .catch((error) => {
        //console.log(error);
      });
  };


  function calculateGestationalAge(dateOfHivTest) {
      let lmpDate=  props?.patientObj?.lmp
    

  // Parse LMP date
  const lmp = moment(lmpDate, "YYYY-MM-DD");
  const today = moment(dateOfHivTest, "YYYY-MM-DD");
 


  // Calculate difference in weeks
  const weeks = today.diff(lmp, 'weeks');


  return weeks;
}


  const getStageOfPregnancy = (testSetting) => {

            
      if(props?.patientObj?.ancNo && props?.patientObj?.gaweeks  && testSetting.includes("_ANC")){

          let gestationalAge=calculateGestationalAge(payload.dateOfHivTest)
          console.log('calculateGestationalAge', gestationalAge)
          //  props?.patientObj?.gaweeks
            // Determine trimester based on gestational age
            if (gestationalAge >= 0 && gestationalAge <= 12) {

              setPayload({...payload, stageOfPregnancy: "first trimester", testSetting: testSetting})

            } else if (gestationalAge >= 13 && gestationalAge <= 24) {

              setPayload({...payload, stageOfPregnancy: "secound trimester", testSetting: testSetting})

            } else if (gestationalAge >= 25 && gestationalAge <= 40) {

              setPayload({...payload, stageOfPregnancy: "third trimester", testSetting: testSetting})

            }
            
          
      }else{
          
              setPayload({...payload, stageOfPregnancy: "", testSetting: testSetting})

      }

  };

  useEffect(() => {
    POINT_ENTRY_PMTCT();
    TIME_ART_INITIATION_PMTCT();
    TB_STATUS();
    getLastPmtctHtsRecord();
    if (props?.patientObj?.id && props?.activeContent?.id && props?.activeContent?.actionType !== 'create') {
      viewPmtctHtsRecord(props?.patientObj?.id);

      getARTStartDate();
      getHIVStatus(
        props?.patientObj?.identifier?.identifier[0]?.value,
       props.personUuid
      );
    }
  }, [props?.activeContent]);

  const viewPmtctHtsRecord = (id) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/view-pmtct-hts-enrollment/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setPayload({
          dateOfHivTest: response.data.dateOfHivTest,
          testEntryPoint: response.data.testEntryPoint,
          testSetting: response.data.testSetting,
          initialHivTest: response.data.initialHivTest,
          stageOfPregnancy: response.data.stageOfPregnancy,
          confirmatoryHivTest: response.data.confirmatoryHivTest,
          
          hospitalNumber: response.data.hospitalNumber,
          syphilis: response.data.syphilis,
          hepatitisB: response.data.hepatitisB,
          hepatitisC: response.data.hepatitisC,
          testingType: response.data.testingType,
          personUuid:props.personUuid,
        });

      setExistingDate(response.data.dateOfHivTest)
      getSettingPoint(response.data.testEntryPoint);

        if (props.activeContent.id === "view") {
          setDisabledField(true);
        } else if (props.activeContent.id === "update") {
          setDisabledField(false);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

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

  const POINT_ENTRY_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTestEntryPoint(response.data);
        // console.log("deducted", ans);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  // const HTS_ENTRY_POINT_FACILITY = () => {
  //   axios
  //     .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((response) => {
  //       setCommunitySetting(response.data);
  //     })
  //     .catch((error) => {
  //       //console.log(error);
  //     });
  // };


  const HTS_ENTRY_POINT_FACILITY = () => {
  axios
    .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
              if(response.data){
//         "FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY",

      const requiredCodes = [
        "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING",
        "FACILITY_HTS_TEST_SETTING_L&D",
        "FACILITY_HTS_TEST_SETTING_ANC"
      ];

      const filteredData = response.data.filter(item => 
        requiredCodes.includes(item.code)
      );

      setCommunitySetting(filteredData);
    }
    })
    .catch((error) => {
      console.error("Error fetching HTS entry points:", error);
    });
};

  const HTS_ENTRY_POINT_COMMUNITY = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/COMMUNITY_HTS_TEST_SETTING
 `,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {


        if(response.data){
              const requiredCodes = [
        "COMMUNITY_HTS_TEST_SETTING_CONGREGATIONAL_SETTING",
        "COMMUNITY_HTS_TEST_SETTING_DELIVERY_HOMES",
        "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
        "COMMUNITY_HTS_TEST_SETTING_TBA_RT-HCW"
      ];

const filteredData = response.data.filter(item => 
        requiredCodes.includes(item.code)
      );

      setCommunitySetting(filteredData);



        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getSettingPoint = (testEntryPoint) => {
    if (testEntryPoint.includes("ENROLLMENT_SETTING_COMMUNITY")) {
      HTS_ENTRY_POINT_COMMUNITY();
    } else {
      HTS_ENTRY_POINT_FACILITY();
    }
  };

  const TIME_ART_INITIATION_PMTCT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TIMING_MOTHERS_ART_INITIATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setartStartTime(response.data);
      })
      .catch((error) => {});
  };
  const TB_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TB_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTbStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const handleInputChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });

    if (e.target.name === "testEntryPoint" && e.target.value !== "") {
       getSettingPoint(e.target.value);
        if(e.target.value === "ENROLLMENT_SETTING_FACILITY"  && props?.patientObj?.ancNo){
          
          setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: "FACILITY_HTS_TEST_SETTING_ANC"  });
            setDisableEntryPoint(true)

        }else if(e.target.value === "ENROLLMENT_SETTING_FACILITY"  && props?.entrypointValue ==="PMTCT_ENTRY_POINT_L&D"){
         setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: "FACILITY_HTS_TEST_SETTING_L&D"  });
            setDisableEntryPoint(true)


        }else if(e.target.value === "ENROLLMENT_SETTING_FACILITY"  && props?.entrypointValue === "PMTCT_ENTRY_POINT_POST-PARTUM"){

          setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING"  });
            setDisableEntryPoint(true)

        }else{

          setPayload({ ...payload, [e.target.name]: e.target.value,testSetting: ''  });
            setDisableEntryPoint(false)

        }




    }else if(e.target.name === "dateOfHivTest" && e.target.value !== ""){
      checkifDateExist(e.target.value)
    }else if(e.target.name === "testSetting" && e.target.value !== ""){
            getStageOfPregnancy(e.target.value)

      }else{
          setPayload({ ...payload, [e.target.name]: e.target.value });


      }
  
  };
  const getHIVStatus = (hospitalNumber, uuid) => {
    axios
      .get(
        `${baseUrl}pmtct/anc/hiv-status?hospitalNumber=${hospitalNumber}&personUuid=${uuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data) {
          setEnrollDto({ ...enroll, hivStatus: response.data });
          setDisableHIVStatus(true);
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  };



    const checkifDateExist = (dateOfHivTest) => {
    setCheckingForTheDate(true)
    axios
      .get(
        `${baseUrl}pmtct/anc/check-if-date-exist?personUuid=${props.personUuid}&dateOfHivTest=${dateOfHivTest}&`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
      //  
      setDateOfHivTestExist(response.data && existingDate !== dateOfHivTest ? true : false )
      setCheckingForTheDate(false)

      setPayload({...payload, dateOfHivTest: dateOfHivTest})
      setErrors({ ...errors,  dateOfHivTest: response.data && existingDate !== dateOfHivTest ? "Date already exist": '' });

      if(lastPmtctHtsRecord?.dateOfHivTest){
       validateHIVRetestDate(dateOfHivTest)

      }   

      })
      .catch((error) => {
        //console.log(error);
      setCheckingForTheDate(false)

      });
  };




  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.dateOfHivTest = payload.dateOfHivTest ? "" : "This field is required";
// dateOfHivTestExist
  
    temp.dateOfHivTest = dateOfHivTestExist ? "Date already exist" : payload.dateOfHivTest? "" : "This field is required";

    temp.testEntryPoint = payload.testEntryPoint
      ? ""
      : "This field is required";

    temp.testSetting = payload.testSetting ? "" : "This field is required";

    temp.initialHivTest = payload.initialHivTest
      ? ""
      : "This field is required";

    temp.confirmatoryHivTest = payload.confirmatoryHivTest
      ? ""
      : "This field is required";




    payload.testSetting !== "" &&
      payload.testSetting === "PMTCT_ENTRY_POINT_ANC" &&
      (temp.stageOfPregnancy = payload.stageOfPregnancy
        ? ""
        : "This field is required");

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };


  function validateHIVRetestDate(newTestDate) {

  let lastTestDate= lastPmtctHtsRecord?.dateOfHivTest


  // Parse dates using moment
  const newDate = moment(newTestDate);
  const lastDate = moment(lastTestDate);

 

  // Check if new test is before or same as last test
  if (newDate.isSameOrBefore(lastDate)) {
    setValidateHIVRetest({
        message: "New test date must be after the last test date",
        isValid: false, 
        showError: true

    })

  }


  // Calculate difference in days
  const daysDifference = newDate.diff(lastDate, 'days');
  const isWithinOneMonth = daysDifference < 30;

  if (isWithinOneMonth ) {
        setValidateHIVRetest({
         message: `Cannot document HIV test. Test is within 1 month (${daysDifference} days) of last test.`,
        isValid: false, 
        showError: true

    })
 
  }


  let gestationalAge= calculateGestationalAge(newTestDate)
  if(props?.patientObj?.ancNo){

          // Determine trimesters
          const getTrimester = (gestationalAge) => {
            if (gestationalAge >= 0 && gestationalAge <= 12) return "first trimester";
            if (gestationalAge >= 13 && gestationalAge <= 24) return "second trimester";
            if (gestationalAge >= 25 && gestationalAge <= 40) return "third trimester";
            return "Unknown";
          };

          const lastTrimester =lastPmtctHtsRecord?.stageOfPregnancy
          const newTrimester = getTrimester(gestationalAge);
          const isSameTrimester = lastTrimester === newTrimester


            if ( isSameTrimester) {
                setValidateHIVRetest({
                message: `Cannot document HIV test. Test is in the same trimester (${newTrimester}).`,
                isValid: false, 
                showError: true

            })
 
  }



}
     setValidateHIVRetest({
        message: "HIV test date is valid", 
         isValid: true,
        showError: false

    })

}

  /**** Submit Button Processing  */

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting", payload);
    console.log("Submitting", payload);
    if (validate() && !checkingForTheDate && validateHIVRetest.isValid) {
      console.log("Submitted");

      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-pmtct-hts-enrollment/${props.activeContent.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((response) => {
            setSaving(false);
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

        axios
          .post(`${baseUrl}pmtct/anc/pmtct-hts-enrollment`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            toast.success("Enrollment save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            if (props.handleRoute && props.onEnrollPatient) {
              let data = {

                ...props?.patientObj, 
                id:  props?.patientObj.id,  
                entryPoint: props.entrypointValue,
              
                hospitalNumber: props?.patientObj?.identifier?.identifier[0]?.value ,
                fullName: props?.patientObj?.surname,
                age: props?.patientAge,
                hivStatus: props?.patientObj?.dynamicHivStatus,
                 ancNo: props?.patientObj?.ancNo,
                personUuid:props.personUuid ,
            
            };
              props.handleRoute(data);
              console.log("What are we passing", props?.patientObj);
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

    if(!validateHIVRetest.isValid){
        console.log('validateHIVRetest', validateHIVRetest)
   toast.error(validateHIVRetest.message, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
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
                  {props?.PmtctHtsRetestingType === "pmtct-hts"
                    ? " PMTCT HTS"
                    : "Retesting"}
                </h5>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date of HIV Test <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="date"
                      onKeyPress={(e) => {
                        e.preventDefault();
                      }}
                      name="dateOfHivTest"
                      id="dateOfHivTest"
                      onChange={handleInputChange}
                      value={payload.dateOfHivTest}
                       min={patientObj.ancNo? props?.patientObj?.firstAncDate:""}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </InputGroup>

                  {errors.dateOfHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfHivTest}
                    </span>
                  ) : (
                    ""
                  )}
            
                </FormGroup>
              </div>

              
          <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                         Hospital Number<span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="hospitalNumber"
                            id="hospitalNumber"
                            // onChange={handleInputChange}
                            value={payload.hospitalNumber}
                            disabled
                          />
                        </InputGroup>
                    
                        
                      </FormGroup>
                    </div>

                 { props?.patientObj?.ancNo && <div className="form-group mb-3 col-md-4">
                      <FormGroup>
                        <Label>
                          ANC No <span style={{ color: "red" }}> *</span>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="ancNo"
                            id="ancNo"
                            // onChange={handleInputChangeANC}
                            value={payload.ancNo}
                            disabled

                          />
                        </InputGroup>
                      </FormGroup>
                    </div>}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Test Entry Point
                    {/* <span style={{ color:"red"}}> *</span> */}
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="testEntryPoint"
                      id="testEntryPoint"
                      onChange={handleInputChange}
                      value={payload.testEntryPoint}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {testEntryPoint.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>

                  {errors.testEntryPoint !== "" ? (
                    <span className={classes.error}>
                      {errors.testEntryPoint}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Test Setting <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="testSetting"
                      id="testSetting"
                      onChange={handleInputChange}
                      value={payload.testSetting}
                      disabled={disableEntryPoint? disableEntryPoint: disabledField}
                    >
                      <option value="">Select</option>
                      {communitySetting.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                      {/* <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option> */}
                    </Input>
                  </InputGroup>
                  {errors.testSetting !== "" ? (
                    <span className={classes.error}>{errors.testSetting}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {console.log(payload.testSetting)}
              {/* FACILITY_HTS_TEST_SETTING_ANC */}
              {payload.testSetting.includes("_ANC") && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>
                      Stage of Pregnancy
                      <span style={{ color: "red" }}>*</span>{" "}
                    </Label>
                    <InputGroup>
                      <Input
                        type="select"
                        name="stageOfPregnancy"
                        id="stageOfPregnancy"
                        onChange={handleInputChange}
                        value={payload.stageOfPregnancy}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        <option value="first trimester">First trimester</option>
                        <option value="second trimester">
                          Second trimester
                        </option>
                        <option value="third trimester">
                          Third trimester
                        </option>
                      </Input>
                    </InputGroup>
                    {errors.stageOfPregnancy !== "" ? (
                      <span className={classes.error}>
                        {errors.stageOfPregnancy}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Initial HIV Test
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="initialHivTest"
                      id="initialHivTest"
                      onChange={handleInputChange}
                      value={payload.initialHivTest}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="reactive">Reactive</option>
                      <option value="non-reactive">Non-reactive</option>
                    </Input>
                  </InputGroup>
                  {errors.initialHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.initialHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label> Confirmatory HIV Test </Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="confirmatoryHivTest"
                      id="confirmatoryHivTest"
                      onChange={handleInputChange}
                      value={payload.confirmatoryHivTest}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                        <option value="reactive">Reactive</option>
                      <option value="non-reactive">Non-reactive</option>
                    </Input>
                  </InputGroup>
                  {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.confirmatoryHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>


          <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Tie Breaker</Label>
                  <InputGroup>
                    <Input
                      type="select"
                      name="tieBreaker"
                      id="tieBreaker"
                      onChange={handleInputChange}
                      value={payload.confirmatoryHivTest}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                        <option value="reactive">Reactive</option>
                      <option value="non-reactive">Non-reactive</option>
                    </Input>
                  </InputGroup>
                  {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>
                      {errors.confirmatoryHivTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {props?.PmtctHtsRetestingType === "pmtct-hts" && (
                <>
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Syphilis </Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="syphilis"
                          id="syphilis"
                          onChange={handleInputChange}
                          value={payload.syphilis}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                      <option value="reactive">Reactive</option>
                      <option value="non-reactive">Non-reactive</option>                        </Input>
                      </InputGroup>
                      {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                    </FormGroup>
                  </div>

                  {props?.PmtctHtsRetestingType === "pmtct-hts" &&<div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Hepatitis B</Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="hepatitisB"
                          id="hepatitisB"
                          onChange={handleInputChange}
                          value={payload.hepatitisB}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>
                        </Input>
                      </InputGroup>
                      {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                    </FormGroup>
                  </div>}

                {props?.PmtctHtsRetestingType === "pmtct-hts" && <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Hepatitis C</Label>
                      <InputGroup>
                        <Input
                          type="select"
                          name="hepatitisC"
                          id="hepatitisC"
                          onChange={handleInputChange}
                          value={payload.hepatitisC}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>                        </Input>
                      </InputGroup>
                      {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                    </FormGroup>
                  </div>}
                </>
              )}
            </div>
            {saving ? <Spinner /> : ""}
            <br />

            <>
              <>
      

                        
           <>
                {props.activeContent && props.activeContent.actionType === "update"  ? (
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
            
              </>
            </>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PmtctHtsForm;
