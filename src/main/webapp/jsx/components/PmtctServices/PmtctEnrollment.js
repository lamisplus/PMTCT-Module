import React, {useState, useEffect} from 'react';
import {Card,CardBody, FormGroup, Label, Input, InputGroup,InputGroupText} from 'reactstrap';
import {Label as FormLabelName, } from "reactstrap";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { useHistory } from "react-router-dom";
import 'react-summernote/dist/react-summernote.css'; // import styles
import { Spinner } from "reactstrap";
import {Message } from 'semantic-ui-react'
import moment from "moment";

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
    console.log(patientObj)
    let history = useHistory();
    const classes = useStyles()
    const [pointOfEntry, setPointOfEntry] = useState([]);
    const [tbStatus, setTbStatus] = useState([]);
    const [timingOfArtInitiation, setTimingOfArtInitiation] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [enroll, setEnrollDto]= useState({
            ancNo: patientObj.ancNo,
            pmtctEnrollmentDate:"",
            pointOfEntry: "",
            ga: props.patientObj.gaweeks,
            gravida: props.patientObj.gravida,
            artStartDate: "",
            timingOfArtInitiation: "",
            id: "",
            tbStatus:""            
    })
    useEffect(() => { 
        POINT_ENTRY_PMTCT();
        TIME_ART_INITIATION_PMTCT();
        TB_STATUS();
    }, []);
    const POINT_ENTRY_PMTCT =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/POINT_ENTRY_PMTCT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPointOfEntry(response.data)
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
        temp.pointOfEntry = enroll.pointOfEntry ? "" : "This field is required"
        temp.ga = enroll.ga ? "" : "This field is required"
        temp.gravida = enroll.gravida ? "" : "This field is required"
        temp.pmtctEnrollmentDate = enroll.pmtctEnrollmentDate ? "" : "This field is required"
        temp.artStartDate = enroll.artStartDate ? "" : "This field is required"
        temp.timingOfArtInitiation = enroll.timingOfArtInitiation ? "" : "This field is required"
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
        axios.post(`${baseUrl}pmtct/anc/pmtct-enrollment`, enroll,
        { headers: {"Authorization" : `Bearer ${token}`}},
        
        )
            .then(response => {
                setSaving(false);
                props.patientObj.pmtctRegStatus=true
                toast.success("Enrollment save successful", {position: toast.POSITION.BOTTOM_CENTER});
                props.setActiveContent({...props.activeContent, route:'recent-history'})

            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong", {position: toast.POSITION.BOTTOM_CENTER});
                
            });
        }
    }

  return (      
      <div >
                   
        <Card className={classes.root}>
            <CardBody>
            <form >
                <div className="row">
                <h2>PMTCT Enrollment</h2>
                <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >ANC ID *</Label>
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
                    </div>
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Date of Enrollment *</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="pmtctEnrollmentDate"
                                    id="pmtctEnrollmentDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.pmtctEnrollmentDate} 
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                />

                            </InputGroup>
                            {errors.pmtctEnrollmentDate !=="" ? (
                                <span className={classes.error}>{errors.pmtctEnrollmentDate}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Point of Entry *</Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="pointOfEntry"
                                id="pointOfEntry"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.pointOfEntry} 
                            >
                                <option value="">Select</option>
                                {pointOfEntry.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.pointOfEntry !=="" ? (
                                <span className={classes.error}>{errors.pointOfEntry}</span>
                        ) : "" }
                        </FormGroup>
                    </div> 
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >GA *</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="ga"
                                    id="ga"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.ga} 
                                    disabled
                                />

                            </InputGroup>
                            {errors.ga !=="" ? (
                                <span className={classes.error}>{errors.ga}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Gravida *</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="gravida"
                                    id="gravida"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.gravida} 
                                    disabled
                                />

                            </InputGroup>
                            {errors.gravida !=="" ? (
                                <span className={classes.error}>{errors.gravida}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Art Start Date *</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="artStartDate"
                                    id="artStartDate"
                                    onChange={handleInputChangeEnrollmentDto}
                                    value={enroll.artStartDate} 
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                />

                            </InputGroup>
                            {errors.artStartDate !=="" ? (
                                <span className={classes.error}>{errors.artStartDate}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Timing of ART Initiation *</Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="timingOfArtInitiation"
                                id="timingOfArtInitiation"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.timingOfArtInitiation} 
                            >
                                <option value="">Select</option>
                                {timingOfArtInitiation.map((value, index) => (
                                    <option key={index} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                            </Input>

                        </InputGroup>
                        {errors.timingOfArtInitiation !=="" ? (
                                <span className={classes.error}>{errors.timingOfArtInitiation}</span>
                        ) : "" }
                        </FormGroup>
                    </div> 
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >TB Status *</Label>
                        <InputGroup> 
                            <Input 
                                type="select"
                                name="tbStatus"
                                id="tbStatus"
                                onChange={handleInputChangeEnrollmentDto}
                                value={enroll.tbStatus} 
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
                </div>
                
                {saving ? <Spinner /> : ""}
            <br />
            
            <MatButton
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<SaveIcon />}
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
                
            >
                <span style={{ textTransform: "capitalize" }}>Cancel</span>
            </MatButton>
            
                </form>
            </CardBody>
        </Card> 
                  
    </div>
  );
}

export default AncPnc;
