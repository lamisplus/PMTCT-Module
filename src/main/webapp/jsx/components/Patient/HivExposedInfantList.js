import React, { forwardRef } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import axios from "axios";
import { token as token, url as baseUrl } from "./../../../api";

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
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { MdDashboard } from "react-icons/md";
import "@reach/menu-button/styles.css";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";

Moment.locale("en");
momentLocalizer();

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

// Age in completed months — calculate_age (utils) reports whole years, which reads as "0"
// for the entire 0-24 month range this grid targets.
const calculateAgeInMonths = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months += today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months -= 1;
  return `${Math.max(months, 0)} mo`;
};

// HIV-Exposed Infant grid: children aged 0-24 months with a positive HTS record and no
// PMTCT/maternal enrollment path — picking a row opens the dedicated infant-only dashboard,
// not the pregnant-woman PatientDetail dashboard.
const HivExposedInfantList = () => {
  const columns = [
    {
      title: "Patient Name",
      field: "fullName",
      render: (rowData) =>
        rowData.fullName || `${rowData.firstName || ""} ${rowData.surname || ""}`.trim(),
    },
    { title: "Hospital Number", field: "hospitalNumber", filtering: false },
    { title: "Sex", field: "sex", filtering: false },
    {
      title: "Age",
      field: "dateOfBirth",
      filtering: false,
      render: (rowData) => calculateAgeInMonths(rowData.dateOfBirth),
    },
    {
      title: "Actions",
      field: "actions",
      render: (rowData) => (
        <Link
          to={{
            pathname: "/hei-infant-dashboard",
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
              aria-label="open infant dashboard"
              aria-haspopup="menu"
              style={{ backgroundColor: "rgb(153, 46, 98)" }}
            >
              <MdDashboard />
            </Button>
            <Button style={{ backgroundColor: "rgb(153, 46, 98)" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: "bolder",
                }}
              >
                Infant Dashboard
              </span>
            </Button>
          </ButtonGroup>
        </Link>
      ),
    },
  ];

  const getData = async (query) => {
    try {
      const searchParam = query.search || "*";
      const response = await axios.get(
        `${baseUrl}pmtct/anc/hiv-exposed-infants?pageSize=${query.pageSize}&pageNo=${query.page}&searchParam=${searchParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return {
        data: response.data.records || [],
        page: query?.page || 0,
        totalCount: response.data.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching HIV-Exposed Infant candidates:", error);
      return { data: [], page: 0, totalCount: 0 };
    }
  };

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="HIV Exposed Infants"
        columns={columns}
        data={getData}
        localization={{
          body: { emptyDataSourceMessage: "No records to display" },
        }}
        options={{
          headerStyle: { backgroundColor: "#014d88", color: "#fff" },
          searchFieldStyle: { width: "200%", margingLeft: "250px" },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
        components={{
          Toolbar: (props) => <MTableToolbar {...props} />,
        }}
      />
    </div>
  );
};

export default HivExposedInfantList;
