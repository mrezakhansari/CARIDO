import React, { Component } from "react";
import ReactInputMask from "react-input-mask";
import _ from "lodash";
import { Field } from "formik";
import { FormGroup, Label } from "reactstrap";

class InputMaskDebounce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mask: this.props.mask ? this.props.mask : '',
      value: ''
    };
  }


  onChange = (event, form) => {
    //console.log('event',event)
    // console.log('props',this.props);
    event.persist();
    const { debounceTime, name, toUppercase } = this.props;
    const defaultDebounceTime = debounceTime && debounceTime !== 0 ? debounceTime : 0;
    if (!this.debouncedFn) {
      this.debouncedFn = _.debounce(() => {
        if (event.target) {
          const temp = { ...this.state };
          temp.value = event.target.value;
          this.setState({ mask: temp.mask, value: temp.value });
          if (this.state.mask !== "" && this.state.mask.length > 0) {
            if (_(event.target.value).replace("_", "").length === this.state.mask.length) {
              // console.log(event.target.value);
              form.setFieldValue(name, toUppercase ? _(temp.value).toUpper() : temp.value);
              if (this.props.onChange)
                this.props.onChange();
            }
            else {
              //form.setFieldValue(name, temp.value);
            }
          } else {
            form.setFieldValue(name, toUppercase ? _(temp.value).toUpper() : temp.value);
            if (this.props.onChange)
              this.props.onChange();
          }

          //console.log(searchString)
        }
      }, defaultDebounceTime);
    }
    this.debouncedFn();
  };
  render() {
    const { label, name, className, placeholder, defaultValue, type } = this.props;
    const classN = "form-control " + className;
    const defaultType = this.props.mask ? 'text' : type ? type : 'text';
    return (
      <FormGroup>
        {label !== null && label !== "" && <Label for={name}>{label}</Label>}
        <Field name={name}>
          {(Fieldprops) => {
            const { form, meta } = Fieldprops;
            //console.log(this.state);
            // console.log('mask debounce props', Fieldprops);
            return (
              <React.Fragment>
                <ReactInputMask
                  type={defaultType}
                  mask={this.state.mask}
                  id={name}
                  onBlur={() => form.setFieldTouched(name, true)}
                  onChange={(event) => this.onChange(event, form)}
                  placeholder={placeholder}
                  className={classN}
                  defaultValue={defaultValue}
                />
                {meta.touched && (meta.error) ? (
                  <div className="error">{meta.error}</div>
                ) : null}
              </React.Fragment>
            );
          }}
        </Field>
      </FormGroup>
    );
  }
}

export default InputMaskDebounce;
