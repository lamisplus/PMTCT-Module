import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, Icon, List, Button, Card,Feed } from 'semantic-ui-react'
// Page titie
import { FormGroup, Label as FormLabelName, InputGroup,
          InputGroupText,
          Input,
        } from "reactstrap";
import ADR from './ADR/Index'
import OpportunisticInfection from './OpportunisticInfection/Index'
import TBScreening from './TBScreening/Index'
import { url as baseUrl, token } from "../../../api";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import axios from "axios";
//import AddVitals from './Vitals/AddVitals'
import AddAllergy from './Allergies/AddAllergy'
import AddCondition from './Conditions/AddCondition'
import PostPatient from './PostPatient/Index'
import moment from "moment";
import { toast } from "react-toastify";
import { Accordion, Alert } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";

let adherenceLevelObj = []
const useStyles = makeStyles(theme => ({
  card: {
    margin: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  cardBottom: {
    marginBottom: 20
  },
  Select: {
    height: 45,
    width: 350
  },
  button: {
    margin: theme.spacing(1)
  },

  root: {
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  input: {
    display: 'none'
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}))

const ClinicVisit = (props) => {
  let patientObj = props.patientObj ? props.patientObj : {}
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [splitButtonOpen, setSplitButtonOpen] = React.useState(false);
  const toggleDropDown = () => setDropdownOpen(!dropdownOpen);
  const toggleSplit = () => setSplitButtonOpen(!splitButtonOpen);
  const [heightValue, setHeightValue]= useState("cm")
  const [errors, setErrors] = useState({});
  const [clinicVisitList, setClinicVisitList] = useState([])
  const [loading, setLoading] = useState(true)
  const [
    activeAccordionHeaderShadow,
    setActiveAccordionHeaderShadow,
  ] = useState(0);
  let temp = { ...errors }
  const classes = useStyles()
  const [getPatientObj, setGetPatientObj] = useState({});
  const [saving, setSaving] = useState(false);
  const [clinicalStage, setClinicalStage] = useState([]);
  const [functionalStatus, setFunctionalStatus] = useState([]);
  const [adherenceLevel, setAdherenceLevel] = useState([]);
  const [tbStatus, setTbStatus] = useState([]);
  const [TBForms, setTBForms] = useState(false)
  // const [addVitalModal, setAddVitalModal] = useState(false);
  // const AddVitalToggle = () => setAddVitalModal(!addVitalModal)
  const [addConditionModal, setAddConditionModal] = useState(false);
  const AddConditionToggle = () => setAddConditionModal(!addConditionModal)
  const [addAllergyModal, setAddAllergyModal] = useState(false);
  const AddAllergyToggle = () => setAddAllergyModal(!addAllergyModal)
  const [postPatientModal, setPostPatientModal] = useState(false);
  const PostPatientToggle = () => setPostPatientModal(!postPatientModal)
  const [currentVitalSigns, setcurrentVitalSigns] = useState({})
  const [showCurrentVitalSigns, setShowCurrentVitalSigns] = useState(false)
  //opportunistic infection Object
  const [infection, setInfection] = useState({ illnessInfection: "", ondateInfection: "" });
  const [infectionList, setInfectionList] = useState([]);
  //ADR array Object 
  const [adrObj, setAdrObj] = useState({ adr: "", adrOnsetDate: "" });
  const [adrList, setAdrList] = useState([]);
  //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
                                                                    bodyWeight: "",
                                                                    diastolic: "",
                                                                    height: "",
                                                                    systolic: "",
                                                                    pulse:"",
                                                                    temperature:"",
                                                                    respiratoryRate:"" 
                                                                  })
  const [objValues, setObjValues] = useState({
    adherenceLevel: "",
    adheres: {},
    adrScreened: "",
    adverseDrugReactions: {},
    artStatusId: "" ,
    cd4: "",
    cd4Percentage: "",
    clinicalNote: "",
    clinicalStageId: "",
    facilityId: 0,
    functionalStatusId: "",
    hivEnrollmentId: "",
    nextAppointment: "",
    lmpDate: "",
    oiScreened: "",
    opportunisticInfections: {},
    personId: patientObj.id,
    tbScreen: {},
    stiIds: "",
    stiTreated: "",
    uuid: "",
    visitDate: "",
    whoStagingId: ""
  });
  const [vital, setVitalSignDto] = useState({
    bodyWeight: "",
    diastolic: "",
    encounterDate: "",
    facilityId: 1,
    height: "",
    personId: props.patientObj.id,
    serviceTypeId: 1,
    systolic: "",
    pulse:"",
    temperature:"",
    respiratoryRate:"" 
  })
  const [tbObj, setTbObj] = useState({
    currentOnIpt: "",
    coughing: "",
    antiTBDrug: "",
    nightSweat: "",
    fever: "",
    contactWithTBCase: "",
    lethergy: "",
    tbStatusId: ""
  });

  useEffect(() => {
    FunctionalStatus();
    WhoStaging();
    AdherenceLevel();
    TBStatus();
    VitalSigns();
    GetPatientObj();
    ClinicVisitList();
    PatientDetaild();
    //hiv/patient/3
  }, []);
     //GET LIST Drug Refill
     async function ClinicVisitList() {
      setLoading(true)
      axios
          .get(`${baseUrl}hiv/art/clinic-visit/person?pageNo=0&pageSize=10&personId=${props.patientObj.id}`,
          { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              setLoading(false)
              setClinicVisitList(response.data);                
          })
          .catch((error) => {  
              setLoading(false)  
          });        
    }
    //Check for the last Vital Signs
    const VitalSigns = () => {
    axios
      .get(`${baseUrl}patient/vital-sign/person/${props.patientObj.id}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {

        const lastVitalSigns = response.data[response.data.length - 1]
        if (lastVitalSigns.encounterDate === moment(new Date()).format("YYYY-MM-DD") === true) {
          setcurrentVitalSigns(lastVitalSigns)
          setShowCurrentVitalSigns(true)
        }
      })
      .catch((error) => {
        //console.log(error);
      });
    }
    //Check for the Patient Object
    const PatientDetaild = () => {
      axios
        .get(`${baseUrl}hiv/patient/${props.patientObj.id}`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
            patientObj=response.data
        })
        .catch((error) => {
          //console.log(error);
        });
      }
    //Get The updated patient objeect
    const GetPatientObj = () => {
      axios
        .get(`${baseUrl}hiv/patients`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          const patObJ= response.data.filter((x)=> x.id===props.patientObj.id)

          setGetPatientObj(patObJ[0])
        })
        .catch((error) => {
          //console.log(error);
        });
    }

  //Get list of WhoStaging
  const WhoStaging = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CLINICAL_STAGE`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        //console.log(response.data);
        setClinicalStage(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });

  }
  ///GET LIST OF FUNCTIONAL%20_STATUS
  // TB STATUS
  const TBStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TB_STATUS`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        //console.log(response.data);
        setTbStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });

  }

  async function FunctionalStatus() {
    axios
      .get(`${baseUrl}application-codesets/v2/FUNCTIONAL%20_STATUS`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {

        setFunctionalStatus(response.data);
        //setValues(response.data)
      })
      .catch((error) => {
      });
  }
  ///Level of Adherence
  async function AdherenceLevel() {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        setAdherenceLevel(response.data);

      })
      .catch((error) => {
      });
  }
  const handleInputChange = e => {
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
    if (e.target.name === "whoStagingId") {
      if (e.target.value === "NO") {
        setTBForms(true)
      } else {
        setTBForms(false)
      }
    }
  }
  const handleInputChangeVitalSignDto = e => {
    setVitalSignDto({ ...vital, [e.target.name]: e.target.value });
  }

  const addConditionsModal = () => {
    //setpatientObj({...patientObj, ...row});
    setAddConditionModal(!addConditionModal)
  }
  const addAllergiesModal = () => {
    //setpatientObj({...patientObj, ...row});
    setAddAllergyModal(!addAllergyModal)
  }
  const PostPatientService = (row) => {
    //setpatientObj({...patientObj, ...row});
    setPostPatientModal(!postPatientModal)
  }
  //Handle CheckBox 
  const handleCheckBox = e => {
    if (e.target.checked) {
      //currentVitalSigns.personId === null ? props.patientObj.id : currentVitalSigns.personId
      setVitalSignDto({ ...currentVitalSigns })
    } else {
      setVitalSignDto({
        bodyWeight: "",
        diastolic: "",
        encounterDate: "",
        facilityId: "",
        height: "",
        personId: props.patientObj.id,
        serviceTypeId: "",
        systolic: "",
        pulse:"",
        temperature:"",
        respiratoryRate:"" 
      })
    }
  }
  //to check the input value for clinical decision 
  const handleInputValueCheckHeight =(e)=>{
    if(e.target.name==="height" && (e.target.value < 48.26 || e.target.value>216.408)){
      const message ="Height cannot be greater than 216.408 and less than 48.26"
      setVitalClinicalSupport({...vitalClinicalSupport, height:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, height:""})
    }
  }
  const handleInputValueCheckBodyWeight =(e)=>{
    if(e.target.name==="bodyWeight" && (e.target.value < 3 || e.target.value>150)){      
      const message ="Body weight must not be greater than 150 and less than 3"
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:""})
    }
  }
  const handleInputValueCheckSystolic =(e)=>{
    if(e.target.name==="systolic" && (e.target.value < 90 || e.target.value>240)){      
      const message ="Blood Pressure systolic must not be greater than 240 and less than 90"
      setVitalClinicalSupport({...vitalClinicalSupport, systolic:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, systolic:""})
    }
  }
  const handleInputValueCheckDiastolic =(e)=>{
    if(e.target.name==="diastolic" && (e.target.value < 60 || e.target.value>140)){      
      const message ="Blood Pressure diastolic must not be greater than 140 and less than 60"
      setVitalClinicalSupport({...vitalClinicalSupport, diastolic:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, diastolic:""})
    }
  }
  const handleInputValueCheckPulse =(e)=>{
    if(e.target.name==="pulse" && (e.target.value < 40 || e.target.value>120)){      
    const message ="Pulse must not be greater than 120 and less than 40"
    setVitalClinicalSupport({...vitalClinicalSupport, pulse:message})
    }else{
    setVitalClinicalSupport({...vitalClinicalSupport, pulse:""})
    }
}
const handleInputValueCheckRespiratoryRate =(e)=>{
    if(e.target.name==="respiratoryRate" && (e.target.value < 10 || e.target.value>70)){      
    const message ="Respiratory Rate must not be greater than 70 and less than 10"
    setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:message})
    }else{
    setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:""})
    }
}
const handleInputValueCheckTemperature =(e)=>{
    if(e.target.name==="temperature" && (e.target.value < 35 || e.target.value>47)){      
    const message ="Temperature must not be greater than 47 and less than 35"
    setVitalClinicalSupport({...vitalClinicalSupport, temperature:message})
    }else{
    setVitalClinicalSupport({...vitalClinicalSupport, temperature:""})
    }
}
  //Validations of the forms
  const validate = () => {        
    temp.encounterDate = vital.encounterDate ? "" : "This field is required"
    temp.nextAppointment = objValues.nextAppointment ? "" : "This field is required"
    temp.whoStagingId = objValues.whoStagingId ? "" : "This field is required"
    temp.clinicalNote = objValues.clinicalNote ? "" : "This field is required"
    temp.functionalStatusId = objValues.functionalStatusId ? "" : "This field is required"
    temp.adherenceLevel = objValues.adherenceLevel ? "" : "This field is required"
    temp.labTestGroupId = vital.diastolic ? "" : "This field is required"
    temp.systolic = vital.systolic ? "" : "This field is required"
    temp.height = vital.height ? "" : "This field is required"
    temp.bodyWeight = vital.bodyWeight ? "" : "This field is required"
    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }


  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validate()){
    setSaving(true)
    objValues.visitDate = vital.encounterDate
    objValues.adverseDrugReactions = adrList
    objValues.artStatusId = getPatientObj.artCommence.id
    objValues.hivEnrollmentId = getPatientObj.enrollment.id
    objValues.opportunisticInfections = infectionList
    objValues.tbScreen = tbObj
    objValues['vitalSignDto'] = vital
    axios.post(`${baseUrl}hiv/art/clinic-visit/`, objValues,
      { headers: { "Authorization": `Bearer ${token}` } },

    )
      .then(response => {
        PatientDetaild();
        setSaving(false);
        toast.success("Clinic Visit save successful");
        props.setActiveContent({...props.activeContent, route:'recent-history'})
      })
      .catch(error => {
        setSaving(false);
        if(error.response && error.response.data){
          let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
          toast.error(errorMessage);
        }
        else{
          toast.error("Something went wrong. Please try again...");
        }
       
      });
    }
  }


  return (
    <div>
    <div className="row">

      <div className="col-md-6">
        <h2>Clinic Follow-up Visit</h2>
        </div>
        
      </div>
      <Grid columns='equal'>
       <Grid.Column width={5}>
          
            <Segment>
              <Label as='a' color='blue' style={{width:'110%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>Vital Signs</h4>
              </Label>
              <br />

               <PerfectScrollbar
                style={{ height: "370px" }}
                id="DZ_W_Todo1"
                className="widget-media dz-scroll ps ps--active-y"
              >
                <br/>
                    <ul className="timeline">
                    { clinicVisitList.length > 0 ?(
                      
                    <Accordion
                        className="accordion accordion-header-bg accordion-header-shadow accordion-rounded "
                        defaultActiveKey="0"
                        
                      >
                        <>
                        {clinicVisitList.map((visit, i)=>
                        <div className="accordion-item" key={i} >
                          <Accordion.Toggle
                              as={Card.Text}
                              eventKey={`${i}`}
                              className={`accordion-header ${
                                activeAccordionHeaderShadow === 1 ? "" : "collapsed"
                              } accordion-header-info`}
                              onClick={() =>
                                setActiveAccordionHeaderShadow(
                                  activeAccordionHeaderShadow === 1 ? -1 : i
                                )
                              }
                              style={{width:'100%'}}
                          >
                          <span className="accordion-header-icon"></span>
                          <span className="accordion-header-text float-start">Visit Date : <span className="">{visit.visitDate}</span> </span>
                          <span className="accordion-header-indicator"></span>
                        </Accordion.Toggle>
                        <Accordion.Collapse
                          eventKey={`${i}`}
                          className="accordion__body"
                        >
                          <div className="accordion-body-text">
                        
                              <List celled style={{width:'100%'}}>
                                  {visit.vitalSignDto && visit.vitalSignDto.pulse!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px',borderTop:'1px solid #fff', marginTop:'-5px' }}>Pulse <span style={{color:'rgb(153, 46, 98)'}} className="float-end"><b>{visit.vitalSignDto.pulse} bpm</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.respiratoryRate!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>Respiratory Rate <span className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{visit.vitalSignDto.respiratoryRate} bpm</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.temperature!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>Temperature <span className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{visit.vitalSignDto.temperature} <sup>0</sup>C</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.systolic!==null && visit.vitalSignDto.diastolic!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>Blood Pressure <span  className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{visit.vitalSignDto.systolic}/{visit.vitalSignDto.diastolic}</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.height!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>Height <span  className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{visit.vitalSignDto.height} cm</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.bodyWeight!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>Weight <span  className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{visit.vitalSignDto.bodyWeight} kg</b></span></List.Item>)}
                                  {visit.vitalSignDto && visit.vitalSignDto.bodyWeight!==null && visit.vitalSignDto.height!==null && (<List.Item style={{paddingBottom:'10px', paddingTop:'10px'}}>BMI <span  className="float-end"><b style={{color:'rgb(153, 46, 98)'}}>{Math.round(visit.vitalSignDto.bodyWeight/(visit.vitalSignDto.height/100))} kg</b></span></List.Item>)}
                              </List>
                            
                          </div>
                        </Accordion.Collapse>
                      </div>
                    )}
                    </>
                    </Accordion>             

                ):
                (
                  <>
                  <br/>
                  <Alert
                      variant="info"
                      className="alert-dismissible solid fade show"
                    >
                      <p>No Vital Signs</p>
                    </Alert>
                  </>
                )}
                    </ul>
               
                </PerfectScrollbar>
            </Segment>
            <Segment>
              <Label as='a' color='teal' style={{width:'110%', height:'35px'}} ribbon>
                <h4 style={{color:'#fff'}}>Previous Clinical Notes</h4>
              </Label>
               
             <PerfectScrollbar
               style={{ height: "370px" }}
               id="DZ_W_Todo1"
               className="widget-media dz-scroll ps ps--active-y"
             >
              <br/>
               <ul className="timeline">
               { clinicVisitList.length > 0 ?(
                 
               <Accordion
                   className="accordion accordion-header-bg accordion-header-shadow accordion-rounded "
                   defaultActiveKey="0"
                 >
                   <>
                   {clinicVisitList.map((visit, i)=>
                 <div className="accordion-item" key={i}>
                   <Accordion.Toggle
                     as={Card.Text}
                     eventKey={`${i}`}
                     className={`accordion-header ${
                       activeAccordionHeaderShadow === 1 ? "" : "collapsed"
                     } accordion-header-info`}
                     onClick={() =>
                       setActiveAccordionHeaderShadow(
                         activeAccordionHeaderShadow === 1 ? -1 : i
                       )
                     }
                     style={{width:'100%'}}
                   >
                     <span className="accordion-header-icon"></span>
                     <span className="accordion-header-text float-start" style={{width:'100%'}}>Visit Date : <span className="">{visit.visitDate}</span> </span>
                     <span className="accordion-header-indicator "></span>
                   </Accordion.Toggle>
                   <Accordion.Collapse
                     eventKey={`${i}`}
                     className="accordion__body"
                   >
                     <div className="accordion-body-text">
                         <p>{visit.clinicalNote}</p>
                     </div>
                   </Accordion.Collapse>
                 </div>
               )}
               </>
             </Accordion>             

                   ):
                   (
                     <>
                     <br/>
                     <Alert
                         variant="info"
                         className="alert-dismissible solid fade show"
                       >
                         <p>No Clinical Notes</p>
                       </Alert>
                     </>
                   )}
               </ul>
               </PerfectScrollbar>
               
         </Segment>
         
        </Grid.Column>
        <Grid.Column width={11}>
          <Segment>
            <Label as='a' color='blue'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>VITAL  SIGNS</h4>
            </Label>
            <br /><br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date of Visit *</FormLabelName>
                  <Input
                    type="date"
                    name="encounterDate"
                    id="encounterDate"
                    value={vital.encounterDate}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChangeVitalSignDto}
                    min={props.patientObj && props.patientObj.artCommence ? props.patientObj.artCommence.visitDate : null}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    required
                  />
                 {errors.encounterDate !=="" ? (
                      <span className={classes.error}>{errors.encounterDate}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                {showCurrentVitalSigns && (
                  <div className="form-check custom-checkbox ml-1 ">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="currentVitalSigns"
                      id="currentVitalSigns"
                      onChange={handleCheckBox} 
                                          
                    />
                    <label
                      className="form-check-label"
                      htmlFor="basic_checkbox_1"
                    >
                      use current Vital Signs
                    </label>
                  </div>
                )}
              </div>
              <div className="row">
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Pulse</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="pulse"
                                id="pulse"
                                onChange={handleInputChangeVitalSignDto}
                                min="40"
                                max="120"
                                value={vital.pulse}
                                onKeyUp={handleInputValueCheckPulse} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                bmp
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.pulse !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.pulse}</span>
                        ) : ""}
                        {errors.pulse !=="" ? (
                            <span className={classes.error}>{errors.pulse}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Respiratory Rate </FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="respiratoryRate"
                                id="respiratoryRate"
                                onChange={handleInputChangeVitalSignDto}
                                min="10"
                                max="70"
                                value={vital.respiratoryRate}
                                onKeyUp={handleInputValueCheckRespiratoryRate} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                bmp
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.respiratoryRate !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.respiratoryRate}</span>
                        ) : ""}
                        {errors.respiratoryRate !=="" ? (
                            <span className={classes.error}>{errors.respiratoryRate}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Temperature </FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="temperature"
                                id="temperature"
                                onChange={handleInputChangeVitalSignDto}
                                min="35"
                                max="47"
                                value={vital.temperature}
                                onKeyUp={handleInputValueCheckTemperature} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                <sup>o</sup>c
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.temperature !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.temperature}</span>
                        ) : ""}
                        {errors.temperature !=="" ? (
                            <span className={classes.error}>{errors.temperature}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                   
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Body Weight</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeVitalSignDto}
                                min="3"
                                max="150"
                                value={vital.bodyWeight}
                                onKeyUp={handleInputValueCheckBodyWeight} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                kg
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.bodyWeight !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.bodyWeight}</span>
                        ) : ""}
                        {errors.bodyWeight !=="" ? (
                            <span className={classes.error}>{errors.bodyWeight}</span>
                        ) : "" }
                        </FormGroup>
                    </div>                                   
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Height</FormLabelName>
                        <InputGroup> 
                        <InputGroupText
                                addonType="append"
                                isOpen={dropdownOpen}
                                toggle={toggleDropDown}
                                style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}
                                >
                                cm
                        </InputGroupText>
                            <Input 
                                type="number"
                                name="height"
                                id="height"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.height}
                                min="48.26"
                                max="216.408"
                                onKeyUp={handleInputValueCheckHeight} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                                <InputGroupText
                                addonType="append"
                                isOpen={dropdownOpen}
                                toggle={toggleDropDown}
                                style={{ backgroundColor:"#992E62", color:"#fff", border: "1px solid #992E62", borderRadius:"0rem"}}
                                >
                                {vital.height!=='' ? (vital.height/100).toFixed(2) + "m" : "m"}
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.height !=="" ? (
                            <span className={classes.error}>{vitalClinicalSupport.height}</span>
                        ) : ""}
                        {errors.height !=="" ? (
                            <span className={classes.error}>{errors.height}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 mt-2 col-md-4">
                        {vital.bodyWeight!=="" && vital.height!=='' && (
                            <FormGroup>
                            <Label > {" "}</Label>
                            <InputGroup> 
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                BMI : {Math.round(vital.bodyWeight/((vital.height * vital.height)/100))}
                            </InputGroupText>                   
                           
                            </InputGroup>                
                            </FormGroup>
                        )}
                    </div>
              </div>
              <div className="row">
              <div className="form-group mb-3 col-md-8">
                  <FormGroup>
                  <FormLabelName >Blood Pressure</FormLabelName>
                  <InputGroup>
                  <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                          systolic(mmHg)
                  </InputGroupText> 
                      <Input 
                          type="number"
                          name="systolic"
                          id="systolic"
                          min="90"
                          max="240"
                          onChange={handleInputChangeVitalSignDto}
                          value={vital.systolic}
                          onKeyUp={handleInputValueCheckSystolic}
                          style={{border: "1px solid #014D88", borderRadius:"0rem"}} 
                      />
                      <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                      diastolic(mmHg)
                      </InputGroupText>
                          <Input 
                          type="number"
                          name="diastolic"
                          id="diastolic"
                          min={0}
                          max={140}
                          onChange={handleInputChangeVitalSignDto}
                          value={vital.diastolic}
                          onKeyUp={handleInputValueCheckDiastolic} 
                          style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                          />
                      
                      
                  </InputGroup>
                  {vitalClinicalSupport.systolic !=="" ? (
                  <span className={classes.error}>{vitalClinicalSupport.systolic}</span>
                  ) : ""}
                  {errors.systolic !=="" ? (
                      <span className={classes.error}>{errors.systolic}</span>
                  ) : "" }  
                  {vitalClinicalSupport.diastolic !=="" ? (
                  <span className={classes.error}>{vitalClinicalSupport.diastolic}</span>
                  ) : ""}
                  {errors.diastolic !=="" ? (
                      <span className={classes.error}>{errors.diastolic}</span>
                  ) : "" }          
                  </FormGroup>
              </div>

              </div>
            </div>
            <Label as='a' color='black'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>CONSULTATION</h4>
            </Label>
            <br /><br />

            <div className=" mb-3">
              <FormLabelName >Clinical Notes</FormLabelName>
              <textarea
                name="clinicalNote"
                className="form-control"
                value={objValues.clinicalNote}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
              ></textarea>
              {errors.clinicalNote !=="" ? (
                      <span className={classes.error}>{errors.clinicalNote}</span>
                  ) : "" }
            </div>
            <div className="row">

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >WHO Staging *</FormLabelName>
                  <Input
                    type="select"
                    name="whoStagingId"
                    id="whoStagingId"
                    value={objValues.whoStagingId}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                    {clinicalStage.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.whoStagingId !=="" ? (
                      <span className={classes.error}>{errors.whoStagingId}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Functional Status *</FormLabelName>
                  <Input
                    type="select"
                    name="functionalStatusId"
                    id="functionalStatusId"
                    value={objValues.functionalStatusId}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                    {functionalStatus.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.functionalStatusId !=="" ? (
                      <span className={classes.error}>{errors.functionalStatusId}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Level of Adherence *</FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={objValues.adherenceLevel}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                    {adherenceLevel.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.adherenceLevel !=="" ? (
                      <span className={classes.error}>{errors.adherenceLevel}</span>
                  ) : "" }
                </FormGroup>
              </div>

            </div>
            <br />
            <Label as='a' color='red' style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>OPPORTUNISTIC INFECTION</h4>
            </Label>
            <br /><br />
            <OpportunisticInfection setInfection={setInfection} infection={infection} setInfectionList={setInfectionList} infectionList={infectionList} artStartDate={props.patientObj.enrollment.dateOfRegistration}/>
            <br />
            <Label as='a' color='pink' style={{width:'106%', height:'35px'}}  ribbon>
            <h4 style={{color:'#fff'}}>ADR </h4>
            </Label>
            <br /><br />
            <ADR setAdrObj={setAdrObj} adrObj={adrObj} setAdrList={setAdrList} adrList={adrList} artStartDate={props.patientObj.enrollment.dateOfRegistration} />
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>TB SCREENING</h4>
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <TBScreening tbObj={tbObj} setTbObj={setTbObj} />
            <br />
            <Label as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>NEXT CLINICAL APPOINTMENT DATE </h4>
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <Input
                    type="date"
                    name="nextAppointment"
                    id="nextAppointment"
                    className="col-md-6"
                    value={vital.nextAppointment}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    min={vital.encounterDate}
                    
                  />
              {errors.nextAppointment !=="" ? (
                      <span className={classes.error}>{errors.nextAppointment}</span>
                  ) : "" }
            <br />
            <MatButton
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={saving}
              startIcon={<SaveIcon />}
              style={{backgroundColor:"#014d88"}}
              onClick={handleSubmit}
            >
              {!saving ? (
                <span style={{ textTransform: "capitalize" }}>Save</span>
              ) : (
                <span style={{ textTransform: "capitalize" }}>Saving...</span>
              )}
            </MatButton>
          </Segment>
        </Grid.Column>
      </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
      <AddAllergy toggle={AddAllergyToggle} showModal={addAllergyModal} />
      <AddCondition toggle={AddConditionToggle} showModal={addConditionModal} />
      <PostPatient toggle={PostPatientToggle} showModal={postPatientModal} />
    </div>
  );
};

export default ClinicVisit;
