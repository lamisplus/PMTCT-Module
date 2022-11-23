import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import MatButton from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
// import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
// import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Label as LabelRibbon} from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";



const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(20),
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cardBottom: {
        marginBottom: 20,
    },
    Select: {
        height: 45,
        width: 300,
    },
    button: {
        margin: theme.spacing(1),
    },
    root: {
        '& > *': {
            margin: theme.spacing(1)
        },
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
    demo: {
        backgroundColor: theme.palette.background.default,
    },
    inline: {
        display: "inline",
    },
    error:{
        color: '#f85032',
        fontSize: '12.8px'
    }
}));


const BasicInfo = (props) => {
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
    }

    return (
        <>
            <Card className={classes.root}>
                <CardBody>
               
                <h3 >OTHERS - (Resquest {"& "} Result Form)</h3>
               <hr/>
                <br/>
                    <form >
                        <div className="row">
                        <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>Syphilis Testing</h5>
                        </LabelRibbon>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Syphilis test result *</Label>
                                    <select
                                        className="form-control"
                                        name="syphilisTestResult"
                                        id="syphilisTestResult"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Reactive</option>
                                        <option value="No">Non-Reactive</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <hr/>
                            <br/>
                            <LabelRibbon as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
                            <h5 style={{color:'#fff'}}>Hepatitis B Testing</h5>
                            </LabelRibbon>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Hepatitis B virus test result *</Label>
                                    <select
                                        className="form-control"
                                        name="hepatitisBTestResult"
                                        id="hepatitisBTestResult"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Positive</option>
                                        <option value="No">Negative</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Hepatitis C virus test result *</Label>
                                    <select
                                        className="form-control"
                                        name="hepatitisCTestResult"
                                        id="hepatitisCTestResult"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                       <option value={""}></option>
                                        <option value="Yes">Positive</option>
                                        <option value="No">Negative</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>HIV Request and Result form filled with CT Intake Form *</Label>
                                    <select
                                        className="form-control"
                                        name="hivRequestResultCT"
                                        id="hivRequestResultCT"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Completed By</Label>
                                <Input
                                    type="number"
                                    name="completedBy"
                                    id="completedBy"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Longitude</Label>
                                <Input
                                    type="number"
                                    name="longitude"
                                    id="longitude"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Latitude</Label>
                                <Input
                                    type="number"
                                    name="latitude"
                                    id="latitude"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Adhoc Code</Label>
                                <Input
                                    type="number"
                                    name="adhocCode"
                                    id="adhocCode"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                                                      
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-6">
                            <MatButton
                            type="button"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            onClick={()=>handleItemClick('basic','others')}
                            style={{backgroundColor:"#014d88"}}
                            //disabled={objValues.dateOfEac1==="" ? true : false}
                            >
                            {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Save</span>
                            ) : (
                            <span style={{ textTransform: "capitalize" }}>Saving...</span>
                            )}
                            </MatButton>
                            </div>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default BasicInfo