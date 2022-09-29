import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, Icon, List, Button, Card, } from 'semantic-ui-react'
// Page titie
import { FormGroup, Input, Label as FormLabelName, InputGroup, InputGroupText } from "reactstrap";
import ADR from './ADR/Index'
import OpportunisticInfection from './OpportunisticInfection/Index'
import TBScreening from './TBScreening/Index'
import { url as baseUrl, token } from "../../../api";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import axios from "axios";
//import AddVitals from './Vitals/AddVitals'
import AddAllergy from './Allergies/AddAllergy'
import AddCondition from './Conditions/AddCondition'
import PostPatient from './PostPatient/Index'
import moment from "moment";
import { toast } from "react-toastify";



let adherenceLevelObj = []
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
  const patientObj = props.patientObj ? props.patientObj : {}
  const [errors, setErrors] = useState({});
  let temp = { ...errors }
  const classes = useStyles()
  const [getPatientObj, setGetPatientObj] = useState({});
  const [saving, setSaving] = useState(false);
  const [clinicalStage, setClinicalStage] = useState([]);
  const [functionalStatus, setFunctionalStatus] = useState([]);
  const [adherenceLevel, setAdherenceLevel] = useState([]);
  const [tbStatus, setTbStatus] = useState([]);
  const [TBForms, setTBForms] = useState(false)
  // const [addVitalModal, setAddVitalModal] = useState(false);
  // const AddVitalToggle = () => setAddVitalModal(!addVitalModal)
  const [addConditionModal, setAddConditionModal] = useState(false);
  const AddConditionToggle = () => setAddConditionModal(!addConditionModal)
  const [addAllergyModal, setAddAllergyModal] = useState(false);
  const AddAllergyToggle = () => setAddAllergyModal(!addAllergyModal)
  const [postPatientModal, setPostPatientModal] = useState(false);
  const PostPatientToggle = () => setPostPatientModal(!postPatientModal)
  const [currentVitalSigns, setcurrentVitalSigns] = useState({})
  const [showCurrentVitalSigns, setShowCurrentVitalSigns] = useState(false)
  //opportunistic infection Object
  const [infection, setInfection] = useState({ illnessInfection: "", ondateInfection: "" });
  const [infectionList, setInfectionList] = useState([]);
  //ADR array Object 
  const [adrObj, setAdrObj] = useState({ adr: "", adrOnsetDate: "" });
  const [adrList, setAdrList] = useState([]);
  //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
                                                                    bodyWeight: "",
                                                                    diastolic: "",
                                                                    height: "",
                                                                    systolic: ""
                                                                  })
  const [objValues, setObjValues] = useState({
    adherenceLevel: "",
    adheres: {},
    adrScreened: "",
    adverseDrugReactions: {},
    artStatusId: "" ,
    cd4: "",
    cd4Percentage: 0,
    clinicalNote: "",
    clinicalStageId: 0,
    facilityId: 0,
    functionalStatusId: 0,
    hivEnrollmentId: "",
    nextAppointment: "",
    lmpDate: "",
    oiScreened: "",
    opportunisticInfections: {},
    personId: patientObj.id,
    tbScreen: {},
    stiIds: "",
    stiTreated: "",
    uuid: "",
    visitDate: "",
    whoStagingId: 0
  });
  const [vital, setVitalSignDto] = useState({
    bodyWeight: "",
    diastolic: "",
    encounterDate: "",
    facilityId: 1,
    height: "",
    personId: props.patientObj.id,
    serviceTypeId: 1,
    systolic: ""
  })
  const [tbObj, setTbObj] = useState({
    currentOnIpt: "",
    coughing: "",
    antiTBDrug: "",
    nightSweat: "",
    fever: "",
    contactWithTBCase: "",
    lethergy: "",
    tbStatusId: ""
  });

  useEffect(() => {
    FunctionalStatus();
    WhoStaging();
    AdherenceLevel();
    TBStatus();
    VitalSigns()
    GetPatientObj()
  }, []);
  //Check for the last Vital Signs
  const VitalSigns = () => {
    axios
      .get(`${baseUrl}patient/vital-sign/person/${props.patientObj.id}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {

        const lastVitalSigns = response.data[response.data.length - 1]
        if (lastVitalSigns.encounterDate === moment(new Date()).format("YYYY-MM-DD") === true) {
          console.log(lastVitalSigns)
          setcurrentVitalSigns(lastVitalSigns)
          setShowCurrentVitalSigns(true)
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  }
    //Get The updated patient objeect
    const GetPatientObj = () => {
      axios
        .get(`${baseUrl}hiv/patients`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          const patObJ= response.data.filter((x)=> x.id===props.patientObj.id)

          setGetPatientObj(patObJ[0])
        })
        .catch((error) => {
          //console.log(error);
        });
    }

  //Get list of WhoStaging
  const WhoStaging = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CLINICAL_STAGE`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        //console.log(response.data);
        setClinicalStage(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });

  }
  ///GET LIST OF FUNCTIONAL%20_STATUS
  // TB STATUS
  const TBStatus = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/TB_STATUS`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        //console.log(response.data);
        setTbStatus(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });

  }

  async function FunctionalStatus() {
    axios
      .get(`${baseUrl}application-codesets/v2/FUNCTIONAL%20_STATUS`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {

        setFunctionalStatus(response.data);
        //setValues(response.data)
      })
      .catch((error) => {
      });
  }
  ///Level of Adherence
  async function AdherenceLevel() {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        setAdherenceLevel(response.data);

      })
      .catch((error) => {
      });
  }
  const handleInputChange = e => {
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
    if (e.target.name === "whoStagingId") {
      if (e.target.value === "NO") {
        setTBForms(true)
      } else {
        setTBForms(false)
      }
    }
  }
  const handleInputChangeVitalSignDto = e => {
    setVitalSignDto({ ...vital, [e.target.name]: e.target.value });
  }

  const addConditionsModal = () => {
    //setpatientObj({...patientObj, ...row});
    setAddConditionModal(!addConditionModal)
  }
  const addAllergiesModal = () => {
    //setpatientObj({...patientObj, ...row});
    setAddAllergyModal(!addAllergyModal)
  }
  const PostPatientService = (row) => {
    //setpatientObj({...patientObj, ...row});
    setPostPatientModal(!postPatientModal)
  }
  //Handle CheckBox 
  const handleCheckBox = e => {
    if (e.target.checked) {
      //currentVitalSigns.personId === null ? props.patientObj.id : currentVitalSigns.personId
      console.log(currentVitalSigns)
      setVitalSignDto({ ...currentVitalSigns })
    } else {
      setVitalSignDto({
        bodyWeight: "",
        diastolic: "",
        encounterDate: "",
        facilityId: "",
        height: "",
        personId: props.patientObj.id,
        serviceTypeId: 1,
        systolic: ""
      })
    }
  }
  //to check the input value for clinical decision 
  const handleInputValueCheckHeight =(e)=>{
    if(e.target.name==="height" && (e.target.value < 48.26 || e.target.value>216.408)){
      const message ="Height cannot be greater than 216.408 and less than 48.26"
      setVitalClinicalSupport({...vitalClinicalSupport, height:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, height:""})
    }
  }
  const handleInputValueCheckBodyWeight =(e)=>{
    if(e.target.name==="bodyWeight" && (e.target.value < 3 || e.target.value>150)){      
      const message ="Body weight must not be greater than 150 and less than 3"
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:""})
    }
  }
  const handleInputValueCheckSystolic =(e)=>{
    if(e.target.name==="systolic" && (e.target.value < 90 || e.target.value>240)){      
      const message ="Blood Pressure systolic must not be greater than 240 and less than 90"
      setVitalClinicalSupport({...vitalClinicalSupport, systolic:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, systolic:""})
    }
  }
  const handleInputValueCheckDiastolic =(e)=>{
    if(e.target.name==="diastolic" && (e.target.value < 60 || e.target.value>140)){      
      const message ="Blood Pressure diastolic must not be greater than 140 and less than 60"
      setVitalClinicalSupport({...vitalClinicalSupport, diastolic:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, diastolic:""})
    }
  }
  //Validations of the forms
  const validate = () => {        
    temp.encounterDate = vital.encounterDate ? "" : "This field is required"
    temp.labTestGroupId = vital.diastolic ? "" : "This field is required"
    temp.systolic = vital.systolic ? "" : "This field is required"
    temp.height = vital.height ? "" : "This field is required"
    temp.bodyWeight = vital.bodyWeight ? "" : "This field is required"
    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(getPatientObj)
    if(validate()){
    setSaving(true)
    objValues.visitDate = vital.encounterDate
    objValues.adverseDrugReactions = adrList
    objValues.artStatusId = getPatientObj.artCommence.id
    objValues.hivEnrollmentId = getPatientObj.enrollment.id
    objValues.opportunisticInfections = infectionList
    objValues.tbScreen = tbObj
    objValues['vitalSignDto'] = vital
    axios.post(`${baseUrl}hiv/art/clinic-visit/`, objValues,
      { headers: { "Authorization": `Bearer ${token}` } },

    )
      .then(response => {
        setSaving(false);
        toast.success("Clinic Visit save successful");
        props.setActiveContent('recent-history')
      })
      .catch(error => {
        setSaving(false);
        let errorMessage = error.response.data && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
        toast.error(errorMessage);
       
      });
    }
  }


  return (
    <div>
      <h2>Clinic Follow-up Visit</h2>
      <Grid columns='equal'>
        {/* <Grid.Column>
          {showCurrentVitalSigns && (
            <Segment>
              <Label as='a' color='blue' ribbon>
                Recent Vitals
              </Label>
              <br />
              <List celled>
                {currentVitalSigns.pulse!==null ? <List.Item>Pulse <span className="float-end"><b>{currentVitalSigns.pulse}bpm</b></span></List.Item> :""}
                {currentVitalSigns.respiratoryRate!==null ?<List.Item>Respiratory Rate <span className="float-end"><b>{currentVitalSigns.respiratoryRate}bpm</b></span></List.Item> :""}
                 {currentVitalSigns.temperature!==null ?<List.Item>Temperature <span className="float-end"><b>{currentVitalSigns.temperature}<sup>0</sup>C</b></span></List.Item> :""}
                 {currentVitalSigns.systolic!==null && currentVitalSigns.diastolic!==null ?<List.Item>Blood Presure <span className="float-end"><b>{currentVitalSigns.systolic}/{currentVitalSigns.diastolic}</b> mmHg</span></List.Item> :""}
                 {currentVitalSigns.height!==null ?<List.Item>Height <span className="float-end"><b>{currentVitalSigns.height}cm</b></span></List.Item> :""}
                 {currentVitalSigns.bodyWeight!==null ?<List.Item>Weight <span className="float-end"><b>{currentVitalSigns.bodyWeight}kg</b></span></List.Item> :""}
              </List>
            </Segment>
          )}
          <Segment>
            <Label as='a' color='black' ribbon>
              Conditions
            </Label>
            <Label as='a' color='teal' onClick={() => addConditionsModal()} className="float-end" size='mini' >
              <Icon name='plus' />
            </Label>
            <br />
            <Label as='a' color='white' size="mini" pointing>
              Laser Fever
            </Label>
            <Label as='a' color='white' size="mini" pointing>
              Typoid Fever
            </Label>
            <Label as='a' color='white' size="mini" pointing>
              Asthma
            </Label>

          </Segment>
          <Segment>
            <Label as='a' color='red' ribbon>
              Allergies
            </Label>
            <Label as='a' color='teal' onClick={() => addAllergiesModal()} className="float-end" size='mini' >
              <Icon name='plus' />
            </Label>
            <br /><br />
            <Label.Group color='blue'>

              <Label as='a' size="mini">dust</Label>
              <Label as='a' size="mini">smoke</Label>

            </Label.Group>

          </Segment>
        </Grid.Column> */}
        <Grid.Column width={12}>
          <Segment>
            <Label as='a' color='blue' ribbon>
              <b>Vital Signs</b>
            </Label>
            <br /><br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date of Visit </FormLabelName>
                  <Input
                    type="date"
                    name="encounterDate"
                    id="encounterDate"
                    value={vital.encounterDate}
                    onChange={handleInputChangeVitalSignDto}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    required
                  />
                 {errors.encounterDate !=="" ? (
                      <span className={classes.error}>{errors.encounterDate}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                {showCurrentVitalSigns && (
                  <div className="form-check custom-checkbox ml-1 ">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="currentVitalSigns"
                      id="currentVitalSigns"
                      onChange={handleCheckBox}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="basic_checkbox_1"
                    >
                      use current Vital Signs
                    </label>
                  </div>
                )}
              </div>
              <div className="mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Body Weight</FormLabelName>

                  <InputGroup>
                    <InputGroupText>
                      kg
                    </InputGroupText>
                    <Input
                      type="number"
                      name="bodyWeight"
                      id="bodyWeight"
                      onChange={handleInputChangeVitalSignDto}
                      min="3"
                      max="150"
                      value={vital.bodyWeight}
                      onKeyUp={handleInputValueCheckBodyWeight}
                    />
                  </InputGroup>
                  {vitalClinicalSupport.bodyWeight !=="" ? (
                    <span className={classes.error}>{vitalClinicalSupport.bodyWeight}</span>
                  ) : ""}
                  {errors.bodyWeight !=="" ? (
                      <span className={classes.error}>{errors.bodyWeight}</span>
                  ) : "" }
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Height</FormLabelName>
                  <InputGroup>
                    <InputGroupText>
                      cm
                    </InputGroupText>
                    <Input
                      type="number"
                      name="height"
                      id="height"
                      onChange={handleInputChangeVitalSignDto}
                      value={vital.height}
                      min="48.26"
                      max="216.408"
                      onKeyUp={handleInputValueCheckHeight}
                    />

                  </InputGroup>
                  {vitalClinicalSupport.height !=="" ? (
                    <span className={classes.error}>{vitalClinicalSupport.height}</span>
                  ) : ""}
                  {errors.height !=="" ? (
                      <span className={classes.error}>{errors.height}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Blood Pressure</FormLabelName>
                  <InputGroup>
                    <InputGroupText>
                      systolic(mmHg)
                    </InputGroupText>
                    <Input
                      type="number"
                      name="systolic"
                      id="systolic"
                      min="90"
                      max="2240"
                      onChange={handleInputChangeVitalSignDto}
                      value={vital.systolic}
                      onKeyUp={handleInputValueCheckSystolic}
                    />

                  </InputGroup>
                  {vitalClinicalSupport.systolic !=="" ? (
                    <span className={classes.error}>{vitalClinicalSupport.systolic}</span>
                  ) : ""}
                  {errors.systolic !=="" ? (
                      <span className={classes.error}>{errors.systolic}</span>
                  ) : "" }
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Blood Pressure</FormLabelName>

                  <InputGroup>
                    <InputGroupText>
                      diastolic(mmHg)
                    </InputGroupText>
                    <Input
                      type="text"
                      name="diastolic"
                      id="diastolic"
                      onChange={handleInputChangeVitalSignDto}
                      value={vital.diastolic}
                      onKeyUp={handleInputValueCheckDiastolic}
                    />

                  </InputGroup>
                  {vitalClinicalSupport.diastolic !=="" ? (
                    <span className={classes.error}>{vitalClinicalSupport.diastolic}</span>
                  ) : ""}
                  {errors.diastolic !=="" ? (
                      <span className={classes.error}>{errors.diastolic}</span>
                  ) : "" }
                </FormGroup>
              </div>
            </div>
            <Label as='a' color='black' ribbon>
              <b>Consultation</b>
            </Label>
            <br /><br />

            <div className=" mb-3">
              <FormLabelName >Clinical Notes</FormLabelName>
              <textarea
                name="clinicalNote"
                className="form-control"
                value={objValues.clinicalNote}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="row">

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >WHO Staging</FormLabelName>
                  <Input
                    type="select"
                    name="whoStagingId"
                    id="whoStagingId"
                    value={objValues.whoStagingId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="select">Select </option>

                    {clinicalStage.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>

                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Functional Status</FormLabelName>
                  <Input
                    type="select"
                    name="functionalStatusId"
                    id="functionalStatusId"
                    value={objValues.functionalStatusId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="select">Select </option>

                    {functionalStatus.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Level of Adherence</FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={objValues.adherenceLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="select">Select </option>

                    {adherenceLevel.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>

            </div>
            <br />
            <Label as='a' color='red' ribbon>
              Opportunistic Infection
            </Label>
            <br /><br />
            <OpportunisticInfection setInfection={setInfection} infection={infection} setInfectionList={setInfectionList} infectionList={infectionList} />
            <br />
            <Label as='a' color='pink' ribbon>
              ADR
            </Label>
            <br /><br />
            <ADR setAdrObj={setAdrObj} adrObj={adrObj} setAdrList={setAdrList} adrList={adrList} />
            <br />
            <Label as='a' color='teal' ribbon>
              TB Screening
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <TBScreening tbObj={tbObj} setTbObj={setTbObj} />
            <br />
            <Label as='a' color='blue' ribbon>
              Next Clinical Appointment Date
            </Label>
            <br /><br />
            {/* TB Screening Form */}
            <Input
                    type="date"
                    name="nextAppointment"
                    id="nextAppointment"
                    value={vital.nextAppointment}
                    onChange={handleInputChange}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    required
                  />
            <br />
            <MatButton
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={saving}
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
            >
              {!saving ? (
                <span style={{ textTransform: "capitalize" }}>Save</span>
              ) : (
                <span style={{ textTransform: "capitalize" }}>Saving...</span>
              )}
            </MatButton>
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment>
            <List>
              <List.Item>
                {/* <Button icon labelPosition='right' color='teal' fluid onClick={() => PostPatientService()}>
                  <Icon name='external alternate' />
                  Post Patient
                </Button> */}
              </List.Item>
              {/* <List.Item>
                  <Button icon labelPosition='right' color='green' fluid>
                      <Icon name='eye' />
                        View History
                    </Button>
                  </List.Item> */}
              {/* <List.Item>
                <Button icon labelPosition='right' color='blue' fluid>
                  <Icon name='calendar alternate' />
                  Appointment
                </Button>
              </List.Item> */}
            </List>
            <Card>
              <Card.Content>
                <b>Previous Clinical Notes</b>
              </Card.Content>
              <Card.Content>
                {/* <Feed>
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Date content='20-03-2022' />
                    <Feed.Summary>
                      The malaria is plus 3 and and need more attention
                    </Feed.Summary>
                  </Feed.Content>
                </Feed.Event>
                <hr/>
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Date content='20-05-2022' />
                    <Feed.Summary>
                      Blood presure is too high
                    </Feed.Summary>
                  </Feed.Content>
                </Feed.Event>
              </Feed> */}
              </Card.Content>
            </Card>

          </Segment>
        </Grid.Column>
        </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
      <AddAllergy toggle={AddAllergyToggle} showModal={addAllergyModal} />
      <AddCondition toggle={AddConditionToggle} showModal={addConditionModal} />
      <PostPatient toggle={PostPatientToggle} showModal={postPatientModal} />
    </div>
  );
};

export default ClinicVisit;
