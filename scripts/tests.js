import {
  validateTitle,
  validateDate,
  validateDuration,
  validateTag
} from "./validators.js";
const demoForm = document.querySelector("#validation-demo-form");

if (demoForm) {
  const fields = {
    title: {
      input: document.querySelector("#demo-title"),
      error: document.querySelector("#title-error"),
      validate: validateTitle
    },

    date: {
      input: document.querySelector("#demo-date"),
      error: document.querySelector("#date-error"),
      validate: validateDate
    },

    duration: {
      input: document.querySelector("#demo-duration"),
      error:document.querySelector("#duration-error"),
      validate: validateDuration
    },

    tag: {
      input: document.querySelector("#demo-tag"),
      error: document.querySelector ("#tag-error"),
      validate: validateTag
    }
  };
  function validateField(field) {
    const message = field.validate(field.input.value);
    const errorMessage = typeof message === "string"
      ? message
      :"";

    field.error.textContent = errorMessage;
    field.input.setAttribute(
      "aria-invalid",
      errorMessage ? "true" : "false"
    );

    return !errorMessage;
  }

  Object.values(fields).forEach((field) => {
    field.input.addEventListener("blur", () => {
      validateField(field);
    });

    field.input.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") {
        validateField(field)
      }
    });
  });

  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.values(fields).map(validateField);
    const output = document.querySelector("#validation-output");

    if (results.every(Boolean)) {
      output.textContent = "Success! All four fields passed validation.";
    } else {
      output.textContent = 
        "Please correct the highlighted fields before continuing.";
    }
  });

  demoForm.addEventListener("reset", () => {
    Object.values(fields).forEach((field) => {
      field.error.textContent = "";
      field.input.removeAttribute("aria-invalid");
    });

    document.querySelector("#validation-output").textContent = "";
  });

}