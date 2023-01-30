import React, { useState, useEffect } from "react";
import axios from "axios";
import {Dropdown, Menu } from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import { url as baseUrl, token } from "../../../api";


const useStyles = makeStyles((theme) => ({
    navItemText: {
        padding: theme.spacing(2),
    },
}));

function SubMenu(props) {
    const classes = useStyles();
    let gender=""
    const patientObjs = props.patientObj ? props.patientObj : {}
    //const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
    const [patientObj, setpatientObj] = useState(patientObjs)
    const [genderType, setGenderType] = useState()
    let mentalStatus=false
    let initialEvaluationStatus=false
    useEffect(() => {
        Observation();
        gender =props.patientObj && props.patientObj.sex ? props.patientObj.sex : null
        setGenderType(gender==="Female" ? true : false)
    }, [props.patientObj]);
     //Get list of RegimenLine
     const Observation =()=>{
        axios
            .get(`${baseUrl}observation/person/${props.patientObj.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                const observation = response.data
                const mental= observation.filter((x)=> x.type==='mental health')
                const evaluation= observation.filter((x)=> x.type==='initial evaluation')
                if(mental.length > 1){
                    mentalStatus=true
                }
                if(evaluation.length > 1){
                    initialEvaluationStatus=true
                }

            })
            .catch((error) => {
            //console.log(error);
            });
        
        }
    const loadAncPnc =(row)=> {
        props.setActiveContent({...props.activeContent, route:'anc-pnc'})
    }
    const loadLabourDelivery =(row)=> {
        props.setActiveContent({...props.activeContent, route:'labour-delivery'})
    }
    const onClickConsultation = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'consultation'})
    }
    const onClickHome = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'recent-history'})
    }
    const loadPmtctHts = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'pmtct-hts'})
    }
    const onClickInfant = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'infants'})
    }
    const onClickPartner = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'partners'})
    }
    const loadPatientHistory = ()=>{
        props.setActiveContent({...props.activeContent, route:'patient-history'})
    }
    //


    return (
         <div>
            <Menu size="mini" color={"black"} inverted >
                <Menu.Item onClick={() => onClickHome()} > Home</Menu.Item> 

                {patientObj.dynamicHivStatus==='Positive' || patientObj.staticHivStatus==='Positive' && (<>
                    {patientObj.pmtctRegStatus!==true ? (
                        <>
                        <Menu.Item onClick={() => loadAncPnc()} >PMTCT Enrollment</Menu.Item> 
                        
                        </>
                        )
                        :
                        (
                            <>
                            <Menu.Item onClick={() => onClickConsultation()} >Follow Up Visit</Menu.Item>                
                            <Menu.Item onClick={() => loadLabourDelivery()} >Labour and Delivery</Menu.Item>
                            <Menu.Item onClick={() => onClickPartner()} > Partners</Menu.Item>
                            <Menu.Item onClick={() => onClickInfant()} > Infant Information</Menu.Item>
                            </>
                        )
                    }               
                    
                </>)
                }
                <Menu.Item onClick={() => loadPatientHistory()} >History</Menu.Item>                
            </Menu>             
        </div>
    );
}



export default SubMenu;
