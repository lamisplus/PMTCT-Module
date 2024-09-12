import React, {useCallback, useEffect, useState} from "react";

import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {toast} from "react-toastify";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import axios from "axios";
import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Label as LabelRibbon, Button} from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";


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


const HivTestResult = (props) => {
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    let temp = { ...errors }
    console.log(props.patientObj)
    const patientID= props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.id : "";
    const clientId = props.patientObj && props.patientObj ? props.patientObj.id : "";
    const [hivTestDate, setHivTestDate] = useState("");
    const [showCD4Count, setShowCD4Count] = useState(true);
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
    const patientAge=calculate_age(moment(props.patientObj.personResponseDto && props.patientObj.personResponseDto.dateOfBirth ? props.patientObj.personResponseDto.dateOfBirth : 0).format("DD-MM-YYYY"))
   
    const [objValues, setObjValues]= useState(
        {
            confirmatoryTest: {},
            confirmatoryTest2: {},
            hivTestResult: "",
            hivTestResult2: "",
            htsClientId:"",
            personId: props.patientObj  ? props.patientObj.id : "",
            test1: {},
            test2: {},
            tieBreakerTest: {},
            tieBreakerTest2: {},
            syphilisTesting:{},
            hepatitisTesting:{},
            others:{},
            cd4:{},
        }
    )
    const handleInputChange = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setObjValues ({...objValues,  [e.target.name]: e.target.value});            
    }
    const [initialTest1, setInitailTest]= useState(
        {
            date:"",
            result:"",            
        }
    )
    const [initialTest12, setInitailTest2]= useState(
        {
            date2 :"",
            result2  :"",            
        }
    )
    const handleInputChangeCd4Count = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setCd4Count ({...cd4Count,  [e.target.name]: e.target.value});            
    }
    const [cd4Count, setCd4Count]= useState(
        {
            cd4Count:"",
            cd4SemiQuantitative:"",
            cd4FlowCyteometry:""            
        }
    )
    const handleInputChangeInitial = e => { 
        //setErrors({...temp, [e.target.name]:""})
        if(e.target.value==='No'){
            setInitailTest ({...initialTest1,  [e.target.name]: e.target.value}); 
            setConfirmatoryTest({
                date :"",
                result  :"",            
            })
            setTieBreakerTest({
                date :"",
                result  :"",            
            })
            //This is to show cd4 count section
            setShowCD4Count(false)
                
        }else{
            setInitailTest ({...initialTest1,  [e.target.name]: e.target.value});
            //This is to show cd4 count section 
            setShowCD4Count(true)
        }            
    }
    const handleInputChangeInitial2 = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        if(e.target.value==='No'){
            setInitailTest2 ({...initialTest12,  [e.target.name]: e.target.value});  
            setConfirmatoryTest2({
                date2 :"",
                result2  :"",            
            })
            setTieBreakerTest2({
                date2 :"",
                result2  :"",            
            })
            //This is to show cd4 count section
            setShowCD4Count(false)
        }else{
            setInitailTest2 ({...initialTest12,  [e.target.name]: e.target.value});
            //This is to show cd4 count section 
            setShowCD4Count(true) 
        }           
    }
    const [confirmatoryTest, setConfirmatoryTest]= useState(
        {
            date :"",
            result  :"",            
        }
    )
    const [confirmatoryTest2, setConfirmatoryTest2]= useState(
        {
            date2 :"",
            result2  :"",            
        }
    )
    const handleInputChangeConfirmatory = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setConfirmatoryTest ({...confirmatoryTest,  [e.target.name]: e.target.value});
        //This is to show cd4 count section 
        if(initialTest1.result==='Yes' && e.target.value==='Yes'){
            setShowCD4Count(true)

        }else{
            setShowCD4Count(true)
        }              
    }
    const handleInputChangeConfirmatory2 = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setConfirmatoryTest2 ({...confirmatoryTest2,  [e.target.name]: e.target.value}); 
        //This is to show cd4 count section 
        if(initialTest12.result2==='Yes' && e.target.value==='Yes'){
            setShowCD4Count(true)

        }else{
            setShowCD4Count(true)
        }                 
    }
    const [tieBreakerTest, setTieBreakerTest]= useState(
        {
            date :"",
            result  :"",            
        }
    )
    const [tieBreakerTest2, setTieBreakerTest2]= useState(
        {
            date2 :"",
            result2  :"",            
        }
    )
    const handleInputChangeTie = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setTieBreakerTest ({...tieBreakerTest,  [e.target.name]: e.target.value});  
        //This is to show cd4 count section
        if(confirmatoryTest.result==='No' && e.target.value==='Yes'){
            setShowCD4Count(true)
        }else if(confirmatoryTest.result==='No' && e.target.value==='No'){
            setShowCD4Count(false)
        }else{
            setShowCD4Count(true)
        }         
    }
    const handleInputChangeTie2 = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setTieBreakerTest2 ({...tieBreakerTest2,  [e.target.name]: e.target.value});
        //This is to show cd4 count section
        if(confirmatoryTest2.result2==='No' && e.target.value==='Yes'){
            setShowCD4Count(true)
        }else if(confirmatoryTest2.result2==='No' && e.target.value==='No'){
            setShowCD4Count(false)
        }else{
            setShowCD4Count(true)
        }                     
    }
    const [syphills, setSyphills]= useState(
        {
            syphilisTestResult :"",
           // result  :"",            
        }
    )
    const handleInputChangeSyphills = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setSyphills ({...syphills,  [e.target.name]: e.target.value});            
    }
    const [hepatitis, setHepatitis]= useState(
        {
            hepatitisCTestResult :"",
            hepatitisBTestResult  :"", 
            longitude:"",
            latitude:"",
            adhocCode :""                       
        }
    )
    const handleInputChangeHepatitis = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setHepatitis ({...hepatitis,  [e.target.name]: e.target.value});            
    }
    const [others, setOthers]= useState(
        {
            longitude:"",
            latitude:"",
            adhocCode :""                       
        }
    )
    useEffect(() => { 
        //console.log(props.patientObj)
        if(props.patientObj){
            if(props.patientObj.dateVisit && props.patientObj.dateVisit!=='' ){
                setHivTestDate(props.patientObj.dateVisit)
            }else{
                setHivTestDate("")
            }
            setCd4Count(props.patientObj  && props.patientObj.cd4!==null? props.patientObj.cd4 : {})
            //setInitailTest(props.patientObj  && props.patientObj.test1!==null? props.patientObj.test1 : {})
            //setConfirmatoryTest(props.patientObj  && props.patientObj.confirmatoryTest!==null? props.patientObj.confirmatoryTest : {})
            setTieBreakerTest(props.patientObj && props.patientObj.tieBreakerTest!==null ? props.patientObj.tieBreakerTest : {})
            setSyphills(props.patientObj  && props.patientObj.syphilisTesting!==null ? props.patientObj.syphilisTesting : {})
            setHepatitis(props.patientObj  && props.patientObj.hepatitisTesting!==null ? props.patientObj.hepatitisTesting : {})
            setOthers(props.patientObj  && props.patientObj.others!==null ? props.patientObj.others : {})
            
            //setInitailTest2(props.patientObj  && props.patientObj.test2!==null? props.patientObj.test2 : {})
            //setConfirmatoryTest2(props.patientObj  && props.patientObj.confirmatoryTest2!==null? props.patientObj.confirmatoryTest2 : {})
            //setTieBreakerTest2(props.patientObj && props.patientObj.tieBreakerTest2!==null ? props.patientObj.tieBreakerTest2 : {})
        }
    }, [props.patientObj]);//initialTest12, tieBreakerTest2, confirmatoryTest2, 

    const handleInputChangeOthers = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setOthers ({...others,  [e.target.name]: e.target.value});            
    }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
    }
    const validate = () => {
        //HTS FORM VALIDATION
        initialTest1.date!=="" &&  (temp.date = initialTest1.result ? "" : "This field is required.")
        // initialTest1.result!==""  && (temp.date = confirmatoryTest.date ? "" : "This field is required.")
        // initialTest1.result!==""  && (temp.date = tieBreakerTest.date ? "" : "This field is required.")
              
                setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    const handleSubmit =(e)=>{
        e.preventDefault();
        if(validate()){
                    //logic to get Hiv result test
        if(initialTest12.result2==='No' ){
            objValues.hivTestResult2="Negative"
        }else if(initialTest12.result2==='Yes' && confirmatoryTest2.result2==='Yes'){
            objValues.hivTestResult2="Positive" 
        }
        // else if(initialTest12.result2==='Yes' && confirmatoryTest2.result2==='No' && tieBreakerTest2.result2===''){
        //     objValues.hivTestResult2="Negative" 
        // }
        else if(confirmatoryTest2.result2==='No' && tieBreakerTest2.result2==='Yes'){
            objValues.hivTestResult2="Positive" 
        }else if(confirmatoryTest2.result2==='No' && tieBreakerTest2.result2==='No'){
            objValues.hivTestResult2="Negative" 
        }else{
            objValues.hivTestResult2=""
        }
      
        if(initialTest1.result==='No' ){
            objValues.hivTestResult="Negative"
        }else if(initialTest1.result==='Yes' && confirmatoryTest.result==='Yes'){
            objValues.hivTestResult="Positive"
        }
        // else if(initialTest1.result==='Yes' && confirmatoryTest.result==='No' && tieBreakerTest.result===''){
        //     objValues.hivTestResult="Negative"
        // }
        else if(confirmatoryTest.result==='No' && tieBreakerTest.result==='Yes'){
            objValues.hivTestResult="Positive"
        }else if(confirmatoryTest.result==='No' && tieBreakerTest.result==='No'){
            objValues.hivTestResult="Negative"
        }else{
            objValues.hivTestResult=""
        }
            objValues.htsClientId= clientId
            objValues.confirmatoryTest= confirmatoryTest
            objValues.confirmatoryTest2= confirmatoryTest2
            objValues.personId= patientID
            objValues.test1= initialTest1
            objValues.test2= initialTest12
            objValues.tieBreakerTest=tieBreakerTest
            objValues.tieBreakerTest2=tieBreakerTest2
            objValues.syphilisTesting=syphills
            objValues.hepatitisTesting=hepatitis
           
            objValues.cd4=cd4Count
            objValues.others=others
            axios.put(`${baseUrl}hts/${clientId}/request-result`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}}, )
            .then(response => {
                setSaving(false);
                props.setPatientObj(response.data)
                //console.log(response.data)
                //props.setPatientObj(props && props.patientObj ? props.patientObj : "")
                //toast.success("HIV test successful");
                handleItemClick('post-test', 'hiv-test')
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
        <>
            <Card className={classes.root}>
                <CardBody>
               
                <h2 style={{color:'#000'}}>REQUEST AND RESULT FORM</h2>
                    <form >
                        <div className="row">
                        <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                        <h4 style={{color:'#fff'}}>HIV TEST RESULT</h4>
                        </LabelRibbon>
                           <br/>
                           <div className="form-group  col-md-2"></div>
                            <h4>Initial HIV Test 1:</h4>
                            <div className="form-group mb-3 col-md-5">
                                <FormGroup>
                                <Label for=""> Date  </Label>
                                <Input
                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                    name="date"
                                    id="date"
                                    value={initialTest1.date}
                                    onChange={handleInputChangeInitial}
                                    min={hivTestDate!=="" && hivTestDate!==null ? hivTestDate  :""}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    required
                                />
                                {errors.date !=="" ? (
                                    <span className={classes.error}>{errors.date}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            {initialTest1.date && (
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>Result </Label>
                                    <select
                                        className="form-control"
                                        name="result"
                                        id="result"
                                        value={initialTest1.result}
                                        onChange={handleInputChangeInitial}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={ initialTest1.date===""? true : false}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Reactive</option>
                                        <option value="No">Non Reactive</option>
                                        
                                    </select>
                                    {errors.result !=="" ? (
                                    <span className={classes.error}>{errors.result}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group  col-md-2"></div>
                            {initialTest1.result ==='Yes' && (
                            <>
                            <h4>Confirmatory Test:</h4>
                            <div className="form-group mb-3 col-md-5">
                                <FormGroup>
                                <Label for=""> Date  </Label>
                                <Input
                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                    name="date"
                                    id="date"
                                    value={confirmatoryTest.date}
                                    onChange={handleInputChangeConfirmatory}
                                    min={initialTest1.date}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    required
                                />
                                {errors.dateOfEac1 !=="" ? (
                                    <span className={classes.error}>{errors.dateOfEac1}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            {confirmatoryTest.date && (
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>Result </Label>
                                    <select
                                        className="form-control"
                                        name="result"
                                        id="result"
                                        value={confirmatoryTest.result}
                                        onChange={handleInputChangeConfirmatory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={confirmatoryTest.date===''? true : false}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Reactive</option>
                                        <option value="No">Non Reactive</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group  col-md-2"></div>
                            </>
                            )}
                            {confirmatoryTest.result ==='No' && (
                            <>
                            <h4>Tie Breaker Test:</h4>
                            <div className="form-group mb-3 col-md-5">
                                <FormGroup>
                                <Label for=""> Date  </Label>
                                <Input
                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                    name="date"
                                    id="date"
                                    value={tieBreakerTest.date}
                                    onChange={handleInputChangeTie}
                                    min={confirmatoryTest.date}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    required
                                />
                               
                                </FormGroup>
                            </div>
                            {tieBreakerTest.date && (
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>Result </Label>
                                    <select
                                        className="form-control"
                                        name="result"
                                        id="result"
                                        value={tieBreakerTest.result}
                                        onChange={handleInputChangeTie}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={tieBreakerTest.date===''? true : false}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Reactive</option>
                                        <option value="No">Non Reactive</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group  col-md-2"></div>

                            </>)}
                            <div className="row">
                            <div className="form-group  col-md-12">  
                                {initialTest1.result==='No' &&  (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )}                       
                                {initialTest1.result==='No' && confirmatoryTest.result==='No' &&  (
                                    <LabelRibbon color="green" >
                                    Negative
                                </LabelRibbon>
                                )}
                                
                                {(initialTest1.result==='Yes' && confirmatoryTest.result==='Yes' ) && (
                                    <>
                                    <LabelRibbon color="red" >
                                        Positive
                                    </LabelRibbon>
                                    <br/>
                                    <hr/>
                                    <div className="row">
                                        <h4>Initial HIV Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={initialTest12.date2}
                                                onChange={handleInputChangeInitial2}
                                                min={confirmatoryTest.date}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                            {errors.date2 !=="" ? (
                                                <span className={classes.error}>{errors.date2}</span>
                                            ) : "" }
                                            </FormGroup>
                                        </div>

                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result  </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={initialTest12.result2}
                                                    onChange={handleInputChangeInitial2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={initialTest12.date2===''? true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                {errors.result2 !=="" ? (
                                                <span className={classes.error}>{errors.result2}</span>
                                            ) : "" }
                                            </FormGroup>
                                        </div>
                                   
                                        <div className="form-group  col-md-2"></div>
                                        {initialTest12.result2 ==='Yes' && (
                                        <>
                                        <h4>Confirmatory Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date  </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={confirmatoryTest2.date2}
                                                onChange={handleInputChangeConfirmatory2}
                                                min={initialTest12.date2}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                           
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={confirmatoryTest2.result2}
                                                    onChange={handleInputChangeConfirmatory2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={confirmatoryTest2.date2===''? true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-2"></div>
                                        </>
                                        )}
                                        {confirmatoryTest2.result2 ==='No' && (
                                        <>
                                        <h4>Tie Breaker Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date  </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={tieBreakerTest2.date2}
                                                onChange={handleInputChangeTie2}
                                                min={confirmatoryTest2.date2}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                        
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={tieBreakerTest2.result2}
                                                    onChange={handleInputChangeTie2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={tieBreakerTest2.date2===''?true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-2"></div>
            
                                        </>)}
                                    </div>
                                    </>
                                )}
                                {/* This is result for Test 1 */}
                                {/* {(initialTest1.result==='Yes' && confirmatoryTest.result==='No' && tieBreakerTest.result==='' ) && (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )} */}
                                {(confirmatoryTest.result==='No' && tieBreakerTest.result==='Yes' ) && (<>
                                    <LabelRibbon color="red" >
                                        Positive
                                    </LabelRibbon>
                                    <br/>
                                    <hr/>
                                   
                                    <div className="row">
                                        <h4>Initial HIV Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date  </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={initialTest12.date2}
                                                onChange={handleInputChangeInitial2}
                                                min={ tieBreakerTest.date}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                            {errors.date2 !=="" ? (
                                                <span className={classes.error}>{errors.date2}</span>
                                            ) : "" }
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result  </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={initialTest12.result2}
                                                    onChange={handleInputChangeInitial2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={initialTest12.date2===''?true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                {errors.result2 !=="" ? (
                                                <span className={classes.error}>{errors.result2}</span>
                                            ) : "" }
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-2"></div>
                                        {initialTest12.result2 ==='Yes' && (
                                        <>
                                        <h4>Confirmatory Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date  </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={confirmatoryTest2.date2}
                                                onChange={handleInputChangeConfirmatory2}
                                                min={initialTest12.date2}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                           
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={confirmatoryTest2.result2}
                                                    onChange={handleInputChangeConfirmatory2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={confirmatoryTest2.date2===''?true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-2"></div>
                                        </>
                                        )}
                                        {confirmatoryTest2.result2 ==='No' && (
                                        <>
                                        <h4>Tie Breaker Test 2:</h4>
                                        <div className="form-group mb-3 col-md-5">
                                            <FormGroup>
                                            <Label for=""> Date  </Label>
                                            <Input
                                                type="date"                       onKeyPress={(e)=>{e.preventDefault()}}
                                                name="date2"
                                                id="date2"
                                                value={tieBreakerTest2.date2}
                                                onChange={handleInputChangeTie2}
                                                min={confirmatoryTest2.date2}
                                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                                required
                                            />
                                        
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-5">
                                            <FormGroup>
                                                <Label>Result </Label>
                                                <select
                                                    className="form-control"
                                                    name="result2"
                                                    id="result2"
                                                    value={tieBreakerTest2.result2}
                                                    onChange={handleInputChangeTie2}
                                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                                    disabled={tieBreakerTest2.date2===''?true : false}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Yes">Reactive</option>
                                                    <option value="No">Non Reactive</option>
                                                    
                                                </select>
                                                
                                            </FormGroup>
                                        </div>
                                        <div className="form-group  col-md-2"></div>
            
                                        </>)}
                                    </div>
                                    </>
                                )}
                                {(confirmatoryTest.result==='No' && tieBreakerTest.result==='No' && (initialTest1.result==='Yes' || initialTest1.result==='Yes' || initialTest1.result==='')) && (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )}
                                 {/* END of  result for Test 1 */}
                                {/* This is result for Test 2 */}
                                {initialTest12.result2 && initialTest12.result2==='No' &&  (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )} 
                                {initialTest12.result2==='No' && confirmatoryTest2.result2==='No'  && (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )}
                                
                                {(initialTest12.result2==='Yes' && confirmatoryTest2.result2==='Yes' ) && (
                                    <>
                                    <LabelRibbon color="red" >
                                        Positive
                                    </LabelRibbon>
                                    <br/>
                                    </>
                                )}
                                {/* {(initialTest12.result2==='Yes' && confirmatoryTest2.result2==='No' && tieBreakerTest2.result2==='' ) && (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )} */}
                                {(confirmatoryTest2.result2==='No' && tieBreakerTest2.result2==='Yes' ) && (
                                    <LabelRibbon color="red" >
                                        Positive
                                    </LabelRibbon>
                                )}
                                {(confirmatoryTest2.result2==='No' && tieBreakerTest2.result2==='No' && (initialTest12.result2==='Yes' || initialTest12.result2==='Yes' || initialTest12.result2==='')) && (
                                    <LabelRibbon color="green" >
                                        Negative
                                    </LabelRibbon>
                                )}
                                
                                 {/* END of  result for Test 2*/}
                            </div>
                            </div>
                            {showCD4Count && (<>
                            <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                                <h5 style={{color:'#fff'}}>CD4 Count</h5>
                            </LabelRibbon>
                            <br/> <br/>
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>CD4 Count </Label>
                                    <select
                                        className="form-control"
                                        name="cd4Count"
                                        id="cd4Count"
                                        value={cd4Count.cd4Count}
                                        onChange={handleInputChangeCd4Count}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Semi-Quantitative">Semi-Quantitative</option>
                                        <option value="Flow Cyteometry">Flow Cyteometry</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            {cd4Count.cd4Count ==='Semi-Quantitative' && (
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>CD4 Count Value</Label>
                                    <select
                                        className="form-control"
                                        name="cd4SemiQuantitative"
                                        id="cd4SemiQuantitative"
                                        value={cd4Count.cd4SemiQuantitative}
                                        onChange={handleInputChangeCd4Count}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Semi-Quantitative">{"<200"}</option>
                                        <option value="Flow Cyteometry">{">=200"}</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )}
                            {cd4Count.cd4Count ==='Flow Cyteometry' && (
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">CD4 Count Value</Label>
                                <Input
                                    type="text"
                                    name="cd4FlowCyteometry"
                                    id="cd4FlowCyteometry"
                                    value={cd4Count.cd4FlowCyteometry}
                                    onChange={handleInputChangeCd4Count}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                 
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group  col-md-7"></div>
                           
                            </>)}
                            <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>Syphilis Testing</h5>
                        </LabelRibbon>
                        <br/> <br/>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Syphilis test result *</Label>
                                    <select
                                        className="form-control"
                                        name="syphilisTestResult"
                                        id="syphilisTestResult"
                                        value={syphills.syphilisTestResult}
                                        onChange={handleInputChangeSyphills}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Reactive</option>
                                        <option value="No">Non-Reactive</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
 
                            <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>Hepatitis Testing</h5>
                            </LabelRibbon>
                            <br/> <br/>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Hepatitis B virus test result *</Label>
                                    <select
                                        className="form-control"
                                        name="hepatitisBTestResult"
                                        id="hepatitisBTestResult"
                                        value={hepatitis.hepatitisBTestResult}
                                        onChange={handleInputChangeHepatitis}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Positive</option>
                                        <option value="No">Negative</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Hepatitis C virus test result *</Label>
                                    <select
                                        className="form-control"
                                        name="hepatitisCTestResult"
                                        id="hepatitisCTestResult"
                                        value={hepatitis.hepatitisCTestResult}
                                        onChange={handleInputChangeHepatitis}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                       <option value={""}></option>
                                        <option value="Yes">Positive</option>
                                        <option value="No">Negative</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>Others</h5>
                            </LabelRibbon>
                            <br/> <br/>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Longitude</Label>
                                <Input
                                    type="number"
                                    name="longitude"
                                    id="longitude"
                                    value={others.longitude}
                                    onChange={handleInputChangeOthers}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Latitude</Label>
                                <Input
                                    type="number"
                                    name="latitude"
                                    id="latitude"
                                    value={others.latitude}
                                    onChange={handleInputChangeOthers}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Adhoc Code</Label>
                                <Input
                                    type="number"
                                    name="adhocCode"
                                    id="adhocCode"
                                    value={others.adhocCode}
                                    onChange={handleInputChangeOthers}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-12">
                            {patientAge<=15 ? 
                            (<>
                                <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('basic', 'basic')}/>
                            </>)
                            :
                            (<>
                                <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('pre-test-counsel', 'pre-test-counsel')}/>
                            </>)
                            }
                            
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

export default HivTestResult