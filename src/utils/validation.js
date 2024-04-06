const fieldIsEmpty = (str) => {
  if (str === "" || str === null || str === undefined) {
    return true;
  } else {
    return false;
  }
};

const fieldIsValidEmail = (str) => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const result = emailRegex.test(str);

  return result;
};

const fieldIsNumber = (str) => {
  const numberRegex = /^\d+$/;

  const result = numberRegex.test(str);

  return result;
};

const filedIsPhoneNumber = (str) => {
  if (str.startsWith("08") || str.startsWith("62") || str.startsWith("+62")) {
    return true;
  } else {
    return false;
  }
};

const fieldFileIsEmpty = (reqFile, field) => {
  if (reqFile !== undefined) {
    const reqFields = Object.keys(reqFile);

    if (!reqFields.includes(field)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const filedFileSizeIsLessThan = (fileSize, maxSize) => {
  if (fileSize <= maxSize) {
    return true;
  } else {
    return false;
  }
};

const fieldFileExtensionIsAllowed = (extensions, fileExtension) => {
  if (extensions.includes(fileExtension)) {
    return true;
  } else {
    return false;
  }
};

const strMinLength = (str, min) => {
  if (str.length > min) {
    return true;
  } else {
    return false;
  }
};

const strMaxLength = (str, max) => {
  if (str.length < max) {
    return true;
  } else {
    return false;
  }
};

export {
  fieldIsEmpty,
  fieldIsValidEmail,
  fieldIsNumber,
  filedIsPhoneNumber,
  fieldFileIsEmpty,
  filedFileSizeIsLessThan,
  fieldFileExtensionIsAllowed,
  strMaxLength,
  strMinLength,
};
