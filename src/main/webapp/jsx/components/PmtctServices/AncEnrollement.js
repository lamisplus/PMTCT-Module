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

const AncEnrollement = (props) => {
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
                <h2>ANC Enrollment</h2>
                <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ANC No *</Label>
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
                            <Label >Date of 1st ANC *</Label>
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
                            <Label >Gravida</Label>
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
                            <Label >Parity</Label>
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
                            <Label >Date Of Last Menstrual Period* </Label>
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
                            <Label >Expected Date Of Delivery </Label>
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
                            <Label >Gestational Age (Weeks)</Label>
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
                            <Label >Time of HIV Diagnosis</Label>
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
                    
                    <h3>Syphilis Information</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Tested for syphilis?</Label>
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
                            <Label >Test Result</Label>
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
                            <Label >Treated for Syphilis</Label>
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
                            <Label >Referred for syphilis treatment</Label>
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
                    <h3>PMTCT HTS</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Previously known HIV positive?</Label>
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
                            <Label >Date tested HIV positive</Label>
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
                            <Label >Accepted HIV Testing?</Label>
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
                            <Label >HIV test result</Label>
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
                            <Label >HIV Restesting?</Label>
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
                            <Label >Received HIV test result?</Label>
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
                    
                    <h3>Hepatitis Information</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Tested for Hepatitis B</Label>
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
                            <Label >Hepatitis B test result</Label>
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
                            <Label >Tested for Hepatitis C</Label>
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
                            <Label >Hepatitis C test result</Label>
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
                    <h3>Partner Notification</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Agreed to partner notification?</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                >
                                    <option value="">Select</option>
                                </Input>
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Partner's HIV status</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                >
                                    <option value="">Select</option>
                                </Input>
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Partner referred to?</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="encounterDate"
                                    id="encounterDate"
                                    onChange={handleInputChangeVitalSignDto}
                                    value={vital.encounterDate} 
                                >
                                    <option value="">Select</option>
                                </Input>
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

export default AncEnrollement;
