import React from "react";
import { Switch } from "antd";
import { FormGroup,Label } from "reactstrap";
import { Field } from "formik";
const CustomSwitch = (props) => {
  const {
    unCheckedChildren,
    checkedChildren,
    selectedValue,
    label,
    onselectedChanged,
    name,
    className,
    ...rest
  } = props;
  const classN = "form-control " + className;

  const handleSelectedSwitchChanged = (value, form) => {
    //console.log("valuesssss", selectedValue);
    if (props.onSelectedChanged) {
      props.onSelectedChanged(value);
    }
    form.setFieldValue(props.name, value);
  };
  return (
    <FormGroup>
         {label !== null && label !== "" && <Label for={name}>{label}</Label>}
      <Field {...rest} className={classN}>
        {(fieldProps) => {
          const { form } = fieldProps;
          return (
            <Switch
              defaultChecked={selectedValue}
              
              //checked={selectedValue}
              unCheckedChildren={unCheckedChildren}
              checkedChildren={checkedChildren}
              onChange={(value) => handleSelectedSwitchChanged(value, form)}
            ></Switch>
          );
        }}
      </Field>
    </FormGroup>
  );
};

export default CustomSwitch;
