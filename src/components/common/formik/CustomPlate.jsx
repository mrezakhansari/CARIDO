import React, { useState } from "react";
import { Field } from "formik";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import Select from "react-select";
import plateNoPNG from '../../../assets/img/plateNo.png';
import plateSVG from '../../../assets/icons/svg/flag.svg'
import ReactInputMask from "react-input-mask";
import _ from 'lodash';

const CustomPlate = (props) => {
    const {
        label,
        name,
        className,
    } = props;

    const [state, setState] = useState({
        firstPart: '',
        secondPart: '',
        thirdPart: '',
        forthPart: ''
    })
    const classN = className ? className : "ltr";
    const alphabetList = [
        {
            value: '1',
            label: 'الف'
        },
        {
            value: '2',
            label: 'ب'
        },
        {
            value: '3',
            label: 'پ'
        },
        {
            value: '4',
            label: 'ت'
        },
        {
            value: '5',
            label: 'ث'
        },
        {
            value: '6',
            label: 'ج'
        },
        {
            value: '7',
            label: 'چ'
        },
        {
            value: '8',
            label: 'ح'
        },
        {
            value: '9',
            label: 'خ'
        },
        {
            value: '10',
            label: 'د'
        },
        {
            value: '11',
            label: 'ذ'
        },
        {
            value: '12',
            label: 'ر'
        },
        {
            value: '13',
            label: 'ز'
        },
        {
            value: '14',
            label: 'ژ'
        },
        {
            value: '15',
            label: 'س'
        },
        {
            value: '16',
            label: 'ش'
        },
        {
            value: '17',
            label: 'ص'
        },
        {
            value: '18',
            label: 'ض'
        },
        {
            value: '19',
            label: 'ع'
        },
        {
            value: '20',
            label: 'غ'
        },
        {
            value: '21',
            label: 'ف'
        },
        {
            value: '22',
            label: 'ق'
        },
        {
            value: '23',
            label: 'ک'
        },
        {
            value: '24',
            label: 'گ'
        },
        {
            value: '25',
            label: 'ل'
        },
        {
            value: '26',
            label: 'م'
        },
        {
            value: '27',
            label: 'ن'
        },
        {
            value: '28',
            label: 'و'
        },
        {
            value: '29',
            label: 'ه'
        },
        {
            value: '30',
            label: 'ی'
        },
        {
            value: '31',
            label: 'ط'
        },
        {
            value: '32',
            label: 'ظ'
        }
    ]
    const handleChangeFirstPartPlateNo = (event, form) => {
        const temp = event.target.value.replaceAll('_', '')
        if (temp === "" || (temp !== "" && temp.length === 2)) {
            setState(preState => {
                return {
                    ...preState,
                    firstPart: temp
                }
            })

            form.setFieldValue(name, { ...state, firstPart: temp });
            if (props.onSelectedChanged) props.onSelectedChanged({ ...state, firstPart: temp });
        }
    }
    const handleChangeSecondPartPlateNo = (e, form) => {
        console.log(
        _(alphabetList).find(c=>c.value === e.target.value));
        const temp = _(alphabetList).find(c=>c.value === e.target.value);
        setState(preState => {
            return {
                ...preState,
                secondPart: temp.label
            }
        })
        form.setFieldValue(name, { ...state, secondPart: temp.label });
        if (props.onSelectedChanged) props.onSelectedChanged({ ...state, secondPart: temp.label });

    }
    const handleChangeThirdPartPlateNo = (event, form) => {
        const temp = event.target.value.replaceAll('_', '')
        if (temp === "" || (temp !== "" && temp.length === 3)) {
            setState(preState => {
                return {
                    ...preState,
                    thirdPart: temp
                }
            })
            form.setFieldValue(name, { ...state, thirdPart: temp });
            if (props.onSelectedChanged) props.onSelectedChanged({ ...state, thirdPart: temp });
        }
    }
    const handleChangeForthPartPlateNo = (event, form) => {
        const temp = event.target.value.replaceAll('_', '')
        if (temp === "" || (temp !== "" && temp.length === 2)) {
            setState(preState => {
                return {
                    ...preState,
                    forthPart: temp
                }
            })
            form.setFieldValue(name, { ...state, forthPart: temp });
            if (props.onSelectedChanged) props.onSelectedChanged({ ...state, forthPart: temp });
        }
    }
    return (
        <header>
            <div className="head-text">
                <div className="head-image">
                    <img src={plateSVG} alt="plateNo" style={{ width: "100%", height: "100%" }} />
                </div>
                <div className="text-on-image" style={{ width: "100%", height: "100%", fontWeight: "bold", fontSize: "1.5rem", direction: "ltr" }}>
                    <FormGroup >

                        <Field name={name}>
                            {(fieldProps) => {
                                const { form, meta } = fieldProps;
                                //console.log("Render props", props);
                                console.log(state)
                                return (
                                    <React.Fragment>
                                        <table style={{ width: "100%", position: "absolute" }}>
                                            <tbody>
                                                <tr>
                                                    <td 
                                                    style={{ 
                                                        //paddingTop: "5%",
                                                         width: "2%", 
                                                         }}
                                                    >
                                                        <div style={{
                                                             marginTop:"25%",
                                                             marginRight: "30%",
                                                             marginLeft:"-10%" }}>

                                                            <ReactInputMask
                                                                id="first"
                                                                type="tel"
                                                                maxLength={2}
                                                                minLength={2}
                                                                onChange={(event) => handleChangeFirstPartPlateNo(event, form)}
                                                                placeholder="11"
                                                                onBlur={() => form.setFieldTouched(name, true)}
                                                                autoComplete="off"
                                                                className="form-control"
                                                              //  style={{ width: "100%", height: "100%", marginBottom: "1%" }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{
                                                            width: "3%"
                                                        }}>
                                                        {/* <Select
                                                            style={{ height: "10em", maxHeight: "1em", paddingTop: "10em", paddingBottom: "10em" }}
                                                            // className="d-flex justify-content-md-center"
                                                            isMulti={false}
                                                            className="basic-single"
                                                            classNamePrefix="select"
                                                            // defaultValue={selectedValue}
                                                            name="second"
                                                            options={alphabetList}
                                                            placeholder='الف'
                                                            onChange={(value) => handleChangeSecondPartPlateNo(value, form)}
                                                            onBlur={() => form.setFieldTouched(name, true)}
                                                        /> */}
                                                        <div className="select-container"
                                                            style={{ marginRight: "30%", 
                                                            marginTop: "19%",
                                                            marginLeft:"-15%"
                                                             }}>
                                                            <select
                                                            itemType="tel"
                                                                className="form-control"
                                                                style={{ width: "100%" }}
                                                                onChange={(e) => handleChangeSecondPartPlateNo(e, form)}
                                                                onBlur={() => form.setFieldTouched(name, true)}
                                                            >
                                                                {alphabetList.map((option) => (
                                                                    <option value={option.value} key={option.value}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td style={{
                                                        width: "2%",
                                                    }}>
                                                        <div style={{ marginRight: "35%",marginLeft:"-30%",
                                                    marginTop: "25%" }}>

                                                            <ReactInputMask
                                                                id="third"
                                                                type="tel"
                                                                maxLength={3}
                                                                minLength={3}
                                                                onChange={(event) => handleChangeThirdPartPlateNo(event, form)}
                                                                placeholder="888"
                                                                className="form-control"
                                                                onBlur={() => form.setFieldTouched(name, true)}
                                                                autoComplete="off"
                                                              //  style={{ width: "100%", height: "100%", marginBottom: "1rem" }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td style={{
                                                        width: "3.5%",
                                                        //paddingRight: "0%",
                                                       // paddingLeft: "0%",
                                                    }}>
                                                        <div
                                                            style={{ marginRight: "50%",marginLeft:"-7%",
                                                            marginTop: "19%" }}>
                                                            <ReactInputMask
                                                                id="forth"
                                                                type="tel"
                                                                maxLength={2}
                                                                minLength={2}
                                                                onChange={(event) => handleChangeForthPartPlateNo(event, form)}
                                                                placeholder="99"
                                                                className="form-control"
                                                                onBlur={() => form.setFieldTouched(name, true)}
                                                                autoComplete="off"
                                                                // style={{
                                                                //     width: "100%", height: "100%",
                                                                //     marginBottom: "1rem"
                                                                // }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="3" style={{
                                                            marginTop: "60%" }}>
                                                        {meta.touched && meta.error ? (
                                                            <div className="error">{meta.error}</div>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        {/* <p>
                                       {meta.touched && meta.error ? (
                                            <div className="error">{meta.error}</div>
                                        ) : null}
                                       </p> */}
                                    </React.Fragment>
                                );
                            }}
                        </Field>
                    </FormGroup>
                </div>
            </div>
        </header>


    );
};

export default CustomPlate;
