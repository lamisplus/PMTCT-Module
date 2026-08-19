import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { url as baseUrl, token } from "../../api";

export const calculate_age = (dob) => {
  if (dob !== null && dob != "") {
    //Check if the DOB is not null or empty
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob);
    // get the day, month and year of today
    let todayMonth = today.getMonth();
    let todayYear = today.getFullYear();
    let todayDate = today.getDate(); // get the day, month and year from date of birth
    let birthDateMonth = birthDate.getMonth();
    let birthDateYear = birthDate.getFullYear();
    let birthdateDate = birthDate.getDate();
    // substract birthdate year from today year  ie todayYear - birthdateYear which  will give  "AssumedAge" is the age  we assume the patient will clock this year
    let assumedAge = todayYear - birthDateYear;
    if (assumedAge > 0) {
      //Checking the month to confirm if the age has been cloocked
      let monthGap = todayMonth - birthDateMonth;
      // If 'monthGap'> 0, the age has been clocked, 'monthGap'< 0, the age has not been clocked, 'monthGap'= 0, we are in the month then check date to confirm clocked age
      if (monthGap > 0) {
        return assumedAge + " year(s)";
      } else if (monthGap < 0) {
        let confirmedAge = assumedAge - 1;
        return confirmedAge + " year(s)";
      } else if (monthGap === 0) {
        let dateGap = todayDate - birthdateDate;

        if (dateGap > 0) {
          return assumedAge + " year(s)";
        } else if (dateGap < 0) {
          let confirmedAge = assumedAge - 1;
          return confirmedAge + " year(s)";
        }
      }
    } else {
      let monthGap = todayMonth - birthDateMonth;
      let dateGap = todayDate - birthdateDate;
      let monthOld = monthGap > 0 ? monthGap : 0;
      let DayOld = dateGap > 0 ? dateGap : 0;
      let result = monthOld ? monthOld + "month(s)" : DayOld + "day(s)";
      return result;
    }
  }
};





export const calculateGestationalAge = (enrollmentDate, lmp) => {

  if(enrollmentDate === ""){

    toast.error("Date of enrolllment is empty");
    return 0;

  }else if(lmp ===  "" ){

    toast.error("Last menstrual Period is empty");
    return 0;

  }else if(enrollmentDate < lmp){

    toast.error("Last menstrual Period is earlier than enrollment date");
    return 0;

  }else{

      let theEnrollmentDate = moment(enrollmentDate);
      let theLmp = moment(lmp);

      if(theEnrollmentDate.diff(theLmp, 'week') >= 1 ){
          return theEnrollmentDate.diff(theLmp, 'week')
      }else{
        return 0;
      }
  }


}

export const validateGestationalAge = (gaWeeks, min = 4, max = 45) => {
  const ga = parseInt(gaWeeks);
  if (isNaN(ga) || ga <= 0) {
    return { valid: false, gaWeeks: ga, reason: "invalid" };
  }
  if (ga > max) {
    return { valid: false, gaWeeks: ga, reason: "too_high" };
  }
  if (ga < min) {
    return { valid: false, gaWeeks: ga, reason: "too_low" };
  }
  return { valid: true, gaWeeks: ga, reason: null };
};

export const addWeeksToDate = (dateStr, weeks) => {
  return moment(dateStr).add(weeks, "weeks").format("YYYY-MM-DD");
};

// Scrolls to and focuses the topmost (first, in visual/reading order) field with a
// validation error, so the user isn't left hunting a long form for a red error message
// they can't see. Call with the field name/id keys that currently have an error message —
// e.g. Object.keys(newErrors).filter((k) => newErrors[k]) — after a failed validate() on
// submit. Re-running this on each submit attempt naturally advances to the next remaining
// error once earlier ones are fixed, since it always picks whichever error field is
// currently topmost on screen.
export const scrollToFirstError = (errorFieldKeys) => {
  if (!errorFieldKeys || errorFieldKeys.length === 0) return;
  let target = null;
  let minTop = Infinity;
  errorFieldKeys.forEach((key) => {
    const el = document.getElementById(key) || document.getElementsByName(key)[0];
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < minTop) {
      minTop = top;
      target = el;
    }
  });
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  // Focus after the scroll settles rather than immediately — focusing mid-scroll can jump
  // the viewport straight to the field (skipping the smooth animation) in some browsers.
  setTimeout(() => {
    if (typeof target.focus === "function") target.focus({ preventScroll: true });
  }, 400);
};

export  const convertMaternalCodeToValue = (code) => {
  const stored = JSON.parse(localStorage.getItem("maternalOutcome"));

      if(stored && stored.length > 0){
           let convertedValue =  stored.filter((each )=>{

              return each.code === code

             })

             return  convertedValue.length > 0 ? convertedValue[0].display : "";

          }
      return "";
}



