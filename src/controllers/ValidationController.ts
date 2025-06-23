type ValidationInput = {
  field: string;
  type: string;
  value: any;
  matchValue?: any;
};

export class ValidationController {
  static regex = {
    onlyString: /^[a-zA-Z\s]+$/,
    onlyNumber: /^[+-]?(\d*\.)?\d+$/,
    onlySymbol: /^[!@#\$%\^\&*\)\(+=._-]+$/,
    onlyEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    onlyPassword: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{6,18}$/,
    onlyURL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
    strNum_: /^[a-zA-Z0-9_]+$/,
    strNum_Space: /^[a-zA-Z0-9_ ]+$/,
    objectId: /^[0-9a-fA-F]{24}$/,
    imageFormat: /\.(jpg|jpeg|png)$/i,
    onlyUPI: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
  };

  static passwordChecks = {
    hasCaps: /[A-Z]/,
    hasSmall: /[a-z]/,
    hasNumber: /\d/,
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
  };

  async validate(data: ValidationInput[]) {
    const errors: Record<string, string> = {};

    if (!Array.isArray(data)) return { errors };

    data.forEach(({ field, type, value, matchValue }) => {
      const isEmpty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty && type !== 'image' && type !== 'number' && type !== 'required') {
        errors[field] = '*Required';
        return;
      }

      switch (type) {
        case 'string':
          if (value.length > 50 && field !== 'country' && field !== 'address') {
            errors[field] = 'Not more than 50 characters';
          } else if (!ValidationController.regex.onlyString.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'number':
          if (value === '' || value === null || isNaN(value)) {
            errors[field] = 'Invalid';
          } else if (!ValidationController.regex.onlyNumber.test(value)) {
            errors[field] = 'Invalid';
          } else if (parseFloat(value) <= 0) {
            errors[field] = 'Allow Only Numeric';
          }
          break;

        case 'email':
          if (!ValidationController.regex.onlyEmail.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'password':
          if (!ValidationController.passwordChecks.hasCaps.test(value)) {
            errors[field] = 'At least one uppercase';
          } else if (!ValidationController.passwordChecks.hasSmall.test(value)) {
            errors[field] = 'At least one lowercase';
          } else if (!ValidationController.passwordChecks.hasNumber.test(value)) {
            errors[field] = 'At least one number';
          } else if (!ValidationController.passwordChecks.hasSymbol.test(value)) {
            errors[field] = 'At least one special character';
          } else if (value.length < 8) {
            errors[field] = 'Not less than 8 characters';
          } else if (value.length > 16) {
            errors[field] = 'Not more than 16 characters';
          } else if (!ValidationController.regex.onlyPassword.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'match':
          if (value !== matchValue) {
            errors[field] = 'Passwords do not match';
          }
          break;

        case 'notmatch':
          if (value === matchValue) {
            errors[field] = 'Must not be equal';
          }
          break;

        case 'upi':
          if (!ValidationController.regex.onlyUPI.test(value)) {
            errors[field] = 'Invalid UPI';
          }
          break;

        case 'equal':
          if (!ValidationController.regex.onlyURL.test(value)) {
            errors[field] = 'Invalid URL';
          }
          break;

        case 'gte':
          if (parseFloat(value) <= matchValue) {
            errors[field] = `Must be greater than ${matchValue}`;
          }
          break;

        case 'lte':
          if (parseFloat(value) >= matchValue) {
            errors[field] = `Must be lesser than ${matchValue}`;
          }
          break;

        case 'str&Num&_':
        case 'strNum_':
          if (!ValidationController.regex.strNum_.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'strNum_Space':
          if (!ValidationController.regex.strNum_Space.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'objectId':
          if (!ValidationController.regex.objectId.test(value)) {
            errors[field] = 'Invalid';
          }
          break;

        case 'image':
          if (!value?.name || typeof value.size !== 'number') {
            errors[field] = 'Invalid file';
          } else if (value.size > 1000000) {
            errors[field] = 'File must be 1MB or less';
          } else if (!ValidationController.regex.imageFormat.test(value.name)) {
            errors[field] = 'Invalid file format';
          }
          break;

        case 'dob':
          const birthDate = new Date(value);
          if (isNaN(birthDate.getTime())) {
            errors[field] = 'Invalid date';
            break;
          }
          const now = new Date();
          const minAgeDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
          if (birthDate > minAgeDate) {
            errors[field] = 'Must be 18 years old';
          }
          break;

        case 'required':
          if (
            value === '' ||
            value === null ||
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          ) {
            errors[field] = 'Required';
          }
          break;

        default:
          break;
      }
    });

    return { errors };
  }
}
