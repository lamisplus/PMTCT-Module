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
  let temp = { ...errors }
  const classes = useStyles()
  const [saving, setSaving] = useState(false);
  const [infants, setInfants] = useState([])
  const [fp, setFp] = useState([]);
  //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState(
          {
            bodyWeight: "",
            diastolic: "",
            height: "",
            systolic: "",
            pulse:"",
            temperature:"",
            respiratoryRate:"" 
          })
  const [objValues, setObjValues] = useState({
    ancNo: patientObj.ancNo,
    dateOfViralLoad: "",
    dateOfVisit: "",
    dateOfmeternalOutcome: "",
    dsd: "",
    dsdModel: "",
    dsdOption: "",
    enteryPoint: "",
    fpCounseling: "",
    fpMethod: "",
    gaOfViralLoad: "",
    id: "",
    maternalOutcome: "",
    nextAppointmentDate: "",
    personUuid: patientObj.person_uuid,
    resultOfViralLoad: "",
    transferTo: "",
    visitStatus: "",
    timeOfViralLoad: "",
  }
  );
  const [vital, setVitalSignDto] = useState({
    bodyWeight: "",
    diastolic: "",
    encounterDate: "",
    facilityId: 1,
    height: "",
    personId: props.patientObj.id,
    serviceTypeId: 1,
    systolic: "",
    pulse:"",
    temperature:"",
    respiratoryRate:"" 
  })
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
  const handleInputChange = e => {
    setErrors({...temp, [e.target.name]:""}) 
    
    //console.log(e.target.name)
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
    
  }
  const handleInputChangeVitalSignDto = e => {
    setVitalSignDto({ ...vital, [e.target.name]: e.target.value });
  } 

  //Validations of the forms
  const validate = () => {       
    temp.visitStatus = objValues.visitStatus ? "" : "This field is required"
    temp.dateOfVisit = objValues.dateOfVisit ? "" : "This field is required"
    temp.dsd = objValues.dsd ? "" : "This field is required"
    temp.enteryPoint = objValues.enteryPoint ? "" : "This field is required"
    temp.fpCounseling = objValues.fpCounseling ? "" : "This field is required"
    temp.fpMethod = objValues.fpMethod ? "" : "This field is required"
    temp.dateOfmeternalOutcome = objValues.dateOfmeternalOutcome ? "" : "This field is required"
    temp.maternalOutcome = objValues.maternalOutcome ? "" : "This field is required"
    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
  const handleInputValueCheckBodyWeight =(e)=>{
    if(e.target.name==="bodyWeight" && (e.target.value < 3 || e.target.value>150)){      
      const message ="Body weight must not be greater than 150 and less than 3"
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:""})
    }
  }

  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validate()){
    setSaving(true)
    axios.post(`${baseUrl}pmtct/anc/pmtct-visit`, objValues,
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
          console.log(obj)
          setInfantObj(obj)
          //alert(obj)
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
                    name="dateOfVisit"
                    id="dateOfVisit"
                    value={objValues.dateOfVisit}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChange}
                    //={props.patientObj && props.patientObj.artCommence ? props.patientObj.artCommence.visitDate : null}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                    required
                  />
                 {errors.dateOfVisit !=="" ? (
                      <span className={classes.error}>{errors.dateOfVisit}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Mother ANC number *</FormLabelName>
                  <Input
                    type="text"
                    name="motherAncNumber"
                    id="motherAncNumber"
                    value={objValues.motherAncNumber}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChange}
                    disabled
                  />
                 {errors.motherAncNumber !=="" ? (
                      <span className={classes.error}>{errors.motherAncNumber}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Body Weight</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeVitalSignDto}
                                min="3"
                                max="150"
                                value={vital.bodyWeight}
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
            </div>
            <div className="row">
              
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Timing of mother's ART Initiation </FormLabelName>
                  <Input
                    type="select"
                    name="enteryPoint"
                    id="enteryPoint"
                    value={objValues.enteryPoint}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                   
                  </Input>
                  {errors.enteryPoint !=="" ? (
                      <span className={classes.error}>{errors.enteryPoint}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Mother's ART Regimen </FormLabelName>
                  <Input
                    type="select"
                    name="fpCounseling"
                    id="fpCounseling"
                    value={objValues.fpCounseling}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                   
                  </Input>
                  {errors.fpCounseling !=="" ? (
                      <span className={classes.error}>{errors.fpCounseling}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName >Infant ARV Type </FormLabelName>
                  <Input
                    type="select"
                    name="fpMethod"
                    id="fpMethod"
                    value={objValues.fpMethod}
                    onChange={handleInputChange}
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
                  {errors.fpMethod !=="" ? (
                      <span className={classes.error}>{errors.fpMethod}</span>
                  ) : "" }
                </FormGroup>
              </div>
            </div>
            {/* <div className="row">
              
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >Point of Entry*</FormLabelName>
                  <Input
                    type="select"
                    name="enteryPoint"
                    id="enteryPoint"
                    value={objValues.enteryPoint}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="select">Select </option>

                    {entryPoint.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.enteryPoint !=="" ? (
                      <span className={classes.error}>{errors.enteryPoint}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >FP Counselling *</FormLabelName>
                  <Input
                    type="select"
                    name="fpCounseling"
                    id="fpCounseling"
                    value={objValues.fpCounseling}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="YES">YES </option>
                    <option value="NO">NO </option>
                   
                  </Input>
                  {errors.fpCounseling !=="" ? (
                      <span className={classes.error}>{errors.fpCounseling}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-3">
                <FormGroup>
                  <FormLabelName >FP Method *</FormLabelName>
                  <Input
                    type="select"
                    name="fpMethod"
                    id="fpMethod"
                    value={objValues.fpMethod}
                    onChange={handleInputChange}
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
                  {errors.fpMethod !=="" ? (
                      <span className={classes.error}>{errors.fpMethod}</span>
                  ) : "" }
                </FormGroup>
              </div>
            </div> */}
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>Infant CTX</h4>
            </Label>
            <br />
            {/* LAB Screening Form */}
            <div className="row">
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Age at CTX Initiation</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Age at Test(months)</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date sample collected</FormLabelName>
                <Input
                type="date"
                name="dateOfViralLoad"
                id="dateOfViralLoad"
                value={objValues.dateOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}  
                />
                {errors.dateOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.dateOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date sample sent</FormLabelName>
                <Input
                type="date"
                name="dateOfViralLoad"
                id="dateOfViralLoad"
                value={objValues.dateOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}  
                />
                {errors.dateOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.dateOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date Result received at facility</FormLabelName>
                <Input
                type="date"
                name="dateOfViralLoad"
                id="dateOfViralLoad"
                value={objValues.dateOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}  
                />
                {errors.dateOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.dateOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date caregiver given result</FormLabelName>
                <Input
                type="date"
                name="dateOfViralLoad"
                id="dateOfViralLoad"
                value={objValues.dateOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                //min={patientObj.pmtctEnrollmentRespondDto.pmtctEnrollmentDate}
                max={moment(new Date()).format("YYYY-MM-DD")}  
                />
                {errors.dateOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.dateOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Result *</FormLabelName>
                <Input
                type="text"
                name="resultOfViralLoad"
                id="resultOfViralLoad"
                value={vital.nextAppointment}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                />
                {errors.resultOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.resultOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
            </div>
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}> 2nd PCR 12 weeks after cessation of breastfeeding or as indicated  </h4>
            </Label>
            <br />
            {/* LAB Screening Form */}
            <div className="row">
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Age at Test(months)</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date sample collected</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Result *</FormLabelName>
                <Input
                type="text"
                name="resultOfViralLoad"
                id="resultOfViralLoad"
                value={vital.nextAppointment}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                />
                {errors.resultOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.resultOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
            </div>
            <br />
            <br />
            <Label as='a' color='teal' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>    Infant Testing(Rapid test) - 1st Rapid Antibody Test 9 months of age or 1st contact after  </h4>
            </Label>
            <br />
            {/* LAB Screening Form */}
            <div className="row">
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Age at Test(months)</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Date sample collected</FormLabelName>
                <Input
                type="number"
                name="gaOfViralLoad"
                id="gaOfViralLoad"
                value={objValues.gaOfViralLoad}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                min={vital.encounterDate}   
                />
                {errors.gaOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.gaOfViralLoad}</span>
                ) : "" }
                </FormGroup>   
                </div>
                <div className=" mb-3 col-md-4">
                <FormGroup>
                <FormLabelName >Result *</FormLabelName>
                <Input
                type="text"
                name="resultOfViralLoad"
                id="resultOfViralLoad"
                value={vital.nextAppointment}
                onChange={handleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}} 
                />
                {errors.resultOfViralLoad !=="" ? (
                <span className={classes.error}>{errors.resultOfViralLoad}</span>
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
