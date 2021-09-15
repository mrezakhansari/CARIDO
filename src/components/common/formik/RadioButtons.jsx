import React from 'react';
import { ErrorMessage, Field } from 'formik';
import TextError from './TextError';
import { FormGroup, Label } from "reactstrap";
import {Tag} from 'antd'

const RadioButtons = (props) => {
    const { label, name, options, ...rest } = props;
    return (
        <FormGroup >
            <Label htmlFor={name} className="mr-2"><Tag color="magenta">{label}</Tag></Label>
            <Field as='radio' name={name} {...rest} className='form-control'>
                {
                    ({ field }) => {
                        //console.log('Field',field);
                        return options.map(option => {
                            return (
                                <React.Fragment key={option.key}>
                                    <input type='radio' id={option.value} {...field} value={option.value}
                                        checked={field.value === option.value} className="mr-1" />
                                    <label htmlFor={option.value} className="mr-1">{option.key}</label>
                                </React.Fragment>
                            )
                        })
                    }
                }
            </Field>
            <ErrorMessage name={name} component={TextError}/>
        </FormGroup>
    );
}

export default RadioButtons;