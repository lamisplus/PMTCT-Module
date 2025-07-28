
import React from "react";
import MaterialTable, { MTableToolbar } from "material-table";

const defaultOptions = {
  search: true,
  headerStyle: {
    backgroundColor: "#014d88",
    color: "#fff",
  },
  searchFieldStyle: {
    width: "200%",
    margingLeft: "250px",
  },
  filtering: false,
  exportButton: false,
  searchFieldAlignment: "left",
  pageSizeOptions: [10, 20, 100],
  pageSize: 10,
  debounceInterval: 400,
};

const CustomTable = ({ title, columns, data, icons, showPPI, onPPIChange,
  isLoading
}) => {
    
  const CustomToolbar = (props) => (
    <div>
      <div className="form-check custom-checkbox float-left mt-4 ml-3">
        <input
          type="checkbox"
          className="form-check-input"
          name="showPPI"
          id="showPPI"
          value="showPPI"
          checked={!showPPI}
          onChange={onPPIChange}
          style={{
            border: "1px solid #014D88",
            borderRadius: "0.25rem",
          }}
        />
        <label className="form-check-label" htmlFor="basic_checkbox_1">
          <b style={{ color: "#014d88", fontWeight: "bold" }}>SHOW PII</b>
        </label>
      </div>
      <MTableToolbar {...props} />
    </div>
  );

  return (
    <MaterialTable
      icons={icons}
      title={title}
      columns={columns}
      isLoading={isLoading}
      data={data}
      options={defaultOptions}
      components={{
        Toolbar: CustomToolbar,
      }}
    />
  );
};

export default React.memo(CustomTable);
