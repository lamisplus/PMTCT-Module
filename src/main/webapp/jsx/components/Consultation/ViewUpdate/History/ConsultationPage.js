import React, { useState, useEffect } from "react";
import { Grid, Segment, Label,} from 'semantic-ui-react'
// Page titie
import { FormGroup, Label as FormLabelName, InputGroup,
          InputGroupText,
          InputGroupButtonDropdown,
          Input,
          DropdownToggle,
          DropdownMenu,
          DropdownItem
        } from "reactstrap";
import ADR from './../ADR/Index'
import OpportunisticInfection from './../OpportunisticInfection/Index'
import TBScreening from './../TBScreening/Index'
import { url as baseUrl, token } from "../../../../../api";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import { Row, Col,   } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { Button as ButtonSMUI, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom';
//import { objectValues } from "react-toastify/dist/utils";


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
  const patientObj = props.patientObj ? props.patientObj : {}
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [splitButtonOpen, setSplitButtonOpen] = React.useState(false);
  const toggleDropDown = () => setDropdownOpen(!dropdownOpen);
  const toggleSplit = () => setSplitButtonOpen(!splitButtonOpen);
  const [visitId, setVisitId]= useState()
  const [enableUpdateButton, setEnableUpdateButton]=useState(false)
  const [heightValue, setHeightValue]= useState("cm")
  const [enableUpdate, setEnableUpdate]= useState(false) //Enable update for all input field if the user have permission
  const [errors, setErrors] = useState({});
  const [clinicVisitList, setClinicVisitList] = useState([])
  const [loading, setLoading] = useState(true)
  let temp = { ...errors }
  const classes = useStyles()
  // the visit date history 
  //end of the visit date history
  const [getPatientObj, setGetPatientObj] = useState({});
  const [saving, setSaving] = useState(false);
  const [clinicalStage, setClinicalStage] = useState([]);
  const [functionalStatus, setFunctionalStatus] = useState([]);
  const [adherenceLevel, setAdherenceLevel] = useState([]);
  const [tbStatus, setTbStatus] = useState([]);
  const [TBForms, setTBForms] = useState(false)
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
    VitalSigns()
    GetPatientObj();
    ClinicVisitListHistory();
    if(props.activeContent.id!==null){
     
      GetVisitById(props.activeContent.id)
      setVisitId(props.activeContent.id)
    }
  }, []);
     //GET LIST Drug Refill
     async function ClinicVisitListHistory() {
      setLoading(true)
      axios
          .get(`${baseUrl}hiv/art/clinic-visit/person?pageNo=0&pageSize=10&personId=${props.patientObj.id}`,
          { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              setLoading(false)
              setClinicVisitList(response.data.filter((x)=> x.isCommencement!==true));              
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

  const  heightFunction =(e)=>{
    if(e==='cm'){
        setHeightValue('cm')
        if(vital.height!==""){
            const newHeightValue= (vital.height * 100)
            setVitalSignDto ({...vital,  height: newHeightValue});
        }
    }else if(e==='m'){
        setHeightValue('m')
        if(vital.height!==""){
            const newHeightValue= (vital.height/100)
            setVitalSignDto ({...vital,  height: newHeightValue});
        }
        
    }

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
    axios.put(`${baseUrl}hiv/art/clinic-visit/${visitId}`, objValues,
      { headers: { "Authorization": `Bearer ${token}` } },

    )
      .then(response => {
        setSaving(false);
        toast.success("Clinic Visit updated successful");
        //GetVisitById(visitId)
        //props.setActiveContent({...props.activeContent, route:'consultation', id:"", activeTab:"history", actionType:"view", obj:{}})
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
  //Get visit by ID
  async function GetVisitById(visitID) {
    axios
      .get(`${baseUrl}hiv/art/clinic-visit/${visitID}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
          const e = response.data
          setVitalSignDto({ ...e.vitalSignDto })
          objValues.clinicalNote = e.clinicalNote
          objValues.functionalStatusId= e.functionalStatusId
          objValues.whoStagingId= e.whoStagingId 
          objValues.nextAppointment= e.nextAppointment
          objValues.adherenceLevel = e.adherenceLevel
          setTbObj({...e.tbScreen})
          setAdrList([...e.adverseDrugReactions])
          setInfectionList([...e.opportunisticInfections])

      })
      .catch((error) => {
      });
  }
  const getVisitDetail=(e)=>{
      setEnableUpdateButton(true)
      setVisitId(e.id)
      GetVisitById(e.id)      
  }
  const EnableUpdateAction =()=>{

      setEnableUpdate(true)
  }


  return (
    <div>
        <div className="row">
            <div className="col-xl-3 col-xxl-3 col-lg-3" >
                <div className="card" style={{ height: "500px" }}>
                    <div className="card-header  border-0 pb-2" style={{backgroundColor:"#014D88"}}>
                    <h4 className="card-title" style={{color:"#fff"}}> Clinic Visits</h4>
                    </div>
                    <div className="card-body" >
                    <PerfectScrollbar
                        style={{ height: "370px" }}
                        id="DZ_W_Todo1"
                        className="widget-media dz-scroll ps ps--active-y"
                    >
                    {clinicVisitList.map((visit,index)=>(	
                    <div className="media pb-3 border-bottom mb-0 align-items-center" key={index}>								
                      <div className="media-body">
                            <ButtonSMUI
                                color='black'
                                content='Visit Date'
                                icon='calendar alternate'
                                onClick={()=>getVisitDetail(visit)}
                                label={{ basic: true, color: 'grey', pointing: 'left', content: `${visit.visitDate}` }}
                            />
                      </div>
                    </div>
						))}
                    </PerfectScrollbar>
                    </div>
                </div>
            </div>

            <div className="col-xl-9 col-xxl-9 col-lg-9">
                <div className="card">
                    <div className="card-header  border-0 pb-2" style={{backgroundColor:"#014D88"}}>
                    <h4 className="card-title" style={{color:"#fff"}}> </h4>
                    {enableUpdateButton && (
                    <ButtonSMUI color='facebook' onClick={()=>EnableUpdateAction()} >
                      <Icon name='edit' /> Edit Visit 
                    </ButtonSMUI>
                    )}
                    </div>
                    <div className="card-body">
                    <Grid columns='equal'>
                    <Grid.Column >
                    <Segment>
                    <Label as='a' color='black' style={{width:'106%', height:'35px'}} ribbon>
                        <h4 style={{color:'#fff'}}> Visit Date - {vital.encounterDate}</h4>
                        </Label>
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
                                max={moment(new Date()).format("YYYY-MM-DD")}
                                disabled={!enableUpdate}
                                required
                            />
                            {errors.encounterDate !=="" ? (
                                <span className={classes.error}>{errors.encounterDate}</span>
                            ) : "" }

                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">

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
                        <Label as='a' color='grey' style={{width:'106%', height:'35px'}} ribbon>
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
                            disabled={!enableUpdate}
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
                                disabled={!enableUpdate}
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
                                disabled={!enableUpdate}
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
                                disabled={!enableUpdate}
                                required
                            >
                                <option value="">Select </option>

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
                        <OpportunisticInfection setInfection={setInfection} infection={infection} setInfectionList={setInfectionList} infectionList={infectionList} enableUpdate={enableUpdate}/>
                        <br />
                        <Label as='a' color='pink' style={{width:'106%', height:'35px'}} ribbon>
                        <h4 style={{color:'#fff'}}>ADR</h4>
                        </Label>
                        <br /><br />
                        <ADR setAdrObj={setAdrObj} adrObj={adrObj} setAdrList={setAdrList} adrList={adrList}  enableUpdate={enableUpdate}/>
                        <br />
                        <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
                        <h4 style={{color:'#fff'}}>TB SCREENING</h4>
                        </Label>
                        <br /><br />
                        {/* TB Screening Form */}
                        <TBScreening tbObj={tbObj} setTbObj={setTbObj} enableUpdate={enableUpdate}/>
                        <br />
                        <Label as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                        <h4 style={{color:'#fff'}}>NEXT CLINICAL APPOINTMENT DATE</h4>
                        </Label>
                        <br /><br />
                        {/* TB Screening Form */}
                        <Input
                                type="date"
                                name="nextAppointment"
                                id="nextAppointment"
                                className="col-md-6"
                                value={objValues.nextAppointment}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                min={moment(new Date()).format("YYYY-MM-DD")}
                                disabled={!enableUpdate}
                                required
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
                        hidden={!enableUpdate}
                        >
                        {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Update</span>
                        ) : (
                            <span style={{ textTransform: "capitalize" }}>Updating...</span>
                        )}
                        </MatButton>
                    </Segment>
                    </Grid.Column>

                </Grid>
                    </div>
                </div>
            </div>
    </div>    
      
    </div>
  );
};

export default ClinicVisit;
