import React, { Component } from "react";
import { Label, Row, Col, FormGroup } from "reactstrap";
import { Field, ErrorMessage } from "formik";
import _ from "lodash";
import DatePicker from "react-modern-calendar-datepicker";
import { TimePicker } from "antd";
import moment from "jalali-moment";

class CustomDateTimePicker extends Component {

    constructor(props) {
        super(props);

        const { selectedValue } = this.props;
        console.log("props from ", this.props);
        this.state = {
            selectedDate: "",
            selectedTime: "",
        };
        if (selectedValue != null && selectedValue !== "") {
            const date = this.convertDateTo(selectedValue, "fa"); // 1392/6/31 23:59:59);
            var formatedDate = {
                year: parseInt(date[0]),
                month: parseInt(date[1]),
                day: parseInt(date[2]),
            };
            const time = moment(selectedValue, "YYYY-M-D HH:mm:ss")
                .locale("fa")
                .format("HH:mm:ss"); //23:59:59
            this.state = {
                selectedDate: formatedDate,
                selectedTime: time,
            };
        }
    }
    convertDateTo = (date, locale) => {
        switch (locale) {
            case "fa":
                let result = moment(date, "YYYY-M-D HH:mm:ss")
                    .locale(locale)
                    .format("YYYY/M/D")
                    .split("/"); // 1392/6/31);
                return result;
            case "en":
                let result1 = moment.from(date, "fa", "YYYY/M/D").format("YYYY-M-D"); // 2013-8-25 16:40:00
                return result1;
            default:
                break;
        }
    };

    getMiladiDate = (value) => {
        const formatedDate = `${value.year}/${value.month}/${value.day}`;
        const miladiDate = this.convertDateTo(formatedDate, "en");
        return miladiDate;
    };
    handleSelectedDateChanged = (value) => {
        const miladiDate = this.getMiladiDate(value);
        this.setState({
            selectedDate: value,
            selectedTime: this.state.selectedTime,
        });
        if (this.props.onSelectedChanged)
            this.props.onSelectedChanged(miladiDate + " " + this.state.selectedTime);
    };

    handleSelectedTimeChanged = (TimeString) => {
        this.setState({ ...this.state, selectedTime: TimeString });

        const miladiDate = this.getMiladiDate(this.state.selectedDate);
        if (this.props.onSelectedChanged)
            this.props.onSelectedChanged(miladiDate + " " + TimeString);
    };

    render() {
        const { label, name, datePlaceholder,timePlaceholder } = this.props;
        const minimumDate = {
            year: 1398,
            month: 12,
            day: 29
        };
        const maximumDate = {
            year: 1420,
            month: 12,
            day: 29
        }
        return (
            <FormGroup>
                {label !== null && label !== "" && <Label for={name}>{label}</Label>}

                <Row>
                    <Col md="6" sm="6" style={{ paddingLeft: "1px"  }}>
                        <DatePicker
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            shouldHighlightWeekends
                            wrapperClassName="form-control overlay"
                            value={this.state.selectedDate}
                            onChange={(value) =>
                                this.handleSelectedDateChanged(value)
                            }
                            colorPrimary="rgb(57, 124, 182)" // added this
                            calendarClassName="custom-calendar" // and this
                            calendarTodayClassName="custom-today-day" // also this
                            locale="fa"
                            inputClassName="customSize"
                            inputPlaceholder={datePlaceholder}
                            
                        />
                    </Col>
                    <Col md="6" sm="6" style={{ padding: "1px 6px 1px 1px" }}>
                        <TimePicker
                            disabled={!this.state.selectedDate}
                            value={
                                this.state.selectedTime
                                    ? moment(this.state.selectedTime, "HH:mm:ss")
                                    : ""
                            }
                            className="form-control"
                            placeholder={timePlaceholder}
                            size="middle"
                            onChange={(time, TimeString) =>
                                this.handleSelectedTimeChanged(TimeString)
                            }
                        />
                    </Col>
                </Row>

            </FormGroup>
        );
    }
}

export default CustomDateTimePicker;
