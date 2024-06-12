import React, {useState, useEffect } from "react";
// import { Link } from 'react-router-dom';
import { Table  } from "react-bootstrap";
import { Input, Label, FormGroup, } from "reactstrap";
import { makeStyles } from '@material-ui/core/styles'
import {Icon, List, Label as LabelSui} from 'semantic-ui-react'
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { url as baseUrl,token } from "./../../../../../api";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";

const useStyles = makeStyles(theme => ({
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}))

const ADR = (props) => {
  const [errors, setErrors] = useState({});
  const classes = useStyles()
  let temp = { ...errors }
  const [prepSideEffect, setPrepSideEffect] = useState([]);
  
  useEffect(() => {
    PrepSideEffect();
  }, []);
       //Get list of PrepSideEffect
       const PrepSideEffect =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setPrepSideEffect(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
        }
  const handAdrleInputChange = e => {
    props.setAdrObj ({...props.adrObj,  [e.target.name]: e.target.value});
  }
   //Validations of the forms
   const validate = () => {        
    temp.adr = props.adrObj.adr ? "" : "This field is required"
    temp.adrOnsetDate = props.adrObj.adrOnsetDate ? "" : "This field is required"

    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
  const addADR = e => { 
    if(validate()){
        props.setAdrList([...props.adrList, props.adrObj])
    }else{
      toast.error(" Field are required ");
    }
  }
  /* Remove ADR  function **/
  const removeRelativeLocation = index => {       
      props.adrList.splice(index, 1);
      props.setAdrList([...props.adrList]);
     
  };


  return (
    <div>
        <div className="row">
        {props.enableUpdate && (
        <>
        <div className="form-group mb-3 col-md-5">

            <FormGroup>
            <Label >ADR </Label>
            
              <Input
                  type="select"
                  name="adr"
                  id="adr"
                  value={props.adrObj.adr}
                  onChange={handAdrleInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  required
                  >
                    <option value=""> Select</option>
                      {prepSideEffect.map((value) => (
                          <option key={value.id} value={value.display}>
                              {value.display}
                          </option>
                      ))}
              </Input>
                {errors.adr !=="" ? (
                    <span className={classes.error}>{errors.adr}</span>
                ) : "" }
            </FormGroup>
        </div>
        <div className="form-group mb-3 col-md-5">        
        <FormGroup>
            <Label > Onset Date</Label>
            <Input
                type="date"
                name="adrOnsetDate"
                id="adrOnsetDate"
                value={props.adrObj.adrOnsetDate}
                min={props.artStartDate}
                onChange={handAdrleInputChange}
                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                max= {moment(new Date()).format("YYYY-MM-DD") }
                required
                > 
            </Input>
            {errors.adrOnsetDate !=="" ? (
                <span className={classes.error}>{errors.adrOnsetDate}</span>
            ) : "" }
            </FormGroup>
        </div>
        
        <div className="form-group mb-3 col-md-2">
          <LabelSui as='a' color='black'  onClick={addADR}  size='tiny' style={{ marginTop:35}}>
              <Icon name='plus' /> Add
          </LabelSui>
        </div>
        </>)}
        {props.adrList.length >0 
          ?
            <List>
            <Table  striped responsive>
                  <thead >
                      <tr>
                          <th>ADR</th>
                          <th>OnSetDate</th>
                          <th ></th>
                      </tr>
                  </thead>
                  <tbody>
                {props.adrList.map((relative, index) => (

                  <RelativeList
                      key={index}
                      index={index}
                      relative={relative}
                      removeRelativeLocation={removeRelativeLocation}
                  />
                  ))}
                  </tbody>
                  </Table>
            </List>
            :
            ""
        }       
    </div>
    </div>
     
  );
};

function RelativeList({
  relative,
  index,
  removeRelativeLocation,
}) {


  return (
          <tr>
              <th>{relative.adr}</th>
              <th>{relative.adrOnsetDate}</th>
              <th></th>
              <th >
                  <IconButton aria-label="delete" size="small" color="error" onClick={() =>removeRelativeLocation(index)}>
                      <DeleteIcon fontSize="inherit" />
                  </IconButton>
                  
              </th>
          </tr> 
  );
}


export default ADR;
