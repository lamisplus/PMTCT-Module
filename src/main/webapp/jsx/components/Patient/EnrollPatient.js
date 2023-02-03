import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";
import {FormGroup, Label, Spinner,Input,Form, InputGroup} from "reactstrap";
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCheckSquare, faCoffee, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons'
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {Link, useHistory, useLocation} from "react-router-dom";
import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import  './patient.css'
// import Form from 'react-bootstrap/Form';
import {  Modal } from "react-bootstrap";





library.add(faCheckSquare, faCoffee, faEdit, faTrash);

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
        flexGrow: 1,
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


const UserRegistration = (props) => {
    const [basicInfo, setBasicInfo]= useState(
            {
                active: true,
                address: [],
                contact: [],
                contactPoint: [],
                dateOfBirth: "",
                deceased: false,
                deceasedDateTime: null,
                firstName: "",
                genderId: "",
                identifier: "",
                otherName: "",
                maritalStatusId: "",
                educationId: "",
                employmentStatusId:"",
                dateOfRegistration: "",
                isDateOfBirthEstimated: null,
                age:"",
                phoneNumber:"",
                altPhonenumber:"",
                dob:"",
                countryId:"",
                stateId:"",
                district:"",
                landmark:"",
                sexId:"",
                ninNumber:""

            }
    )
    const [saving, setSaving] = useState(false);
    const [disabledAgeBaseOnAge, setDisabledAgeBaseOnAge] = useState(false);
    const [ageDisabled, setAgeDisabled] = useState(true);
    const [genders, setGenders]= useState([]);
    const [ancNumberCheck, setAncNumberCheck] = useState(false);
    const [errors, setErrors] = useState({})
    const userDetail = props.location && props.location.state ? props.location.state.user : null;
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();

     //const [values, setValues] = useState([]);
     const [objValues, setObjValues] = useState({   
            ancNo:"",
            gaweeks: "",
            gravida: "",
            expectedDeliveryDate:"",
            firstAncDate:"",
            lmp: "",
            parity: "",
            person_uuid:"",
            hivDiognosicTime:"",
            referredSyphilisTreatment: "",
            testResultSyphilis: "",
            testedSyphilis: "",
            treatedSyphilis: "",
            personDto:{},
            pmtctHtsInfo:{},
            syphilisInfo:{},
            partnerNotification:{},
            sourceOfReferral:"",
            staticHivStatus:"",

    });
     const [pregnancyStatus, setPregnancyStatus] = useState([]);
     //set ro show the facility name field if is transfer in 

     const [open, setOpen] = React.useState(false)
     const toggle = () => setOpen(!open);
    const locationState = location.state;
    let patientId = null;
    let patientObj = {};
    patientId = locationState ? locationState.patientId : null;
    patientObj = locationState ? locationState.patientObj : {}; 
    console.log(patientObj)
    const [sourceOfReferral, setSourceOfReferral] = useState([]);
    useEffect(() => { 
        loadGenders();
        getSex();
        PregnancyStatus();
        if(patientObj){
            objValues.staticHivStatus = patientObj && patientObj.dynamicHivStatus==='Positive' ? "Positive": ""
            const identifiers = patientObj.identifier;
            const hospitalNumber = identifiers.identifier.find(obj => obj.type === 'HospitalNumber');
            basicInfo.dob=patientObj.dateOfBirth
            basicInfo.firstName=patientObj.firstName
            basicInfo.dateOfRegistration=patientObj.dateOfRegistration
            basicInfo.middleName=patientObj.otherName
            basicInfo.lastName=patientObj.surname
            basicInfo.dateOfRegistration=patientObj.dateOfRegistration
            basicInfo.hospitalNumber=hospitalNumber && hospitalNumber ? hospitalNumber.value : ''
            setObjValues ({...objValues,  uniqueId: hospitalNumber ? hospitalNumber.value : ''});
            basicInfo.genderId=patientObj && patientObj.gender ? patientObj.gender.id : null
            const patientAge=calculate_age(moment(patientObj.dateOfBirth).format("DD-MM-YYYY"))
            basicInfo.age=patientAge
            objValues.personId=patientObj.id
            basicInfo.ninNumber=patientObj.ninNumber
            basicInfo.staticHivStatus=patientObj.dynamicHivStatus

        }
        if(basicInfo.dateOfRegistration < basicInfo.dob){
            alert('Date of registration can not be earlier than date of birth')
        }
        SOURCE_REFERRAL_PMTCT() 
        
    }, [patientObj, patientId, basicInfo.dateOfRegistration]);
    //Get list of Source of Referral
    const SOURCE_REFERRAL_PMTCT =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/SOURCE_REFERRAL_PMTCT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setSourceOfReferral(response.data)
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const getSex =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/SEX`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            let patientSex=""
            if(patientObj.sex==='female' || patientObj.sex==='Female' || patientObj.sex==='FEMALE'){
                 patientSex= 'Female'
            }
            if(patientObj.sex==='Male' || patientObj.sex==='male' || patientObj.sex==='MALE' ){
                 patientSex= 'Male'
            }
            const getSexId=  response.data.find((x)=> x.display===patientSex)//get patient sex ID by filtering the request
            basicInfo.sexId=getSexId.display
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const loadGenders = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}application-codesets/v2/SEX`, { headers: {"Authorization" : `Bearer ${token}`} });
            setGenders(response.data);
        } catch (e) {
            
        }
    }, []);
    //Calculate Date of birth 
    const calculate_age = dob => {
        var today = new Date();
        var dateParts = dob.split("-");
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age_now--;
                }
            if (age_now === 0) {
                    return m + " month(s)";
                }
                return age_now ;
    };

    const handleAgeChange = (e) => {
        const ageNumber = e.target.value.replace(/\D/g, '')
        if (!ageDisabled && ageNumber) {
            if(ageNumber!=='' && ageNumber>=60){
                toggle()
            }
            if(ageNumber <=1){
                setDisabledAgeBaseOnAge(true)
            }else{
                setDisabledAgeBaseOnAge(false)
            }
            const currentDate = new Date();
            currentDate.setDate(15);
            currentDate.setMonth(5);
            const estDob = moment(currentDate.toISOString());
            const dobNew = estDob.add((ageNumber * -1), 'years');
            //setBasicInfo({...basicInfo, dob: moment(dobNew).format("YYYY-MM-DD")});
            basicInfo.dob =moment(dobNew).format("YYYY-MM-DD")

        }
        setBasicInfo({...basicInfo, age: ageNumber});
    }
    //End of Date of Birth and Age handling 
     /*****  Validation  */
     const validate = () => {
        let temp = { ...errors }
        
            //temp.firstAncDate = objValues.firstAncDate ? "" : "This field is required"
            temp.gaweeks = objValues.gaweeks ? "" : "This field is required"
            temp.gravida = objValues.gravida ? "" : "This field is required"
            objValues.testedSyphilis==='Yes' && objValues.testResultSyphilis==='Positive' && (temp.referredSyphilisTreatment = objValues.referredSyphilisTreatment ? "" : "This field is required")
            temp.lmp = objValues.lmp ? "" : "This field is required"
            temp.parity = objValues.parity ? "" : "This field is required"
            temp.testedSyphilis = objValues.testedSyphilis ? "" : "This field is required"
            objValues.testedSyphilis==='Yes' && objValues.testResultSyphilis==='Positive' && (temp.treatedSyphilis = objValues.treatedSyphilis ? "" : "This field is required")
            temp.sourceOfReferral = objValues.sourceOfReferral ? "" : "This field is required"
            objValues.testedSyphilis==='Yes' && (temp.testResultSyphilis = objValues.testResultSyphilis ? "" : "This field is required")
            temp.ancNo = objValues.ancNo ? "" : "This field is required"
                setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    //Handle Input Change for Basic Infor
    const handleInputChangeBasic = e => { 
        
        setErrors({...errors, [e.target.name]: ""}) 
               
        setBasicInfo ({...basicInfo,  [e.target.name]: e.target.value});              
    } 

    //Get list of KP
    const PregnancyStatus =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PREGANACY_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setPregnancyStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const handleInputChange = e => { 
        setErrors({...errors, [e.target.name]: ""}) 
        if(e.target.name==='ancNo' && e.target.value!==''){

            async function getAncNumber() {
                const ancNumber=e.target.value
                const ancNo= {
                    ancNo:ancNumber
                }
                const response = await axios.post(`${baseUrl}pmtct/anc/exist/anc-number/${ancNumber}`,ancNo,
                        { headers: {"Authorization" : `Bearer ${token}`, 'Content-Type': 'text/plain'} }
                    );
                if(response.data===true){
                    
                    toast.error("ANC number already exist")
                    setAncNumberCheck(response.data)
                }else{
                    setAncNumberCheck(false)
                }
            }
            getAncNumber();
            } 
            if(e.target.name==='lmp' && e.target.value!==''){

                async function getGa() {
                    const ga=e.target.value
                    const response = await axios.get(`${baseUrl}pmtct/anc/calculate-ga/${ga}`,
                            { headers: {"Authorization" : `Bearer ${token}`, 'Content-Type': 'text/plain'} }
                        );
                    if(response.data>0){
                        objValues.gaweeks=response.data
                        setObjValues ({...objValues,  [e.target.name]: e.target.value});  
                    }else{
                        toast.error("Please select a validate date")
                        setObjValues ({...objValues,  [e.target.name]: e.target.value}); 
                    }
                }
                getGa();
            }       
        setObjValues ({...objValues,  [e.target.name]: e.target.value});                
    }   

    //Handle CheckBox 
    const handleCancel =()=>{
        history.push({ pathname: '/' });
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); 

         if(validate()){
            try {
                objValues.person_uuid = patientObj.uuid;
                const response = await axios.post(`${baseUrl}pmtct/anc/anc-enrollement`, objValues, { headers: {"Authorization" : `Bearer ${token}`} });
                toast.success("Patient Register successful", {position: toast.POSITION.BOTTOM_CENTER});
                history.push('/');
            } catch (error) {                
                if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    if(error.response.data.apierror && error.response.data.apierror.message!=="" && error.response.data.apierror && error.response.data.apierror.subErrors[0].message!==""){
                        toast.error(error.response.data.apierror.message + " : " + error.response.data.apierror.subErrors[0].field + " " + error.response.data.apierror.subErrors[0].message, {position: toast.POSITION.BOTTOM_CENTER});
                    }else{
                        toast.error(errorMessage, {position: toast.POSITION.BOTTOM_CENTER});
                    }
                }
                else{
                    toast.error("Something went wrong. Please try again...", {position: toast.POSITION.BOTTOM_CENTER});
                }
            }
        }

    }
