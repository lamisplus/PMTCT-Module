import React, { memo } from "react";
import { Link } from "react-router-dom";
const FindPatientName = memo(({ row }) => {
  if (row.currentStatus !== "Not Enrolled") {
    return (
      <Link
        to={{ pathname: "/patient-history", state: { patientObj: row } }}
        title="Click to view patient dashboard"
      >
        {row.firstName + " " + row.surname}
      </Link>
    );
  }
  return (
    <Link
      to={{
        pathname: "/enroll-patient",
        state: { patientId: row.id, patientObj: row },
      }}
      title="Enroll Patient"
    >
      {row.firstName + " " + row.surname}
    </Link>
  );
});

export default FindPatientName;
