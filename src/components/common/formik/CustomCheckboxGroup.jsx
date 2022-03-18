import React from "react";
import { ErrorMessage, Field } from "formik";
import TextError from "./TextError";
import { FormGroup, Row } from "reactstrap";
import { Checkbox } from 'antd';
import antdClass from 'antd/dist/antd.css';
import antdClass2 from "../../../assets/css/vendors/customAntdTable.css";

const CheckboxGroup = (props) => {
    const { label, name, options, disabled, defaultValue, className, ...rest } = props;
    const classN = "form-control " + className;
    return (
        <FormGroup>
            {/* <Row> */}
            <Field name={name} {...rest} className={classN}>
                {({ form, meta }) => {
                    //console.log("Field", options);
                    return (
                        <div>
                            <Checkbox.Group
                                disabled={disabled}
                                options={options}
                                name={name}
                                defaultValue={defaultValue}
                                onChange={(checkedValues) => {
                                    if (props.onSelectedChange)
                                        props.onSelectedChange(checkedValues);
                                    form.setFieldValue(name, checkedValues);
                                }}
                            />
                            {meta.touched && meta.error ? (
                                <div className="error">{meta.error}</div>
                            ) : null}
                        </div>
                    );
                }}
            </Field>
            {/* <ErrorMessage name={name} component={TextError} /> */}
            {/* </Row> */}
        </FormGroup>
    );
};

export default CheckboxGroup;
