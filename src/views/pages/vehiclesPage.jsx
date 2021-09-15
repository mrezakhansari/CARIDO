import React, { useEffect, useState } from "react";
import { Row, Col, Button, FormGroup, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag } from 'antd';
//import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from 'yup';

toast.configure({ bodyClassName: "customFont" });

const VehiclesPage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------

    const CreateVehicleInitialValues = {
        imei: ''
    }

    const CreateVehicleValidationSchema = Yup.object({
        imei: Yup.string().required("!را وارد کنید IMEI کد"),
    });

    const Columns = [
        // {
        //     title: 'نوع GPS',
        //     dataIndex: 'gpsType',
        //     key: 'gpsType',
        //     width: '7vw'
        // },
        {
            title: 'ردیف',
            key: 'index',
            render : (text, record, index) => index,
            width:'1vw'
        },
        {
            title: 'IMEI',
            dataIndex: 'imei',
            key: 'imei',
            render: text => (
                <Tag color="geekblue">{
                    text
                }</Tag>
            ),
            width: '5vw'
        }
    ];

    const [state, setState] = useState({
        gpsTypesList: [{ label: "Type 0", value: 0 }, { label: "Type 1", value: 1 }],
        vehiclesList: [],
        vehiclesListForGrid: [],
        currentVehicle: {},
        createVehicleInfoModal: false
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {
        vehicleService.GetAllVehicles()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    setState(prevState => {
                        return {
                            ...prevState,
                            vehiclesList: result, vehiclesListForGrid: createDataModelForDataTabel(result)
                        }
                    });
                }
                else {
                    return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
                }
            })
            .catch(error => {
                //
            })
    }, [])

    //#endregion ---------------------------------------------------------

    //#region Create Vehicle Info ----------------------------------------

    const handleCreateVehicleInfo = (record) => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: {}
            }
        });
        createVehicleInfoToggle();
    }

    const createVehicleInfoToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                createVehicleInfoModal: !prevState.createVehicleInfoModal
            }
        });
    }

    const handleSubmitCreateDeviceInfo = (values) => {

        vehicleService.CreateByAdmin(_.pick(values, ["imei"]))
            .then(response => {
                if (response.data.success) {

                    const originalVehicles = [...state.vehiclesList];
                    originalVehicles.push(response.data.result);
                    //console.log(response);
                    setState(prevState => {
                        return {
                            ...prevState,
                            vehiclesList: originalVehicles, vehiclesListForGrid: createDataModelForDataTabel(originalVehicles)
                            , currentVehicle: {}
                        }
                    });
                    createVehicleInfoToggle();
                    return toast.success("CreateByAdmin")
                }
                else {
                    return toast.error("امکان اضافه کردن وسیله ی جدید مقدور نیست");
                }
            })
            .catch(error => {
                //console.log(error.message);
            })
    }

    const handleCancelCreateVehicleInfo = () => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: {}
            }
        });
        createVehicleInfoToggle();
    }

    //#endregion ---------------------------------------------------------


    return (
        <React.Fragment>
            <div className="container">
                <Row className="customBackgroundColor ">
                    <Col md="12" className="mt-2">
                        <FormGroup>
                            <Row className="d-flex justify-content-md-center">
                                <Col md="2">
                                    <button className="btn btn-warning rtl"
                                        style={{ direction: 'rtl', float: 'right' }}
                                        type="button"
                                        onClick={handleCreateVehicleInfo}>اضافه کردن وسیله</button>
                                </Col>
                            </Row>
                            <Row className="justify-content-md-center">
                                <Col md="6">
                                    <Table
                                        //className={antdClass2}
                                        columns={Columns}
                                        dataSource={state.vehiclesListForGrid}
                                        pagination={false}
                                        scroll={{ x: 'max-content', y: 600 }}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
            <Modal
                isOpen={state.createVehicleInfoModal}
                toggle={createVehicleInfoToggle}
                className={props.className + " customFont"}
                backdrop="static"
            // dir="rtl"
            >
                <ModalHeader toggle={createVehicleInfoToggle} className="customFont text-right">اضافه کردن وسیله جدید</ModalHeader>
                <ModalBody className="text-center">
                    <Formik
                        initialValues={CreateVehicleInitialValues}
                        validationSchema={CreateVehicleValidationSchema}
                        onSubmit={async (values) => {
                            ////console.log("values", values);
                            await handleSubmitCreateDeviceInfo(values);
                        }}
                        validateOnBlur={true}
                        validateOnMount={true}
                        enableReinitialize
                    >
                        {(formik) => {
                            ////console.log("Formik props values", formik);

                            return (
                                <React.Fragment>
                                    <Form>
                                        <Row>
                                            <Col md="12">
                                                <FormikControl
                                                    control="inputMaskDebounce"
                                                    mask="999999999999999"
                                                    type="text"
                                                    name="imei"
                                                    id="imei"
                                                    className="ltr"
                                                    placeholder="کد IMEI"
                                                />
                                            </Col>
                                        </Row>
                                        <div className="form-actions center">
                                            <Button color="primary" type="submit" className="mr-1" disabled={!formik.isValid}>
                                                {/* <LogIn size={16} color="#FFF" />  */}
                                                            Save
                                                        </Button>
                                            <Button color="secondary" type="button" onClick={handleCancelCreateVehicleInfo}>
                                                Cancel
                                                         </Button>
                                        </div>
                                    </Form>
                                </React.Fragment>
                            );
                        }}
                    </Formik>

                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default VehiclesPage;
