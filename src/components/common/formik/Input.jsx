import React from "react";
import { Field, ErrorMessage } from "formik";
import TextError from "./TextError";
import { FormGroup, Label } from "reactstrap";

const Input = (props) => {
  const { label, name, className, ...rest } = props;
  const classN = "form-control " + className;
  return (
    <FormGroup>
      {label !== null && label !== "" && <Label for={name}>{label}</Label>}
      <Field id={name} name={name} {...rest} className={classN} />
      <ErrorMessage name={name} component={TextError} />
    </FormGroup>
  );
};

export default Input;
