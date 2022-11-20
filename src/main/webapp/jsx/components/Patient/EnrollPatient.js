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
    const [relatives, setRelatives]= useState(
                { 
                    address:"",
                    phone:"",
                    firstName: "",
                    email: "",
                    relationshipId: "",
                    lastName: "",
                    middleName: ""
                }
        )

    const [today, setToday] = useState(new Date().toISOString().substr(0, 10).replace('T', ' '));
    const [contacts, setContacts] = useState([]);
    const [saving, setSaving] = useState(false);
    const [disabledAgeBaseOnAge, setDisabledAgeBaseOnAge] = useState(false);
    const [ageDisabled, setAgeDisabled] = useState(true);
    const [showRelative, setShowRelative] = useState(false);
    const [editRelative, setEditRelative] = useState(null);
    const [genders, setGenders]= useState([]);
    const [maritalStatusOptions, setMaritalStatusOptions]= useState([]);
    const [educationOptions, setEducationOptions]= useState([]);
    const [occupationOptions, setOccupationOptions]= useState([]);
    const [relationshipOptions, setRelationshipOptions]= useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [errors, setErrors] = useState({})
    const [topLevelUnitCountryOptions, settopLevelUnitCountryOptions]= useState([]);
    const [patientDTO, setPatientDTO]= useState({"person":"", "hivEnrollment":""})
    const userDetail = props.location && props.location.state ? props.location.state.user : null;
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
     //HIV INFORMATION
     const [femaleStatus, setfemaleStatus]= useState(false)
     //const [values, setValues] = useState([]);
     const [objValues, setObjValues] = useState({   ancNo:"",
            gaweeks: "",
            gravida: "",
            expectedDeliveryDate:"",
            lmp: "",
            parity: "",
            hivDiognosicTime:"",
            referredSyphilisTreatment: "",
            testResultSyphilis: "",
            testedSyphilis: "",
            treatedSyphilis: "",
            personDto:{},
            pmtctHtsInfo:{},
            syphilisInfo:{},
            partnerNotification:{}
    });
     const [carePoints, setCarePoints] = useState([]);
     const [sourceReferral, setSourceReferral] = useState([]);
     const [hivStatus, setHivStatus] = useState([]);
     const [enrollSetting, setEnrollSetting] = useState([]);
     const [tbStatus, setTbStatus] = useState([]);
     const [kP, setKP] = useState([]);
     const [newSex, setNewSex] = useState([]);
     const [pregnancyStatus, setPregnancyStatus] = useState([]);
     //set ro show the facility name field if is transfer in 
     const [transferIn, setTransferIn] = useState(false);
     // display the OVC number if patient is enrolled into OVC 
     const [ovcEnrolled, setOvcEnrolled] = useState(false);
     //Input fields to hidden base on some conditions
     const [hideTargetGroup, setHideTargetGroup]= useState("false");
     const [open, setOpen] = React.useState(false)
     const toggle = () => setOpen(!open);
    const locationState = location.state;
    let patientId = null;
    let patientObj = {};
    patientId = locationState ? locationState.patientId : null;
    patientObj = locationState ? locationState.patientObj : {}; 

    useEffect(() => { 
        loadGenders();
        getSex();
        loadMaritalStatus();
        loadEducation();
        loadOccupation();
        loadRelationships();
        loadTopLevelCountry();        
        CareEntryPoint();
        SourceReferral();
        HivStatus();
        EnrollmentSetting();
        TBStatus();
        KP();
        PregnancyStatus();
        GetCountry();
        if(patientObj){
            //console.log(patientObj)
            const contacts =patientObj && patientObj.contact ? patientObj.contact : [];
            //setContacts(patientObj.contacts);
            let newConatctsInfo=[]
            //Manipulate relatives contact  address:"",
            const actualcontacts=contacts.contact && contacts.contact.length>0 && contacts.contact.map((x)=>{ 
                const contactInfo = 
                    { 
                        address:x.address.line[0],
                        phone:x.contactPoint.value,
                        firstName:x.firstName,
                        email: "",
                        relationshipId: x.relationshipId,
                        lastName: x.surname,
                        middleName: x.otherName
                    }
                newConatctsInfo.push(contactInfo)
            })
            setContacts(newConatctsInfo);
            const identifiers = patientObj.identifier;
            const address = patientObj.address;
            const contactPoint = patientObj.contactPoint;
            const hospitalNumber = identifiers.identifier.find(obj => obj.type === 'HospitalNumber');
            const phone = contactPoint.contactPoint.find(obj => obj.type === 'phone');
            const email = contactPoint.contactPoint.find(obj => obj.type === 'email');
            const altphone = contactPoint.contactPoint.find(obj => obj.type === 'altphone');
            const country = address && address.address && address.address.length > 0 ? address.address[0] : null;
            //const getSexId=  genders.length>0 && genders.find((x)=> x.display===patientObj.sex)//get patient sex ID by filtering the request
            //console.log(newSex)
            //setValue('dob', format(new Date(patientObj.dateOfBirth), 'yyyy-MM-dd'));
            basicInfo.dob=patientObj.dateOfBirth
            basicInfo.firstName=patientObj.firstName
            basicInfo.dateOfRegistration=patientObj.dateOfRegistration
            basicInfo.middleName=patientObj.otherName
            basicInfo.lastName=patientObj.surname
            basicInfo.hospitalNumber=hospitalNumber && hospitalNumber ? hospitalNumber.value : ''
            setObjValues ({...objValues,  uniqueId: hospitalNumber ? hospitalNumber.value : ''});
            basicInfo.maritalStatusId=patientObj && patientObj.maritalStatus ? patientObj.maritalStatus.id : ""
            basicInfo.employmentStatusId=patientObj && patientObj.employmentStatus ? patientObj.employmentStatus.id :""
            basicInfo.genderId=patientObj && patientObj.gender ? patientObj.gender.id : null
            //basicInfo.sexId=patientObj.sex
            basicInfo.educationId=patientObj && patientObj.education ? patientObj.education.id : ""
            basicInfo.phoneNumber=phone && phone.value ? phone.value :""
            basicInfo.altPhonenumber= altphone && altphone.value ? altphone.value :""
            basicInfo.email=email && email.value ? email.value :""
            basicInfo.address=country  && country.city ? country.city :""
            basicInfo.landmark=country.line && country.line.length>0 ? country.line[0]: ""
            //console.log(basicInfo.landmark)
            basicInfo.countryId=country && country.countryId  ? country.countryId  :""
            setStateByCountryId(country.countryId); 
            getProvincesId(country && country.stateId  ? country.stateId  :"")
            basicInfo.stateId=country && country.stateId  ? country.stateId  :""
            basicInfo.district=country && country.district ? country.district :""
            const patientAge=calculate_age(moment(patientObj.dateOfBirth).format("DD-MM-YYYY"))
            basicInfo.age=patientAge
            objValues.personId=patientObj.id
            setfemaleStatus(patientObj.sex==='Female'? true : false)
            if(patientObj.age<=14){
                setOvcEnrolled(true)
            }
            basicInfo.ninNumber=patientObj.ninNumber

        }
        if(basicInfo.dateOfRegistration < basicInfo.dob){
            alert('Date of registration can not be earlier than date of birth')
        }
        
    }, [patientObj, patientId, basicInfo.dateOfRegistration]);
    //Get list of Source of Referral
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
    const loadMaritalStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}application-codesets/v2/MARITAL_STATUS`, { headers: {"Authorization" : `Bearer ${token}`} });
            setMaritalStatusOptions(response.data);
        } catch (e) {
        }
    }, []);
    const loadEducation = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}application-codesets/v2/EDUCATION`, { headers: {"Authorization" : `Bearer ${token}`} });
            setEducationOptions(response.data);
        } catch (e) {

        }
    }, []);
    const loadOccupation = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}application-codesets/v2/OCCUPATION`, { headers: {"Authorization" : `Bearer ${token}`} });
            setOccupationOptions(response.data);
        } catch (e) {

        }
    }, []);
    const loadRelationships = useCallback(async () => {
      try {
          const response = await axios.get(`${baseUrl}application-codesets/v2/RELATIONSHIP`, { headers: {"Authorization" : `Bearer ${token}`} });
          setRelationshipOptions(response.data);
      } catch (e) {
      }
    }, []);
    const loadTopLevelCountry = useCallback(async () => {
        const response = await axios.get(`${baseUrl}organisation-units/parent-organisation-units/0`, { headers: {"Authorization" : `Bearer ${token}`} });
        settopLevelUnitCountryOptions(response.data);
    }, []);

    //Country List
      const GetCountry =()=>{
        axios
        .get(`${baseUrl}organisation-units/parent-organisation-units/0`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setCountries(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
     //Get States from selected country
     const getStates = e => {
        const getCountryId =e.target.value;

            setStateByCountryId(getCountryId); 
            setBasicInfo({ ...basicInfo, countryId: getCountryId });
    };
    //Get list of State
    function setStateByCountryId(getCountryId) {
        axios
        .get(`${baseUrl}organisation-units/parent-organisation-units/${getCountryId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setStates(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });  
    }
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
     //fetch province

    function getProvincesId(getStateId) {
        axios
        .get(`${baseUrl}organisation-units/parent-organisation-units/${getStateId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setProvinces(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });  
    }
    //Date of Birth and Age handle 
    const handleDobChange = (e) => {
        if (e.target.value) {
            const today = new Date();
            const birthDate = new Date(e.target.value);
            let age_now = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            // if(m<18){
            //     toast.error("The child is less than 18months",  {position: toast.POSITION.TOP_RIGHT})
            //     setDisabledAgeBaseOnAge(true)
            // }else{
            //     setDisabledAgeBaseOnAge(false)
            // }
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age_now--;
            }
            basicInfo.age=age_now
            //setBasicInfo({...basicInfo, age: age_now});        
        } else {
            setBasicInfo({...basicInfo, age:  ""});
        }
        setBasicInfo({...basicInfo, dob: e.target.value});
        if(basicInfo.age!=='' && basicInfo.age>=60){
            toggle()
        }
    }
    const handleDateOfBirthChange = (e) => {
        if (e.target.value == "Actual") {
            setAgeDisabled(true);
        } else if (e.target.value == "Estimated") {
            setAgeDisabled(false);
        }
    }
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
            // temp.firstName = basicInfo.firstName ? "" : "First Name is required"
            // temp.hospitalNumber = basicInfo.hospitalNumber ? "" : "Hospital Number  is required."

            // temp.lastName = basicInfo.lastName ? "" : "Last Name  is required."
            // temp.sexId = basicInfo.sexId ? "" : "Sex is required."
            // temp.dateOfRegistration1 = basicInfo.dateOfRegistration ? "" : "Date of Registration is required."
            // temp.educationId = basicInfo.educationId ? "" : "Education is required."
            // temp.address = basicInfo.address ? "" : "Address is required."
            // temp.phoneNumber = basicInfo.phoneNumber ? "" : "Phone Number  is required."
            // temp.countryId = basicInfo.countryId ? "" : "Country is required."    
            // temp.stateId = basicInfo.stateId ? "" : "State is required."  
            // temp.district = basicInfo.district ? "" : "Province/LGA is required." 
            //HIV FORM VALIDATION
            temp.targetGroupId = objValues.targetGroupId ? "" : "Target group is required."
            temp.dateConfirmedHiv = objValues.dateConfirmedHiv ? "" : "date confirm HIV is required."
            temp.sourceOfReferrer = objValues.sourceOfReferrer ? "" : "Source of referrer is required."
            temp.enrollmentSettingId = objValues.enrollmentSettingId ? "" : "Enrollment Setting Number  is required."
            temp.tbStatusId = objValues.tbStatusId ? "" : "TB status is required."    
            temp.statusAtRegistrationId = objValues.statusAtRegistrationId ? "" : "Status at Registration is required."  
            temp.entryPointId = objValues.entryPointId ? "" : "Care Entry Point is required." 
            temp.dateOfRegistration = objValues.dateOfRegistration ? "" : "Date of Registration is required."  
            temp.uniqueId = objValues.uniqueId ? "" : "Unique ID is required."
            
                setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    //Handle Input Change for Basic Infor
    const handleInputChangeBasic = e => { 
        setErrors({...errors, [e.target.name]: ""})        
        setBasicInfo ({...basicInfo,  [e.target.name]: e.target.value}); 
        //manupulate inpute fields base on gender/sex 
        if(e.target.name==='sexId' && e.target.value==='Female') {
            setfemaleStatus(true)
        }
        if(e.target.name==='firstName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setBasicInfo ({...basicInfo,  [e.target.name]: name});
        }
        if(e.target.name==='lastName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setBasicInfo ({...basicInfo,  [e.target.name]: name});
        }
        if(e.target.name==='middleName' && e.target.value!==''){
            const name = alphabetOnly(e.target.value)
            setBasicInfo ({...basicInfo,  [e.target.name]: name});
        }
        if(e.target.name==='ninNumber' && e.target.value!==''){

            const ninNumberValue = checkNINLimit(e.target.value.replace(/\D/g, ''))
            setBasicInfo ({...basicInfo,  [e.target.name]: ninNumberValue});
        }
                   
    } 
    
    const checkNINLimit=(e)=>{
        const limit = 11;        
        const acceptedNumber= e.slice(0, limit)
        return  acceptedNumber   
    }
    //Function to show relatives 
    const handleAddRelative = () => {
        setShowRelative(true);
    };
    //Function to cancel the relatives form
    const handleCancelSaveRelationship = () => {
        setShowRelative(false);
    }

    /*****  Validation  Relationship Input*/
    const validateRelatives = () => {
        let temp = { ...errors }
            temp.firstName = relatives.firstName ? "" : "First Name is required"
            temp.lastName = relatives.lastName ? "" : "Last Name  is required."
            temp.relationshipId = relatives.relationshipId ? "" : "Relationship Type is required."  
                setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    //Function to add relatives 
    const handleSaveRelationship = (e) => {
        if(validateRelatives()){
            setContacts([...contacts, relatives])
        }

    }
    const handleDeleteRelative = (index) => {
        contacts.splice(index, 1);
        setContacts([...contacts]);
    };
    const handleEditRelative = (relative, index) => {
        setRelatives(relative)
        setShowRelative(true);
        contacts.splice(index, 1); 
    };   
    const getRelationship = (relationshipId) => {
        const relationship = relationshipOptions.find(obj => obj.id == relationshipId);
        return relationship ? relationship.display : '';
    };
    const handleInputChangeRelatives = e => {        
        setRelatives ({...relatives,  [e.target.name]: e.target.value});               
    }
    
    const alphabetOnly=(value)=>{
        const result = value.replace(/[^a-z]/gi, '');
        return result
    }
   
    const CareEntryPoint =()=>{
            axios
                .get(`${baseUrl}application-codesets/v2/POINT_ENTRY`,
                    { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                    //console.log(response.data);
                    setCarePoints(response.data);
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
    //Get list of HIV STATUS ENROLLMENT
    const HivStatus =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/HIV_STATUS_ENROL`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setHivStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    //Get list of HIV STATUS ENROLLMENT
    const EnrollmentSetting =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`,
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
    //Get list of HIV STATUS ENROLLMENT
    const TBStatus =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/TB_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setTbStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    //Get list of KP
    const KP =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/TARGET_GROUP`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setKP(response.data);
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
            //console.log(response.data);
            setPregnancyStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const handleInputChange = e => { 
        setErrors({...errors, [e.target.name]: ""})       
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
        if(e.target.name ==="entryPointId" ){
            if(e.target.value==="21"){
                setTransferIn(true)
            }else{
                setTransferIn(false)
            }
        }  
        // if(e.target.name ==="pregnancyStatusId" ){
        //     if(e.target.value==="72"){
        //         setTransferIn(true)
        //     }else{
        //         setTransferIn(false)
        //     }
        // }                
    }    
    
    const checkPhoneNumber=(e, inputName)=>{
        const limit = 10;
            setRelatives({...relatives,  [inputName]: e.slice(0, limit)});     
    }
    const checkPhoneNumberBasic=(e, inputName)=>{
        const limit = 10;
        setErrors({...errors, [inputName]: ""})    
            setBasicInfo({...basicInfo,  [inputName]: e.slice(0, limit)});     
    } 
    //Handle CheckBox 
    const handleCheckBox =e =>{
        if(e.target.checked){
            setOvcEnrolled(true)
        }else{
            setOvcEnrolled(false)
        }
    }
    const handleCancel =()=>{
        history.push({ pathname: '/' });
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); 

         if(validate()){
            try {

                objValues.personId = patientId;
                const response = await axios.post(`${baseUrl}hiv/enrollment`, objValues, { headers: {"Authorization" : `Bearer ${token}`} });
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

    return (
        <>
        <div className="row page-titles mx-0" style={{marginTop:"0px", marginBottom:"-10px"}}>
			<ol className="breadcrumb">
				<li className="breadcrumb-item active"><h4> <Link to={"/"} >HIV /</Link> Patient Enrollment</h4></li>
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
                            {/* </div> */}

                            </div>

                            {/* Adding HIV ENROLLEMENT FORM HERE */}
                            <div className="card">
                            <div className="card-header" style={{backgroundColor:"#014d88",color:'#fff',fontWeight:'bolder', borderRadius:"0.2rem"}}>
                                <h5 className="card-title"  style={{color:'#fff'}}>ANC  Enrollment</h5>
                            </div>
                            <div className="card-body">
                            <div className="row">
                              
                                <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >ANC No *</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="ancNo"
                                                    id="ancNo"
                                                    onChange={handleInputChange}
                                                    value={objValues.ancNo} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>
                                    
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Gravida</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="gravida"
                                                    id="gravida"
                                                    onChange={handleInputChange}
                                                    value={objValues.gravida} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Parity</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="parity"
                                                    id="parity"
                                                    onChange={handleInputChange}
                                                    value={objValues.parity} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Date Of Last Menstrual Period* </Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="date"
                                                    name="lmp"
                                                    id="lmp"
                                                    onChange={handleInputChange}
                                                    value={objValues.lmp} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>
                                   
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Gestational Age (Weeks)</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="gaweeks"
                                                    id="gaweeks"
                                                    onChange={handleInputChange}
                                                    value={objValues.gaweeks} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>
                                    
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Source of Referral</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="encounterDate"
                                                    id="encounterDate"
                                                    onChange={handleInputChange}
                                                    value={objValues.encounterDate} 
                                                />

                                            </InputGroup>
                                        
                                            </FormGroup>
                                    </div>                                
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Tested for syphilis</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="text"
                                                    name="testedSyphilis"
                                                    id="testedSyphilis"
                                                    onChange={handleInputChange}
                                                    value={objValues.testedSyphilis} 
                                                >
                                                     <option value="" >Select</option>
                                                    <option value="Positive" >Positive</option>
                                                    <option value="Negative" >Negative</option>
                                                </Input>
                                            </InputGroup>                                        
                                            </FormGroup>
                                    </div>
                                
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Syphilis test result</Label>
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
                                            </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Treated for syphilis (penicillin)</Label>
                                            <InputGroup> 
                                                <Input 
                                                    type="select"
                                                    name="treatedSyphilis"
                                                    id="treatedSyphilis"
                                                    onChange={handleInputChange}
                                                    value={objValues.encounterDate} 
                                                >
                                                    <option value="" >Select</option>
                                                    <option value="Yes" >Yes</option>
                                                    <option value="No" >No</option>
                                                </Input>
                                            </InputGroup>                                        
                                            </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                            <FormGroup>
                                            <Label >Referred Syphilis +ve client</Label>
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