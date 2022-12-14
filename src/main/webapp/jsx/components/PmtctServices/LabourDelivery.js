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

const LabourDelivery = (props) => {
    const patientObj = props.patientObj;
    //let history = useHistory();
    const classes = useStyles()
    const [delieryMode, setDelieryMode] = useState([]);
    const [feedingDecision, setfeedingDecision] = useState([]);
    const [maternalOutCome, setmaternalOutCome] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [childStatus, setChildStatus] = useState([]);
    const [bookingStatus, setBookingStatus] = useState([]);
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
    useEffect(() => {           
        MODE_DELIVERY();
        FEEDING_DECISION();
        MATERNAL_OUTCOME();
        CHILD_STATUS_DELIVERY();
        BOOKING_STATUS();
    }, [props.patientObj.id, ]);
    //Get list 
    const BOOKING_STATUS =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/BOOKING STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setBookingStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const MODE_DELIVERY =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/MODE_DELIVERY`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setDelieryMode(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const CHILD_STATUS_DELIVERY =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/CHILD_STATUS_DELIVERY`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setChildStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const FEEDING_DECISION =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/FEEDING DECISION`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setfeedingDecision(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const MATERNAL_OUTCOME =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/MATERNAL_OUTCOME`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setmaternalOutCome(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const handleInputChangeDeliveryDto = e => {  
        setErrors({...errors, [e.target.name]: ""})            
        setDelivery ({...delivery,  [e.target.name]: e.target.value});
    }

    //FORM VALIDATION
    const validate = () => {
        let temp = { ...errors }
        temp.artStartedLdWard = delivery.artStartedLdWard ? "" : "This field is required"
        temp.referalSource = delivery.referalSource ? "" : "This field is required"
        temp.romDeliveryInterval = delivery.romDeliveryInterval ? "" : "This field is required"
        temp.vaginalTear = delivery.vaginalTear ? "" : "This field is required"
        temp.onArt = delivery.onArt ? "" : "This field is required"
        temp.modeOfDelivery = delivery.modeOfDelivery ? "" : "This field is required"
        temp.maternalOutcome = delivery.maternalOutcome ? "" : "This field is required"
        temp.hivExposedInfantGivenHbWithin24hrs = delivery.hivExposedInfantGivenHbWithin24hrs ? "" : "This field is required"
        temp.hcstatus = delivery.hcstatus ? "" : "This field is required"
        temp.hbstatus = delivery.hbstatus ? "" : "This field is required"
        temp.gaweeks = delivery.gaweeks ? "" : "This field is required"
        temp.feedingDecision = delivery.feedingDecision ? "" : "This field is required"
        temp.episiotomy = delivery.episiotomy ? "" : "This field is required"
        temp.deliveryTime = delivery.deliveryTime ? "" : "This field is required"
        temp.dateOfDelivery = delivery.dateOfDelivery ? "" : "This field is required"
        temp.childStatus = delivery.childStatus ? "" : "This field is required"
        temp.childGivenArvWithin72 = delivery.childGivenArvWithin72 ? "" : "This field is required"
        temp.bookingStatus = delivery.bookingStatus ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();        
        if(validate()){
        setSaving(true);
        axios.post(`${baseUrl}pmtct/anc/pmtct-delivery`, delivery,
        { headers: {"Authorization" : `Bearer ${token}`}},
        
        )
            .then(response => {
                setSaving(false);
                //props.patientObj.commenced=true
                toast.success("Record save successful", {position: toast.POSITION.BOTTOM_CENTER});
                props.setActiveContent({...props.activeContent, route:'recent-history'})
            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong", {position: toast.POSITION.BOTTOM_CENTER});
                
            });
        }else{
            toast.error("All field are required", {position: toast.POSITION.BOTTOM_CENTER});
        } 
    }

  return (      
      <div >
                   
        <Card className={classes.root}>
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
                            {errors.ancNo !=="" ? (
                                    <span className={classes.error}>{errors.ancNo}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Booking Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="bookingStatus"
                                    id="bookingStatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.bookingStatus} 
                                >
                                <option value="">Select </option>
                                    
                                    {bookingStatus.map((value) => (
                                        <option key={value.id} value={value.code}>
                                            {value.display}
                                        </option>
                                    ))}

                               </Input>
                            </InputGroup>
                            {errors.bookingStatus !=="" ? (
                                    <span className={classes.error}>{errors.bookingStatus}</span>
                            ) : "" }
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
                            {errors.dateOfDelivery !=="" ? (
                                    <span className={classes.error}>{errors.dateOfDelivery}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Gestational Age (weeks)</Label>
                            <InputGroup> 
                                <Input 
                                    type="number"
                                    name="gaweeks"
                                    id="gaweeks"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.gaweeks} 
                                />

                            </InputGroup>
                            {errors.gaweeks !=="" ? (
                                    <span className={classes.error}>{errors.gaweeks}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ROM to Delivery Interval </Label>
                            <InputGroup> 
                                <Input 
                                    type="number"
                                    name="romDeliveryInterval"
                                    id="romDeliveryInterval"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.romDeliveryInterval} 
                                />

                            </InputGroup>
                            {errors.romDeliveryInterval !=="" ? (
                                    <span className={classes.error}>{errors.romDeliveryInterval}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Mode of Delivery</Label>
                            
                            <Input
                                    type="select"
                                    name="modeOfDelivery"
                                    id="modeOfDelivery"
                                    value={delivery.modeOfDelivery}
                                    onChange={handleInputChangeDeliveryDto}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    required
                                >
                                     <option value="">Select </option>
                                        
                                        {delieryMode.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}

                                </Input>
                                {errors.modeOfDelivery !=="" ? (
                                    <span className={classes.error}>{errors.modeOfDelivery}</span>
                                ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Episiotomy</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="episiotomy"
                                    id="episiotomy"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.episiotomy} 
                                >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                </Input>

                            </InputGroup>
                            {errors.episiotomy !=="" ? (
                                    <span className={classes.error}>{errors.episiotomy}</span>
                                ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Vaginal Tear</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="vaginalTear"
                                    id="vaginalTear"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.vaginalTear} 
                                >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                </Input>
                            </InputGroup>
                            {errors.vaginalTear !=="" ? (
                                    <span className={classes.error}>{errors.vaginalTear}</span>
                                ) : "" }                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Feeding decision</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="feedingDecision"
                                    id="feedingDecision"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.feedingDecision} 
                                >
                                    <option value="">Select </option>
                                        
                                    {feedingDecision.map((value) => (
                                        <option key={value.id} value={value.code}>
                                            {value.display}
                                        </option>
                                    ))}
                                </Input>

                            </InputGroup>
                            {errors.feedingDecision !=="" ? (
                                    <span className={classes.error}>{errors.feedingDecision}</span>
                                ) : "" }  
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Maternal Outcome</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="maternalOutcome"
                                    id="maternalOutcome"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.maternalOutcome} 
                                >
                                    <option value="">Select </option>    
                                    {maternalOutCome.map((value) => (
                                        <option key={value.id} value={value.code}>
                                            {value.display}
                                        </option>
                                    ))}
                                </Input>
                            </InputGroup> 
                            {errors.maternalOutcome !=="" ? (
                                    <span className={classes.error}>{errors.maternalOutcome}</span>
                                ) : "" }                                       
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Child given ARV within 72 hrs</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="childGivenArvWithin72"
                                    id="childGivenArvWithin72"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.childGivenArvWithin72} 
                                >
                                <option value="" >Select</option>
                                <option value="Yes" >Yes</option>
                                <option value="No" >No</option>
                            </Input>
                            </InputGroup>
                            {errors.childGivenArvWithin72 !=="" ? (
                                    <span className={classes.error}>{errors.childGivenArvWithin72}</span>
                                ) : "" }                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Child status</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="childStatus"
                                    id="childStatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.childStatus} 
                                >
                                <option value="">Select </option>    
                                {childStatus.map((value) => (
                                    <option key={value.id} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                                </Input>
                            </InputGroup>
                            {errors.childStatus !=="" ? (
                                    <span className={classes.error}>{errors.childStatus}</span>
                                ) : "" }                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >On ART?</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="onArt"
                                    id="onArt"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.onArt} 
                                >
                                
                                <option value="" >Select</option>
                                <option value="Yes" >Yes</option>
                                <option value="No" >No</option>
                                </Input>
                            </InputGroup> 
                            {errors.onArt !=="" ? (
                                    <span className={classes.error}>{errors.onArt}</span>
                                ) : "" }                                       
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >HIV exposed infant given Hep B within 24 hrs of birth</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="hivExposedInfantGivenHbWithin24hrs"
                                    id="hivExposedInfantGivenHbWithin24hrs"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hivExposedInfantGivenHbWithin24hrs} 
                                    >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                    </Input>
                            </InputGroup>
                            {errors.hivExposedInfantGivenHbWithin24hrs !=="" ? (
                                    <span className={classes.error}>{errors.hivExposedInfantGivenHbWithin24hrs}</span>
                                ) : "" }                                        
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
                            {errors.deliveryTime !=="" ? (
                                    <span className={classes.error}>{errors.deliveryTime}</span>
                                ) : "" }                                          
                            </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ART started in L&D ward</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="artStartedLdWard"
                                    id="artStartedLdWard"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.artStartedLdWard} 
                                >
                                <option value="" >Select</option>
                                <option value="Yes" >Yes</option>
                                <option value="No" >No</option>
                                </Input>
                            </InputGroup>
                            {errors.artStartedLdWard !=="" ? (
                                    <span className={classes.error}>{errors.artStartedLdWard}</span>
                                ) : "" }                                        
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
                            {errors.referalSource !=="" ? (
                                    <span className={classes.error}>{errors.referalSource}</span>
                                ) : "" }                                         
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Hepatitis B Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="hbstatus"
                                    id="hbstatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hbstatus} 
                                    >
                                    <option value="" >Select</option>
                                    <option value="Positive" >Yes</option>
                                    <option value="Negative" >No</option>
                                    </Input>
                            </InputGroup>
                            {errors.hbstatus !=="" ? (
                                    <span className={classes.error}>{errors.hbstatus}</span>
                                ) : "" }                                         
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Hepatitis C Status</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="hcstatus"
                                    id="hcstatus"
                                    onChange={handleInputChangeDeliveryDto}
                                    value={delivery.hcstatus} 
                                >
                                <option value="" >Select</option>
                                <option value="Positive" >Yes</option>
                                <option value="Negative" >No</option>
                                </Input>
                            </InputGroup> 
                            {errors.hcstatus !=="" ? (
                                    <span className={classes.error}>{errors.hcstatus}</span>
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
            style={{backgroundColor:"#014d88"}}
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
                style={{backgroundColor:'#992E62'}}
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
