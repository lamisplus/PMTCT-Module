import React, {useCallback, useEffect, useState} from "react";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";

// import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
// import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Button} from 'semantic-ui-react'
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
        flexGrow: 1,
        maxWidth: 752,
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
            <Card >
                <CardBody>
                
                <h2 style={{color:'#000'}}>Index Notification Services - Elicitation</h2>
              
                    <form >
                        <div className="row">
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">First Name</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Middle Name</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Last Name</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Date Of Birth </Label>
                                <Input
                                    type="date"
                                    name="dateOfLastViralLoad"
                                    id="dateOfLastViralLoad"
                                    // value={objValues.dateOfLastViralLoad}
                                    // onChange={handleInputChange}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Age</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Sex *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Address</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Hang-out spots</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Phone Number</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">Alternative Phone Number</Label>
                                <Input
                                    type="number"
                                    name="lastViralLoad"
                                    id="lastViralLoad"
                                    // value={objValues.lastViralLoad}
                                    // onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                   
                                />
                                
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Relationship to Index Client *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Do you currently live with this partner? *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>As far as you know, as this partner ever tested positive for HIV *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value={""}>Yes</option>
                                        <option value={""}>No</option>
                                        <option value={""}>Don't know/Decline to answer</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>As this partner ever hit, kick, slapped or otherwise physical hurt you? *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value={""}>Yes</option>
                                        <option value={""}>No</option>
                                        <option value={""}>Decline to answer</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has this partner ever threaten to hurt you? *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value={""}>Yes</option>
                                        <option value={""}>No</option>
                                        <option value={""}>Decline to answer</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Has this partner ever threaten force you to do something sexually that made you uncomfortable ?  *</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value={""}>Yes</option>
                                        <option value={""}>No</option>
                                        <option value={""}>Decline to answer</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Notification Method selected*</Label>
                                    <select
                                        className="form-control"
                                        name="sex"
                                        id="sex"
                                        
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                       
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">If contract by which date will partner come for testing?</Label>
                                <Input
                                    type="date"
                                    name="dateOfEac1"
                                    id="dateOfEac1"
                                    // value={objValues.dateOfEac1}
                                    // onChange={handleInputChange}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.dateOfEac1 !=="" ? (
                                    <span className={classes.error}>{errors.dateOfEac1}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                           
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-6">
                            <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('post-test', 'post-test')}/>
                            <Button content='Next' icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={()=>handleItemClick('others', 'indexing')}/>
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