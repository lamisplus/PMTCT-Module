import React, { useEffect, useState } from 'react'
import MaterialTable from 'material-table';
import axios from "axios";
import { url as baseUrl , token as token} from "./../../../../api";
import { forwardRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import "react-widgets/dist/css/react-widgets.css";
import { toast} from "react-toastify";
import {FaUserPlus} from 'react-icons/fa'
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/dist/css/react-widgets.css';
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from "react-router-dom";
//import {Menu,MenuList,MenuButton,MenuItem,} from "@reach/menu-button";
import "@reach/menu-button/styles.css";

import { Dropdown,Button, Menu, Icon } from 'semantic-ui-react'


const tableIcons = {
Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

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



const PatientnHistory = (props) => {
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        PatientHistory()
      }, [props.patientObj.id]);
        ///GET LIST OF Patients
        const PatientHistory =()=>{
            setLoading(true)
            axios
               .get(`${baseUrl}pmtct/anc/${props.patientObj.id}`,
                   { headers: {"Authorization" : `Bearer ${token}`} }
               )
               .then((response) => {
                setLoading(false)
                //console.log(response.data.partnerInformation)
                setPartners(response.data.partnerInformation!==null ? [response.data.partnerInformation] : [])
                })

               .catch((error) => {
               //console.log(error);
               });
           
          }
    
    const LoadPage =(row,activePage)=>{    
            props.setActiveContent({...props.activeContent, route:'add-partner', id:row, actionType:activePage, obj:row})
    }
    const LoadViewPage =(row)=>{
        
        if(row.path==='Mental-health'){        
            //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
            axios
            .delete(`${baseUrl}observation/${row.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                toast.success("Record Deleted Successfully");
                PatientHistory()
            })
            .catch((error) => {
                if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    toast.error(errorMessage);
                  }
                  else{
                    toast.error("Something went wrong. Please try again...");
                  }
            });  
        }else if(row.path==='Art-commence'){
            //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
            axios
            .delete(`${baseUrl}hiv/art/commencement/${row.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                toast.success("Record Deleted Successfully");
                PatientHistory()
            })
            .catch((error) => {
                if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    toast.error(errorMessage);
                  }
                  else{
                    toast.error("Something went wrong. Please try again...");
                  }
            });

        }
        
    }

  return (
    <div>
        <Button
            variant="contained"
            color="primary"
            className=" float-end  mr-2 mt-2"
            onClick={()=>LoadPage()}
            style={{backgroundColor:"#014d88"}}
            startIcon={<FaUserPlus size="10"/>}
        >
            <span style={{ textTransform: "capitalize" }}>New Partner</span>
        </Button>
        <br/><br/><br/><br/>

            <MaterialTable
            icons={tableIcons}
              title="List of Partners "
              columns={[
                { title: "Partner Name", field: "name" },
                { title: "Partner Name", field: "age" },
                { title: "Pre-test Counseled", field: "pre" },
                { title: "Partner Accept HIV Test", field: "hiv" },             
                { title: "Post-Test Counseled", field: "post" },
                { title: "HBV Status", field: "hbv" },
                { title: "HCV Status", field: "hcv" },
                { title: "Syphillis Status", field: "syphillis" },
                { title: "Referred To", field: "referred", filtering: false },        
                { title: "Actions", field: "actions", filtering: false }, 
              ]}
              isLoading={loading}
              data={partners.map((row) => ({
                   name: row.fullName,
                   age: row.age,
                   pre: row.preTestCounseled,
                   hiv: row.acceptHivTest,
                   post: row.postTestCounseled,
                   hbv: row.hbStatus,
                   hcv: row.hbStatus,
                   syphillis: row.syphillisStatus,
                   referred: row.referredTo,
                   actions:
            
                    <div>
                        <Menu.Menu position='right'  >
                        <Menu.Item >
                            <Button style={{backgroundColor:'rgb(153,46,98)'}} primary>
                            <Dropdown item text='Action'>

                            <Dropdown.Menu style={{ marginTop:"10px", }}>
                            <Dropdown.Item onClick={()=>LoadPage(row, 'view')}> <Icon name='eye' />View  </Dropdown.Item>
                                <Dropdown.Item  onClick={()=>LoadPage(row, 'update')}><Icon name='edit' />Edit</Dropdown.Item>
                                {/* <Dropdown.Item  onClick={()=>LoadPage(row, 'delete')}> <Icon name='trash' /> Delete</Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                            </Button>
                        </Menu.Item>
                        </Menu.Menu>
                  </div>
                  
                  }))}
            
                        options={{
                          headerStyle: {
                              backgroundColor: "#014d88",
                              color: "#fff",
                          },
                          searchFieldStyle: {
                              width : '200%',
                              margingLeft: '250px',
                          },
                          filtering: false,
                          exportButton: false,
                          searchFieldAlignment: 'left',
                          pageSizeOptions:[10,20,100],
                          pageSize:10,
                          debounceInterval: 400
                      }}
            />
         
    </div>
  );
}

export default PatientnHistory;


