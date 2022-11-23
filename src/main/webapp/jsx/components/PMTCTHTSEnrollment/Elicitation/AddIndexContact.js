import React, {useCallback, useEffect, useState} from "react";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import axios from "axios";
import {token, url as baseUrl } from "../../../../api";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
// import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Button} from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'



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


const AddIndexContact = (props) => {
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [sexs, setSexs] = useState([])
    const [notificationContact, setNotificationContact] = useState([])
    const [ageDisabled, setAgeDisabled] = useState(true);
    const [indexTesting, setIndexTesting]= useState([]);
    const [consent, setConsent]= useState([]);
    const [hivTestDate, setHivTestDate] = useState("");
   
    const [objValuesIndex, setObjValuesIndex]= useState( {
        htsClientId: null,
        indexNotificationServicesElicitation: {},
        personId: null
      })
   
    const [objValues, setObjValues]= useState(
        {
            firstName: "",
            middleName: "",
            lastName:"",
            dob:"",
            phoneNumber:"",
            altPhoneNumber: "",
            sex: "",
            htsClientId:props  && props.patientObj ? props.patientObj.id : "",
            physicalHurt: "",
            threatenToHurt: "",
            address: "", 
            hangOutSpots: "",
            relativeToIndexClient: "",
            currentlyLiveWithPartner: "", 
            partnerTestedPositive: "",
            sexuallyUncomfortable: "", 
            notificationMethod : "",
            datePartnerCameForTesting: "",
        }
    )
           
    useEffect(() => { 
        Sex();
        NotificationContact();
        IndexTesting();
        Consent();
        if(props.patientObj){

            if(props.patientObj.dateVisit && props.patientObj.dateVisit!=='' ){
                setHivTestDate(props.patientObj.dateVisit)
            }else{
                setHivTestDate("")
            }
        }
    }, [props.patientObj]);

    //Get list of Genders from 
    const Sex =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/SEX`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setSexs(response.data);

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
    ///CONSENT	Yes		en	CONSENT
    const Consent =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/CONSENT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setConsent(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const NotificationContact =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/NOTIFICATION_CONTACT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setNotificationContact(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
        
    }
    const handleItemClickPage =(page)=>{
        props.handleIClickPage(page)
    }
    const handleInputChange = e => { 
        //setErrors({...temp, [e.target.name]:""})
        if(e.target.name==='firstName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setObjValues ({...objValues,  [e.target.name]: name});
        }
        if(e.target.name==='lastName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setObjValues ({...objValues,  [e.target.name]: name});
        }
        if(e.target.name==='middleName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setObjValues ({...objValues,  [e.target.name]: name});
        } 
        // if((e.target.name !=='maritalStatusId' && e.target.value!=='5' )){//logic for marital status
        //     setHideNumChild(true)
        // }else{
        //     setHideNumChild(false)
        // }         
        setObjValues ({...objValues,  [e.target.name]: e.target.value});            
    }
    //Date of Birth and Age handle 
    const handleDobChange = (e) => {
        if (e.target.value) {
            const today = new Date();
            const birthDate = new Date(e.target.value);
            let age_now = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age_now--;
            }
            objValues.age=age_now
            
            //setBasicInfo({...basicInfo, age: age_now});        
        } else {
            setObjValues({...objValues, age:  ""});
        }
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
   
        setObjValues({...objValues, dob: e.target.value});
        
    }
    const handleDateOfBirthChange = (e) => {
        if (e.target.value == "Actual") {
            objValues.isDateOfBirthEstimated=false
            setAgeDisabled(true);
        } else if (e.target.value == "Estimated") {
            objValues.isDateOfBirthEstimated=true
            setAgeDisabled(false);
        }
    }
    const handleAgeChange = (e) => {
        if (!ageDisabled && e.target.value) {
            const currentDate = new Date();
            currentDate.setDate(15);
            currentDate.setMonth(5);
            const estDob = moment(currentDate.toISOString());
            const dobNew = estDob.add((e.target.value * -1), 'years');
            setObjValues({...objValues, dob: moment(dobNew).format("YYYY-MM-DD")});
            objValues.dob =moment(dobNew).format("YYYY-MM-DD")

        }
        setObjValues({...objValues, age: e.target.value});
    }
    //End of Date of Birth and Age handling 
    const checkPhoneNumberBasic=(e, inputName)=>{
        const limit = 10;
        setObjValues({...objValues,  [inputName]: e.slice(0, limit)});     
    }
    const alphabetOnly=(value)=>{
        const result = value.replace(/[^a-z]/gi, '');
        return result
    }
    const handleSubmit =(e)=>{
        e.preventDefault();     
        objValues.isDateOfBirthEstimated=objValues.isDateOfBirthEstimated==true ? 1 : 0
            axios.post(`${baseUrl}index-elicitation`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                toast.success("Record save successful",  {position: toast.POSITION.BOTTOM_CENTER});
                handleItemClickPage('list')

            })
            .catch(error => {
                setSaving(false);
                if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    toast.error(errorMessage,  {position: toast.POSITION.BOTTOM_CENTER});
                }
                else{
                    toast.error("Something went wrong. Please try again...",  {position: toast.POSITION.BOTTOM_CENTER});
                }
            });
            
    }

    return (
        <>
            <Card className={classes.root}>
                <CardBody>
                
                <h2 style={{color:'#000'}}>Index Notification Services - Elicitation 
                <Button
                    variant="contained"
                    color="primary"
                    className=" float-end  mr-2 mt-2"
                    onClick={()=>handleItemClickPage('list')}
                    //startIcon={<FaUserPlus size="10"/>}
                >
                    <span style={{ textTransform: "capitalize" }}> Back To Client Index List</span>
                </Button>
                </h2>
                <br/><br/>    
                    <form >
                        <div className="row">
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">First Name</Label>
                                <Input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    value={objValues.firstName}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Middle Name</Label>
                                <Input
                                    type="text"
                                    name="middleName"
                                    id="middleName"
                                    value={objValues.middleName}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Last Name</Label>
                                <Input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={objValues.lastName}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-2 col-md-2">
                                <FormGroup>
                                    <Label>Date Of Birth</Label>
                                    <div className="radio">
                                        <label>
                                            <input
                                                type="radio"
                                                value="Actual"
                                                name="dateOfBirth"
                                                defaultChecked
                                                
                                                onChange={(e) => handleDateOfBirthChange(e)}
                                                style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                            /> Actual
                                        </label>
                                    </div>
                                    <div className="radio">
                                        <label>
                                            <input
                                                type="radio"
                                                value="Estimated"
                                                name="dateOfBirth"
                                                
                                                onChange={(e) => handleDateOfBirthChange(e)}
                                                style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                            /> Estimated
                                        </label>
                                    </div>
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                    <Label>Date</Label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        name="dob"
                                        id="dob"
                                        max= {moment(new Date()).format("YYYY-MM-DD") }
                                        value={objValues.dob}
                                        onChange={handleDobChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    />
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                    <Label>Age</Label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        name="age"
                                        id="age"
                                        value={objValues.age}
                                        disabled={ageDisabled}
                                        onChange={handleAgeChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    />
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Phone Number</Label>
                                
                                    <PhoneInput
                                        containerStyle={{width:'100%',border: "1px solid #014D88"}}
                                        inputStyle={{width:'100%',borderRadius:'0px'}}
                                        country={'ng'}
                                        placeholder="(234)7099999999"
                                        minLength={10}
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        masks={{ng: '...-...-....', at: '(....) ...-....'}}
                                        value={objValues.phoneNumber}
                                        onChange={(e)=>{checkPhoneNumberBasic(e,'phoneNumber')}}
                                        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}
                                    />
                                    {errors.phoneNumber !=="" ? (
                                        <span className={classes.error}>{errors.phoneNumber}</span>
                                        ) : "" }
                                </FormGroup>
                            </div>
                            
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Alternative Phone Number</Label>
                                <PhoneInput
                                        containerStyle={{width:'100%',border: "1px solid #014D88"}}
                                        inputStyle={{width:'100%',borderRadius:'0px'}}
                                        country={'ng'}
                                        placeholder="(234)7099999999"
                                        minLength={10}
                                        name="altPhoneNumber"
                                        id="altPhoneNumber"
                                        masks={{ng: '...-...-....', at: '(....) ...-....'}}
                                        value={objValues.altPhoneNumber}
                                        onChange={(e)=>{checkPhoneNumberBasic(e,'altPhoneNumber')}}
                                        //onChange={(e)=>{handleInputChangeBasic(e,'phoneNumber')}}
                                    />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Sex *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        value={objValues.sex}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {sexs.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    
                                </FormGroup>
                            </div>                           
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Address</Label>
                                <Input
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={objValues.address}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                                   
                                />                                
                                </FormGroup>
                            </div> 
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Hang-out spots</Label>
                                <Input
                                    type="text"
                                    name="hangOutSpots"
                                    id="hangOutSpots"
                                    value={objValues.hangOutSpots}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                                   
                                />                                
                                </FormGroup>
                            </div>

                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Relationship to Index Client *</Label>
                                    <select
                                        className="form-control"
                                        name="relativeToIndexClient"
                                        id="relativeToIndexClient"
                                        value={objValues.relativeToIndexClient}
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
                                    <Label>Do you currently live with this partner? *</Label>
                                    <select
                                        className="form-control"
                                        name="currentlyLiveWithPartner"
                                        id="currentlyLiveWithPartner"
                                        value={objValues.currentlyLiveWithPartner}
                                        onChange={handleInputChange}        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value={"true"}>Yes</option>
                                        <option value={"false"}>No</option>
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>As far as you know, as this partner ever tested positive for HIV *</Label>
                                    <select
                                        className="form-control"
                                        name="partnerTestedPositive"
                                        id="partnerTestedPositive"
                                        value={objValues.partnerTestedPositive}
                                        onChange={handleInputChange} 
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {consent.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has this partner ever hit, kick, slapped or otherwise physical hurt you? *</Label>
                                    <select
                                        className="form-control"
                                        name="physicalHurt"
                                        id="physicalHurt"
                                        value={objValues.physicalHurt}
                                        onChange={handleInputChange} 
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                         <option value={""}></option>
                                        {consent.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has this partner ever threaten to hurt you? *</Label>
                                    <select
                                        className="form-control"
                                        name="threatenToHurt"
                                        id="threatenToHurt"
                                        value={objValues.threatenToHurt}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {consent.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    
                                </FormGroup>
                            </div>
                           
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has this partner ever threaten force you to do something sexually that made you uncomfortable ?  *</Label>
                                    <select
                                        className="form-control"
                                        name="sexuallyUncomfortable"
                                        id="sexuallyUncomfortable"
                                        value={objValues.sexuallyUncomfortable}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                         <option value={""}></option>
                                        {consent.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </select>
                                    
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Notification Method selected*</Label>
                                    <select
                                        className="form-control"
                                        name="notificationMethod"
                                        id="notificationMethod"
                                        value={objValues.notificationMethod}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        {notificationContact.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>

                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">If contract by which date will partner come for testing?</Label>
                                <Input
                                    type="date"
                                    name="datePartnerCameForTesting"
                                    id="datePartnerCameForTesting"
                                    value={objValues.datePartnerCameForTesting}
                                    onChange={handleInputChange}
                                    min={hivTestDate}
                                    //max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.datePartnerComeForTesting !=="" ? (
                                    <span className={classes.error}>{errors.datePartnerComeForTesting}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                           
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-6">
                           
                            <Button content='Save' icon='save' labelPosition='left' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                            </div>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default AddIndexContact