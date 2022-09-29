import React, {useState, useEffect} from 'react';
import {Card,CardBody, FormGroup, Label, Input, InputGroup} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "./../../../api";
import { useHistory } from "react-router-dom";
import 'react-summernote/dist/react-summernote.css'; // import styles
import { Spinner } from "reactstrap";

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

const LabourDelivery = (props) => {
    const patientObj = props.patientObj;
    console.log(patientObj)
    let history = useHistory();
    const classes = useStyles()
    //const [values, setValues] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [vital, setVitalSignDto]= useState({

                                                bodyWeight: "",
                                                diastolic: "",
                                                encounterDate: "",
                                                facilityId: 1,
                                                height: "",
                                                personId: "",
                                                pulse: "",
                                                respiratoryRate: "",
                                                systolic:"",
                                                temperature: "",
                                                visitId:""
                                            })
    
        const handleInputChangeVitalSignDto = e => {            
            setVitalSignDto ({...vital,  [e.target.name]: e.target.value});
        }

        //FORM VALIDATION
        const validate = () => {
            let temp = { ...errors }
            //temp.name = details.name ? "" : "This field is required"
            //temp.description = details.description ? "" : "This field is required"
            setErrors({
                ...temp
                })    
            return Object.values(temp).every(x => x == "")
        }
          
        /**** Submit Button Processing  */
        const handleSubmit = (e) => {        
            e.preventDefault();        
            
            setSaving(true);
            axios.post(`${baseUrl}patient/vital-sign/`, vital,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
              .then(response => {
                  setSaving(false);
                  props.patientObj.commenced=true
                  toast.success("Vital signs save successful");
                  props.toggle()
                  props.patientsVitalsSigns()

              })
              .catch(error => {
                  setSaving(false);
                  toast.error("Something went wrong");
                 
              });
          
        }

  return (      
      <div >
                   
        <Card >
            <CardBody>
            <form >
                <div className="row">
                    <h2>labour and Delivery</h2>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ANC ID  *</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Booking Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Date of Delivery</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Gestational Age (weeks)</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ROM to Delivery Interval </Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Mode of Delivery</Label>
                            <InputGroup> 
                                <Input 
                                    type="Date"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Episiotomy</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Vaginal Tear</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Feeding decision</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Maternal Outcome</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Child given ARV within 72 hrs</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Child status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >HIV exposed infant given Hep B within 24 hrs of birth</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Time of Diagnosis</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >On ART?</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ART started in L&D ward</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
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
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Hepatitis B Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Hepatitis C Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                />
                            </InputGroup>                                        
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

export default LabourDelivery;
