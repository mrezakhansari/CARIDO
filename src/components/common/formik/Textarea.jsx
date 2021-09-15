import React from 'react';
import { Field, ErrorMessage } from 'formik';
import TextError from './TextError';
import { FormGroup, Label } from "reactstrap";

const validateTextArea = (value) => {
    //console.log('validate textarea', value);

    //eenja mitoonim khodemoon handle konim ke dorost hast ya nist
}
const Textarea = (props) => {
    const { label, name, ...rest } = props;
    return (
        <FormGroup >
            <Label htmlFor={name}>{label}</Label>
            <Field as='textarea' id={name} name={name} {...rest} validate={validateTextArea}  className='form-control'/>
            <ErrorMessage name={name} component={TextError} />
        </FormGroup>
    );
}

export default Textarea;