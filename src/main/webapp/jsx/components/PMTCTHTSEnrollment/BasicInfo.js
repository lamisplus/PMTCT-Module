
import React, { useEffect, useState} from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import { Button} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import {  Modal } from "react-bootstrap";


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
    },
    success:{
        color: 'green',
        fontSize: '12.8px',
        fontWeight:'bold'
    }
}));


const BasicInfo = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [hideNumChild, setHideNumChild] = useState(false);
    const [kP, setKP] = useState([]);
    const [enrollSetting, setEnrollSetting] = useState([]);
    const [sourceReferral, setSourceReferral] = useState([]);
    const [gender, setGender] = useState([])
    const [counselingType, setCounselingType] = useState([]);
    const [pregnancyStatus, setPregnancyStatus] = useState([]);
    const [indexTesting, setIndexTesting]= useState([]);
    let temp = { ...errors }
    const [clientCodeetail, setclientCodeetail]= useState("");
    const [clientCodeetail2, setclientCodeetail2]= useState("");
    const [clientCodeCheck, setClientCodeCheck]= useState("");

    const [objValues, setObjValues]= useState(
        {
            active: true,
            personId: props.patientObj.personId,
            clientCode: props.patientObj && props.patientObj.clientCode ? props.patientObj.clientCode :"",  
            breastFeeding:props.patientObj && props.patientObj.breastFeeding ? props.patientObj.breastFeeding :"",
            dateVisit: props.patientObj && props.patientObj.dateVisit ? props.patientObj.dateVisit :"",
            firstTimeVisit: props.patientObj && props.patientObj.firstTimeVisit ? props.patientObj.firstTimeVisit :"",
            indexClient: props.patientObj && props.patientObj.indexClient ? props.patientObj.indexClient :"",
            numChildren: props.patientObj && props.patientObj.numChildren ? props.patientObj.numChildren :"",
            numWives: props.patientObj && props.patientObj.numWives ? props.patientObj.numWives :"",
            pregnant:props.patientObj && props.patientObj.pregnant ? props.patientObj.pregnant :"",           
            previouslyTested: props.patientObj ? props.patientObj.previouslyTested :"",
            referredFrom: props.patientObj ? props.patientObj.referredFrom :"",
            riskAssessment:  props.patientObj && props.patientObj.riskAssessment? props.patientObj.riskAssessment : {},
            riskStratificationCode:props.extra && props.extra.code!=='' ? props.extra.code : "",
            targetGroup: props.patientObj && props.patientObj.targetGroup? props.patientObj.targetGroup :"",
            testingSetting:props.patientObj ? props.patientObj.testingSetting :"",
            typeCounseling: props.patientObj ? props.patientObj.typeCounseling :"",
            relationshipWithIndexClient:props.patientObj ? props.patientObj.relationshipWithIndexClient :"",
            indexClientCode:props.patientObj ? props.patientObj.indexClientCode :"",
        }
    )    
    useEffect(() => { 
        KP(); 
        EnrollmentSetting(); 
        SourceReferral();
        Genders();
        CounselingType();
        PregnancyStatus()
        IndexTesting();
    }, [ props.patientObj]);
    //Get list of KP
    const KP =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/TARGET_GROUP`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setKP(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    //Get list of IndexTesting
    const IndexTesting =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/INDEX_TESTING`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setIndexTesting(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    //Get list of KP
    const PregnancyStatus =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PREGANACY_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPregnancyStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    
    //Get list of KP
    const CounselingType =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/COUNSELING_TYPE`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setCounselingType(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    //Get list of HIV STATUS ENROLLMENT
    const EnrollmentSetting =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/TEST_SETTING`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setEnrollSetting(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }

    //Get list of Source of Referral
    const SourceReferral =()=>{
            axios
            .get(`${baseUrl}application-codesets/v2/SOURCE_REFERRAL`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                //console.log(response.data);
                setSourceReferral(response.data);
            })
            .catch((error) => {
            //console.log(error);
            });        
    }
    //Get list of Genders from 
    const Genders =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/GENDER`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setGender(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const handleInputChange = e => { 
        setErrors({...temp, [e.target.name]:""}) 
        if(e.target.name==='indexClientCode' && e.target.value!==''){
            async function getIndexClientCode() {
                const indexClientCode=e.target.value
                const response = await axios.get(`${baseUrl}hts/client/${indexClientCode}`,
                        { headers: {"Authorization" : `Bearer ${token}`, 'Content-Type': 'text/plain'} }
                    );
                if(response.data!=='Record Not Found'){
                    setclientCodeetail2("")
                    setclientCodeetail(response.data)
                    
                }else{
                    setclientCodeetail("")
                    setclientCodeetail2(response.data)
                }
            }
            getIndexClientCode();
        }         
        setObjValues ({...objValues,  [e.target.name]: e.target.value});            
    }

    /*****  Validation  */
    const validate = () => {
        //HTS FORM VALIDATION
        
           temp.clientCode = objValues.clientCode ? "" : "This field is required."
            temp.typeCounseling = objValues.typeCounseling ? "" : "This field is required."
            temp.testingSetting = objValues.testingSetting ? "" : "This field is required."
            temp.targetGroup = objValues.targetGroup ? "" : "This field is required."
            temp.referredFrom = objValues.referredFrom ? "" : "This field is required."
            temp.previouslyTested = objValues.previouslyTested ? "" : "This field is required." 
            temp.indexClient = objValues.indexClient ? "" : "This field is required."  
            temp.firstTimeVisit = objValues.firstTimeVisit ? "" : "This field is required." 
            temp.dateVisit = objValues.dateVisit ? "" : "This field is required."               
                setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
    }
    //checkClientCode
    const checkClientCode = e => { 

        async function getIndexClientCode() {
            const indexClientCode=objValues.clientCode
            const response = await axios.get(`${baseUrl}hts/client/${indexClientCode}`,
                    { headers: {"Authorization" : `Bearer ${token}`, 'Content-Type': 'text/plain'} }
                );
            if(response.data!=='Record Not Found'){
                setClientCodeCheck("Client code already exist")
            }else{
                setClientCodeCheck("")
            }
        }
        getIndexClientCode();
                          
    }
    const handleSubmit =(e)=>{
        e.preventDefault();
        const patientForm ={
            clientCode: objValues.clientCode,
            dateVisit: objValues.dateVisit,
            extra: {},
            firstTimeVisit: objValues.firstTimeVisit,
            indexClient: objValues.indexClient,
            numChildren: objValues.numChildren,
            numWives: objValues.numWives,
            personId: props.patientObj.personId,
            hospitalNumber:objValues.clientCode,
            previouslyTested: objValues.previouslyTested,
            referredFrom: objValues.referredFrom,
            targetGroup: objValues.targetGroup,
            testingSetting: objValues.testingSetting,
            typeCounseling:objValues.typeCounseling,
            breastFeeding:objValues.breastFeeding,
            pregnant:objValues.pregnant,
            relationshipWithIndexClient:objValues.relationshipWithIndexClient,
            riskStratificationCode:props.extra && props.extra.code!=='' ? props.extra.code : "",
            }

            if(validate()){
            axios.post(`${baseUrl}hts`,patientForm,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                props.setPatientObj(response.data)
                //toast.success("HTS Test successful");
                if(props.patientAge>15){
                    handleItemClick('pre-test-counsel', 'basic' )
                }else{
                    handleItemClick('hiv-test', 'baisc')
                }

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
            }else{
                toast.error("All fields are required",  {position: toast.POSITION.BOTTOM_CENTER});
            }
    }


    return (
        <>  
        
            <Card className={classes.root}>
                <CardBody>   
                <h2 style={{color:'#000'}}>CLIENT INTAKE FORM </h2>
                <br/>
                    <form >
                        <div className="row">
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Target Group *</Label>
                                    <select
                                        className="form-control"
                                        name="targetGroup"
                                        id="targetGroup"
                                        onChange={handleInputChange}
                                        value={objValues.targetGroup}
                                        disabled
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {kP.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.targetGroup !=="" ? (
                                        <span className={classes.error}>{errors.targetGroup}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Client Code *</Label>
                                <Input
                                    type="text"
                                    name="clientCode"
                                    id="clientCode"
                                    value={objValues.clientCode}
                                    onChange={handleInputChange}
                                    //disabled={props.clientCode!=="" && props.clientCode!==null? true : false}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                {errors.clientCode !=="" ? (
                                    <span className={classes.error}>{errors.clientCode}</span>
                                ) : "" }                                
                                </FormGroup>
                            </div>                           
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Referred From *</Label>
                                    <select
                                        className="form-control"
                                        name="referredFrom"
                                        id="referredFrom"
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {sourceReferral.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.referredFrom !=="" ? (
                                        <span className={classes.error}>{errors.referredFrom}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Setting*</Label>
                                    <select
                                        className="form-control"
                                        name="testingSetting"
                                        id="testingSetting"
                                        value={objValues.testingSetting}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {enrollSetting.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.testingSetting !=="" ? (
                                        <span className={classes.error}>{errors.testingSetting}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Visit Date  </Label>
                                <Input
                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                    name="dateVisit"
                                    id="dateVisit"
                                    value={objValues.dateVisit}
                                    onChange={handleInputChange}
                                    min={objValues.dateOfRegistration}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.dateVisit !=="" ? (
                                    <span className={classes.error}>{errors.dateVisit}</span>
                                ) : "" }
                                </FormGroup>
                            </div>

                            {/* {(objValues.targetGroup!=='457' && objValues.targetGroup!=="") && (
                            <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Gender</Label>
                                <select
                                    className="form-control"
                                    name="genderId"
                                    id="genderId"
                                    value={objValues.genderId}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                >
                                    <option value={""}></option>
                                    {gender.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                                </select>
                               
                            </FormGroup>
                            </div>
                            )} */}

                            {(objValues.age>9 ) && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Number of Children {'<5'} years</Label>
                                    <Input
                                        type="number"
                                        name="numChildren"
                                        id="numChildren"
                                        min={0}
                                        value={objValues.numChildren}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                    /> 
                                     
                                </FormGroup>
                            </div>
                            )}
                            {(objValues.age > 9 && objValues.sexId=='376') && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Number of wives/co-wives</Label>
                                    <Input
                                        type="number"
                                        name="numWives"
                                        id="numWives"
                                        min={0}
                                        value={objValues.numWives}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                    />
                                    
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Index Testing</Label>
                                    <select
                                        className="form-control"
                                        name="indexClient"
                                        id="indexClient"
                                        value={objValues.indexClient}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">YES</option>
                                        <option value="false">NO</option>
                                    </select>
                                    {errors.indexClient !=="" ? (
                                        <span className={classes.error}>{errors.indexClient}</span>
                                    ) : "" }   
                                </FormGroup>
                            </div>
                            {objValues.indexClient==='true' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Relationship of the index client</Label>
                                    <select
                                        className="form-control"
                                        name="relationshipWithIndexClient"
                                        id="relationshipWithIndexClient"
                                        value={objValues.relationshipWithIndexClient}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {indexTesting.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                             <div className="form-group  col-md-4">
                             <FormGroup>
                                 <Label>Index Client Code/ID</Label>
                                 <Input
                                     type="text"
                                     name="indexClientCode"
                                     id="indexClientCode"
                                     value={objValues.indexClientCode}
                                     onBlur ={checkClientCode}
                                     onChange={handleInputChange}
                                     style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                                 />
                                 {clientCodeCheck!=="" ? (
                                <span className={classes.error}>{clientCodeCheck}</span>
                            ) : "" }  
                             </FormGroup>
                            </div>
                            </>
                            )}
                            {objValues.sex==='377' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Pregnant</Label>
                                    <select
                                        className="form-control"
                                        name="pregnant"
                                        id="pregnant"
                                        value={objValues.pregnant}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {pregnancyStatus.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>

                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Breast Feeding</Label>
                                    <select
                                        className="form-control"
                                        name="breastFeeding"
                                        id="breastFeeding"
                                        value={objValues.breastFeeding}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">YES</option>
                                        <option value="false">NO</option>
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            </>
                            )}
                           
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>First time visit</Label>
                                    <select
                                        className="form-control"
                                        name="firstTimeVisit"
                                        id="firstTimeVisit"
                                        value={objValues.firstTimeVisit}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">YES</option>
                                        <option value="false">NO</option>
                                        
                                    </select>
                                    {errors.firstTimeVisit !=="" ? (
                                        <span className={classes.error}>{errors.firstTimeVisit}</span>
                                    ) : "" }    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Previously tested within the last 3 months</Label>
                                    <select
                                        className="form-control"
                                        name="previouslyTested"
                                        id="previouslyTested"
                                        value={objValues.previouslyTested}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">YES</option>
                                        <option value="false">NO</option>
                                    </select>
                                    {errors.previouslyTested !=="" ? (
                                        <span className={classes.error}>{errors.previouslyTested}</span>
                                    ) : "" }    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Type of Counseling</Label>
                                    <select
                                        className="form-control"
                                        name="typeCounseling"
                                        id="typeCounseling"
                                        value={objValues.typeCounseling}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {counselingType.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    {errors.typeCounseling !=="" ? (
                                        <span className={classes.error}>{errors.typeCounseling}</span>
                                    ) : "" }   
                                </FormGroup>
                            </div>
                            
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-6">

                            <Button content='Save & Continue' type="submit" icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                            </div>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>
                                  
        </>
    );
};

export default BasicInfo