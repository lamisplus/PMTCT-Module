import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Label as LabelRibbon, Button, Message} from 'semantic-ui-react'
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


const BasicInfo = (props) => {
    const classes = useStyles();
    const patientID= props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.id : "";
    const sex= props.patientObj && props.patientObj.personResponseDto ? props.patientObj.personResponseDto.sex : "";
    const clientId = props.patientObj && props.patientObj ? props.patientObj.id : "";
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    let temp = { ...errors }
    const [riskAssessmentPartner, setRiskAssessmentPartner]= useState(
        {
            sexPartnerHivPositive:"",
            newDiagnosedHivlastThreeMonths:"",
            currentlyArvForPmtct :"",
            knowHivPositiveOnArv :"",
            knowHivPositiveAfterLostToFollowUp:"", 
            uprotectedAnalSex  :"",
        }
    )
    const [objValues, setObjValues]= useState(
        {
            htsClientId: clientId,
            knowledgeAssessment: {},
            personId: patientID,
            riskAssessment: {},
            stiScreening: {},
            tbScreening: {},
            sexPartnerRiskAssessment:{}
        }
    )
    const [knowledgeAssessment, setKnowledgeAssessment]= useState(
        {
            previousTestedHIVNegative:"",
            timeLastHIVNegativeTestResult:"",
            clientPregnant:"",
            clientInformHivTransRoutes:"",
            clientInformRiskkHivTrans:"",
            clientInformPreventingsHivTrans:"", 
            clientInformPossibleTestResult:"",
            informConsentHivTest:"",
        }
    )
    const [riskAssessment, setRiskAssessment]= useState(
        {
            everHadSexualIntercourse:"",
            bloodtransInlastThreeMonths:"",
            uprotectedSexWithCasualLastThreeMonths:"",
            uprotectedSexWithRegularPartnerLastThreeMonths:"", 
            unprotectedVaginalSex:"",  
            uprotectedAnalSex:"",   
            stiLastThreeMonths:"",
            sexUnderInfluence :"",
            moreThanOneSexPartnerLastThreeMonths:"",
            experiencePain:"",
            haveSexWithoutCondom:"",
            abuseDrug:"",
            bloodTransfusion:"",
            consistentWeightFeverNightCough:"",
            soldPaidVaginalSex:"",
        }
    )
    const [stiScreening, setStiScreening]= useState(
        {
            vaginalDischarge:"",
            lowerAbdominalPains :"",
            urethralDischarge :"",
            complaintsOfScrotal:"", 
            complaintsGenitalSore  :"",
                
        }
    )
    const [tbScreening, setTbScreening]= useState(
        {
            currentCough :"",
            weightLoss  :"",
            lymphadenopathy :"", 
            fever :"",  
            nightSweats :"",
        }
    )
    useEffect(() => { 
        //console.log(props.patientObj)
        if(props.patientObj){
            setKnowledgeAssessment(props.patientObj.knowledgeAssessment  && props.patientObj.knowledgeAssessment!==null ? props.patientObj.knowledgeAssessment : {})
            setRiskAssessment(props.patientObj.riskAssessment  && props.patientObj.riskAssessment!==null ? props.patientObj.riskAssessment : {})
            setRiskAssessmentPartner(props.patientObj.sexPartnerRiskAssessment && props.patientObj.sexPartnerRiskAssessment!==null ? props.patientObj.sexPartnerRiskAssessment : {})
            setStiScreening(props.patientObj.stiScreening  && props.patientObj.stiScreening!==null? props.patientObj.stiScreening : {})
            setTbScreening(props.patientObj.tbScreening  && props.patientObj.tbScreening!==null? props.patientObj.tbScreening : {})
            //patientAge=calculate_age(moment(props.patientObj.personResponseDto.dateOfBirth).format("DD-MM-YYYY"))
            //console.log(props.patientObj.riskStratificationResponseDto.riskAssessment)
            if(props.patientObj.riskStratificationResponseDto && Object.keys(props.patientObj.riskStratificationResponseDto.riskAssessment).length !== 0 && props.patientObj.riskAssessment===null){
                setRiskAssessment({...riskAssessment, ...props.patientObj.riskStratificationResponseDto.riskAssessment})
            }else{
                setRiskAssessment({...riskAssessment, ...props.patientObj.riskAssessment})   
            } 
        }
    }, [props.patientObj]);
    const handleItemClick =(page, completedMenu)=>{        
        if(props.completed.includes(completedMenu)) {
        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
        props.handleItemClick(page)
    }

    const handleInputChangeKnowledgeAssessment = e => { 
        //setErrors({...temp, [e.target.name]:""})
        
        setKnowledgeAssessment ({...knowledgeAssessment,  [e.target.name]: e.target.value}); 
          
    }
    
    const handleInputChangeRiskAssessment = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setRiskAssessment ({...riskAssessment,  [e.target.name]: e.target.value});                  
    }
    // Getting the number count of riskAssessment True
    const actualRiskCountTrue=Object.values(riskAssessment)
    const riskCount=actualRiskCountTrue.filter((x)=> x==='true')
   
    const handleInputChangeRiskAssessmentPartner = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setRiskAssessmentPartner ({...riskAssessmentPartner,  [e.target.name]: e.target.value});                       
    }
    // Getting the number count of sexPartRiskCount True
    const actualSexPartRiskCountTrue=Object.values(riskAssessmentPartner)
    const sexPartRiskCount=actualSexPartRiskCountTrue.filter((x)=> x==='true')

    const handleInputChangeStiScreening = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setStiScreening ({...stiScreening,  [e.target.name]: e.target.value});            
    }
    // Getting the number count of STI True
    const actualStiTrue=Object.values(stiScreening)
    const stiCount=actualStiTrue.filter((x)=> x==='true')
    
    const [tbCount, settbCount] = useState(0);
    const handleInputChangeTbScreening = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        
        if(e.target.value==='true') {
            const newcount = tbCount +1
            if(newcount>=0 && newcount <=5){
                settbCount(newcount)
            }
        }
        if(e.target.value==='false') {
            const newcount = tbCount -1
            //settbCount(newcount)
            //console.log(newcount)
            if(newcount <=0 ){
                
                settbCount(0)
            }else{
                settbCount(newcount)
            }
        } 
        setTbScreening ({...tbScreening,  [e.target.name]: e.target.value});          
    }
     /*****  Validation  */
     const validate = () => {
        //HTS FORM VALIDATION
           temp.previousTestedHIVNegative = knowledgeAssessment.previousTestedHIVNegative ? "" : "This field is required."
           {knowledgeAssessment.previousTestedHIVNegative==='true' && ( temp.timeLastHIVNegativeTestResult = knowledgeAssessment.timeLastHIVNegativeTestResult ? "" : "This field is required.")}
           temp.clientPregnant = knowledgeAssessment.clientPregnant ? "" : "This field is required."
           temp.clientInformHivTransRoutes = knowledgeAssessment.clientInformHivTransRoutes ? "" : "This field is required."
           temp.clientInformRiskkHivTrans = knowledgeAssessment.clientInformRiskkHivTrans ? "" : "This field is required."
           temp.clientInformPreventingsHivTrans = knowledgeAssessment.clientInformPreventingsHivTrans ? "" : "This field is required."
           temp.clientInformPossibleTestResult = knowledgeAssessment.clientInformPossibleTestResult ? "" : "This field is required."
           temp.informConsentHivTest = knowledgeAssessment.informConsentHivTest ? "" : "This field is required."  

            temp.currentCough = tbScreening.currentCough ? "" : "This field is required."
            temp.weightLoss = tbScreening.weightLoss ? "" : "This field is required."
            temp.lymphadenopathy = tbScreening.lymphadenopathy ? "" : "This field is required."
            temp.fever = tbScreening.fever ? "" : "This field is required."
            temp.nightSweats = tbScreening.nightSweats ? "" : "This field is required."

            {props.patientObj && props.patientObj.personResponseDto.sex==='Female' && (temp.vaginalDischarge = stiScreening.vaginalDischarge ? "" : "This field is required." )}
            {props.patientObj && props.patientObj.personResponseDto.sex==='Female' && (temp.lowerAbdominalPains = stiScreening.lowerAbdominalPains ? "" : "This field is required.")}
            {props.patientObj.personResponseDto && props.patientObj.personResponseDto.sex==='Male' && (temp.urethralDischarge = stiScreening.urethralDischarge ? "" : "This field is required.")}
            {props.patientObj.personResponseDto && props.patientObj.personResponseDto.sex==='Male' && (temp.complaintsOfScrotal = stiScreening.complaintsOfScrotal ? "" : "This field is required.")}
            {props.patientObj.personResponseDto && props.patientObj.personResponseDto.sex==='Male' && (temp.complaintsGenitalSore = stiScreening.complaintsGenitalSore ? "" : "This field is required.")}
 
            {props.patientObj.targetGroup==="473" && (temp.everHadSexualIntercourse = riskAssessment.everHadSexualIntercourse ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.bloodtransInlastThreeMonths = riskAssessment.bloodtransInlastThreeMonths ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.uprotectedSexWithCasualLastThreeMonths = riskAssessment.uprotectedSexWithCasualLastThreeMonths ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.uprotectedSexWithRegularPartnerLastThreeMonths = riskAssessment.uprotectedSexWithRegularPartnerLastThreeMonths ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.unprotectedVaginalSex = riskAssessment.unprotectedVaginalSex ? "" : "This field is required.")}

            {props.patientObj.targetGroup==="473" && (temp.uprotectedAnalSex = riskAssessment.uprotectedAnalSex ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.sexUnderInfluence = riskAssessment.sexUnderInfluence ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.uprotectedSexWithCasualLastThreeMonths = riskAssessment.uprotectedSexWithCasualLastThreeMonths ? "" : "This field is required.")}
            {props.patientObj.targetGroup==="473" && (temp.moreThanOneSexPartnerLastThreeMonths = riskAssessment.moreThanOneSexPartnerLastThreeMonths ? "" : "This field is required.")}
            
            
            {props.patientObj.targetGroup!=="473" && (temp.experiencePain = riskAssessment.experiencePain ? "" : "This field is required.")}

            {props.patientObj.targetGroup!=="473" && (temp.haveSexWithoutCondom = riskAssessment.haveSexWithoutCondom ? "" : "This field is required.")}
            {props.patientObj.targetGroup!=="473" && (temp.abuseDrug = riskAssessment.abuseDrug ? "" : "This field is required.")}
            {props.patientObj.targetGroup!=="473" && (temp.bloodTransfusion = riskAssessment.bloodTransfusion ? "" : "This field is required.")}
            {props.patientObj.targetGroup!=="473" && (temp.consistentWeightFeverNightCough = riskAssessment.consistentWeightFeverNightCough ? "" : "This field is required.")}
            {props.patientObj.targetGroup!=="473" && (temp.soldPaidVaginalSex = riskAssessment.soldPaidVaginalSex ? "" : "This field is required.")}

            temp.sexPartnerHivPositive = tbScreening.sexPartnerHivPositive ? "" : "This field is required."
            {riskAssessmentPartner.sexPartnerHivPositive==='true' && (temp.newDiagnosedHivlastThreeMonths = tbScreening.newDiagnosedHivlastThreeMonths ? "" : "This field is required.")}
            {riskAssessmentPartner.sexPartnerHivPositive==='true' && (temp.currentlyArvForPmtct = tbScreening.currentlyArvForPmtct ? "" : "This field is required.")}
            {riskAssessmentPartner.sexPartnerHivPositive==='true' && ( temp.knowHivPositiveOnArv = tbScreening.knowHivPositiveOnArv ? "" : "This field is required.")}
            {riskAssessmentPartner.sexPartnerHivPositive==='true' && (temp.knowHivPositiveAfterLostToFollowUp = tbScreening.knowHivPositiveAfterLostToFollowUp ? "" : "This field is required.")}
            {riskAssessmentPartner.sexPartnerHivPositive==='true' && (temp.uprotectedAnalSex = tbScreening.uprotectedAnalSex ? "" : "This field is required.")}
            
            setErrors({ ...temp })
        return Object.values(temp).every(x => x == "")
    }
    const handleSubmit =(e)=>{
        e.preventDefault();

            objValues.htsClientId= clientId
            objValues.knowledgeAssessment= knowledgeAssessment
            objValues.personId= patientID
            objValues.riskAssessment= riskAssessment
            objValues.stiScreening=stiScreening
            objValues.tbScreening=tbScreening
            objValues.sexPartnerRiskAssessment=riskAssessmentPartner
            axios.put(`${baseUrl}hts/${clientId}/pre-test-counseling`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                props.setPatientObj(response.data)
                //toast.success("Risk Assesment successful");
                handleItemClick('hiv-test', 'pre-test-counsel' )

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
    console.log(riskAssessmentPartner)

    return (
        <>
            <Card className={classes.root}>
                <CardBody>
               
                <h2>PRE TEST COUNSELING</h2>
                    <form >
                        <div className="row">

                        <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'rgb(0,181,173)', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Knowledge Assessment</div>
                     
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Previously tested HIV negative *</Label>
                                    <select
                                        className="form-control"
                                        name="previousTestedHIVNegative"
                                        id="previousTestedHIVNegative"
                                        value={knowledgeAssessment.previousTestedHIVNegative}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.previousTestedHIVNegative !=="" ? (
                                    <span className={classes.error}>{errors.previousTestedHIVNegative}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            {knowledgeAssessment.previousTestedHIVNegative==='true' && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Time of last HIV Negative test Result*</Label>
                                    <select
                                        className="form-control"
                                        name="timeLastHIVNegativeTestResult"
                                        id="timeLastHIVNegativeTestResult"
                                        value={knowledgeAssessment.timeLastHIVNegativeTestResult}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="<1"> {"< 1"} month</option>
                                        <option value="1-3 Months">1-3 Months</option>
                                        <option value="4-6 Months">4-6 Months</option>
                                        <option value=">6 Months"> {">6"} Months</option>
                                        
                                    </select>
                                    {errors.timeLastHIVNegativeTestResult !=="" ? (
                                    <span className={classes.error}>{errors.timeLastHIVNegativeTestResult}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            )}
                            {sex ==='Female' && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Client pregnant *</Label>
                                    <select
                                        className="form-control"
                                        name="clientPregnant"
                                        id="clientPregnant"
                                        value={knowledgeAssessment.clientPregnant}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clientPregnant !=="" ? (
                                    <span className={classes.error}>{errors.clientPregnant}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                             )}
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Client informed about HIV transmission routes *</Label>
                                    <select
                                        className="form-control"
                                        name="clientInformHivTransRoutes"
                                        id="clientInformHivTransRoutes"
                                        value={knowledgeAssessment.clientInformHivTransRoutes}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clientInformHivTransRoutes !=="" ? (
                                    <span className={classes.error}>{errors.clientInformHivTransRoutes}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Client informed about risk factors for HIV transmission *</Label>
                                    <select
                                        className="form-control"
                                        name="clientInformRiskkHivTrans"
                                        id="clientInformRiskkHivTrans"
                                        value={knowledgeAssessment.clientInformRiskkHivTrans}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clientInformRiskkHivTrans !=="" ? (
                                    <span className={classes.error}>{errors.clientInformRiskkHivTrans}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Client informed on preventing HIV transmission methods *</Label>
                                    <select
                                        className="form-control"
                                        name="clientInformPreventingsHivTrans"
                                        id="clientInformPreventingsHivTrans"
                                        value={knowledgeAssessment.clientInformPreventingsHivTrans}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clientInformPreventingsHivTrans !=="" ? (
                                    <span className={classes.error}>{errors.clientInformPreventingsHivTrans}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Client informed about possible test results *</Label>
                                    <select
                                        className="form-control"
                                        name="clientInformPossibleTestResult"
                                        id="clientInformPossibleTestResult"
                                        value={knowledgeAssessment.clientInformPossibleTestResult}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clientInformPossibleTestResult !=="" ? (
                                    <span className={classes.error}>{errors.clientInformPossibleTestResult}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Informed consent for HIV testing given *</Label>
                                    <select
                                        className="form-control"
                                        name="informConsentHivTest"
                                        id="informConsentHivTest"
                                        value={knowledgeAssessment.informConsentHivTest}
                                        onChange={handleInputChangeKnowledgeAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.informConsentHivTest !=="" ? (
                                    <span className={classes.error}>{errors.informConsentHivTest}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#000', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Clinical TB screening</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Current cough *</Label>
                                    <select
                                        className="form-control"
                                        name="currentCough"
                                        id="currentCough"
                                        value={tbScreening.currentCough}
                                        onChange={handleInputChangeTbScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.currentCough !=="" ? (
                                    <span className={classes.error}>{errors.currentCough}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Weight loss *</Label>
                                    <select
                                        className="form-control"
                                        name="weightLoss"
                                        id="weightLoss"
                                        value={tbScreening.weightLoss}
                                        onChange={handleInputChangeTbScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.weightLoss !=="" ? (
                                    <span className={classes.error}>{errors.weightLoss}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Lymphadenopathy (swelling of the lymph nodes) *</Label>
                                    <select
                                        className="form-control"
                                        name="lymphadenopathy"
                                        id="lymphadenopathy"
                                        value={tbScreening.lymphadenopathy}
                                        onChange={handleInputChangeTbScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.lymphadenopathy !=="" ? (
                                    <span className={classes.error}>{errors.lymphadenopathy}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Fever *</Label>
                                    <select
                                        className="form-control"
                                        name="fever"
                                        id="fever"
                                        value={tbScreening.fever}
                                        onChange={handleInputChangeTbScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.fever !=="" ? (
                                    <span className={classes.error}>{errors.fever}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Night sweats*</Label>
                                    <select
                                        className="form-control"
                                        name="nightSweats"
                                        id="nightSweats"
                                        value={tbScreening.nightSweats}
                                        onChange={handleInputChangeTbScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.nightSweats !=="" ? (
                                    <span className={classes.error}>{errors.nightSweats}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <Message warning>
                                <h4>TB Screening score (calculate the sum of the TB assessment) If score {">= 1"}, test for Xper MTB RIF or refer to TB service </h4>
                                <b>Score : {tbCount}</b>
                            </Message>
                            <hr/>
                            <br/>
                           {props.patientObj.targetGroup==="TARGET_GROUP_GEN_POP" && ( <>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >HIV Risk Assessment  (Last 3 months)</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Ever had sexual intercourse </Label>
                                    <select
                                        className="form-control"
                                        name="everHadSexualIntercourse"
                                        id="everHadSexualIntercourse"
                                        value={riskAssessment.everHadSexualIntercourse}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.everHadSexualIntercourse !=="" ? (
                                    <span className={classes.error}>{errors.everHadSexualIntercourse}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Blood transfusion in last 3 months *</Label>
                                    <select
                                        className="form-control"
                                        name="bloodtransInlastThreeMonths"
                                        id="bloodtransInlastThreeMonths"
                                        value={riskAssessment.bloodtransInlastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.bloodtransInlastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.bloodtransInlastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected sex with casual partner in last 3 months *</Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedSexWithCasualLastThreeMonths"
                                        id="uprotectedSexWithCasualLastThreeMonths"
                                        value={riskAssessment.uprotectedSexWithCasualLastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedSexWithCasualLastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedSexWithCasualLastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected sex with regular partner in the last 3months</Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedSexWithRegularPartnerLastThreeMonths"
                                        id="uprotectedSexWithRegularPartnerLastThreeMonths"
                                        value={riskAssessment.uprotectedSexWithRegularPartnerLastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedSexWithRegularPartnerLastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedSexWithRegularPartnerLastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected vaginal sex</Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedVaginalSex"
                                        id="unprotectedVaginalSex"
                                        value={riskAssessment.unprotectedVaginalSex}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedVaginalSex !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedVaginalSex}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Anal sex</Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedAnalSex"
                                        id="uprotectedAnalSex"
                                        value={riskAssessment.uprotectedAnalSex}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedAnalSex !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedAnalSex}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>         
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>STI in last 3 months *</Label>
                                    <select
                                        className="form-control"
                                        name="stiLastThreeMonths"
                                        id="stiLastThreeMonths"
                                        value={riskAssessment.stiLastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.stiLastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.stiLastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Sex under the influence of drugs or alcohol*</Label>
                                    <select
                                        className="form-control"
                                        name="sexUnderInfluence"
                                        id="sexUnderInfluence"
                                        value={riskAssessment.sexUnderInfluence}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sexUnderInfluence !=="" ? (
                                    <span className={classes.error}>{errors.sexUnderInfluence}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>More than 1 sex partner during last 3 months*</Label>
                                    <select
                                        className="form-control"
                                        name="moreThanOneSexPartnerLastThreeMonths"
                                        id="moreThanOneSexPartnerLastThreeMonths"
                                        value={riskAssessment.moreThanOneSexPartnerLastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.moreThanOneSexPartnerLastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.moreThanOneSexPartnerLastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <Message warning>
                                <h4>Personal HIV Risk assessment score (sum of all 7 answers)</h4>
                                <b>Score : {riskCount.length}</b>
                            </Message>
                            <hr/>
                            <br/>
                            </>)}
                            {props.patientObj.targetGroup!=="TARGET_GROUP_GEN_POP" && ( <>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >HIV Risk Assessment  (Last 3 months)</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you/your partner experienced lower abdominal pain, smelly discharge, blisters and wounds around you/partner vagina, penis anus or mouth?</Label>
                                    <select
                                        className="form-control"
                                        name="experiencePain"
                                        id="experiencePain"
                                        value={riskAssessment.experiencePain}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.experiencePain !=="" ? (
                                    <span className={classes.error}>{errors.experiencePain}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you/partner had sex without a condom with someone of unknown HIV status, or you/partner raped by person with unknown HIV status? *</Label>
                                    <select
                                        className="form-control"
                                        name="haveSexWithoutCondom"
                                        id="haveSexWithoutCondom"
                                        value={riskAssessment.haveSexWithoutCondom}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveSexWithoutCondom !=="" ? (
                                    <span className={classes.error}>{errors.haveSexWithoutCondom}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had a condom burst with your partner during sexual intercourse?  *</Label>
                                    <select
                                        className="form-control"
                                        name="haveCondomBurst"
                                        id="haveCondomBurst"
                                        value={riskAssessment.haveCondomBurst}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveCondomBurst !=="" ? (
                                    <span className={classes.error}>{errors.haveCondomBurst}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Do you/partner share needles/syringes, other sharp objects or used abuse drug substances of any kind?</Label>
                                    <select
                                        className="form-control"
                                        name="abuseDrug"
                                        id="abuseDrug"
                                        value={riskAssessment.abuseDrug}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.abuseDrug !=="" ? (
                                    <span className={classes.error}>{errors.abuseDrug}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you/partner had any blood or blood product transfusion?</Label>
                                    <select
                                        className="form-control"
                                        name="bloodTransfusion"
                                        id="bloodTransfusion"
                                        value={riskAssessment.bloodTransfusion}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.bloodTransfusion !=="" ? (
                                    <span className={classes.error}>{errors.bloodTransfusion}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you/partner experienced coughing, weight loss, fever, night sweats consistently?</Label>
                                    <select
                                        className="form-control"
                                        name="consistentWeightFeverNightCough"
                                        id="consistentWeightFeverNightCough"
                                        value={riskAssessment.consistentWeightFeverNightCough}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.consistentWeightFeverNightCough !=="" ? (
                                    <span className={classes.error}>{errors.consistentWeightFeverNightCough}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>            
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you/partner paid or sold vaginal, anal or oral sex? *</Label>
                                    <select
                                        className="form-control"
                                        name="soldPaidVaginalSex"
                                        id="soldPaidVaginalSex"
                                        value={riskAssessment.soldPaidVaginalSex}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.soldPaidVaginalSex !=="" ? (
                                    <span className={classes.error}>{errors.soldPaidVaginalSex}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <Message warning>
                                <h4>Personal HIV Risk assessment score (sum of all 7 answers)</h4>
                                <b>Score :{riskCount.length}</b>
                            </Message>
                            <hr/>
                            <br/>
                            </>)}
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Sex Partner Risk Assessment (Last 3 months)</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who is HIV positive? </Label>
                                    <select
                                        className="form-control"
                                        name="sexPartnerHivPositive"
                                        id="sexPartnerHivPositive"
                                        value={riskAssessmentPartner.sexPartnerHivPositive}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sexPartnerHivPositive !=="" ? (
                                    <span className={classes.error}>{errors.sexPartnerHivPositive}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            {riskAssessmentPartner.sexPartnerHivPositive==='true' && (<>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Is sex partner newly diagnosed with HIV and started treatment less than 3-6 months ago?*</Label>
                                    <select
                                        className="form-control"
                                        name="newDiagnosedHivlastThreeMonths"
                                        id="newDiagnosedHivlastThreeMonths"
                                        value={riskAssessmentPartner.newDiagnosedHivlastThreeMonths}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.newDiagnosedHivlastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.newDiagnosedHivlastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Is sex partner pregnant and currently receiving ARV for PMTCT?*</Label>
                                    <select
                                        className="form-control"
                                        name="currentlyArvForPmtct"
                                        id="currentlyArvForPmtct"
                                        value={riskAssessmentPartner.currentlyArvForPmtct}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.currentlyArvForPmtct !=="" ? (
                                    <span className={classes.error}>{errors.currentlyArvForPmtct}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Known HIV positive partner on ARV with an unsurpressed VL</Label>
                                    <select
                                        className="form-control"
                                        name="knowHivPositiveOnArv"
                                        id="knowHivPositiveOnArv"
                                        value={riskAssessmentPartner.knowHivPositiveOnArv}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.knowHivPositiveOnArv !=="" ? (
                                    <span className={classes.error}>{errors.knowHivPositiveOnArv}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Known HIV positive recently returned to treatment after being lost to follow up</Label>
                                    <select
                                        className="form-control"
                                        name="knowHivPositiveAfterLostToFollowUp"
                                        id="knowHivPositiveAfterLostToFollowUp"
                                        value={riskAssessmentPartner.knowHivPositiveAfterLostToFollowUp}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.knowHivPositiveAfterLostToFollowUp !=="" ? (
                                    <span className={classes.error}>{errors.knowHivPositiveAfterLostToFollowUp}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Anal sex</Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedAnalSex"
                                        id="uprotectedAnalSex"
                                        value={riskAssessmentPartner.uprotectedAnalSex}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedAnalSex !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedAnalSex}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            </>)}
                            <Message warning>
                                <h4>Sex Partner Risk Assessment score (sum of all 6 answers)</h4>
                                <b>Score :{sexPartRiskCount.length}</b>
                            </Message>        
                            
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#014D88', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Syndromic STI Screening</div>
                            {props.patientObj && props.patientObj.personResponseDto.sex==='Female' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of vaginal discharge or burning when urinating?</Label>
                                    <select
                                        className="form-control"
                                        name="vaginalDischarge"
                                        id="vaginalDischarge"
                                        value={stiScreening.vaginalDischarge}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.vaginalDischarge !=="" ? (
                                    <span className={classes.error}>{errors.vaginalDischarge}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of lower abdominal pains with or without vaginal discharge?</Label>
                                    <select
                                        className="form-control"
                                        name="lowerAbdominalPains"
                                        id="lowerAbdominalPains"
                                        value={stiScreening.lowerAbdominalPains}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.lowerAbdominalPains !=="" ? (
                                    <span className={classes.error}>{errors.lowerAbdominalPains}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            </>)}
                            {props.patientObj.personResponseDto && props.patientObj.personResponseDto.sex==='Male' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of urethral discharge or burning when urinating?</Label>
                                    <select
                                        className="form-control"
                                        name="urethralDischarge"
                                        id="urethralDischarge"
                                        value={stiScreening.urethralDischarge}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.urethralDischarge !=="" ? (
                                    <span className={classes.error}>{errors.urethralDischarge}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of scrotal swelling and pain</Label>
                                    <select
                                        className="form-control"
                                        name="complaintsOfScrotal"
                                        id="complaintsOfScrotal"
                                        value={stiScreening.complaintsOfScrotal}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.complaintsOfScrotal !=="" ? (
                                    <span className={classes.error}>{errors.complaintsOfScrotal}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of genital sore(s) or swollen inguinal lymph nodes with or without pains?</Label>
                                    <select
                                        className="form-control"
                                        name="complaintsGenitalSore"
                                        id="complaintsGenitalSore"
                                        value={stiScreening.complaintsGenitalSore}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.complaintsGenitalSore !=="" ? (
                                    <span className={classes.error}>{errors.complaintsGenitalSore}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            </>)} 
                            <Message warning>
                                <h4>Calculate the sum of the STI screening. If {">= "}1, should be referred for STI test </h4>
                                <b>Score :{stiCount.length}</b>
                            </Message>
                           
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-12">
                            <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('basic','basic')}/>
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

export default BasicInfo