console.log(errors)

    return (
        <>
        <div className="row page-titles mx-0" style={{marginTop:"0px", marginBottom:"-10px"}}>
			<ol className="breadcrumb">
				<li className="breadcrumb-item active"><h4> <Link to={"/"} >PMTCT /</Link> Patient Enrollment</h4></li>
			</ol>
		  </div>
            <ToastContainer autoClose={3000} hideProgressBar />
            <Card className={classes.root}>
                <CardContent>
                    <Link
                        to={{
                            pathname: "/",
                            state: 'users'
                        }}>
                        <Button
                            variant="contained"
                            color="primary"
                            className=" float-end ms-1"
                            style={{backgroundColor:'#014d88',fontWeight:"bolder"}}
                            startIcon={<TiArrowBack />}
                        >
                            <span style={{ textTransform: "capitalize", color:'#fff' }}>Back </span>
                        </Button>
                    </Link>
                    <br />
                    <br />
                    <div className="col-xl-12 col-lg-12">
                        <Form >
                            <div className="card">
                                <div className="card-header" style={{backgroundColor:"#014d88",color:'#fff',fontWeight:'bolder',  borderRadius:"0.2rem"}}>
                                    <h5 className="card-title" style={{color:'#fff'}}>{userDetail===null ? "Basic Information" : "Edit User Information"}</h5>
                                </div>

                                <div className="card-body">
                                    <div className="basic-form">
                                        <div className="row">
                                            <div className="form-group mb-3 col-md-4">
                                                <FormGroup>
                                                    <Label for="firstName">Name</Label>
                                                    <Input
                                                        className="form-control"
                                                        type="text"
                                                        name="firstName"
                                                        id="firstName"
                                                        value={basicInfo.firstName + " "+ basicInfo.lastName}
                                                        onChange={handleInputChangeBasic}
                                                        style={{border: 'none', backgroundColor: 'transparent', outline:'none'}}
                                                        //disabled
                                                    />
                                                    {errors.firstName !=="" ? (
                                                    <span className={classes.error}>{errors.firstName}</span>
                                                    ) : "" }
                                                </FormGroup>
                                            </div>
                                            <div className="form-group mb-3 col-md-3">
                                                <FormGroup>
                                                    <Label for="patientId">Hospital Number </Label>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        name="hospitalNumber"
                                                        id="hospitalNumber"
                                                        value={basicInfo.hospitalNumber}
                                                        onChange={handleInputChangeBasic}
                                                        style={{border: 'none', backgroundColor: 'transparent', outline:'none'}}
                                                        //disabled
                                                    />
                                                   
                                                </FormGroup>
                                            </div>            

                                            <div className="form-group  col-md-2">
                                                <FormGroup>
                                                    <Label>Sex </Label>
                                                    <Input
                                                            className="form-control"
                                                            name="sexId"
                                                            id="sexId"
                                                            onChange={handleInputChangeBasic}
                                                            value={basicInfo.sexId}
                                                            style={{border: 'none', backgroundColor: 'transparent', outline:'none'}}
                                                            
                                                        />
                                                </FormGroup>
                                            </div>
                                            <div className="form-group mb-3 col-md-2">
                                                <FormGroup>
                                                    <Label>Age</Label>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        name="age"
                                                        id="age"
                                                        value={basicInfo.age}
                                                        disabled={ageDisabled}
                                                        onChange={handleAgeChange}
                                                        style={{border: 'none', backgroundColor: 'transparent', outline:'none'}}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>                                     
                                    </div>
                                </div>
                           
                            </div>

                            {/* Adding  ENROLLEMENT FORM HERE */}
                            <div className="card">
                            <div className="card-header" style={{backgroundColor:"#014d88",color:'#fff',fontWeight:'bolder', borderRadius:"0.2rem"}}>
                                <h5 className="card-title"  style={{color:'#fff'}}>ANC  Enrollment</h5>
                            </div>
                            <div className="card-body">
                            <div className="row">
                              
                                <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >ANC No <span style={{ color:"red"}}> *</span></Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="ancNo"
                                                    id="ancNo"
                                                    onChange={handleInputChange}
                                                    value={objValues.ancNo} 
                                                />

                                            </InputGroup>
                                            {errors.ancNo !=="" ? (
                                                    <span className={classes.error}>{errors.ancNo}</span>
                                            ) : "" }  
                                            {ancNumberCheck===true ? (
                                                        <span className={classes.error}>{"ANC number already exist"}</span>
                                                    ) : "" }         
                                            </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >Date of Enrollment <span style={{ color:"red"}}> *</span></Label>
                                    <InputGroup> 
                                        <Input 
                                            type="date"
                                            name="firstAncDate"
                                            id="firstAncDate"
                                            onChange={handleInputChange}
                                            value={objValues.firstAncDate} 
                                            min={patientObj.dateOfRegistration}
                                            max= {moment(new Date()).format("YYYY-MM-DD") }
                                        />
                                    </InputGroup>
                                    {errors.firstAncDate !=="" ? (
                                            <span className={classes.error}>{errors.firstAncDate}</span>
                                    ) : "" }  
                                            
                                    </FormGroup>
                                </div>  
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Gravida <span style={{ color:"red"}}> *</span></Label>
                                        <InputGroup> 
                                            <Input 
                                                type="number"
                                                name="gravida"
                                                id="gravida"
                                                onChange={handleInputChange}
                                                value={objValues.gravida} 
                                            />

                                        </InputGroup>
                                        {errors.gravida !=="" ? (
                                                <span className={classes.error}>{errors.gravida}</span>
                                        ) : "" }
                                        </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Parity <span style={{ color:"red"}}> *</span></Label>
                                        <InputGroup> 
                                            <Input 
                                                type="number"
                                                name="parity"
                                                id="parity"
                                                onChange={handleInputChange}
                                                value={objValues.parity} 
                                            />

                                        </InputGroup>
                                        {errors.parity !=="" ? (
                                                <span className={classes.error}>{errors.parity}</span>
                                        ) : "" }
                                        </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Date Of Last Menstrual Period <span style={{ color:"red"}}> *</span> </Label>
                                        <InputGroup> 
                                            <Input 
                                                type="date"
                                                name="lmp"
                                                id="lmp"
                                                onChange={handleInputChange}
                                                value={objValues.lmp} 
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                            />

                                        </InputGroup>
                                        {errors.lmp !=="" ? (
                                                <span className={classes.error}>{errors.lmp}</span>
                                        ) : "" }
                                        </FormGroup>
                                </div>
                                
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Gestational Age (Weeks) <span style={{ color:"red"}}> *</span></Label>
                                        <InputGroup> 
                                            <Input 
                                                type="text"
                                                name="gaweeks"
                                                id="gaweeks"
                                                onChange={handleInputChange}
                                                value={objValues.gaweeks} 
                                                disabled
                                            />

                                        </InputGroup>
                                        {errors.gaweeks !=="" ? (
                                                <span className={classes.error}>{errors.gaweeks}</span>
                                        ) : "" }
                                        {errors.gaweeks ===0 ? (
                                                <span className={classes.error}>Invalid value</span>
                                        ) : "" }
                                        </FormGroup>
                                </div>
                                
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Source of Referral <span style={{ color:"red"}}> *</span></Label>
                                        <InputGroup> 
                                            <Input 
                                                type="select"
                                                name="sourceOfReferral"
                                                id="sourceOfReferral"
                                                onChange={handleInputChange}
                                                value={objValues.sourceOfReferral} 
                                            >
                                                    <option value="">Select</option>
                                                {sourceOfReferral.map((value, index) => (
                                                    <option key={index} value={value.code}>
                                                        {value.display}
                                                    </option>
                                                ))}
                                            </Input>

                                        </InputGroup>
                                        {errors.sourceOfReferral !=="" ? (
                                                <span className={classes.error}>{errors.sourceOfReferral}</span>
                                        ) : "" }
                                        </FormGroup>
                                </div>
                                                           
                                <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Tested for syphilis <span style={{ color:"red"}}> *</span></Label>
                                        <InputGroup> 
                                            <Input 
                                                type="select"
                                                name="testedSyphilis"
                                                id="testedSyphilis"
                                                onChange={handleInputChange}
                                                value={objValues.testedSyphilis} 
                                            >
                                                    <option value="" >Select</option>
                                                <option value="Yes" >Yes</option>
                                                <option value="No" >No</option>
                                            </Input>
                                        </InputGroup> 
                                        {errors.testedSyphilis !=="" ? (
                                                <span className={classes.error}>{errors.testedSyphilis}</span>
                                        ) : "" }                                       
                                        </FormGroup>
                                </div>

                                {objValues.testedSyphilis==='Yes' && (<>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Syphilis test result <span style={{ color:"red"}}> *</span></Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="select"
                                                    name="testResultSyphilis"
                                                    id="testResultSyphilis"
                                                    onChange={handleInputChange}
                                                    value={objValues.testResultSyphilis} 
                                                    
                                                >
                                                    <option value="" >Select</option>
                                                    <option value="Positive" >Positive</option>
                                                    <option value="Negative" >Negative</option>
                                                </Input>
                                            </InputGroup> 
                                            {errors.testResultSyphilis !=="" ? (
                                                    <span className={classes.error}>{errors.testResultSyphilis}</span>
                                            ) : "" }                                        
                                            </FormGroup>
                                    </div>
                                    {objValues.testedSyphilis==='Yes' && objValues.testResultSyphilis==='Positive' && (<>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Treated for syphilis (penicillin) <span style={{ color:"red"}}> *</span></Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="select"
                                                    name="treatedSyphilis"
                                                    id="treatedSyphilis"
                                                    onChange={handleInputChange}
                                                    value={objValues.treatedSyphilis} 
                                                >
                                                    <option value="" >Select</option>
                                                    <option value="Yes" >Yes</option>
                                                    <option value="No" >No</option>
                                                </Input>
                                            </InputGroup> 
                                            {errors.treatedSyphilis !=="" ? (
                                                    <span className={classes.error}>{errors.treatedSyphilis}</span>
                                            ) : "" }                                        
                                            </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Referred Syphilis +ve client <span style={{ color:"red"}}> *</span></Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="select"
                                                    name="referredSyphilisTreatment"
                                                    id="referredSyphilisTreatment"
                                                    onChange={handleInputChange}
                                                    value={objValues.referredSyphilisTreatment} 
                                                >
                                                    <option value="" >Select</option>
                                                    <option value="Yes" >Yes</option>
                                                    <option value="No" >No</option>
                                                </Input>
                                            </InputGroup>
                                            {errors.referredSyphilisTreatment !=="" ? (
                                                    <span className={classes.error}>{errors.referredSyphilisTreatment}</span>
                                            ) : "" }                                         
                                            </FormGroup>
                                    </div>
                                    </>)}
                                </>)}
                                <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >HIV Status <span style={{ color:"red"}}> *</span></Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="select"
                                                    name="staticHivStatus"
                                                    id="staticHivStatus"
                                                    onChange={handleInputChange}
                                                    value={objValues.staticHivStatus} 
                                                    disabled={patientObj.dynamicHivStatus==='Positive'?true :false}
                                                >
                                                    <option value="" >Select</option>
                                                    <option value="Positive">Positive</option>
                                                    <option value="Negative">Negative</option>
                                                    <option value="Unknown" >Unknown</option>
                                                </Input>
                                            </InputGroup>
                                            {errors.staticHivStatus !=="" ? (
                                                    <span className={classes.error}>{errors.staticHivStatus}</span>
                                            ) : "" }                                         
                                            </FormGroup>
                                </div>   
                            </div>
                            </div>
                            </div>
                            {/* END OF HIV ENROLLEMENT FORM */}
                            {saving ? <Spinner /> : ""}

                            <br />


                            <MatButton
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                startIcon={<SaveIcon />}
                                disabled={disabledAgeBaseOnAge}
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
                                onClick={handleCancel}
                                style={{backgroundColor:'#992E62'}}
                            >
                                <span style={{ textTransform: "capitalize", color:"#fff"  }}>Cancel</span>
                            </MatButton>
                        </Form>
                    </div>
                </CardContent>
            </Card>
            <Modal show={open} toggle={toggle} className="fade" size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered backdrop="static">
             <Modal.Header >
            <Modal.Title id="contained-modal-title-vcenter">
                Notification!
            </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <h4>Are you Sure of the Age entered?</h4>
                    
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={toggle} style={{backgroundColor:"#014d88", color:"#fff"}}>Yes</Button>
            </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserRegistration