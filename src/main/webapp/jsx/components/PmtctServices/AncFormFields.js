import React from "react";
import { FormGroup, Label, Input, InputGroup } from "reactstrap";
import PersonIcon from "@material-ui/icons/Person";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import HealingIcon from "@material-ui/icons/Healing";
import TimelineIcon from "@material-ui/icons/Timeline";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import ChildCareIcon from "@material-ui/icons/ChildCare";
import moment from "moment";
import { toast } from "react-toastify";
import { calculateGestationalAge, validateGestationalAge, addWeeksToDate } from "../../utils";
import FacilitySearchDropdown from "../Patient/FacilitySearchDropdown";

const sectionContainerStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: "0.35rem",
  padding: "15px 10px",
  backgroundColor: "#f8f9fa",
};

const sectionHeaderStyle = {
  backgroundColor: "transparent",
  color: "#2d3748",
  padding: "8px 12px",
  borderRadius: "0.25rem",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const sectionIconStyle = {
  fontSize: "16px",
  color: "#014d88",
  marginRight: "6px",
  verticalAlign: "text-bottom",
};

const errorStyle = {
  color: "#f85032",
  fontSize: "12.8px",
};

/**
 * Reusable ANC enrollment form fields component.
 *
 * Props:
 *   values        - flat object with all ANC field values
 *   errors        - object with field-name -> error message
 *   onChange      - function(fieldName, value) called on any field change
 *   disabled      - boolean, true = view mode (all fields disabled)
 *   showHivFields - boolean, show HIV status / ART fields
 *   showAncSetting - boolean, show ANC Setting + Community Setting
 *   showFacilityField - boolean, show facility enrolled in
 *   ancNoDisabled - boolean, ANC number always disabled (e.g. update mode)
 *   ancNoValidator - async function(ancNo) => boolean, true if duplicate
 *   ancSettings   - array of codeset objects for ANC Setting dropdown
 *   communitySettings - array of codeset objects for Community Setting
 *   disableHIVStatus - boolean, disable HIV status dropdown
 *   minDates      - { minDateOfEnrollment, minLmp } for min date constraints
 */
const AncFormFields = ({
  values = {},
  errors = {},
  onChange,
  disabled = false,
  showHivFields = false,
  showAncSetting = false,
  showFacilityField = false,
  ancNoDisabled = false,
  ancNoValidator = null,
  ancSettings = [],
  communitySettings = [],
  disableHIVStatus = false,
  minDates = {},
}) => {

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Parity validation — prevent negative
    if (name === "parity" && value !== "" && value < 0) {
      return;
    }
    // Gravida validation — prevent zero or negative
    if (name === "gravida" && value !== "" && value <= 0) {
      return;
    }

    // Gestational age calculation when dateOfEnrollment changes
    if (name === "dateOfEnrollment" && value !== "" && values.lmp) {
      let ga = calculateGestationalAge(value, values.lmp);
      if (ga > 0) {
        const gaCheck = validateGestationalAge(ga);
        if (!gaCheck.valid) {
          if (gaCheck.reason === "too_high") {
            toast.error("Gestational age exceeds 45 weeks. Please select a valid date or update the LMP.");
          } else if (gaCheck.reason === "too_low") {
            toast.error("Gestational age must be at least 4 weeks.");
          }
          onChange("gaweeks", "");
          onChange(name, "");
          return;
        }
        onChange("gaweeks", ga);
        onChange(name, value);
      } else {
        toast.error("Please select a valid date");
        onChange(name, "");
      }
      return;
    }

    // Gestational age calculation when LMP changes
    if (name === "lmp" && value !== "") {
      let ga = calculateGestationalAge(values.dateOfEnrollment, value);
      if (ga > 0) {
        const gaCheck = validateGestationalAge(ga);
        if (!gaCheck.valid) {
          if (gaCheck.reason === "too_high") {
            toast.error("Gestational age exceeds 45 weeks. Please select a valid date or update the enrollment date.");
          } else if (gaCheck.reason === "too_low") {
            toast.error("Gestational age must be at least 4 weeks.");
          }
          onChange("gaweeks", "");
          onChange(name, "");
          return;
        }
        onChange("gaweeks", ga);
        onChange(name, value);
      } else {
        toast.error("Please select a valid date");
        onChange(name, "");
      }
      return;
    }

    // ANC number uniqueness validation
    if (name === "ancNo" && value !== "" && ancNoValidator) {
      ancNoValidator(value);
    }

    // Syphilis cascading resets
    if (name === "testedSyphilis" && value === "Yes") {
      onChange("testResultSyphilis", "");
      onChange("treatedSyphilis", "");
      onChange("referredSyphilisTreatment", "");
      onChange(name, value);
      return;
    }
    if (name === "testResultSyphilis" && value === "Positive") {
      onChange("treatedSyphilis", "");
      onChange("referredSyphilisTreatment", "");
      onChange(name, value);
      return;
    }

    // Hepatitis B cascading resets
    if (name === "testedHepatitisB") {
      onChange("dateOfHepatitisB", "");
      onChange("hepatitisB", "");
      onChange(name, value);
      return;
    }
    if (name === "hepatitisB") {
      onChange("treatedHepatitisB", "");
      onChange("referredHepatitisB", "");
      onChange(name, value);
      return;
    }

    // Hepatitis C cascading resets
    if (name === "testedHepatitisC") {
      onChange("dateOfHepatitisC", "");
      onChange("hepatitisC", "");
      onChange(name, value);
      return;
    }
    if (name === "hepatitisC") {
      onChange("treatedHepatitisC", "");
      onChange("referredHepatitisC", "");
      onChange(name, value);
      return;
    }

    // ANC Setting resets community
    if (name === "ancSetting") {
      onChange("communitySetting", "");
      onChange(name, value);
      return;
    }

    // HIV status auto-population
    if (name === "previouslyKnownHivStatus") {
      let newStaticHivStatus = "";
      if (value === "Yes") {
        newStaticHivStatus = "Positive";
      }
      onChange("staticHivStatus", newStaticHivStatus);
      onChange(name, value);
      return;
    }

    // Currently on ART resets facility
    if (name === "currentlyOnArt" && value !== "Yes") {
      onChange("facilityEnrolledIn", "");
    }

    onChange(name, value);
  };

  // Wrap onChange into synthetic event handler for <Input> elements
  const onInputChange = (e) => {
    // Clear error for field
    if (errors[e.target.name]) {
      onChange("__clearError__", e.target.name);
    }
    handleChange(e);
  };

  const err = (field) => errors[field] ? <span style={errorStyle}>{errors[field]}</span> : "";

  return (
    <>
      {/* === Registration Information === */}
      <div className="col-md-12 mb-3 mt-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <PersonIcon style={sectionIconStyle} />Registration Information
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>ANC No <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="text" name="ancNo" id="ancNo" onChange={onInputChange} value={values.ancNo || ""} disabled={disabled || ancNoDisabled} />
                </InputGroup>
                {err("ancNo")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Date of Enrollment <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="dateOfEnrollment" id="dateOfEnrollment" onChange={onInputChange} value={values.dateOfEnrollment || ""}
                    max={(() => {
                      const today = moment(new Date()).format("YYYY-MM-DD");
                      if (values.lmp) {
                        const lmpMax = addWeeksToDate(values.lmp, 45);
                        return lmpMax < today ? lmpMax : today;
                      }
                      return today;
                    })()}
                    min={(() => {
                      const lmpMin = values.lmp ? addWeeksToDate(values.lmp, 4) : "";
                      const adminMin = minDates.minDateOfEnrollment || "";
                      if (lmpMin && adminMin) return lmpMin > adminMin ? lmpMin : adminMin;
                      return lmpMin || adminMin;
                    })()}
                    disabled={disabled} />
                </InputGroup>
                {err("dateOfEnrollment")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>ANC Attendance</Label>
                <InputGroup>
                  <Input type="select" name="ancAttendance" id="ancAttendance" onChange={onInputChange} value={values.ancAttendance === "New" ? "New ANC" : values.ancAttendance || "New ANC"} disabled={true}>
                    <option value="">Select</option>
                    <option value="New ANC">New ANC</option>
                    <option value="Revisit">Revisit</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Referred from Spokes Site</Label>
                <InputGroup>
                  <Input type="select" name="referredFromSpokesSite" id="referredFromSpokesSite" onChange={onInputChange} value={values.referredFromSpokesSite || ""} disabled={disabled}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === ANC Setting (optional) === */}
      {showAncSetting && (
        <div className="col-md-12 mb-3">
          <div style={sectionContainerStyle}>
            <h6 style={sectionHeaderStyle}>
              <PersonIcon style={sectionIconStyle} />ANC Setting
            </h6>
            <div className="row">
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>ANC Setting</Label>
                  <InputGroup>
                    <Input type="select" name="ancSetting" id="ancSetting" onChange={onInputChange} value={values.ancSetting || ""} disabled={disabled}>
                      <option value="">Select</option>
                      {ancSettings.map((item, i) => (
                        <option key={i} value={item.code}>{item.display}</option>
                      ))}
                    </Input>
                  </InputGroup>
                </FormGroup>
              </div>
              {values.ancSetting === "ENROLLMENT_SETTING_COMMUNITY" && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Community Setting</Label>
                    <InputGroup>
                      <Input type="select" name="communitySetting" id="communitySetting" onChange={onInputChange} value={values.communitySetting || ""} disabled={disabled}>
                        <option value="">Select</option>
                        {communitySettings.map((item, i) => (
                          <option key={i} value={item.code}>{item.display}</option>
                        ))}
                      </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === HIV Status (optional) === */}
      {showHivFields && (
        <div className="col-md-12 mb-3">
          <div style={sectionContainerStyle}>
            <h6 style={sectionHeaderStyle}>
              <LocalHospitalIcon style={sectionIconStyle} />HIV Status
            </h6>
            <div className="row">
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Previously Known HIV Status</Label>
                  <InputGroup>
                    <Input type="select" name="previouslyKnownHivStatus" id="previouslyKnownHivStatus" onChange={onInputChange} value={values.previouslyKnownHivStatus || ""} disabled={disabled || disableHIVStatus}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not tested">Not tested</option>
                    </Input>
                  </InputGroup>
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>HIV Status at First ANC Visit</Label>
                  <InputGroup>
                    <Input type="select" name="staticHivStatus" id="staticHivStatus" onChange={onInputChange} value={values.staticHivStatus || ""} disabled={disabled || disableHIVStatus}>
                      <option value="">Select</option>
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                      <option value="Unknown">Unknown</option>
                    </Input>
                  </InputGroup>
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Currently on ART?</Label>
                  <InputGroup>
                    <Input type="select" name="currentlyOnArt" id="currentlyOnArt" onChange={onInputChange} value={values.currentlyOnArt || ""} disabled={disabled}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Input>
                  </InputGroup>
                </FormGroup>
              </div>
              {showFacilityField && values.currentlyOnArt === "Yes" && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Facility Currently Enrolled In</Label>
                    <FacilitySearchDropdown
                      value={values.facilityEnrolledIn || ""}
                      onChange={(val) => onChange("facilityEnrolledIn", val)}
                      disabled={disabled}
                    />
                    {err("facilityEnrolledIn")}
                  </FormGroup>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === Obstetric History === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <ChildCareIcon style={sectionIconStyle} />Obstetric History
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Parity <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="number" name="parity" id="parity" onChange={onInputChange} value={values.parity !== undefined && values.parity !== null ? values.parity : ""} min={0} disabled={disabled} />
                </InputGroup>
                {err("parity")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Gravida <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="number" name="gravida" id="gravida" onChange={onInputChange} value={values.gravida || ""} min="1" disabled={disabled} />
                </InputGroup>
                {err("gravida")}
                {values.gravida && values.parity && values.gravida < values.parity ? (
                  <span style={errorStyle}>Gravida should not be less Parity</span>
                ) : ""}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Date Of Last Menstrual Period <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="date" onKeyPress={(e) => { e.preventDefault(); }} name="lmp" id="lmp" onChange={onInputChange} value={values.lmp || ""}
                    max={(() => {
                      const refDate = values.dateOfEnrollment || moment(new Date()).format("YYYY-MM-DD");
                      return addWeeksToDate(refDate, -4);
                    })()}
                    min={(() => {
                      const refDate = values.dateOfEnrollment || moment(new Date()).format("YYYY-MM-DD");
                      const lmpMin = addWeeksToDate(refDate, -45);
                      const adminMin = minDates.minLmp || "";
                      if (adminMin && adminMin > lmpMin) return adminMin;
                      return lmpMin;
                    })()}
                    disabled={disabled} />
                </InputGroup>
                {err("lmp")}
                {values.gaweeks === 0 ? (<span style={errorStyle}>Invalid date</span>) : ""}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Gestational Age (Weeks) <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="text" name="gaweeks" id="gaweeks" onChange={onInputChange} value={values.gaweeks || ""} disabled />
                </InputGroup>
                {err("gaweeks")}
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === Vital Signs === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <FitnessCenterIcon style={sectionIconStyle} />Vital Signs
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Weight (kg)</Label>
                <InputGroup>
                  <Input type="number" name="weight" id="weight" onChange={onInputChange} value={values.weight || ""} step="0.1" min="30" max="150" disabled={disabled} />
                </InputGroup>
                {values.weight && (values.weight < 30 || values.weight > 150) ? (
                  <span style={errorStyle}>Body weight must not be greater than 150 and less than 30</span>
                ) : ""}
                {err("weight")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Height (cm)</Label>
                <InputGroup>
                  <Input type="number" name="height" id="height" onChange={onInputChange} value={values.height || ""} step="0.1" min="48.26" max="216.408" disabled={disabled} />
                </InputGroup>
                {values.height && (values.height < 48.26 || values.height > 216.408) ? (
                  <span style={errorStyle}>Height cannot be greater than 216.408 and less than 48.26</span>
                ) : ""}
                {err("height")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Blood Pressure (mmHg)</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Input type="number" name="systolic" id="systolic" placeholder="Systolic" onChange={onInputChange} value={values.systolic || ""} min="90" max="240" disabled={disabled}
                    style={{ height: "35px", fontSize: "13px", flex: 1, borderColor: values.systolic && (values.systolic < 90 || values.systolic > 240) ? "#e53e3e" : "#d2d6dc", borderWidth: "1.5px" }} />
                  <span style={{ fontWeight: "bold", color: "#64748b", fontSize: "18px" }}>/</span>
                  <Input type="number" name="diastolic" id="diastolic" placeholder="Diastolic" onChange={onInputChange} value={values.diastolic || ""} min="60" max="140" disabled={disabled}
                    style={{ height: "35px", fontSize: "13px", flex: 1, borderColor: values.diastolic && (values.diastolic < 60 || values.diastolic > 140) ? "#e53e3e" : "#d2d6dc", borderWidth: "1.5px" }} />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ flex: 1 }}>
                    {values.systolic && (values.systolic < 90 || values.systolic > 240) ? (
                      <span style={errorStyle}>Systolic must be between 90 and 240</span>
                    ) : ""}
                    {err("systolic")}
                  </div>
                  <div style={{ flex: 1 }}>
                    {values.diastolic && (values.diastolic < 60 || values.diastolic > 140) ? (
                      <span style={errorStyle}>Diastolic must be between 60 and 140</span>
                    ) : ""}
                    {err("diastolic")}
                  </div>
                </div>
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === Counselling === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <TimelineIcon style={sectionIconStyle} />Counselling
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>HIV Testing Services<span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="select" name="counsellingHts" id="counsellingHts" onChange={onInputChange} value={values.counsellingHts || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingHts")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Female Genital Mutilation (FGM)</Label>
                <InputGroup>
                  <Input type="select" name="counsellingFgm" id="counsellingFgm" onChange={onInputChange} value={values.counsellingFgm || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingFgm")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Family Planning</Label>
                <InputGroup>
                  <Input type="select" name="counsellingFp" id="counsellingFp" onChange={onInputChange} value={values.counsellingFp || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingFp")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Maternal Nutrition</Label>
                <InputGroup>
                  <Input type="select" name="counsellingMaternalNutrition" id="counsellingMaternalNutrition" onChange={onInputChange} value={values.counsellingMaternalNutrition || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingMaternalNutrition")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Early Initiation of Breastfeeding</Label>
                <InputGroup>
                  <Input type="select" name="counsellingEarlyBf" id="counsellingEarlyBf" onChange={onInputChange} value={values.counsellingEarlyBf || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingEarlyBf")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Exclusive Breastfeeding</Label>
                <InputGroup>
                  <Input type="select" name="counsellingExclusiveBf" id="counsellingExclusiveBf" onChange={onInputChange} value={values.counsellingExclusiveBf || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("counsellingExclusiveBf")}
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === Syphilis Information === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <LocalHospitalIcon style={sectionIconStyle} />Syphilis Information
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Tested for Syphilis <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="select" name="testedSyphilis" id="testedSyphilis" onChange={onInputChange} value={values.testedSyphilis || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
                {err("testedSyphilis")}
              </FormGroup>
            </div>
            {values.testedSyphilis === "Yes" && (
              <>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Syphilis Test Result <span style={{ color: "red" }}> *</span></Label>
                    <InputGroup>
                      <Input type="select" name="testResultSyphilis" id="testResultSyphilis" onChange={onInputChange} value={values.testResultSyphilis || ""} disabled={disabled}>
                        <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                      </Input>
                    </InputGroup>
                    {err("testResultSyphilis")}
                  </FormGroup>
                </div>
                {values.testResultSyphilis === "Positive" && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Treated for Syphilis <span style={{ color: "red" }}> *</span></Label>
                      <InputGroup>
                        <Input type="select" name="treatedSyphilis" id="treatedSyphilis" onChange={onInputChange} value={values.treatedSyphilis || ""} disabled={disabled}>
                          <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                        </Input>
                      </InputGroup>
                      {err("treatedSyphilis")}
                    </FormGroup>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* === Hepatitis Information === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <LocalHospitalIcon style={sectionIconStyle} />Hepatitis Information
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Tested for Hepatitis B <span style={{ color: "red" }}> *</span></Label>
                <InputGroup>
                  <Input type="select" name="testedHepatitisB" id="testedHepatitisB" onChange={onInputChange} value={values.testedHepatitisB || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            {values.testedHepatitisB === "Yes" && (
              <>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Hepatitis B Test Result</Label>
                    <InputGroup>
                      <Input type="select" name="hepatitisB" id="hepatitisB" onChange={onInputChange} value={values.hepatitisB || ""} disabled={disabled}>
                        <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                      </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                {values.hepatitisB === "Positive" && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Referred Hepatitis B +ve Client</Label>
                      <InputGroup>
                        <Input type="select" name="referredHepatitisB" id="referredHepatitisB" onChange={onInputChange} value={values.referredHepatitisB || ""} disabled={disabled}>
                          <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>
                )}
              </>
            )}
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Tested for Hepatitis C</Label>
                <InputGroup>
                  <Input type="select" name="testedHepatitisC" id="testedHepatitisC" onChange={onInputChange} value={values.testedHepatitisC || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            {values.testedHepatitisC === "Yes" && (
              <>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Hepatitis C Test Result</Label>
                    <InputGroup>
                      <Input type="select" name="hepatitisC" id="hepatitisC" onChange={onInputChange} value={values.hepatitisC || ""} disabled={disabled}>
                        <option value="">Select</option><option value="Positive">Positive</option><option value="Negative">Negative</option>
                      </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
                {values.hepatitisC === "Positive" && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <Label>Referred Hepatitis C +ve Client</Label>
                      <InputGroup>
                        <Input type="select" name="referredHepatitisC" id="referredHepatitisC" onChange={onInputChange} value={values.referredHepatitisC || ""} disabled={disabled}>
                          <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                        </Input>
                      </InputGroup>
                    </FormGroup>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* === Haematology & Lab Tests === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <HealingIcon style={sectionIconStyle} />Haematology & Lab Tests
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>HB (g/dl)</Label>
                <InputGroup>
                  <Input type="number" name="hbPcv" id="hbPcv" onChange={onInputChange} value={values.hbPcv || ""} min="0" max="25" step="0.1" disabled={disabled}
                    style={{ borderColor: values.hbPcv && (parseFloat(values.hbPcv) < 0 || parseFloat(values.hbPcv) > 25) ? "#e53e3e" : "#d2d6dc", borderWidth: "1.5px" }} />
                </InputGroup>
                {values.hbPcv && (parseFloat(values.hbPcv) < 0 || parseFloat(values.hbPcv) > 25) ? (
                  <span style={errorStyle}>HB must be between 0 and 25 g/dL</span>
                ) : ""}
                {err("hbPcv")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>PCV (%)</Label>
                <InputGroup>
                  <Input type="number" name="pcv" id="pcv" onChange={onInputChange} value={values.pcv || ""} min="0" max="70" step="1" disabled={disabled}
                    style={{ borderColor: values.pcv && (parseFloat(values.pcv) < 0 || parseFloat(values.pcv) > 70) ? "#e53e3e" : "#d2d6dc", borderWidth: "1.5px" }} />
                </InputGroup>
                {values.pcv && (parseFloat(values.pcv) < 0 || parseFloat(values.pcv) > 70) ? (
                  <span style={errorStyle}>PCV must be between 0% and 70%</span>
                ) : ""}
                {err("pcv")}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Blood Sugar (Gestational Diabetes)</Label>
                <InputGroup>
                  <Input type="number" name="bloodSugarGdm" id="bloodSugarGdm" onChange={onInputChange} value={values.bloodSugarGdm || ""} min="0" max="500" step="1" disabled={disabled}
                    style={{ borderColor: values.bloodSugarGdm && (parseFloat(values.bloodSugarGdm) < 0 || parseFloat(values.bloodSugarGdm) > 500) ? "#e53e3e" : "#d2d6dc", borderWidth: "1.5px" }} />
                </InputGroup>
                {values.bloodSugarGdm && (parseFloat(values.bloodSugarGdm) < 0 || parseFloat(values.bloodSugarGdm) > 500) ? (
                  <span style={errorStyle}>Blood Sugar must be between 0 and 500 mg/dL</span>
                ) : ""}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Urinalysis - Sugar</Label>
                <InputGroup>
                  <Input type="select" name="urinalysisSugar" id="urinalysisSugar" onChange={onInputChange} value={values.urinalysisSugar || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Urinalysis - Proteins</Label>
                <InputGroup>
                  <Input type="select" name="urinalysisProteins" id="urinalysisProteins" onChange={onInputChange} value={values.urinalysisProteins || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Normal">Normal</option><option value="Abnormal">Abnormal</option><option value="Not Done">Not Done</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === Preventive Services === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <HealingIcon style={sectionIconStyle} />Preventive Services
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>LLIN Given (Mosquito Net)?</Label>
                <InputGroup>
                  <Input type="select" name="llinGiven" id="llinGiven" onChange={onInputChange} value={values.llinGiven || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Dose of IPT Given</Label>
                <InputGroup>
                  <Input type="select" name="iptDose" id="iptDose" onChange={onInputChange} value={values.iptDose || ""} disabled={disabled}>
                    <option value="">Select</option><option value="IPT1">IPT 1</option><option value="IPT2">IPT 2</option><option value="IPT3">IPT 3</option><option value="IPT4">IPT 4</option><option value="None">None</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Hematinics Given (Iron & Folic Acid)?</Label>
                <InputGroup>
                  <Input type="select" name="hematinicsGiven" id="hematinicsGiven" onChange={onInputChange} value={values.hematinicsGiven || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>TD Immunization</Label>
                <InputGroup>
                  <Input type="select" name="tdImmunization" id="tdImmunization" onChange={onInputChange} value={values.tdImmunization || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Td1">Td1</option><option value="Td2">Td2</option><option value="Td3">Td3</option><option value="Td4">Td4</option><option value="Td5">Td5</option><option value="None">None</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
          </div>
        </div>
      </div>

      {/* === Visit Outcome === */}
      <div className="col-md-12 mb-3">
        <div style={sectionContainerStyle}>
          <h6 style={sectionHeaderStyle}>
            <AssignmentTurnedInIcon style={sectionIconStyle} />Visit Outcome
          </h6>
          <div className="row">
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Associated Problems</Label>
                <InputGroup>
                  <Input type="textarea" name="associatedProblems" id="associatedProblems" onChange={onInputChange} value={values.associatedProblems || ""} style={{ height: "41px" }} disabled={disabled} />
                </InputGroup>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>Outcome of Visit</Label>
                <InputGroup>
                  <Input type="select" name="outcomeOfVisit" id="outcomeOfVisit" onChange={onInputChange} value={values.outcomeOfVisit || ""} disabled={disabled}>
                    <option value="">Select</option><option value="Not Treated">Not Treated (NT)</option><option value="Treated">Treated (T)</option><option value="Admitted">Admitted (A)</option><option value="Referred Out">Referred Out (RO)</option>
                  </Input>
                </InputGroup>
              </FormGroup>
            </div>
            {values.outcomeOfVisit === "Referred Out" && (
              <>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Reason for Referral</Label>
                    <InputGroup>
                      <Input type="text" name="referralReason" id="referralReason" onChange={onInputChange} value={values.referralReason || ""} disabled={disabled} />
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Transportation Out</Label>
                    <InputGroup>
                      <Input type="select" name="transportationOut" id="transportationOut" onChange={onInputChange} value={values.transportationOut || ""} disabled={disabled}>
                        <option value="">Select</option><option value="Ambulance">Ambulance</option><option value="Others">Others</option>
                      </Input>
                    </InputGroup>
                  </FormGroup>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AncFormFields;
