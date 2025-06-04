import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import 'react-phone-input-2/lib/style.css'
import {Label as LabelRibbon, Button} from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {token, url as baseUrl } from "../../../api";

const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(20),
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
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
        width: 300,
    },
    button: {
        margin: theme.spacing(1),
    },
    root: {
        '& > *': {
            margin: theme.spacing(1)
        },
        "& .card-title":{
            color:'#fff',
            fontWeight:'bold'
        },
        "& .form-control":{
            borderRadius:'0.25rem',
            height:'41px'
        },
        "& .card-header:first-child": {
            borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0"
        },
        "& .dropdown-toggle::after": {
            display: " block !important"
        },
        "& select":{
            "-webkit-appearance": "listbox !important"
        },
        "& p":{
            color:'red'
        },
        "& label":{
            fontSize:'14px',
            color:'#014d88',
            fontWeight:'bold'
        }
    },
    demo: {
        backgroundColor: theme.palette.background.default,
    },
    inline: {
        display: "inline",
    },
    error:{
        color: '#f85032',
        fontSize: '12.8px'
    }
}));

const Recency = (props) => {
    const classes = useStyles();
    const patientID= props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.id : "";
    const clientId = props.patientObj && props.patientObj ? props.patientObj.id : "";
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hivTestDate, setHivTestDate] = useState("");
    let temp = { ...errors }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {
        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
    }

    const [objValues, setObjValues]= useState(
        {
            htsClientId: clientId,
            recency: {},
            personId: patientID,
        }
    )
    const [recency, setRecency]= useState(
        {
            optOutRTRI:"", 
            optOutRTRITestName:"", 
            optOutRTRITestDate:"", 
            rencencyId:"",  
            controlLine:"",  
            verififcationLine:"", 
            longTermLine:"",  
            rencencyInterpretation:"", 
            hasViralLoad:"", 
            sampleCollectedDate:"",
            sampleReferanceNumber:"",
            dateSampleSentToPCRLab:"",
            sampleTestDate:"",
            sampleType:"", 
            receivingPcrLab:"", 
            viralLoadResultClassification:"",
            recencyResult:"", 
            finalRecencyResult:"",
        }
    )
    
    useEffect(() => { 
        if(props.patientObj){
            setRecency(props.patientObj && props.patientObj.recency!==null ? props.patientObj.recency : {})
            if(props.patientObj.confirmatoryTest && props.patientObj.confirmatoryTest.date!=='' ){
                setHivTestDate(props.patientObj.confirmatoryTest.date)
            }else if(props.patientObj.confirmatoryTest2 && props.patientObj.confirmatoryTest2.date2!=='' ){
                setHivTestDate(props.patientObj.confirmatoryTest2.date2)
            }else{
                setHivTestDate("")
            }
        }
        if(recency.longTermLine==='true' && recency.verififcationLine==='true' && recency.controlLine==='true'){
            recency.rencencyInterpretation="Long Term"
            setRecency ({...recency,  ['rencencyInterpretation']: 'Long Term'}); 
        
        }else if(recency.longTermLine==='false' && recency.verififcationLine==='true' && recency.controlLine==='true'){
            recency.rencencyInterpretation="Recent"
            setRecency ({...recency,  ['rencencyInterpretation']: 'Recent'});
            //setRecency ({...recency,  ['hasViralLoad']: 'true'});
            
        }else if(recency.longTermLine==='false' && recency.verififcationLine==='false' && recency.controlLine==='true'){
            recency.rencencyInterpretation="Negative"
            setRecency ({...recency,  ['rencencyInterpretation']: 'Negative'});
            
        }else if(recency.longTermLine==='true' && recency.verififcationLine==='true' && recency.controlLine==='false'){
            recency.rencencyInterpretation="Invalid"
            setRecency ({...recency,  ['rencencyInterpretation']: 'Invalid'});
           
        }else if(recency.longTermLine==='true' && recency.verififcationLine==='false' && recency.controlLine==='true'){
            recency.rencencyInterpretation="Invalid"
            setRecency ({...recency,  ['rencencyInterpretation']: 'Invalid'});
            
        }else{
            
            setRecency ({...recency,  ['rencencyInterpretation']: ''});
        }
    },[recency.longTermLine,recency.verififcationLine, recency.controlLine, props.patientObj]);
    // console.log(props.patientObj)
    const handleInputChangeRecency = e => { 
        setErrors({...temp, [e.target.name]:""})        
        if(e.target.name ==='viralLoadResultClassification'){
             
            if(e.target.value ==='>=1000'){
                recency.finalRecencyResult='RITA Recent'
                setRecency ({...recency,  [e.target.name]: e.target.value}); 
            
            }else if(e.target.value ==='<1000') {
                recency.finalRecencyResult='RITA Long term'
                setRecency ({...recency,  [e.target.name]: e.target.value}); 
            }else if(e.target.value ==='Failed run') {
                recency.finalRecencyResult='RITA Inconclusive'
                setRecency ({...recency,  [e.target.name]: e.target.value}); 
            }else if(e.target.value ==='Invalid viral load result') {
                recency.finalRecencyResult='RITA Inconclusive'
                setRecency ({...recency,  [e.target.name]: e.target.value}); 
            }else{
                setRecency ({...recency,  [e.target.name]: e.target.value}); 
            }
        }else if(e.target.name==='rencencyId' && e.target.value!==''){
            const recencyIdNumberValue = checkRecencyLimit(e.target.value)
            setRecency ({...recency,  [e.target.name]: recencyIdNumberValue});
        }else {
            setRecency ({...recency,  [e.target.name]: e.target.value}); 
        }
         
    }
    const checkRecencyLimit=(e)=>{
        const limit = 10;        
        const acceptedNumber= e.slice(0, limit)
        return  acceptedNumber   
    }
    /*****  Validation  */
    const validate = () => {
        //HTS FORM VALIDATION
            {recency.sampleCollectedDate!=='' && (temp.sampleReferanceNumber = recency.sampleReferanceNumber ? "" : "This field is required.")}
            {  recency.sampleCollectedDate!=='' && (temp.dateSampleSentToPCRLab = recency.dateSampleSentToPCRLab ? "" : "This field is required.")}
            { recency.sampleCollectedDate!=='' && (temp.sampleType = recency.sampleType ? "" : "This field is required.")}
            setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    const handleSubmit =(e)=>{
        e.preventDefault();
       

            objValues.htsClientId= clientId
            objValues.recency= recency
            objValues.personId= patientID
            axios.put(`${baseUrl}hts/${clientId}/recency`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                props.setPatientObj(response.data)
                //toast.success("Risk Assesment successful");
                handleItemClick('indexing', 'recency-testing' )

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



    return (
        <>
            <Card className={classes.root}>
                <CardBody>               
                <h2>RECENCY FORM</h2>
                    <form >
                        <div className="row">
                        <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>RENCENCY</h5>
                        </LabelRibbon>
                        <br/><br/><br/>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Opt Out of RTRI?*</Label>
                                    <select
                                        className="form-control"
                                        name="optOutRTRI"
                                        id="optOutRTRI"
                                        value={recency.optOutRTRI}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-8"></div>
                            {recency.optOutRTRI==='false' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Test Name *</Label>
                                    <select
                                        className="form-control"
                                        name="optOutRTRITestName"
                                        id="optOutRTRITestName"
                                        value={recency.optOutRTRITestName}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Asante">Asante</option>
                                        <option value="Others">Others</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Test Date *</Label>
                                    <Input
                                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                        name="optOutRTRITestDate"
                                        id="optOutRTRITestDate"
                                        value={recency.optOutRTRITestDate}
                                        onChange={handleInputChangeRecency}
                                        min={hivTestDate!=="" && hivTestDate!==null ? hivTestDate :""}
                                        max= {moment(new Date()).format("YYYY-MM-DD") }
                                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                    />
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Recency ID *</Label>
                                    <Input
                                        className="form-control"
                                        name="rencencyId"
                                        id="rencencyId"
                                        type="text"
                                        value={recency.rencencyId}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    />
                                 
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Control Line *</Label>
                                    <select
                                        className="form-control"
                                        name="controlLine"
                                        id="controlLine"
                                        value={recency.controlLine}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Verification Line *</Label>
                                    <select
                                        className="form-control"
                                        name="verififcationLine"
                                        id="verififcationLine"
                                        value={recency.verififcationLine}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Long Term Line *</Label>
                                    <select
                                        className="form-control"
                                        name="longTermLine"
                                        id="longTermLine"
                                        value={recency.longTermLine}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>

                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Recency Interpretation *</Label>
                                    <Input
                                        className="form-control"
                                        name="rencencyInterpretation"
                                        id="rencencyInterpretation"
                                        type="text"
                                        value={recency.rencencyInterpretation}
                                        disabled
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    />
                                       
                                    
                                </FormGroup>
                            </div>
                            {recency.rencencyInterpretation==='Recent' && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has viral load request been made? *</Label>
                                    <select
                                        className="form-control"
                                        name="hasViralLoad"
                                        id="hasViralLoad"
                                        value={recency.hasViralLoad}
                                        onChange={handleInputChangeRecency}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )}
                            {recency.hasViralLoad==='true' && (
                            <>
                                <div className="row">
                                    <h4>Viral Load Classification :</h4>
                                    <br/>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Sample Collected Date</Label>
                                        <Input
                                            className="form-control"
                                            name="sampleCollectedDate"
                                            id="sampleCollectedDate"
                                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                            value={recency.sampleCollectedDate}
                                            min={recency.optOutRTRITestDate}
                                            max= {moment(new Date()).format("YYYY-MM-DD") }
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                    
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Sample Refernce Number</Label>
                                        <Input
                                            className="form-control"
                                            name="sampleReferanceNumber"
                                            id="sampleReferanceNumber"
                                            type="text"
                                            value={recency.sampleReferanceNumber}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                        {errors.sampleReferanceNumber !=="" ? (
                                        <span className={classes.error}>{errors.sampleReferanceNumber}</span>
                                        ) : "" }
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Sample Type</Label>
                                        <select
                                            className="form-control"
                                            name="sampleType"
                                            id="sampleType"
                                            value={recency.sampleType}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        >
                                            <option value={""}></option>
                                            <option value="DBS">DBS</option>
                                            <option value="Plasma">Plasma</option>
                                            
                                        </select>
                                        {errors.sampleType !=="" ? (
                                        <span className={classes.error}>{errors.sampleType}</span>
                                        ) : "" }
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Date Sample Sent to PCR Lab</Label>
                                        <Input
                                            className="form-control"
                                            name="dateSampleSentToPCRLab"
                                            id="dateSampleSentToPCRLab"
                                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                            min={recency.optOutRTRITestDate}
                                            value={recency.dateSampleSentToPCRLab}
                                            max= {moment(new Date()).format("YYYY-MM-DD") }
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                         {errors.dateSampleSentToPCRLab !=="" ? (
                                        <span className={classes.error}>{errors.dateSampleSentToPCRLab}</span>
                                        ) : "" }
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Sample Test Date</Label>
                                        <Input
                                            className="form-control"
                                            name="sampleTestDate"
                                            id="sampleTestDate"
                                            type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                            min={recency.optOutRTRITestDate}
                                            max= {moment(new Date()).format("YYYY-MM-DD") }
                                            value={recency.sampleTestDate}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                        
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Receiving PCR Lab</Label>
                                        <Input
                                            className="form-control"
                                            name="receivingPcrLab"
                                            id="receivingPcrLab"
                                            type="text"
                                            value={recency.receivingPcrLab}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                        
                                    </FormGroup>
                                </div>
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Viral Load Result Classification and Result (copies/ml)</Label>
                                        <select
                                            className="form-control"
                                            name="viralLoadResultClassification"
                                            id="viralLoadResultClassification"
                                            value={recency.viralLoadResultClassification}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        >
                                            <option value={""}>Select</option>
                                            <option value=">=1000">{">= "} 1000</option>
                                            <option value="<1000">{"< "} 1000</option>
                                            <option value="Failed run">Failed run</option>
                                            <option value="Invalid viral load result">Invalid viral load result</option>
                                            
                                        </select>
                                        
                                    </FormGroup>
                                </div>
                                {/* <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Result (copies/ml)</Label>
                                        <Input
                                            className="form-control"
                                            name="recencyResult"
                                            id="recencyResult"
                                            type="text"
                                            value={recency.recencyResult}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />
                                        
                                    </FormGroup>
                                </div> */}
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label>Final Recency Result</Label>
                                        <Input
                                            className="form-control"
                                            name="finalRecencyResult"
                                            id="finalRecencyResult"
                                            type="text"
                                            disabled
                                            value={recency.finalRecencyResult}
                                            onChange={handleInputChangeRecency}
                                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        />

                                    </FormGroup>
                                </div>
                                </div>
                            </>
                            )}
                            </>)}
                                                      
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-12">
                            <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('post-test','post-test')}/>
                            <Button content='Save & Continue' icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                            </div>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default Recency