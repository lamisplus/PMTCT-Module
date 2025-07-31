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
  const [disabledField, setSisabledField] = useState(false);
  const [entrySetting, setEntrySetting] = useState([]);
  const [testEntryPoint, setTestEntryPoint] = useState([]);
  const [communitySetting, setCommunitySetting] = useState([]);
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

  const [payload, setPayload] = useState({
    dateOfHivTest: "",
    testEntryPoint: "",
    testSetting: "",
    initialHivTest: "",
    stageOfPregnancy: "",
    confirmatoryHivTest: "",
    hospitalNumber: props?.patientObj?.hospitalNumber,
     syphilis:"",
    hepatitisB: "",
    hepatitisC: "",

  });
 
 
  



  useEffect(() => {
    POINT_ENTRY_PMTCT();
    TIME_ART_INITIATION_PMTCT();
    TB_STATUS();

    if (props?.patientObj.id) {
      getARTStartDate();
      getHIVStatus(props?.patientObj?.identifier?.identifier[0]?.value,  props?.patientObj.uuid);
    }
   

  }, []);


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


    const HTS_ENTRY_POINT_FACILITY = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FACILITY_HTS_TEST_SETTING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
   
        setCommunitySetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
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
        //console.log(response.data);
        setCommunitySetting(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };


  const getSettingPoint=(testEntryPoint)=>{

    if(testEntryPoint.includes('ENROLLMENT_SETTING_COMMUNITY') ){
    HTS_ENTRY_POINT_COMMUNITY()

    }else{
      HTS_ENTRY_POINT_FACILITY()
    } 

  }

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


   setPayload({ ...payload, [e.target.name]: e.target.value  })
     if (e.target.name === "testEntryPoint" && e.target.value !== "") {

      getSettingPoint(e.target.value)

     }





    // setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    //   setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
   
    //   setInfantMotherArtDto({
    //     ...infantMotherArtDto,
    //     motherArtInitiationTime: e.target.value,
    //   });

    //  if(e.target.value === "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AFTER_DELIVERY_(POST-PARTUM)" || e.target.value === "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_AT_L&D"){
    //     updateMaxARTDate("pp")
    //   }else if(e.target.value ==="TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_>_36_WEEKS_GESTATION_PERIOD" || e.target.value ===  "TIMING_MOTHERS_ART_INITIATION_INITIATED_ART_DURING_PREGNANCY_<_36_WEEKS_GESTATION_PERIOD"){
    //     updateMaxARTDate("ga")

    //   }else{
    //     updateMaxARTDate("prior")

    //   }
      
    // }else if(e.target.name === "hivStatus" ){
    //       if(e.target.value !== "Positive" ){
    //               toast.error("Cannot enroll negative client on PMTCT");
    //       }
        
    //   }else
    // if (e.target.name === "lmp" && e.target.value !== "") {

    //   let response =   calculateGestationalAge(enroll.pmtctEnrollmentDate, e.target.value)

    //   if (response > 0) {
    //     enroll.gaweeks = response;
    //     setEnrollDto({ ...enroll, [e.target.name]: e.target.value,dateOfDelivery: ""  });
    //   } else {
    //     // enroll.gaweeks = response;
    //     toast.error("Please select a validate date");
    //      setEnrollDto({ ...enroll, [e.target.name]: "",dateOfDelivery: ""  });
      
    //   }

    //   // }
    //   // getGa();
    // }else
    // if (e.target.name === "pmtctEnrollmentDate" && e.target.value !== "" && enroll.lmp !== "" ) {

    // let response =   calculateGestationalAge( e.target.value,  enroll.lmp )
    //   if (response > 0) {
    //     checkTimingOfART(response)

    //     enroll.gaweeks = response;
    //   } else {
    //     // enroll.gaweeks = response;
    //     toast.error("Please select a validate date");
    //     // setEnrollDto({ ...enroll, [e.target.name]: e.target.value  });
    //   }
    //   if(entryValueDisplay.code === "PMTCT_ENTRY_POINT_ANC"){
    //    let EDD = calculateExpectedDate(enroll.lmp) 
    //     setEnrollDto({ ...enroll, [e.target.name]: e.target.value, expectedDeliveryDate:  EDD });

    //   }else{
    //     setEnrollDto({ ...enroll, [e.target.name]: e.target.value  });


    //   }
        
    
    // }else
    // if (e.target.name === "dateOfDelivery" && e.target.value !== "") {
 
    //     let Ga =  calculateGaFromPmtct(e.target.value)
     
    //  if (Ga > 0) {
    //   enroll.gaweeks = Ga;
    //   setEnrollDto({ ...enroll, [e.target.name]: e.target.value });
    // } else {
    //   enroll.gaweeks = Ga;
    //   toast.error("Please select a validate date");
    //   setEnrollDto({ ...enroll, [e.target.name]: e.target.value , gaweeks: ""});
    // }
      
     
    // }else{
    //   setEnrollDto({ ...enroll, [e.target.name]: e.target.value });

    // }
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
  //FORM VALIDATION
  const validate = () => {
    let temp = { ...errors };
    temp.dateOfHivTest = payload.dateOfHivTest
      ? ""
      : "This field is required";
    temp.testEntryPoint = payload.testEntryPoint
      ? ""
      : "This field is required";

      temp.testSetting = payload.testSetting
      ? ""
      : "This field is required";

    temp.initialHivTest = payload.initialHivTest
      ? ""
      : "This field is required";



    temp.confirmatoryHivTest = payload.confirmatoryHivTest ? "" : "This field is required";
  
  
  
    payload.testSetting  !== "" &&
     payload.testSetting  === "PMTCT_ENTRY_POINT_ANC" &&
      (temp.stageOfPregnancy = payload.stageOfPregnancy ? "" : "This field is required");
   

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x == "");
  };

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
   console.log("Submitting", payload);
   console.log("Submitting", payload);
    payload.personUuid =locationState && locationState.patientObj? locationState.patientObj.uuid : props.patientObj.uuid
      payload.testingType= "PMTCT_TEST"
     if (validate()) {
    console.log("Submitted");

      setSaving(true);
      if (props.activeContent && props.activeContent.actionType ) {
        axios
          .put(
            `${baseUrl}pmtct/anc/update-pmtct-enrollment/${props.activeContent.id}`,
            enroll,
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
        // let payload = {
        //   ...enroll,
        //   entryPoint: locationState.entrypointValue
        //     ? locationState.entrypointValue
        //     : props.entrypointValue,
        //   personUuid:
        //     locationState && locationState.patientObj
        //       ? locationState.patientObj.uuid
        //       : props.patientObj.uuid,
        //   personUuid: props.patientObj.person_uuid
        //     ? props.patientObj.person_uuid
        //     : locationState.patientObj.uuid,
        // };

        axios
          .post(`${baseUrl}pmtct/anc/pmtct-hts-enrollment`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setSaving(false);
            // props.patientObj.pmtctRegStatus = true;
            toast.success("Enrollment save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            // if (props.handleRoute) {
            //   props.handleRoute(response.data);
            // } else {
              props.setActiveContent({
                ...props.activeContent,
                route: "recent-history",
              });
            // }
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
                  PMTCT HTS
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
                      onKeyPress={(e)=>{e.preventDefault()}}
                      name="dateOfHivTest"
                      id="dateOfHivTest"
                      onChange={handleInputChange}
                      value={payload.dateOfHivTest}
                      // min={patientObj.ancNo? props.patientObj.firstAncDate: props?.newRegDate? props?.newRegDate: ""}
                      max={moment(new Date()).format("YYYY-MM-DD")}
                      disabled={disabledField}
                    />
                  </InputGroup>
        
                  {errors.dateOfHivTest !== "" ? (
                    <span className={classes.error}>{errors.dateOfHivTest}</span>
                  ) : (
                    ""
                  )}
        
                </FormGroup>
              </div>

              
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
                      <span className={classes.error}>{errors.testEntryPoint}</span>
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
                      disabled={disabledField}

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
                    <span className={classes.error}>
                      {errors.testSetting}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

           
           {console.log(payload.testSetting )}
                  {/* FACILITY_HTS_TEST_SETTING_ANC */}
           { payload.testSetting.includes("_ANC") &&  
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
                      <option value="secound trimester">Secound trimester</option>
                      <option value="third trimester">Third trimester"</option>

                    </Input>                        
                        </InputGroup>
                        {errors.stageOfPregnancy !== "" ? (
                          <span className={classes.error}>{errors.stageOfPregnancy}</span>
                        ) : (
                          ""
                        )}
                     
                      </FormGroup>
                    </div>}
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
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
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
                  <Label>  Confirmatory HIV Test   </Label>
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
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                            </Input> 
                  </InputGroup>
                  {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
      
         
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Syphilis   </Label>
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
                              <option value="non-reactive">Non reactive</option>
                            </Input> 
                  </InputGroup>
                  {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
  
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>HepatitisB</Label>
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
                              <option value="reactive">Reactive</option>
                              <option value="non-reactive">Non reactive</option>
                            </Input> 
                  </InputGroup>
                  {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>
           
       <div className="form-group mb-3 col-md-4">
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
                              <option value="reactive">Reactive</option>
                              <option value="non-reactive">Non reactive</option>
                            </Input> 
                  </InputGroup>
                  {/* {errors.confirmatoryHivTest !== "" ? (
                    <span className={classes.error}>{errors.confirmatoryHivTest}</span>
                  ) : (
                    ""
                  )} */}
                </FormGroup>
              </div>

            
            </div>
            {saving ? <Spinner /> : ""}
            <br />

              <>
              
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
                      {  !saving ? "Save" : "Saving..."}
                    </MatButton>
                  </>
              
              </>
   
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PmtctHtsForm;
