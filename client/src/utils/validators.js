export function validateRequiredFields(values, fields) {
  const nextErrors = {};

  fields.forEach((field) => {
    if (!values[field]) {
      nextErrors[field] = 'This field is required.';
    }
  });

  return nextErrors;
}

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validateProjectForm(values) {
  const errors = validateRequiredFields(values, ['title', 'dueDate']);

  if (values.title && values.title.length < 2) {
    errors.title = 'Project title must be at least 2 characters.';
  }

  if (values.startDate && values.dueDate && values.startDate > values.dueDate) {
    errors.dueDate = 'Project due date must be after the project start date.';
  }

  return errors;
}

export function validateTaskForm(values) {
  const errors = validateRequiredFields(values, ['title', 'projectId']);

  if (values.title && values.title.length < 2) {
    errors.title = 'Task title must be at least 2 characters.';
  }

  return errors;
}

export function validateInviteForm(values) {
  const errors = validateRequiredFields(values, ['name', 'email']);

  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

export function validateProfileForm(values) {
  const errors = validateRequiredFields(values, ['name', 'email']);

  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}
