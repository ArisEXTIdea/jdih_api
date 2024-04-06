const numberConverter = (data) => {
  const dataPhoneArr = data.split("");
  var phoneFormatFix = "";

  if (dataPhoneArr[0] === "0") {
    const newPhoneArr = dataPhoneArr.slice(1);
    newPhoneArr.unshift("62");
    phoneFormatFix += newPhoneArr.join("");
  } else if (dataPhoneArr[0] === "6" && dataPhoneArr[1] === "2") {
    phoneFormatFix += dataPhoneArr.join("");
  } else if (dataPhoneArr[0] === "+") {
    const newPhoneArr = dataPhoneArr.slice(1);
    phoneFormatFix += newPhoneArr.join("");
  }

  return phoneFormatFix;
};

export { numberConverter };
