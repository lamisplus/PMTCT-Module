export const calculate_age = (dob) => {
  console.log("the date of birth", dob);
  if (dob !== null && dob != "") {
    //Check if the DOB is not null or empty
    const today = new Date();
    const dateParts = dob.split("-");
    const birthDate = new Date(dob);
    console.log(birthDate); // get the day, month and year of today
    let todayMonth = today.getMonth();
    let todayYear = today.getFullYear();
    let todayDate = today.getDate(); // get the day, month and year from date of birth
    let birthDateMonth = birthDate.getMonth();
    let birthDateYear = birthDate.getFullYear();
    let birthdateDate = birthDate.getDate();
    console.log(birthDateMonth, birthDateYear, birthdateDate); // substract birthdate year from today year  ie todayYear - birthdateYear which  will give  "AssumedAge" is the age  we assume the patient will clock this year
    let assumedAge = todayYear - birthDateYear;
    if (assumedAge > 0) {
      //Checking the month to confirm if the age has been cloocked
      let monthGap = todayMonth - birthDateMonth;
      console.log("monthGap", monthGap); // If 'monthGap'> 0, the age has been clocked, 'monthGap'< 0, the age has not been clocked, 'monthGap'= 0, we are in the month then check date to confirm clocked age
      if (monthGap > 0) {
        return assumedAge + " year(s)";
      } else if (monthGap < 0) {
        let confirmedAge = assumedAge - 1;
        return confirmedAge + " year(s)";
      } else if (monthGap === 0) {
        let dateGap = todayDate - birthdateDate;
        console.log("date gap", todayDate, birthdateDate, dateGap);
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
