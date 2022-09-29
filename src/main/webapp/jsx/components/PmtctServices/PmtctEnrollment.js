import React, {useState, useEffect} from 'react';
import {Card,CardBody, FormGroup, Label, Input, InputGroup,InputGroupText} from 'reactstrap';
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

const AncPnc = (props) => {
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
                <h2>PMTCT Enrollment</h2>
                <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ANC ID *</Label>
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
                            <Label >Date of Visit *</Label>
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
                        <Label >Blood Presure</Label>
                        <InputGroup>
                        <InputGroupText>
                            systolic(mmHg)
                            </InputGroupText> 
                            <Input 
                                type="number"
                                name="systolic"
                                id="systolic"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.systolic} 
                            />
                            
                        </InputGroup>
                        {vital.systolic > 200 ? (
                                <span className={classes.error}>{"Blood Pressure cannot be greater than 200."}</span>
                            ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Blood Presure</Label>
                        
                        <InputGroup> 
                        <InputGroupText>
                            diastolic (mmHg)
                            </InputGroupText>
                            <Input 
                                type="text"
                                name="diastolic"
                                id="diastolic"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.diastolic} 
                            />
                            
                        </InputGroup>
                        {vital.diastolic > 200 ? (
                            <span className={classes.error}>{"Blood Pressure cannot be greater than 200."}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Body Weight</Label>
                        <InputGroup>
                        <InputGroupText>
                                kg
                            </InputGroupText> 
                            <Input 
                                type="number"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.bodyWeight} 
                            />
                            
                            
                        </InputGroup>
                        {vital.bodyWeight > 200 ? (
                                <span className={classes.error}>{"Body Weight cannot be greater than 200."}</span>
                            ) : "" 
                        }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Fundal Height</Label>
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
                            />
                            
                        </InputGroup>
                        {vital.height > 3 ? (
                            <span className={classes.error}>{"Height cannot be greater than 3."}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Fetal Presentation</Label>
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
                            <Label >Gestational Age(weeks) *</Label>
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
                            <Label >Type of Visit</Label>
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
                            <Label >Visit Status</Label>
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
                            <Label >Viral Load Sample Collected?</Label>
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
                            <Label >Date Sample Collected*</Label>
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
                            <Label >TB Status</Label>
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
                            <Label >Date of next appointment*</Label>
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
                    <hr/>
                    <h3>Counseling/Other Services Provided</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Nutritional Support</Label>
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
                            <Label >Infant Feeding</Label>
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
                            <Label >Family Planing Method Used</Label>
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
                            <Label >Referred to</Label>
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
                    <hr/>
                    <h3>Partner Information</h3>
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Agreed to partner notification</Label>
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

export default AncPnc;
