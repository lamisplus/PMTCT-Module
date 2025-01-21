import { useState, useEffect, useMemo, memo } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import PmtctEntryPoint from "../PmtctServices/PmtctEntryPoint";
import { url as baseUrl, token, wsUrl } from "./../../../api";
import { calculate_age } from "../../../utils";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "react-router-dom";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { Card, CardBody } from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { TiArrowForward } from "react-icons/ti";
import { MdDashboard } from "react-icons/md";

import "@reach/menu-button/styles.css";
import { Label } from "semantic-ui-react";
 import SockJsClient from "react-stomp";

import Spinner from "react-bootstrap/Spinner";
import { usePermissions } from "../../../hooks/usePermissions";
import { useCheckedInPatientData } from "../../../hooks/useCheckedInPatientData";
import CustomTable from "../../../reuseables/CustomTable";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const CheckedInPatients = (props) => {
  const { hasAnyPermission } = usePermissions();
  const [showPPI, setShowPPI] = useState(true);
  const { fetchPatients } = useCheckedInPatientData(baseUrl, token);
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [info, setInfo] = useState({});

  const permissions = useMemo(
    () => ({
      canSeeEnrollButton: hasAnyPermission("maternal_cohort_register","general_anc_register"  ),
    }),
    [hasAnyPermission]
  );

  const onMessageReceived = (msg) => {
    if (msg && msg?.toLowerCase()?.includes("check")) {
      // Trigger table refresh by updating the refresh trigger state
      setTableRefreshTrigger((prev) => prev + 1);
    }
  };


  const handleCheckBox = (e) => {
    setShowPPI(!e.target.checked);
  };

  const columns = useMemo(
    () => [
      {
        title: "Patient Name",
        field: "fullname",
        hidden: showPPI,
      },
      {
        title: "Hospital Number",
        field: "hospitalNumber",
      },
      { title: "Sex", field: "sex" },
      { title: "Age", field: "age" },
      {
        title: "Biometrics",
        field: "biometricStatus",
        render: (rowData) =>
          rowData.biometricStatus === true ? (
            <Label color="green" size="mini">
              Biometric Captured
            </Label>
          ) : (
            <Label color="red" size="mini">
              No Biometric
            </Label>
          ),
      },
      // {
      //   title: "ART Status",
      //   field: "currentStatus",
      //   render: (rowData) => (
      //     <Label color="blue" size="mini">
      //       {rowData.currentStatus || "Not Enrolled"}
      //     </Label>
      //   ),
      // },
      {
        title: "Actions",
        field: "actions",
        render: (rowData) => {
          const isEnrolled = rowData.isEnrolled;

          return (
            <div>

     { permissions.canSeeEnrollButton &&  rowData.isOnPmtct ?
      <div
            onClick={(e) => {
              setInfo({ patientId: rowData.id, patientObj: rowData });
            }}
          >
            <Link
                      to={{
                             pathname: "/patient-history",
                             state: { patientObj: rowData },
                      }}
                                >
            <ButtonGroup
              variant="contained"
              aria-label="split button"
              style={{
                backgroundColor: "rgb(153, 46, 98)",
                height: "30px",
                width: "215px",
              }}
              size="large"
            >
              <Button
                color="primary"
                size="small"
                aria-label="select merge strategy"
                aria-haspopup="menu"
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <TiArrowForward />
              </Button>
                <Button
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  Dashboard
                </span>
              </Button>
            </ButtonGroup>
            </Link>
      </div> : permissions.canSeeEnrollButton &&  rowData.isOnAnc? 
      <div
            onClick={(e) => {
              setInfo({ patientId: rowData.id, patientObj: rowData });
            }}
          >
            <Link
                      to={{
                             pathname: "/patient-history",
                             state: { patientObj: rowData },
                      }}
                                >
            <ButtonGroup
              variant="contained"
              aria-label="split button"
              style={{
                backgroundColor: "rgb(153, 46, 98)",
                height: "30px",
                width: "215px",
              }}
              size="large"
            >
              <Button
                color="primary"
                size="small"
                aria-label="select merge strategy"
                aria-haspopup="menu"
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <TiArrowForward />
              </Button>
                <Button
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  Dashboard
                </span>
              </Button>
            </ButtonGroup>
            </Link>
      </div>:permissions.canSeeEnrollButton?
       <div
            onClick={(e) => {
              setModalShow(true);
              setInfo({ patientId: rowData.id, patientObj: rowData });
            }}
          >
            {/* <Link
                      to={{
                             pathname: "/enroll-patient",
                             state: { patientId : rowData.id, patientObj: rowData, entryType: 'ANC'  }
                            }}
                                > */}
            <ButtonGroup
              variant="contained"
              aria-label="split button"
              style={{
                backgroundColor: "rgb(153, 46, 98)",
                height: "30px",
                width: "215px",
              }}
              size="large"
            >
              <Button
                color="primary"
                size="small"
                aria-label="select merge strategy"
                aria-haspopup="menu"
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <TiArrowForward />
              </Button>
                <Button
                style={{ backgroundColor: "rgb(153, 46, 98)" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#fff",
                    fontWeight: "bolder",
                  }}
                >
                  Enroll Patient
                </span>
              </Button>
            </ButtonGroup>
            {/* </Link> */}
      </div> : ""  } 



      </div>
          );
        },
      },
    ],
    [showPPI, permissions.canSeeEnrollButton]
  );

  const getData = async (query) => {
    try {
      const data = await fetchPatients(query);
      
      const reversedData = [...(data || [])].reverse();


      return {
        data: reversedData,
        page: query?.page || 0,
        totalCount: reversedData.length || 0,
      };
    } catch (error) {
      return {
        data: [],
        page: 0,
        totalCount: 0,
      };
    }
  };

  return (
    <div>
       <SockJsClient
        url={wsUrl}
        topics={["/topic/checking-in-out-process"]}
        onMessage={onMessageReceived}
        debug={true}
      /> 
      <Card>
        <CardBody>
          <CustomTable
            key={tableRefreshTrigger}
            title="PMTCT Checked In Patients"
            columns={columns}
            data={getData}
            icons={tableIcons}
            showPPI={showPPI}
            onPPIChange={handleCheckBox}
          />
        </CardBody>
      </Card>

      <PmtctEntryPoint
        route="/enroll-patient"
        show={modalShow}
        info={info}
        onHide={() => setModalShow(false)}
      />
    </div>
  );
};

export default memo(CheckedInPatients);
