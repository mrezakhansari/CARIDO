import React from 'react';
import { ErrorMessage, Field } from 'formik';
import TextError from './TextError';
import { FormGroup, Label } from "reactstrap";

const Select = (props) => {
    const { label, name, options, ...rest } = props;
    return (
        <FormGroup >
            <Label htmlFor={name}>{label}</Label>
            <Field as='select' id={name} name={name} {...rest} className='form-control'>
                {
                    options.map(option => {
                        return (
                            <option key={option.value} value={option.value}>
                                {option.key}
                            </option>
                        )
                    })
                }
            </Field>
            <ErrorMessage name={name} component={TextError} />
        </FormGroup>
    );
}

export default Select;