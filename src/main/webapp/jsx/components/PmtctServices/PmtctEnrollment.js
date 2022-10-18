import React, {useState, useEffect} from 'react';
import {Card,CardBody, FormGroup, Label, Input, InputGroup,InputGroupText} from 'reactstrap';
import {Label as FormLabelName, } from "reactstrap";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory } from "react-router-dom";
import 'react-summernote/dist/react-summernote.css'; // import styles
import { Spinner } from "reactstrap";
import {Message } from 'semantic-ui-react'
import Biometrics from '../Patient/Biometric';

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

const AncPnc = (props) => {
    const patientObj = props.patientObj;
    console.log(patientObj)
    let history = useHistory();
    const classes = useStyles()
    //const [values, setValues] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [enroll, setEnrollDto]= useState({

                    agreed2PartnerNotification: "",
                    ancNo: patientObj.ancNo,
                    bodyWeight: "",
                    diastolic: "",
                    fetalPresentation: "",
                    fpl: "",
                    fundalHeight: "",
                    id: "",
                    infantFeeding: "",
                    nextAppointmentDate: "",
                    nutritionalSupport: "",
                    pmtctEnrollmentDate: "",
                    referredTo: "",
                    systolic: "",
                    tbStatus: "",
                    viralLoadSample: "",
                    viralLoadSampleDate: "",
                    visitStatus: "",
                    visitType: ""
    })
    
    const handleInputChangeEnrollmentDto = e => {            
        setEnrollDto ({...enroll,  [e.target.name]: e.target.value});
    }

    //FORM VALIDATION
    const validate = () => {
        let temp = { ...errors }
        //temp.name = details.name ? "" : "This field is required"
        //temp.description = details.description ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
    diastolic: "",
    fundalHeight: "",
    systolic: "",
  })
     //to check the input value for clinical decision 
  const handleInputValueCheckHeight =(e)=>{
    if(e.target.name==="fundalHeight" && (e.target.value < 48.26 || e.target.value>216.408)){
      const message ="Height cannot be greater than 216.408 and less than 48.26"
      setVitalClinicalSupport({...vitalClinicalSupport, fundalHeight:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, fundalHeight:""})
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
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();        
        
        setSaving(true);
        axios.post(`${baseUrl}pmtct/anc/pmtct-enrollment`, enroll,
        { headers: {"Authorization" : `Bearer ${token}`}},
        
        )
            .then(response => {
                setSaving(false);
                //props.patientObj.commenced=true
                toast.success("Enrollment save successful");

            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong");
                
            });
        
    }

    function BmiCal (bmi){
        if(bmi<18.5){
          return (
            <Message        
             size='mini'
             color='brown'
              content='Underweight'
            />
          )      
        }else if(bmi >=18.5 && bmi<=24.9){
          <Message        
             size='mini'
             color='olive'
              content='Well nourished'
            />
        }
        else if( bmi>25){
          <Message        
             size='mini'
             color='blue'
              content='Overweight/Obese'
            />
        }
        
      }

  return (      
      <div >
                   
        <Card >
            <CardBody>
            <form >
                <div className="row">
                <h2>PMTCT Enrollment</h2>
                <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ANC ID *</Label>
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
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Date of Enrollment</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="pmtctEnrollmentDate"
                                    id="pmtctEnrollmentDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.pmtctEnrollmentDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
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
                                type="text"
                                name="systolic"
                                id="systolic"
                                min="90"
                                max="240"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.systolic}
                                onKeyUp={handleInputValueCheckSystolic}
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}} 
                            />
                            
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                            diastolic(mmHg)
                            </InputGroupText>
                            
                                <Input 
                                type="text"
                                name="diastolic"
                                id="diastolic"
                                min={0}
                                max={140}
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.diastolic}
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
                            <span className={classes.error} >{vitalClinicalSupport.diastolic}</span>
                            ) : ""}
                            {errors.diastolic !=="" ? (
                                <span className={'float-end'}><span className={classes.error} >{errors.diastolic}</span></span>
                            ) : "" }       
                        </FormGroup>
                    </div>
                    </div>
                    <div className="row">                  
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Body Weight</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="text"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeEnrollmentDto}
                                min="3"
                                max="150"
                                value={enroll.bodyWeight}
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
                    <div className="form-group mb-3 col-md-5">
                        <FormGroup>
                        <FormLabelName >Fundal Height</FormLabelName>
                        <InputGroup> 
                        <InputGroupText
                                addonType="append"
                                
                                style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}
                                >
                                cm
                        </InputGroupText>
                            <Input 
                                type="text"
                                name="fundalHeight"
                                id="fundalHeight"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.fundalHeight}
                                min="48.26"
                                max="216.408"
                                onKeyUp={handleInputValueCheckHeight} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                                <InputGroupText
                                addonType="append"
                               
                                style={{ backgroundColor:"#992E62", color:"#fff", border: "1px solid #992E62", borderRadius:"0rem"}}
                                >
                                {enroll.fundalHeight!=='' && enroll.fundalHeight!=='NaN' ? (enroll.fundalHeight/100).toFixed(2) + "m" : "m"}
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.fundalHeight !=="" ? (
                            <span className={classes.error}>{vitalClinicalSupport.fundalHeight}</span>
                        ) : ""}
                        {errors.fundalHeight !=="" ? (
                            <span className={classes.error}>{errors.fundalHeight}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 mt-2 col-md-3">
                        {enroll.bodyWeight!=="" && enroll.fundalHeight!=='' && (
                            <FormGroup>
                            <Label > {" "}</Label>
                            <InputGroup> 
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                BMI : {(enroll.bodyWeight/(((enroll.fundalHeight/100) * (enroll.fundalHeight/100)))).toFixed(2)}
                            </InputGroupText>                   
                           
                            </InputGroup>                
                            </FormGroup>
                        )}
                    </div>
                    {enroll.bodyWeight!=='' && enroll.fundalHeight!=='' && (
                      <div className="form-group mb-3 mt-2 col-md-12">
                            {
                              BmiCal((enroll.bodyWeight/(((enroll.fundalHeight/100) * (enroll.fundalHeight/100)))).toFixed(2))
                            }
                      </div>
                     )}
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Fetal Presentation</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="fetalPresentation"
                                    id="fetalPresentation"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.fetalPresentation} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Gestational Age(weeks) *</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="gAge"
                                    id="encounterDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Type of Visit</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="visitType"
                                    id="visitType"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.visitType} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Visit Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="visitStatus"
                                    id="visitStatus"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.visitStatus} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Viral Load Sample Collected?</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="viralLoadSample"
                                    id="viralLoadSample"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.viralLoadSample} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Date Sample Collected*</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="viralLoadSampleDate"
                                    id="viralLoadSampleDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.viralLoadSampleDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >TB Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="tbStatus"
                                    id="tbStatus"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.tbStatus} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Date of next appointment*</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="nextAppointmentDate"
                                    id="nextAppointmentDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.nextAppointmentDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <hr/>
                    <h3>Counseling/Other Services Provided</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Nutritional Support</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="nutritionalSupport"
                                    id="nutritionalSupport"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.nutritionalSupport} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Infant Feeding</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="infantFeeding"
                                    id="infantFeeding"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.infantFeeding} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Family Planing Method Used</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="fpl"
                                    id="fpl"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.fpl} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Referred to</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="referredTo"
                                    id="referredTo"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.referredTo} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <hr/>
                    <h3>Partner Information</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Agreed to partner notification</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="agreed2PartnerNotification"
                                    id="agreed2PartnerNotification"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.agreed2PartnerNotification} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                </div>
                
                {saving ? <Spinner /> : ""}
            <br />
            
            <MatButton
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            >
                {!saving ? (
                <span style={{ textTransform: "capitalize" }}>Save</span>
                ) : (
                <span style={{ textTransform: "capitalize" }}>Saving...</span>
                )}
            </MatButton>
            
            <MatButton
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                
            >
                <span style={{ textTransform: "capitalize" }}>Cancel</span>
            </MatButton>
            
                </form>
            </CardBody>
        </Card> 
                  
    </div>
  );
}

export default AncPnc;
