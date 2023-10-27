import React, { useState } from "react";
import {  Table  } from "react-bootstrap";
import { Input, Label, FormGroup, } from "reactstrap";
import { makeStyles } from '@material-ui/core/styles'
import moment from "moment";
import {Icon, List, Label as LabelSui} from 'semantic-ui-react'
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
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
  const handleInfectionInputChange = e => {
  props.setInfection ({...props.infection,  [e.target.name]: e.target.value});
  }
  //Validations of the forms
  const validate = () => {        
    temp.ondateInfection = props.infection.ondateInfection ? "" : "This field is required"
    temp.illnessInfection = props.infection.illnessInfection ? "" : "This field is required"

    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
    const addInfection = e => { 
      if(validate()){
        props.setInfectionList([...props.infectionList, props.infection])
      }else{
        toast.error(" Field are required ");
      }
    
    }
    /* Remove ADR  function **/
    const removeInfection = index => {       
    props.infectionList.splice(index, 1);
    props.setInfectionList([...props.infectionList]);
        
    };
                                            

  return (
    <div>
       <div className="row">
       {props.enableUpdate && (
        <>
          <div className="form-group mb-3 col-md-5">
              <FormGroup>
              <Label >Onset Date </Label>
              <Input
                  type="date"
                  name="ondateInfection"
                  id="ondateInfection"
                  value={props.infection.ondateInfection}
                  onChange={handleInfectionInputChange}
                  max= {moment(new Date()).format("YYYY-MM-DD") }
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  required
                  > 
              </Input>
              {errors.ondateInfection !=="" ? (
                  <span className={classes.error}>{errors.ondateInfection}</span>
              ) : "" }
              </FormGroup>
          </div>
          <div className="form-group mb-3 col-md-5">        
          <FormGroup>
              <Label > Illness</Label>
              <Input
                  type="text"
                  name="illnessInfection"
                  id="illnessInfection"
                  value={props.infection.illnessInfection}
                  onChange={handleInfectionInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  required
                  > 
              </Input>
              {errors.illnessInfection !=="" ? (
                  <span className={classes.error}>{errors.illnessInfection}</span>
              ) : "" }
              </FormGroup>
          </div>
          <div className="form-group mb-3 col-md-2">
          <LabelSui as='a' color='black'  onClick={addInfection}  size='tiny' style={{ marginTop:35}}>
              <Icon name='plus' /> Add
          </LabelSui>
          </div>
        </>
        )}
        {props.infectionList.length >0 
          ?
            <List>
            <div style={{padding:'3px 0px'}} >
            <Table  striped responsive size="sm" >
                  <thead  >
                      <tr >
                          <th>Illness</th>
                          <th>OnSetDate</th>
                          <th ></th>
                      </tr>
                  </thead>
                  <tbody>
                {props.infectionList.map((relative, index) => (

                  <InfectionList
                      key={index}
                      index={index}
                      relative={relative}
                      removeInfection={removeInfection}
                  />
                  ))}
                  </tbody>
                  </Table>
                  </div>
                </List>
                :
                ""
            } 
    </div>
    </div>
     
  );
};

function InfectionList({
    relative,
    index,
    removeInfection,
  }) {
  
   
    return (
            <tr>
  
                <th>{relative.illnessInfection}</th>
                <th>{relative.ondateInfection}</th>
                <th></th>
                <th >
                    <IconButton aria-label="delete" size="small" color="error" onClick={() =>removeInfection(index)}>
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    
                </th>
            </tr> 
    );
  }

export default ADR;
