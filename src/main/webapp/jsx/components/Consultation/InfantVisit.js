import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, Icon, List, Button, Card,Feed } from 'semantic-ui-react'
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
import { Pointer } from "highcharts";


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
  const [fp, setFp] = useState([]);

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
      visitStatus: ""
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
    FAMILY_PLANNING_METHOD();
    InfantInfo();
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

  function GetInfantDetail(obj){
           setInfantHospitalNumber(obj.hospitalNumber)
          setInfantObj(obj)
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
                        <FormLabelName >CTX Status</FormLabelName>
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
                        <option value="YES">YES </option>
                        <option value="NO">NO </option>
                       
                      </Input>
                      {errors.breastFeeding !=="" ? (
                            <span className={classes.error}>{errors.breastFeeding}</span>
                        ) : "" }

                      </FormGroup>
                    </div>              
            </div>
           
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>  Mother's ART </h4>
            </Label>
            <br /><br />
            <div className="row">
              <div className=" mb-3 col-md-6">
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

                   
                  </Input>
                  {errors.motherArtInitiationTime !=="" ? (
                      <span className={classes.error}>{errors.motherArtInitiationTime}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Mother's ART Regimen </FormLabelName>
                  <Input
                    type="select"
                    name="motherArtRegimen"
                    id="motherArtRegimen"
                    value={infantMotherArtDto.motherArtRegimen}
                    onChange={handleInputChangeInfantMotherArtDto}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                   
                  </Input>
                  {errors.motherArtRegimen !=="" ? (
                      <span className={classes.error}>{errors.motherArtRegimen}</span>
                  ) : "" }
                </FormGroup>
              </div>
             
            </div>
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
                type="number"
                name="ageAtCtx"
                id="ageAtCtx"
                value={infantArvDto.ageAtCtx}
                onChange={handleInputChangeInfantArvDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}  
                >
                   <option value="select">Select </option>
                    <option value="<2 Months"> {"<"} 2 Months </option>
                    <option value=">=2 Months">{">"} 2 Months  </option>
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
                    {fp.map((value) => (
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
                  <FormLabelName > Hours Outcome </FormLabelName>
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
            <br />
            <Label as='a' color='black' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}> Infant PCR </h4>
            </Label>
            <br />
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
                <div className=" mb-3 col-md-4">
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
                    <option value="Frist PCR">Frist PCR</option>
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
                type="text"
                name="results"
                id="results"
                value={infantPCRTestDto.results}
                onChange={handleInputChangeInfantPCRTestDto}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                />
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
