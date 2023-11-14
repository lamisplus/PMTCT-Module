import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link, useHistory } from "react-router-dom";

import React, { useState, Fragment, useEffect } from "react";
const PmtctEntryPoint = (props) => {
  const [key, setKey] = useState("home");
  const [postPartumValue, setPostPartumValue] = useState("");
  const history = useHistory();

  useEffect(() => {
    setKey("home");
    console.log(props);
  }, []);

  return (
    <div className="PMTCT-entryPoint">
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            PMTCT Entry Point{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4> </h4>

          <div
            className=" "
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link
              to={{
                pathname: props.route,
                state: { showANC: true, postValue: "ANC", ...props.info },
              }}
            >
              <Button
                variant="primary"
                color="primary"
                className=" mb-10 px-4"
                style={{
                  border: "1px solid black",
                  color: "white",
                  borderRadius: "0",
                  width: "120px",
                  height: "35px",
                  backgroundColor: "#007bb6",
                  borderRadius: "3px",
                  border: "none",
                }}
              >
                <span style={{ textTransform: "capitalize" }}>ANC</span>
              </Button>
            </Link>

            <Link
              to={{
                pathname: props.route,
                state: { showANC: false, postValue: "L&D", ...props.info },
              }}
            >
              <Button
                variant="primary"
                color="primary"
                className=" mb-10 px-4"
                style={{
                  border: "1px solid black",
                  color: "white",
                  borderRadius: "0",
                  width: "120px",
                  margin: "10px 20px ",
                  height: "35px",
                  backgroundColor: "rgb(153, 46, 98)",
                  borderRadius: "3px",
                  border: "none",
                }}
              >
                <span style={{ textTransform: "capitalize" }}>L&D</span>
              </Button>
            </Link>

            <select
              style={{
                border: "1px solid black",
                color: "white",
                borderRadius: "0",
                width: "120px",
                height: "35px",
                padding: "0px 5px",
                backgroundColor: "#21ba45",
                borderRadius: "3px",
                border: "none",
              }}
              onChange={(e) => {
                setPostPartumValue(e.target.value);
                history.push({
                  pathname: props.route,
                  state: {
                    showANC: false,
                    postValue: e.target.value,
                    ...props.info,
                  },
                });
              }}
            >
              <option defaultValue={""}>Post Partum</option>

              <option value="< 72 hrs">{"< 72 hrs"}</option>
              <option value="> 72 hrs - < 6 month">
                {"> 72 hrs - < 6 month"}
              </option>
              <option value="> 6 months - 12 months">
                {"> 6 months - 12 months"}
              </option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="contained"
            color="primary"
            className=" float-end mb-10"
            style={{ backgroundColor: "#014d88", color: "white" }}
            onClick={props.onHide}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PmtctEntryPoint;
