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
    //let history = useHistory();
    const classes = useStyles()
    //const [values, setValues] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [delivery, setDelivery]= useState({

                ancNo: patientObj.ancNo,
                artStartedLdWard: "",
                bookingStatus: "",
                childGivenArvWithin72: "",
                childStatus: "",
                dateOfDelivery: "",
                deliveryTime: "",
                episiotomy: "",
                feedingDecision: "",
                gaweeks: "",
                hbstatus: "",
                hcstatus: "",
                hivExposedInfantGivenHbWithin24hrs: "",
                maternalOutcome: "",
                modeOfDelivery: "",
                onArt: "",
                referalSource: "",
                romDeliveryInterval: "",
                vaginalTear: ""
    })
    
        const handleInputChangeDeliveryDto = e => {            
            setDelivery ({...delivery,  [e.target.name]: e.target.value});
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
            axios.post(`${baseUrl}pmtct/anc/pmtct-delivery`, delivery,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
              .then(response => {
                  setSaving(false);
                  //props.patientObj.commenced=true
                  toast.success("Record save successful");

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
                                    name="ancNo"
                                    id="ancNo"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.ancNo} 
                                    disabled
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
                                    name="bookingStatus"
                                    id="bookingStatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.bookingStatus} 
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
                                    name="dateOfDelivery"
                                    id="dateOfDelivery"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.dateOfDelivery} 
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
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
                                    name="gaweeks"
                                    id="gaweeks"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.gaweeks} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ROM to Delivery Interval </Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="romDeliveryInterval"
                                    id="romDeliveryInterval"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.romDeliveryInterval} 
                                />

                            </InputGroup>
                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Mode of Delivery</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="modeOfDelivery"
                                    id="modeOfDelivery"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.modeOfDelivery} 
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
                                    name="episiotomy"
                                    id="episiotomy"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.episiotomy} 
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
                                    name="vaginalTear"
                                    id="vaginalTear"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.vaginalTear} 
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
                                    name="feedingDecision"
                                    id="feedingDecision"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.feedingDecision} 
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
                                    name="maternalOutcome"
                                    id="maternalOutcome"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.maternalOutcome} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Child given ARV within 72 hrs</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="childGivenArvWithin72"
                                    id="childGivenArvWithin72"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.childGivenArvWithin72} 
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
                                    name="childStatus"
                                    id="childStatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.childStatus} 
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
                                    name="hivExposedInfantGivenHbWithin24hrs"
                                    id="hivExposedInfantGivenHbWithin24hrs"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hivExposedInfantGivenHbWithin24hrs} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Time of Diagnosis</Label>
                            <InputGroup> 
                                <Input 
                                    type="time"
                                    name="deliveryTime"
                                    id="deliveryTime"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.deliveryTime} 
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
                                    name="onArt"
                                    id="onArt"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.onArt} 
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
                                    name="artStartedLdWard"
                                    id="artStartedLdWard"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.artStartedLdWard} 
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
                                    name="referalSource"
                                    id="referalSource"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.referalSource} 
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
                                    name="hbstatus"
                                    id="hbstatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hbstatus} 
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
                                    name="hcstatus"
                                    id="hcstatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hcstatus} 
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
