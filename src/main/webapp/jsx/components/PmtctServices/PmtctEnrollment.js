import React, {useState, useEffect} from 'react';
import { Redirect } from 'react-router-dom';
import {Card,CardBody, FormGroup, Label, Input, InputGroup,InputGroupText} from 'reactstrap';
import {Label as FormLabelName, } from "reactstrap";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory, useLocation } from "react-router-dom";
import 'react-summernote/dist/react-summernote.css'; // import styles
import { Spinner } from "reactstrap";
import {Message } from 'semantic-ui-react'
import moment from "moment";

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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

const AncPnc = (props) => {
    const patientObj = props.patientObj;
    let history = useHistory();

    const location = useLocation();
    const locationState = location && location.state ? location.state : null;
    //console.log(locationState)

    const classes = useStyles()
    const [disabledField, setSisabledField] = useState(false);
    const [entryPoint, setentryPoint] = useState([]);
    const [tbStatus, setTbStatus] = useState([]);
    const [artStartTime, setartStartTime] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [enroll, setEnrollDto]= useState({
            ancNo: patientObj.ancNo?patientObj.ancNo: '' ,
            pmtctEnrollmentDate:"",
            entryPoint: locationState && locationState.pmtctType ? locationState.pmtctType : null,
            ga: props.patientObj.gaweeks,
            gravida: props.patientObj.gravida,
            artStartDate: "",
            artStartTime: "",
            id: "",
            tbStatus:""   ,
            staticHivStatus: '',
            personUuid:  locationState && locationState.patientObj ?  locationState.patientObj.uuid : null,
            patientObj:locationState && locationState.patientObj ? locationState.patientObj : null,
            pmtctType:locationState && locationState.pmtctType ? locationState.pmtctType : null
    })
    useEffect(() => { 
        POINT_ENTRY_PMTCT();
        TIME_ART_INITIATION_PMTCT();
        TB_STATUS();
        if(props.activeContent.id && props.activeContent.id!=="" && props.activeContent.id!==null){
            GetPatientPMTCT(props.activeContent.id)
            setSisabledField(props.activeContent.actionType==='view'?true : false)
        }
    }, []);
    
    const GetPatientPMTCT =(id)=>{
        axios
           .get(`${baseUrl}pmtct/anc/view-pmtct-enrollment/${props.activeContent.id}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
                //console.log(response.data.find((x)=> x.id===id));
                setEnrollDto(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });          
    }
    const POINT_ENTRY_PMTCT =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/POINT_ENTRY_PMTCT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setentryPoint(response.data)
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
            setartStartTime(response.data)
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const TB_STATUS =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/TB_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setTbStatus(response.data)
        })
        .catch((error) => {
        //console.log(error);
        });        
    }
    const handleInputChangeEnrollmentDto = e => {            
        setEnrollDto ({...enroll,  [e.target.name]: e.target.value});
    }

    //FORM VALIDATION
    const validate = () => {
        let temp = { ...errors }        
        temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate ? "" : "This field is required"
        //temp.entryPoint = enroll.entryPoint ? "" : "This field is required"
        //temp.ga = enroll.ga ? "" : "This field is required"
        // temp.gravida = enroll.gravida ? "" : "This field is required"
        temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate ? "" : "This field is required"
        temp.artStartDate = enroll.artStartDate ? "" : "This field is required"
        temp.artStartTime = enroll.artStartTime ? "" : "This field is required"
        temp.tbStatus = enroll.tbStatus ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }

    /**** Submit Button Processing  */
    const handleSubmit = (e) => {

        e.preventDefault();
        if (validate()){             
        setSaving(true);
        if(props.activeContent && props.activeContent.actionType){ //Perform operation for update action
            axios.put(`${baseUrl}pmtct/anc/update-pmtct-enrollment/${props.activeContent.id}`, enroll,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                //props.patientObj.commenced=true
                toast.success("Record updated successful", {position: toast.POSITION.BOTTOM_CENTER});
                props.setActiveContent({...props.activeContent, route:'recent-history'})
            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong", {position: toast.POSITION.BOTTOM_CENTER});
                
            });
        }else{//perform operation for save action
            axios.post(`${baseUrl}pmtct/anc/pmtct-enrollment`, enroll,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
            .then(response => {
                setSaving(false);
                props.patientObj.pmtctRegStatus=true
                toast.success("Enrollment save successful", {position: toast.POSITION.BOTTOM_CENTER});
                //props.setActiveContent({...props.activeContent, route:'recent-history'})
                //return <Redirect to='/patient-history' />
                //history.push("/patient-history");
                history.push({
                    pathname: '/patient-history',
                    state: {  // location state
                        patientObj: locationState.patientObj,
                    },
                });


            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong", {position: toast.POSITION.BOTTOM_CENTER});
                
            });
        }
        }
    }

  return (      
      <div >
                   
        <Card className={classes.root}>
            <CardBody>
            <form >
                <div className="row ">
                <div className="card-header mb-3 " style={{backgroundColor:"#014d88",color:'#fff',fontWeight:'bolder',  borderRadius:"0.2rem", marginTop: '-20px'}}>
                                    <h5 className="card-title" style={{color:'#fff'}}>PMTCT Enrollment</h5>
                </div>

                <h3 className='mb-3'><span>Point of Entry: </span> {  locationState.postValue === 'L&D'? 'Labour and Delivery': locationState.postValue === 'ANC'? 'ANC': `Post Partum:  ${locationState.postValue}`}</h3>
 
         {!true &&     <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >ANC ID
                                 {/* <span style={{ color:"red"}}> *</span> */}
                                 </Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="ancNo"
                                    id="ancNo"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={patientObj.ancNo} 
                                    disabled
                                />

                            </InputGroup>
                            {errors.ancNo !=="" ? (
                                <span className={classes.error}>{errors.ancNo}</span>
                        ) : "" }
                            </FormGroup>
                    </div>}
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Date of Enrollment <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="pmtctEnrollmentDate"
                                    id="pmtctEnrollmentDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.pmtctEnrollmentDate} 
                                    min={props.patientObj.firstAncDate}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    disabled={disabledField}
                                />

                            </InputGroup>
                            {errors.pmtctEnrollmentDate !=="" ? (
                                <span className={classes.error}>{errors.pmtctEnrollmentDate}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    {/* <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Point of Entry <span style={{ color:"red"}}> *</span></Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="entryPoint"
                                id="entryPoint"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.entryPoint} 
                                disabled={disabledField}
                            >
                                <option value="">Select</option>
                                {entryPoint.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.entryPoint !=="" ? (
                                <span className={classes.error}>{errors.entryPoint}</span>
                        ) : "" }
                        </FormGroup>
                    </div>  */}

                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Gravida <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="gravida"
                                    id="gravida"
                                    min="1"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.gravida} 

                                />

                            </InputGroup>
                            {errors.gravida !=="" ? (
                                <span className={classes.error}>{errors.gravida}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Art Start Date <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="artStartDate"
                                    id="artStartDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.artStartDate} 
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    disabled={disabledField}
                                />

                            </InputGroup>
                            {errors.artStartDate !=="" ? (
                                <span className={classes.error}>{errors.artStartDate}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Timing of ART Initiation <span style={{ color:"red"}}> *</span></Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="artStartTime"
                                id="artStartTime"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.artStartTime}
                                disabled={disabledField} 
                            >
                                <option value="">Select</option>
                                {artStartTime.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.artStartTime !=="" ? (
                                <span className={classes.error}>{errors.artStartTime}</span>
                        ) : "" }
                        </FormGroup>
                    </div> 
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >TB Status <span style={{ color:"red"}}> *</span></Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="tbStatus"
                                id="tbStatus"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.tbStatus} 
                                disabled={disabledField}
                            >
                                <option value="">Select</option>
                                {tbStatus.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.tbStatus !=="" ? (
                                <span className={classes.error}>{errors.tbStatus}</span>
                        ) : "" }
                        </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                          <Label>
                            HIV Status <span style={{ color: "red" }}> *</span>
                          </Label>
                          <InputGroup>
                            <Input
                              type="select"
                              name="staticHivStatus"
                              id="staticHivStatus"
                              onChange={handleInputChangeEnrollmentDto}
                              value={enroll.staticHivStatus}
                            >
                              <option value="">Select</option>
                              <option value="Positive">Positive</option>
                              <option value="Negative">Negative</option>
                              <option value="Unknown">Unknown</option>
                            </Input>
                          </InputGroup>
                          {errors.staticHivStatus !== "" ? (
                            <span className={classes.error}>
                              {errors.staticHivStatus}
                            </span>
                          ) : (
                            ""
                          )}
                        </FormGroup>
                      </div>

                </div>
                
                {saving ? <Spinner /> : ""}
                <br />

               { props.hideUpdateButton && <>
                {props.activeContent && props.activeContent.actionType? (<>
                    <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    hidden={disabledField}
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    style={{backgroundColor:"#014d88"}}
                    onClick={handleSubmit}
                    disabled={saving}
                    >
                        {!saving ? (
                        <span style={{ textTransform: "capitalize" }}>Update</span>
                        ) : (
                        <span style={{ textTransform: "capitalize" }}>Updating...</span>
                        )}
                </MatButton>
                </>):(<>
                    <MatButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        startIcon={<SaveIcon />}
                        style={{backgroundColor:"#014d88"}}
                        onClick={handleSubmit}
                        disabled={saving}
                        >
                            {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Save</span>
                            ) : (
                            <span style={{ textTransform: "capitalize" }}>Saving...</span>
                            )}
                </MatButton>
                </>)}
                </>}
                </form>
            </CardBody>
        </Card> 
                  
    </div>
  );
}

export default AncPnc;
