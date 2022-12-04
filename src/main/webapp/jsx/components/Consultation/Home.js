import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, Icon, List, Button, Card,Feed } from 'semantic-ui-react'
// Page titie
import { FormGroup, Label as FormLabelName, 
          Input,
        } from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";


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
  console.log(patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate)
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true)
  let temp = { ...errors }
  const classes = useStyles()
  const [saving, setSaving] = useState(false);
  const [clinicalStage, setClinicalStage] = useState([]);
  const [dsdModelType, setDsdModelType] = useState([]);
  const [currentVitalSigns, setcurrentVitalSigns] = useState({})
  const [showCurrentVitalSigns, setShowCurrentVitalSigns] = useState(false)
  const [visitStatus, setVisitStatus] = useState([]);
  const [maternalCome, setMaternalCome] = useState([]);
  const [fp, setFp] = useState([]);
  //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState(
          {
            bodyWeight: "",
            diastolic: "",
            height: "",
            systolic: "",
            pulse:"",
            temperature:"",
            respiratoryRate:"" 
          })
  const [objValues, setObjValues] = useState({
    ancNo: "",
    dateOfViralLoad32: "",
    dateOfViralLoadOt: "",
    dateOfVisit: "",
    dateOfmeternalOutcome: "",
    dsd: "",
    dsdModel: "",
    dsdOption: "",
    enteryPoint: "",
    fpCounseling: "",
    fpMethod: "",
    gaOfViralLoad32: "",
    gaOfViralLoadOt: "",
    id: "",
    maternalOutcome: "",
    nextAppointmentDate: "",
    personUuid: "",
    resultOfViralLoad32: "",
    resultOfViralLoadOt: "",
    transferTo: "",
    visitStatus: ""
  }
  );
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
  useEffect(() => {
    VitalSigns();
    VISIT_STATUS_PMTCT()
    MATERNAL_OUTCOME();
    FAMILY_PLANNING_METHOD();
  }, []);

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
    const VISIT_STATUS_PMTCT = () => {
      axios
        .get(`${baseUrl}application-codesets/v2/VISIT_STATUS_PMTCT`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          //console.log(response.data);
          setVisitStatus(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
  
    }
    const FAMILY_PLANNING_METHOD = () => {
      axios
        .get(`${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          //console.log(response.data);
          setFp(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
  
    }
    const MATERNAL_OUTCOME = () => {
      axios
        .get(`${baseUrl}application-codesets/v2/MATERNAL_OUTCOME`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          //console.log(response.data);
          setMaternalCome(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
  
    }

  const handleInputChange = e => {
    if(e.target.name ==='dsdModel'){
      DsdModelType(e.target.value)
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
    
  }
  const handleInputChangeVitalSignDto = e => {
    setVitalSignDto({ ...vital, [e.target.name]: e.target.value });
  } 
  //Handle CheckBox 
  // const handleCheckBox = e => {
  //   if (e.target.checked) {
  //     //currentVitalSigns.personId === null ? props.patientObj.id : currentVitalSigns.personId
  //     setVitalSignDto({ ...currentVitalSigns })
  //   } else {
  //     setVitalSignDto({
  //       bodyWeight: "",
  //       diastolic: "",
  //       encounterDate: "",
  //       facilityId: "",
  //       height: "",
  //       personId: props.patientObj.id,
  //       serviceTypeId: "",
  //       systolic: "",
  //       pulse:"",
  //       temperature:"",
  //       respiratoryRate:"" 
  //     })
  //   }
  // }
  //to check the input value for clinical decision 
  // const handleInputValueCheckHeight =(e)=>{
  //   if(e.target.name==="height" && (e.target.value < 48.26 || e.target.value>216.408)){
  //     const message ="Height cannot be greater than 216.408 and less than 48.26"
  //     setVitalClinicalSupport({...vitalClinicalSupport, height:message})
  //   }else{
  //     setVitalClinicalSupport({...vitalClinicalSupport, height:""})
  //   }
  // }
  // const handleInputValueCheckBodyWeight =(e)=>{
  //   if(e.target.name==="bodyWeight" && (e.target.value < 3 || e.target.value>150)){      
  //     const message ="Body weight must not be greater than 150 and less than 3"
  //     setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:message})
  //   }else{
  //     setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:""})
  //   }
  // }
//   const handleInputValueCheckSystolic =(e)=>{
//     if(e.target.name==="systolic" && (e.target.value < 90 || e.target.value>240)){      
//       const message ="Blood Pressure systolic must not be greater than 240 and less than 90"
//       setVitalClinicalSupport({...vitalClinicalSupport, systolic:message})
//     }else{
//       setVitalClinicalSupport({...vitalClinicalSupport, systolic:""})
//     }
//   }
//   const handleInputValueCheckDiastolic =(e)=>{
//     if(e.target.name==="diastolic" && (e.target.value < 60 || e.target.value>140)){      
//       const message ="Blood Pressure diastolic must not be greater than 140 and less than 60"
//       setVitalClinicalSupport({...vitalClinicalSupport, diastolic:message})
//     }else{
//       setVitalClinicalSupport({...vitalClinicalSupport, diastolic:""})
//     }
//   }
//   const handleInputValueCheckPulse =(e)=>{
//     if(e.target.name==="pulse" && (e.target.value < 40 || e.target.value>120)){      
//     const message ="Pulse must not be greater than 120 and less than 40"
//     setVitalClinicalSupport({...vitalClinicalSupport, pulse:message})
//     }else{
//     setVitalClinicalSupport({...vitalClinicalSupport, pulse:""})
//     }
// }
// const handleInputValueCheckRespiratoryRate =(e)=>{
//     if(e.target.name==="respiratoryRate" && (e.target.value < 10 || e.target.value>70)){      
//     const message ="Respiratory Rate must not be greater than 70 and less than 10"
//     setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:message})
//     }else{
//     setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:""})
//     }
// }
// const handleInputValueCheckTemperature =(e)=>{
//     if(e.target.name==="temperature" && (e.target.value < 35 || e.target.value>47)){      
//     const message ="Temperature must not be greater than 47 and less than 35"
//     setVitalClinicalSupport({...vitalClinicalSupport, temperature:message})
//     }else{
//     setVitalClinicalSupport({...vitalClinicalSupport, temperature:""})
//     }
// }
//Get list of DSD Model Type
function DsdModelType (dsdmodel) {
  const dsd = dsdmodel ==='Facility' ? 'DSD_MODEL_FACILITY' : 'DSD_MODEL_COMMUNITY'
  axios
     .get(`${baseUrl}application-codesets/v2/${dsd}`,
         { headers: {"Authorization" : `Bearer ${token}`} }
     )
     .then((response) => {
         //console.log(response.data);
         setDsdModelType(response.data);
     })
     .catch((error) => {
     //console.log(error);
     });
 
}
  //Validations of the forms
  const validate = () => {       
    temp.visitStatus = objValues.visitStatus ? "" : "This field is required"
    temp.dateOfVisit = objValues.dateOfVisit ? "" : "This field is required"
    temp.dsd = objValues.dsd ? "" : "This field is required"
    temp.enteryPoint = objValues.enteryPoint ? "" : "This field is required"
    temp.fpCounseling = objValues.fpCounseling ? "" : "This field is required"
    temp.fpMethod = objValues.fpMethod ? "" : "This field is required"
    temp.dateOfmeternalOutcome = objValues.dateOfmeternalOutcome ? "" : "This field is required"
    temp.maternalOutcome = objValues.maternalOutcome ? "" : "This field is required"
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
    axios.post(`${baseUrl}pmtct/anc/pmtct-visit`, objValues,
      { headers: { "Authorization": `Bearer ${token}` } },

    )
      .then(response => {
        setSaving(false);
        toast.success("Clinic Visit save successful", {position: toast.POSITION.BOTTOM_CENTER});
        props.setActiveContent({...props.activeContent, route:'recent-history'})
      })
      .catch(error => {
        setSaving(false);
        if(error.response && error.response.data){
          let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
          toast.error(errorMessage, {position: toast.POSITION.BOTTOM_CENTER});
        }
        else{
          toast.error("Something went wrong. Please try again...", {position: toast.POSITION.BOTTOM_CENTER});
        }
       
      });
    }
  }


  return (
    <div>
    <div className="row">

      <div className="col-md-8 ">
        <h2>Mother Follow-up Visit</h2>
        </div>
        
      </div>
      <Grid >

        <Grid.Column >
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
                    name="dateOfVisit"
                    id="dateOfVisit"
                    value={vital.dateOfVisit}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChangeVitalSignDto}
                    //={props.patientObj && props.patientObj.artCommence ? props.patientObj.artCommence.visitDate : null}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                  />
                 {errors.dateOfVisit !=="" ? (
                      <span className={classes.error}>{errors.dateOfVisit}</span>
                  ) : "" }

                </FormGroup>
              </div>
              {/* <div className="form-group mb-3 col-md-6">
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
                <div className="form-group mb-3 col-md-12">
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
              </div> */}
            </div>
            <div className="row">
              
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >Point of Entry*</FormLabelName>
                  <Input
                    type="select"
                    name="enteryPoint"
                    id="enteryPoint"
                    value={objValues.enteryPoint}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                    {clinicalStage.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.enteryPoint !=="" ? (
                      <span className={classes.error}>{errors.enteryPoint}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >FP Counselling *</FormLabelName>
                  <Input
                    type="select"
                    name="fpCounseling"
                    id="fpCounseling"
                    value={objValues.fpCounseling}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                   
                  </Input>
                  {errors.fpCounseling !=="" ? (
                      <span className={classes.error}>{errors.fpCounseling}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >FP Method *</FormLabelName>
                  <Input
                    type="select"
                    name="fpMethod"
                    id="fpMethod"
                    value={objValues.fpMethod}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>
                    {fp.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.fpMethod !=="" ? (
                      <span className={classes.error}>{errors.fpMethod}</span>
                  ) : "" }
                </FormGroup>
              </div>
            </div>
            <br />
            <Label as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>VIRAL LOAD AT 32-36 WEEKS GA </h4>
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <div className="row">
            
              <div className=" mb-3 col-md-4">
              <FormGroup>
                <FormLabelName >Viral Load Collection Date*</FormLabelName>
              <Input
                type="date"
                name="dateOfViralLoad32"
                id="dateOfViralLoad32"
                value={objValues.dateOfViralLoad32}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}  
              />
              {errors.dateOfViralLoad32 !=="" ? (
                      <span className={classes.error}>{errors.dateOfViralLoad32}</span>
                  ) : "" }
            </FormGroup>   
              </div>
              <div className=" mb-3 col-md-4">
              <FormGroup>
                <FormLabelName >GA at VL Collection*</FormLabelName>
                <Input
                  type="number"
                  name="gaOfViralLoad32"
                  id="gaOfViralLoad32"
                  value={objValues.gaOfViralLoad32}
                  onChange={handleInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  min={vital.encounterDate}   
                />
              {errors.gaOfViralLoad32 !=="" ? (
                  <span className={classes.error}>{errors.gaOfViralLoad32}</span>
              ) : "" }
            </FormGroup>   
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Result *</FormLabelName>
                  <Input
                    type="text"
                    name="resultOfViralLoad32"
                    id="resultOfViralLoad32"
                    value={vital.nextAppointment}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                  />
                {errors.resultOfViralLoad32 !=="" ? (
                    <span className={classes.error}>{errors.resultOfViralLoad32}</span>
                ) : "" }
              </FormGroup>   
              </div>
           </div>
            <br />
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>VIRAL LOAD - Other AT ANY TIME POINT DURING PMTCT</h4>
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <div className="row">

              <div className=" mb-3 col-md-4">
              <FormGroup>
                <FormLabelName >Viral Load Collection Date*</FormLabelName>
              <Input
                type="date"
                name="dateOfViralLoadOt"
                id="dateOfViralLoadOt"
                value={objValues.dateOfViralLoadOt}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}   
              />
              {errors.dateOfViralLoadOt !=="" ? (
                      <span className={classes.error}>{errors.dateOfViralLoadOt}</span>
                  ) : "" }
            </FormGroup>   
              </div>
              <div className=" mb-3 col-md-4">
              <FormGroup>
                <FormLabelName >GA at VL Collection*</FormLabelName>
                <Input
                  type="number"
                  name="nextAppointment"
                  id="nextAppointment"
                  value={vital.nextAppointment}
                  onChange={handleInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  min={vital.encounterDate}   
                />
              {errors.nextAppointment !=="" ? (
                  <span className={classes.error}>{errors.nextAppointment}</span>
              ) : "" }
            </FormGroup>   
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Result *</FormLabelName>
                  <Input
                    type="text"
                    name="resultOfViralLoadOt"
                    id="resultOfViralLoadOt"
                    value={objValues.resultOfViralLoadOt}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}   
                  />
                {errors.resultOfViralLoadOt !=="" ? (
                    <span className={classes.error}>{errors.resultOfViralLoadOt}</span>
                ) : "" }
              </FormGroup>   
              </div>
           </div>
            <br />
            <Label as='a' color='black' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}> DSD MODEL & OUTCOME</h4>
            </Label>
            <br /><br />
            {/*  */}
            <div className="row">
            <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >DSD *</FormLabelName>
                  <Input
                    type="select"
                    name="dsd"
                    id="dsd"
                    value={objValues.dsd}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                   
                  </Input>
                  {errors.fpCounseling !=="" ? (
                      <span className={classes.error}>{errors.fpCounseling}</span>
                  ) : "" }
                </FormGroup>
              </div>
              {objValues.dsd==='YES' && (<>
              <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                      <FormLabelName >DSD Model</FormLabelName>
                      <Input
                          type="select"
                          name="dsdModel"
                          id="dsdModel"
                          value={objValues.dsdModel}
                          onChange={handleInputChange} 
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                   
                          >
                          <option value="">Select </option>
                          <option value="Facility">Facility </option>
                          <option value="Community">Community </option>
                          
                      </Input>
                      
                  </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                      <FormLabelName >DSD Model Type</FormLabelName>
                      <Input
                          type="select"
                          name="dsdOption"
                          id="dsdOption"
                          value={objValues.dsdOption}
                          onChange={handleInputChange} 
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                   
                          >
                          <option value="">Select </option>
                          {dsdModelType.map((value) => (
                              <option key={value.code} value={value.code}>
                                  {value.display}
                              </option>
                          ))}
                          
                      </Input>
                      
                  </FormGroup>
              </div>
              </>)}
              <div className="form-group mb-3 col-md-3">
                  <FormGroup>
                      <FormLabelName >Maternal Outcome *</FormLabelName>
                      <Input
                          type="select"
                          name="maternalOutcome"
                          id="maternalOutcome"
                          value={objValues.maternalOutcome}
                          onChange={handleInputChange} 
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                   
                          >
                          <option value="">Select </option>
                          {maternalCome.map((value) => (
                              <option key={value.code} value={value.code}>
                                  {value.display}
                              </option>
                          ))}
                          
                      </Input>
                      
                  </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
              <FormGroup>
                <FormLabelName >Date of Outcome *</FormLabelName>
                <Input
                  type="date"
                  name="dateOfmeternalOutcome"
                  id="dateOfmeternalOutcome"
                  value={vital.dateOfmeternalOutcome}
                  onChange={handleInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                  max={moment(new Date()).format("YYYY-MM-DD")} 
                />
                {errors.dateOfmeternalOutcome !=="" ? (
                    <span className={classes.error}>{errors.dateOfmeternalOutcome}</span>
                ) : "" }
              </FormGroup>   
              </div>
              <div className="form-group mb-3 col-md-3">
                  <FormGroup>
                      <FormLabelName >Name of ART Facility </FormLabelName>
                      <Input
                      type="text"
                      name="transferTo"
                      id="transferTo"
                      value={objValues.transferTo}
                      onChange={handleInputChange}
                      style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                      //min={vital.encounterDate}
                      
                    />
                  {errors.transferTo !=="" ? (
                          <span className={classes.error}>{errors.transferTo}</span>
                      ) : "" }
                      
                  </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-3">
                  <FormGroup>
                      <FormLabelName >Client Visit Status *</FormLabelName>
                      <Input
                          type="select"
                          name="visitStatus"
                          id="visitStatus"
                          value={objValues.visitStatus}
                          onChange={handleInputChange} 
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                   
                          >
                          <option value="">Select </option>
                          {visitStatus.map((value) => (
                              <option key={value.code} value={value.code}>
                                  {value.display}
                              </option>
                          ))}
                          
                      </Input>
                      {errors.visitStatus !=="" ? (
                          <span className={classes.error}>{errors.visitStatus}</span>
                      ) : "" }
                  </FormGroup>
              </div>
              
            </div>  
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
      
    </div>
  );
};

export default ClinicVisit;
