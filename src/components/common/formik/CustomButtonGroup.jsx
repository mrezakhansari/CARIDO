import React, { Component } from "react";
import { Button, ButtonGroup, Label, Row, Col, FormGroup } from "reactstrap";
import { Field } from "formik";
import _ from 'lodash';

class CustomButtonGroup extends Component {
    constructor(props) {
        super(props);
        this.state = { cSelected: props.defaultValues ? props.defaultValues : [] };
    }

    onCheckboxBtnClick = (selected, form) => {
        const temp = [...this.state.cSelected];
        const index = temp.indexOf(selected);
        if (index < 0) {
            temp.push(selected);
        } else {
            temp.splice(index, 1);
        }
        this.setState({ cSelected: [...temp] });
        console.log('this.props.onSelectedChanged',this.props)
        if (this.props.onSelectedChanged) this.props.onSelectedChanged(temp);
        form.setFieldValue(this.props.name, temp);
    };

    componentDidUpdate(prevProps, prevState) {
        //console.log('prevProps', prevProps, prevState)
        // this.setState({ cSelected: this.props.defaultValues })
    }

    componentWillReceiveProps(nextProps) {
        //console.log(nextProps);
        const temp = [...this.state.cSelected];
        if (!_.isEqual(_.sortBy(this.props.defaultValues), _.sortBy(nextProps.defaultValues)))
            this.setState({ cSelected: [...temp, ...nextProps.defaultValues] })
    }

    render() {
        const { source, label, name } = this.props;
        const colors = [{ name: 'danger', code: '#FF586B' }, { name: 'success', code: '#0CC27E' }, { name: 'warning', code: '#FF8D60' }, { name: 'primary', code: '#009DA0' }, { name: 'secondary', code: '#757575' }, { name: 'info', code: '#1CBCD8' }];
        return (
            <FormGroup>
                <Row >
                    <Col md="12" >
                        {label !== null && label !== "" && <Label for={name}>{label} : {JSON.stringify(this.state.cSelected)}</Label>}
                    </Col>
                    {/* <Col md="12"> */}
                    <Field>
                        {
                            (fieldProps) => {
                                const { form } = fieldProps;
                                return (

                                      <Row >

                                    <ButtonGroup className="col-md-12">
                                        {/* <Row> */}
                                            <Col md="12"> 
                                        {
                                            source.map((c, i) =>
                                                <Button
                                                    key={label + i}
                                                    //color={`${colors[i%5]}`}
                                                    onClick={() => this.onCheckboxBtnClick(c, form)}
                                                    active={this.state.cSelected.includes(c)}
                                                    //defaultChecked={this.state.cSelected.includes(c)}
                                                    //outline={!this.state.cSelected.includes(c)}
                                                    color={!this.state.cSelected.includes(c) ? colors[i % 5]['name'] : 'white'}
                                                    style={{ borderColor: colors[i % 5]['code'], marginRight: "0.5%", textAlign: "center" }}
                                                    className="customButton"

                                                >
                                                    {c}
                                                </Button>
                                            )
                                        }
                                         </Col>
                                        {/* </Row>  */}
                                    </ButtonGroup>

                                    </Row> 


                                )
                            }
                        }
                    </Field>
                    {/* </Col> */}
                </Row>
            </FormGroup>
        );
    }
}

export default CustomButtonGroup;