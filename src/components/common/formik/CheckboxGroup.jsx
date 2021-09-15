import React from "react";
import { ErrorMessage, Field } from "formik";
import TextError from "./TextError";
import { FormGroup, Row } from "reactstrap";

const CheckboxGroup = (props) => {
  const { label, name, options, className, ...rest } = props;
  const classN = "form-control " + className;
  return (
    <FormGroup>
      <Row>
        <Field name={name} {...rest} className={classN}>
          {({ field }) => {
            //console.log("Field", options);
            return options.map((option) => {
              return (
                <div  key={option.key}>
                  <input 
                    type="checkbox"
                    id={option.value}
                    {...field}
                    value={option.value}
                    checked={field.value.includes(option.value)}
                  />
                  <label htmlFor={option.value}>{option.key}</label>
                </div>
              );
            });
          }}
        </Field>
        <ErrorMessage name={name} component={TextError} />
      </Row>
    </FormGroup>
  );
};

export default CheckboxGroup;
