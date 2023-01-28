import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, List, } from 'semantic-ui-react'
// Page titie
import { FormGroup, Label as FormLabelName, 
          Input,InputGroup, InputGroupText
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
  //console.log(patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate)
  const [errors, setErrors] = useState({});
  const [infantObj, setInfantObj] = useState()
  const [infantHospitalNumber, setInfantHospitalNumber] = useState()
  let temp = { ...errors }
  const classes = useStyles()
  const [saving, setSaving] = useState(false);
  const [infants, setInfants] = useState([])
  const [formFilter, setFormFilter] = useState({infantArv: false,  motherArt: false, outCome:false})
  const [timingOfArtInitiation, setTimingOfArtInitiation] = useState([]);
  const [childStatus, setChildStatus] = useState([]);
  const [timeMotherArt, setTimeMotherArt] = useState([]);
  const [regimenType, setRegimenType] = useState([]);
  const [adultRegimenLine, setAdultRegimenLine] = useState([]);
  const [infantArv, setInfantArv] = useState([]);
  const [agectx, setAgeCTX] = useState([]);
  const [pcrResult, setPcrResult] = useState([])
  const [infantOutcome, setInfantOutcome] = useState([])
  const [objValues, setObjValues] = useState({
      infantVisitRequestDto: "",
      infantArvDto: "",
      infantMotherArtDto: "",
      infantPCRTestDto: "",
  });
  const [infantVisitRequestDto, setInfantVisitRequestDto] = useState({
      ageAtCtx: "",
      ancNumber: props.patientObj.ancNo,
      bodyWeight: "",
      breastFeeding: "",
      ctxStatus: "",
      infantHospitalNumber: infantHospitalNumber,
      uuid: "",
      visitDate: "",
      visitStatus: "",
      infantOutcomeAt18Months:""
  });
  const [infantArvDto, setInfantArvDto] = useState({
      ageAtCtx: "",
      ancNumber: props.patientObj.ancNo,
      arvDeliveryPoint: "",
      infantArvTime: "",
      infantArvType: "",
      infantHospitalNumber: infantHospitalNumber,

});
const [infantMotherArtDto, setInfantMotherArtDto] = useState({
      ancNumber: props.patientObj.ancNo,
      motherArtInitiationTime: "",
      motherArtRegimen: "",
      regimenTypeId:"",
      regimenId:""

});
const [infantPCRTestDto, setInfantPCRTestDto] = useState({
      ageAtTest: "",
      ancNumber: props.patientObj.ancNo,
      dateResultReceivedAtFacility: "",
      dateResultReceivedByCaregiver: "",
      dateSampleCollected: "",
      dateSampleSent: "",
      infantHospitalNumber: infantHospitalNumber,
      results: "",
      testType: "",
  });


  useEffect(() => {
    InfantInfo();
    TIME_ART_INITIATION_PMTCT();
    CHILD_FOLLOW_UP_VISIT_STATUS();
    TIMING_MOTHERS_ART_INITIATION();
    AdultRegimenLine();
    AGE_CTX_INITIATION();
    INFANT_ARV_PROPHYLAXIS_TYPE();
    INFANT_PCR_RESULT();
    INFANT_OUTCOME_AT_18_MONTHS()
  }, [props.patientObj.ancNo]);
    ///GET LIST OF Infants
    const InfantInfo =()=>{
      //setLoading(true)
      axios
          .get(`${baseUrl}pmtct/anc/get-infant-by-ancno/${props.patientObj.ancNo}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
          //setLoading(false)
                  setInfants(response.data)
          })

          .catch((error) => {
          //console.log(error);
          });
      
  }
  const TIME_ART_INITIATION_PMTCT =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/TIME_ART_INITIATION_PMTCT`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setTimingOfArtInitiation(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const INFANT_OUTCOME_AT_18_MONTHS =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/INFANT_OUTCOME_AT_18_MONTHS`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setInfantOutcome(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const INFANT_PCR_RESULT =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/INFANT_PCR_RESULT`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setPcrResult(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const INFANT_ARV_PROPHYLAXIS_TYPE =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/INFANT_ARV_PROPHYLAXIS_TYPE`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setInfantArv(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const AGE_CTX_INITIATION =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/AGE_CTX_INITIATION`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setAgeCTX(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const TIMING_MOTHERS_ART_INITIATION =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/TIMING_MOTHERS_ART_INITIATION`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setTimeMotherArt(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  const CHILD_FOLLOW_UP_VISIT_STATUS =()=>{
    axios
    .get(`${baseUrl}application-codesets/v2/CHILD_FOLLOW_UP_VISIT_STATUS`,
        { headers: {"Authorization" : `Bearer ${token}`} }
    )
    .then((response) => {
        setChildStatus(response.data)
    })
    .catch((error) => {
    //console.log(error);
    });        
  }
  //GET AdultRegimenLine 
  const AdultRegimenLine =()=>{
    axios
        .get(`${baseUrl}hiv/regimen/arv/adult`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            const artRegimen=response.data.filter((x)=> (x.id===1 || x.id===2 || x.id===14)) 
            setAdultRegimenLine(artRegimen);
        })
        .catch((error) => {
        //console.log(error);
        });        
}
  const handleInputChangeInfantVisitRequestDto = e => {
    setErrors({...temp, [e.target.name]:""})   
    //console.log(e.target.name)
    setInfantVisitRequestDto({ ...infantVisitRequestDto, [e.target.name]: e.target.value });    
  }
  const handleInputChangeInfantArvDto = e => {
    setErrors({...temp, [e.target.name]:""})   
    //console.log(e.target.name), 
    setInfantArvDto({ ...infantArvDto, [e.target.name]: e.target.value });    
  }
  const handleInputChangeInfantMotherArtDto = e => {
    setErrors({...temp, [e.target.name]:""})   
    //console.log(e.target.name), 
    setInfantMotherArtDto({ ...infantMotherArtDto, [e.target.name]: e.target.value });    
  }
  const handleInputChangeInfantPCRTestDto= e => {
    setErrors({...temp, [e.target.name]:""})   
    //console.log(e.target.name)infantPCRTestDto, setInfantPCRTestDto
    setInfantPCRTestDto({ ...infantPCRTestDto, [e.target.name]: e.target.value });    
  }

  //Validations of the forms
  const validate = () => {       
    temp.visitDate = infantVisitRequestDto.visitDate ? "" : "This field is required"

    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x === "")
  }

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validate()){
    setSaving(true)
      objValues.infantVisitRequestDto=infantVisitRequestDto
      objValues.infantArvDto=infantArvDto
      objValues.infantMotherArtDto=infantMotherArtDto
      objValues.infantPCRTestDto=infantPCRTestDto
      axios.post(`${baseUrl}pmtct/anc/infant-visit-consolidated`, objValues,
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
  const handleSelecteRegimen = e => { 
    let regimenID=  e.target.value
    //regimenTypeId regimenId
    setInfantMotherArtDto ({...infantMotherArtDto, regimenTypeId:regimenID});
    RegimenType(regimenID)           
    //setErrors({...temp, [e.target.name]:""})
  }
  //Get list of RegimenLine
  const RegimenType =(id)=>{
  axios
      .get(`${baseUrl}hiv/regimen/types/${id}`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
          //console.log(response.data);
          setRegimenType(response.data);
      })
      .catch((error) => {
      //console.log(error);
      });
  
  }
  function GetInfantDetail(obj){
           setInfantHospitalNumber(obj.hospitalNumber)
          setInfantObj(obj)
          const InfantVisit =()=>{
            //setLoading(true)
            axios
                .get(`${baseUrl}pmtct/anc/get-form-filter/${obj.hospitalNumber}`,
                    { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                //setLoading(false)
                  setFormFilter(response.data)
                })
      
                .catch((error) => {
                //console.log(error);
                });
            
        }
        InfantVisit()
  }

  return (
    <div>
      <h2>Clinic Follow-up Visit</h2>
      <Grid columns='equal'>
        <Grid.Column>

            <Segment>
              <Label as='a' color='blue' ribbon>
                Infant's
              </Label>
              <br />
              <List celled>
                  <List.Item >Given Name<span className="float-end"><b>Hospital Number</b></span></List.Item>
                  </List>
              {infants.map((row) =>
                  <List celled>
                  <List.Item onClick={()=>GetInfantDetail(row)} style={{cursor: "pointer"}}>{row.firstName} <span className="float-end"><b>{row.hospitalNumber}</b></span></List.Item>
                  </List>
               
              )}
            </Segment>

          
        </Grid.Column>
        <Grid.Column width={12}>
        <Segment>
            <Label as='a' color='blue'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>Infant Clinic Visit  - {infantObj && infantObj.hospitalNumber ? infantObj.hospitalNumber : " "}</h4>
            </Label>
            <br /><br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date of Visit *</FormLabelName>
                  <Input
                    type="date"
                    name="visitDate"
                    id="visitDate"
                    value={infantVisitRequestDto.visitDate}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    //={props.patientObj && props.patientObj.artCommence ? props.patientObj.artCommence.visitDate : null}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                  />
                 {errors.visitDate !=="" ? (
                      <span className={classes.error}>{errors.visitDate}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Mother ANC number *</FormLabelName>
                  <Input
                    type="text"
                    name="ancNumber"
                    id="ancNumber"
                    value={infantVisitRequestDto.ancNumber}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChangeInfantVisitRequestDto}
                    disabled
                  />
                 {errors.ancNumber !=="" ? (
                      <span className={classes.error}>{errors.ancNumber}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                        <FormGroup>
                        <FormLabelName >Body Weight</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeInfantVisitRequestDto}
                                min="3"
                                max="150"
                                value={infantVisitRequestDto.bodyWeight}
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                kg
                            </InputGroupText>
                        </InputGroup>
                        {errors.bodyWeight !=="" ? (
                            <span className={classes.error}>{errors.bodyWeight}</span>
                        ) : "" }
                        </FormGroup>
                    </div> 
                     <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName >Breast Feeding ?</FormLabelName>
                        <Input
                          type="select"
                          name="breastFeeding"
                          id="breastFeeding"
                          value={infantVisitRequestDto.breastFeeding}
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                          onChange={handleInputChangeInfantVisitRequestDto}
                          
                        >
                        <option value="">Select </option>
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                       
                      </Input>
                      {errors.breastFeeding !=="" ? (
                            <span className={classes.error}>{errors.breastFeeding}</span>
                        ) : "" }

                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName >CTX </FormLabelName>
                        <Input
                          type="select"
                          name="ctxStatus"
                          id="ctxStatus"
                          value={infantVisitRequestDto.ctxStatus}
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                          onChange={handleInputChangeInfantVisitRequestDto}
                          
                        >
                        <option value="">Select </option>
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                       
                      </Input>
                      {errors.ctxStatus !=="" ? (
                            <span className={classes.error}>{errors.ctxStatus}</span>
                        ) : "" }

                      </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName >Visit Status</FormLabelName>
                        <Input
                          type="select"
                          name="visitStatus"
                          id="visitStatus"
                          value={infantVisitRequestDto.visitStatus}
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                          onChange={handleInputChangeInfantVisitRequestDto}
                          
                        >
                        <option value="">Select </option>
                        {childStatus.map((value, index) => (
                                <option key={index} value={value.code}>
                                    {value.display}
                                </option>
                            ))}
                      </Input>
                      {errors.visitStatus !=="" ? (
                            <span className={classes.error}>{errors.visitStatus}</span>
                        ) : "" }

                      </FormGroup>
                    </div> 
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName >Infant outcome at 18 months</FormLabelName>
                        <Input
                          type="select"
                          name="infantOutcomeAt18Months"
                          id="infantOutcomeAt18Months"
                          value={infantVisitRequestDto.infantOutcomeAt18Months}
                          style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                          onChange={handleInputChangeInfantVisitRequestDto}
                          
                        >
                        <option value="">Select </option>
                        {infantOutcome.map((value, index) => (
                                <option key={index} value={value.code}>
                                    {value.display}
                                </option>
                            ))}
                       
                      </Input>
                      {errors.infantOutcomeAt18Months !=="" ? (
                            <span className={classes.error}>{errors.infantOutcomeAt18Months}</span>
                        ) : "" }

                      </FormGroup>
                    </div>             
            </div>
            
            <br />
            {formFilter.motherArt===false && (<>
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>  Mother's ART </h4>
            </Label>
            <br /><br />
            <div className="row">
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Timing of mother's ART Initiation </FormLabelName>
                  <Input
                    type="select"
                    name="motherArtInitiationTime"
                    id="motherArtInitiationTime"
                    value={infantMotherArtDto.motherArtInitiationTime}
                    onChange={handleInputChangeInfantMotherArtDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    
                  >
                    <option value="select">Select </option>
                    {timeMotherArt.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                  </Input>
                  {errors.motherArtInitiationTime !=="" ? (
                      <span className={classes.error}>{errors.motherArtInitiationTime}</span>
                  ) : "" }
                </FormGroup>
              </div>
             
              <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                    <FormLabelName >Original Regimen Line </FormLabelName>
                    <Input
                            type="select"
                            name="regimenTypeId"
                            id="regimenTypeId"
                            value={infantMotherArtDto.regimenTypeId}
                            onChange={handleSelecteRegimen}
                            required
                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                            >
                                <option value=""> Select</option>
        
                                    {adultRegimenLine.map((value) => (
                                    <option key={value.id} value={value.id}>
                                        {value.description}
                                    </option>
                                    ))}
                              
                        </Input>
                        {errors.regimenTypeId !=="" ? (
                            <span className={classes.error}>{errors.regimenTypeId}</span>
                            ) : "" }
                    </FormGroup>
                    </div>                    
                    <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                    <FormLabelName >Original Regimen </FormLabelName>
                    <Input
                            type="select"
                            name="regimenId"
                            id="regimenId"
                            value={infantMotherArtDto.regimenId}
                            onChange={handleInputChangeInfantMotherArtDto}
                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                            required
                            > 
                                <option value=""> Select</option>    
                                {regimenType.map((value) => (
                                    <option key={value.id} value={value.id}>
                                        {value.description}
                                    </option>
                                ))}
                        </Input>
                        {errors.regimenId !=="" ? (
                            <span className={classes.error}>{errors.regimenId}</span>
                            ) : "" }
                    </FormGroup>
                    </div>
            </div>
            </>)}
            <br/>
            {formFilter.infantArv===false && (<>
            <Label as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}> Infant ARV & CTX</h4>
            </Label>
            <br /><br />
            {/* LAB Screening Form */}
            <div className="row">
            <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Age at CTX Initiation </FormLabelName>
                <Input
                type="select"
                name="ageAtCtx"
                id="ageAtCtx"
                value={infantArvDto.ageAtCtx}
                onChange={handleInputChangeInfantArvDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}  
                >
                   <option value="select">Select </option>
                   {agectx.map((value, index) => (
                        <option key={index} value={value.code}>
                            {value.display}
                        </option>
                    ))}
                  </Input>
                {errors.ageAtCtx !=="" ? (
                <span className={classes.error}>{errors.ageAtCtx}</span>
                ) : "" }
                </FormGroup>   
            </div>
            <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Infant ARV Type </FormLabelName>
                  <Input
                    type="select"
                    name="infantArvType"
                    id="infantArvType"
                    value={infantArvDto.infantArvType}
                    onChange={handleInputChangeInfantArvDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>
                    {infantArv.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.infantArvType !=="" ? (
                      <span className={classes.error}>{errors.infantArvType}</span>
                  ) : "" }
                </FormGroup>
            </div>
            <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName > Timing of ARV Prophylaxis </FormLabelName>
                  <Input
                    type="select"
                    name="arvDeliveryPoint"
                    id="arvDeliveryPoint"
                    value={infantArvDto.arvDeliveryPoint}
                    onChange={handleInputChangeInfantArvDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>
                    <option value="Within 72 hour">Within 72 hour </option>
                    <option value="After 72 hour ">After 72 hour  </option>
                  </Input>
                  {errors.arvDeliveryPoint !=="" ? (
                      <span className={classes.error}>{errors.arvDeliveryPoint}</span>
                  ) : "" }
                </FormGroup>
            </div>
            <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName > Place of Delivery </FormLabelName>
                  <Input
                    type="select"
                    name="infantArvTime"
                    id="infantArvTime"
                    value={infantArvDto.infantArvTime}
                    onChange={handleInputChangeInfantArvDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>
                    <option value="Facility Delivery">Facility Delivery</option>
                    <option value="Delivered outside facility">Delivered outside facility </option>
                  </Input>
                  {errors.infantArvTime !=="" ? (
                      <span className={classes.error}>{errors.infantArvTime}</span>
                  ) : "" }
                </FormGroup>
            </div>
            
            </div>
            </>)}
            <br />
            <Label as='a' color='black' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}> Infant PCR </h4>
            </Label>
            <br /><br />
            {/* LAB Screening Form */}
            <div className="row">
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Age at Test(months)</FormLabelName>
                <Input
                type="number"
                name="ageAtTest"
                id="ageAtTest"
                value={infantPCRTestDto.ageAtTest}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                 
                />
                {errors.ageAtTest !=="" ? (
                <span className={classes.error}>{errors.ageAtTest}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName > Sample Type</FormLabelName>
                  <Input
                    type="select"
                    name="testType"
                    id="testType"
                    value={infantArvDto.testType}
                    onChange={handleInputChangeInfantArvDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>
                    <option value="First PCR">First PCR</option>
                    <option value="Second PCR">Second PCR</option>
                    <option value="Confirmatory PCR">Confirmatory PCR</option>
                    <option value="First Rapid Antibody">First Rapid Antibody </option>
                    <option value="Second Rapid Antibody ">Second Rapid Antibody </option>
                  </Input>
                  {errors.testType !=="" ? (
                      <span className={classes.error}>{errors.testType}</span>
                  ) : "" }
                </FormGroup>
              </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Date sample collected</FormLabelName>
                <Input
                type="date"
                name="dateSampleCollected"
                id="dateSampleCollected"
                value={infantPCRTestDto.dateSampleCollected}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                max={moment(new Date()).format("YYYY-MM-DD")}  
                />
                {errors.dateSampleCollected !=="" ? (
                <span className={classes.error}>{errors.dateSampleCollected}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Date Result Received</FormLabelName>
                <Input
                type="date"
                name="dateResultReceivedAtFacility"
                id="dateResultReceivedAtFacility"
                value={infantPCRTestDto.dateResultReceivedAtFacility}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                max={moment(new Date()).format("YYYY-MM-DD")}   
                />
                {errors.dateResultReceivedAtFacility !=="" ? (
                <span className={classes.error}>{errors.dateResultReceivedAtFacility}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Date Result Received By Caregiver</FormLabelName>
                <Input
                type="date"
                name="dateResultReceivedByCaregiver"
                id="dateResultReceivedByCaregiver"
                value={infantPCRTestDto.dateResultReceivedByCaregiver}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                max={moment(new Date()).format("YYYY-MM-DD")}   
                />
                {errors.dateResultReceivedByCaregiver !=="" ? (
                <span className={classes.error}>{errors.dateResultReceivedByCaregiver}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Date Sample Sent</FormLabelName>
                <Input
                  type="date"
                  name="dateSampleSent"
                  id="dateSampleSent"
                  value={infantPCRTestDto.dateSampleSent}
                  onChange={handleInputChangeInfantPCRTestDto}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  max={moment(new Date()).format("YYYY-MM-DD")}  
                  />
                {errors.dateSampleSent !=="" ? (
                <span className={classes.error}>{errors.dateSampleSent}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-6">
                <FormGroup>
                <FormLabelName >Result *</FormLabelName>
                <Input
                type="select"
                name="results"
                id="results"
                value={infantPCRTestDto.results}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                >
                   {pcrResult.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                </Input>
                {errors.results !=="" ? (
                <span className={classes.error}>{errors.results}</span>
                ) : "" }
                </FormGroup>   
                </div>
            </div>
            <br />
            <br />
            {infantObj && infantObj.hospitalNumber ? (
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
              ) : ""
            }
          </Segment>
        </Grid.Column>

        </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
      
    </div>
  );
};

export default ClinicVisit;
