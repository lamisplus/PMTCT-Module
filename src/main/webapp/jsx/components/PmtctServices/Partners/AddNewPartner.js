import React, {useState, useEffect} from 'react';
import {Card,CardBody, FormGroup, Label, Input, InputGroup} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "./../../../../api";
//import { useHistory } from "react-router-dom";
import 'react-summernote/dist/react-summernote.css'; // import styles
import { Spinner } from "reactstrap";
import { Button,  } from 'semantic-ui-react'

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

const Labourpartner = (props) => {
    const patientObj = props.patientObj;
    //let history = useHistory();
    const classes = useStyles()
    const [saving, setSaving] = useState(false);
    const [disabledField, setDisabledField] = useState(false);
    const [errors, setErrors] = useState({});
    const [syphills, setSyphills] = useState([]);
    const [referred, setReferred] = useState([]);
    const [partner, setpartner]= useState({
                age: "",
                dateOfBirth: "",
                fullName: "",
                hbStatus: "",
                hcStatus: "",
                postTestCounseled: "",
                referredTo: "",
                syphillsStatus: "",
                referredToOthers:""
    })
    useEffect(() => {  
        PARTNER_SYPHILIS_STATUS();
        PARTNER_REFERRED_PMTCT(); 
        if(props.activeContent && props.activeContent.id) {
            setpartner(props.activeContent.obj)
            setDisabledField(props.activeContent.actionType==="view"? true : false)
            
        }       
    }, [props.patientObj.id, props.activeContent]);
    //Get list 
    const PARTNER_SYPHILIS_STATUS =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PARTNER_SYPHILIS_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setSyphills(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const PARTNER_REFERRED_PMTCT =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PARTNER_REFERRED_PMTCT`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            //console.log(response.data);
            setReferred(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const handleInputChangepartnerDto = e => {  
        setErrors({...errors, [e.target.name]: ""})            
        setpartner ({...partner,  [e.target.name]: e.target.value});
    }

    //FORM VALIDATION
    const validate = () => {
        let temp = { ...errors }
        temp.age = partner.age ? "" : "This field is required"
        //temp.hbStatus = partner.hbStatus ? "" : "This field is required"
        //temp.hcStatus = partner.hcStatus ? "" : "This field is required"
        temp.postTestCounseled = partner.postTestCounseled ? "" : "This field is required"
        temp.fullName = partner.fullName ? "" : "This field is required" 
        //temp.syphillisStatus = partner.syphillisStatus ? "" : "This field is required"
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
        axios.put(`${baseUrl}pmtct/anc/update-partnerinformation-in-anc/${props.patientObj.id}`, partner,
        { headers: {"Authorization" : `Bearer ${token}`}},
        
        )
            .then(response => {
                setSaving(false);
                //props.patientObj.commenced=true
                toast.success("Record save successful", {position: toast.POSITION.BOTTOM_CENTER});
                props.setActiveContent({...props.activeContent, route:'partners'})
            })
            .catch(error => {
                setSaving(false);
                toast.error("Something went wrong", {position: toast.POSITION.BOTTOM_CENTER});
                
            });
        }else{
            toast.error("All field are required", {position: toast.POSITION.BOTTOM_CENTER});
        } 
    }
    const LoadPage =()=>{    
        props.setActiveContent({...props.activeContent, route:'partners', id:"", actionType:""})
    }
    

  return (      
      <div >
         <Button
            variant="contained"
            color="primary"
            className=" float-end  mr-2 mt-2"
            onClick={()=>LoadPage()}
            style={{backgroundColor:"#014d88"}}
            //startIcon={<FaUserPlus size="10"/>}
        >
            <span style={{ textTransform: "capitalize" }}> Back</span>
        </Button>
        <br/><br/><br/>          
        <Card className={classes.root}>
            <CardBody>
            <form >
                <div className="row">
                    <h2>New Partner </h2>
                    
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >ANC Number <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="ancNo"
                                    id="ancNo"
                                    onChange={handleInputChangepartnerDto}
                                    value={props.patientObj.ancNo} 
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
                            <Label >Partner HIV Status </Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="partnerHivSTatus"
                                    id="partnerHivSTatus"
                                    //onChange={handleInputChangepartnerDto}
                                    value={props.patientObj.dynamicHivStatus!=="Unknown"  ? props.patientObj.dynamicHivStatus : props.patientObj.staticHivStatus}
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
                            <Label >Partner  Full Name <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.fullName} 
                                    disabled={disabledField}
                                    
                                />
                            </InputGroup>
                            {errors.fullName !=="" ? (
                                    <span className={classes.error}>{errors.fullName}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Partner  age <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                                <Input 
                                    type="Number"
                                    name="age"
                                    id="age"
                                    min={10}
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.age} 
                                    disabled={disabledField}
                                />
                            </InputGroup>
                            {errors.ancNo !=="" ? (
                                    <span className={classes.error}>{errors.ancNo}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Pre-test Counseled <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="preTestCounseled"
                                    id="preTestCounseled"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.preTestCounseled}
                                    disabled={disabledField} 
                                >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                </Input>
                            </InputGroup>
                            {errors.preTestCounseled !=="" ? (
                                    <span className={classes.error}>{errors.preTestCounseled}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Partner accepts  HIV test</Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="acceptHivTest"
                                    id="acceptHivTest"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.acceptHivTest}
                                    disabled={disabledField} 
                                >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                </Input>
                            </InputGroup>
                            {errors.acceptHivTest !=="" ? (
                                    <span className={classes.error}>{errors.acceptHivTest}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Post-test counseled/ received test result</Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="postTestCounseled"
                                    id="postTestCounseled"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.postTestCounseled} 
                                    disabled={disabledField}
                                >
                                    <option value="" >Select</option>
                                    <option value="Yes" >Yes</option>
                                    <option value="No" >No</option>
                                </Input>

                            </InputGroup>
                            {errors.postTestCounseled !=="" ? (
                                    <span className={classes.error}>{errors.postTestCounseled}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >HBV status <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="hbStatus"
                                    id="hbStatus"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.hbStatus} 
                                    disabled={disabledField}
                                >
                                    <option value="" >Select</option>
                                    <option value="Positive" >Positive</option>
                                    <option value="Negative" >Negative</option>
                                </Input>

                            </InputGroup>
                            {errors.hbStatus !=="" ? (
                                    <span className={classes.error}>{errors.hbStatus}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >HCV status <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="hcStatus"
                                    id="hcStatus"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.hcStatus} 
                                    disabled={disabledField}
                                >
                                    <option value="" >Select</option>
                                    <option value="Positive" >Positive</option>
                                    <option value="Negative" >Negative</option>
                                </Input>

                            </InputGroup>
                            {errors.hcStatus !=="" ? (
                                    <span className={classes.error}>{errors.hcStatus}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Syphillis Status <span style={{ color:"red"}}> *</span></Label>
                            <InputGroup> 
                            <Input 
                                    type="select"
                                    name="syphillisStatus"
                                    id="syphillisStatus"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.syphillisStatus}
                                    disabled={disabledField} 
                                >
                                    <option value="" >Select</option>                                    
                                    {syphills.map((value) => (
                                        <option key={value.id} value={value.display}>
                                            {value.display}
                                        </option>
                                    ))}
                                </Input>

                            </InputGroup>
                            {errors.syphillisStatus !=="" ? (
                                    <span className={classes.error}>{errors.syphillisStatus}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Referred To</Label>
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="referredTo"
                                    id="referredTo"
                                    onChange={handleInputChangepartnerDto}
                                    value={partner.referredTo} 
                                    disabled={disabledField}
                                >
                                    <option value="" >Select</option> 
                                     {referred.map((value) => (
                                        <option key={value.id} value={value.display}>
                                            {value.display}
                                        </option>
                                    ))}
                                </Input>
                            </InputGroup>
                            {errors.referredTo !=="" ? (
                                    <span className={classes.error}>{errors.referredTo}</span>
                            ) : "" }
                            </FormGroup>
                    </div>
                    {partner.referredTo==='OTHERS' && (
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Referred To</Label>
                        <InputGroup> 
                            <Input 
                                type="text"
                                name="referredToOthers"
                                id="referredToOthers"
                                onChange={handleInputChangepartnerDto}
                                value={partner.referredToOthers} 
                                disabled={disabledField}
                            >
                                
                            </Input>
                        </InputGroup>
                       
                        </FormGroup>
                </div>
                    )}
  
            </div>
                
                {saving ? <Spinner /> : ""}
            <br />
            {props.activeContent && props.activeContent.actionType ==="update" ? (<>
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
                        <span style={{ textTransform: "capitalize" }}>Update</span>
                        ) : (
                        <span style={{ textTransform: "capitalize" }}>Updating</span>
                        )}
                    </MatButton>
            </>)
            :
            (<>
            
                <MatButton
                type="submit"
                variant="contained"
                color="primary"
                hidden={disabledField}
                className={classes.button}
                disabled={saving}
                startIcon={<SaveIcon />}
                style={{backgroundColor:"#014d88"}}
                onClick={handleSubmit}
                >
                    {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving</span>
                    )}
                </MatButton>
                </>)
            }
            
            <MatButton
                variant="contained"
                className={classes.button}
                startIcon={<CancelIcon />}
                style={{backgroundColor:'#992E62'}}
                onClick={()=>LoadPage()}
            >
                <span style={{ textTransform: "capitalize" }}>Cancel</span>
            </MatButton>
            
                </form>
            </CardBody>
        </Card> 
                  
    </div>
  );
}

export default Labourpartner;
