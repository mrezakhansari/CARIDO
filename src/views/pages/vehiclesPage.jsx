import React, { useEffect, useState } from "react";
import { Row, Col, Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag, Space } from 'antd';
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from 'yup';
import css from '../../assets/css/vendors/customAntdTableReport.css';
import MapPNG from '../../assets/icons/Map.png';
import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Popup, Polyline, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

toast.configure({ bodyClassName: "customFont" });

let DefaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;

const VehiclesPage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------


    const CreateVehicleInitialValues = {
        imei: '',
        gpsType: ''
    }

    const CreateVehicleValidationSchema = Yup.object({
        imei: Yup.string().required("!را وارد کنید IMEI کد"),
        gpsType: Yup.object().required("!را انتخاب کنید GPS نوع")
    });

    const getRemainDateTime = (text) => {
        if (text) {
            let temp = text.split(":")[0];
            return `${temp} ساعت`
        }
        return ""
    }

    const getDateTime = (text) => {
        if (text) {

            let result = "";
            let temp = _(text).split('-').value();
            if (temp.length == 3) {
                result = `${temp[0]}/${temp[1]}/`;
                let day = temp[2].split('T');
                if (day.length == 2) {
                    result += day[0];
                    // let time = day[1].split(':');
                    // result += ` ${time[0]}:${time[1]}`;
                }
            }
            return result;
        }
        return "";
    }

    const [page, setPage] = React.useState(1);

    const Columns = [
        {
            title: 'ردیف',
            key: 'row',
            render: (text, record, index) => (page - 1) * 10 + index +1,
            width: '4vw'
        },
        // {
        //     title: 'سریال دستگاه',
        //     dataIndex: 'serialNo',
        //     key: 'serialNo',
        //     width: '15vw'
        // },
        {
            title: 'IMEI',
            dataIndex: 'imei',
            key: 'imei',
            width: '7vw',
            render: (text) => <Tag color="cyan">{text}</Tag>
        },
        {
            title: 'خودرو',
            dataIndex: 'title',
            key: 'carName',
            width: '5vw'
        },
        {
            title: 'نام کاربر',
            //dataIndex: 'user.fullName',
            key: 'fullName',
            width: '5vw',
            render: (text, record) => <Tag color="processing">{record.user && record.user.fullName}</Tag>
        },
        {
            title: 'سیم کارت GPS',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text, record) => <span style={{ direction: "ltr"}}>{text}</span>,
            width: '5vw'
        },
        {
            title: 'شماره مدیر دستگاه',
            dataIndex: 'userPhoneNo',
            key: 'userPhoneNo',
            width: '7vw'
        },
        {
            title: 'زمان آخرین نقطه دریافتی',
            key: 'lastGpsLocationDateTime',
            width: '10vw',
            render: (text, record) => <React.Fragment>
                {record.gpsLocations && record.gpsLocations.length > 0 &&
                    <Tag color="processing" style={{ direction: "ltr", marginBottom: "1vh", paddingTop: "1vh" }}>
                        {
                            getDateTime(record.gpsLocations[0].creationTime)
                        }</Tag>}
            </React.Fragment>
            ,
            width: '5vw'
        },
        {
            title: 'آخرین لوکیشن',
            key: 'location',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    {
                        record.gpsLocations && record.gpsLocations.length > 0 && <div className="btn logo-img " size="sm"
                            onClick={() => handleLocationOnMap(record)}>
                            <img src={MapPNG} alt="logo" width="20%"
                                title={`lat: ${record.gpsLocations[0].lat}, lon:${record.gpsLocations[0].lon}`} />
                        </div>
                    }

                </Space>
            ),
            width: '7vw'
        },
        {
            title: 'سایر کاربران',
            dataIndex: 'otherUsers',
            key: 'otherUsers',
            width: '6vw'
        },
        {
            title: 'میزان طرح باقیمانده',
            dataIndex: 'remain',
            key: 'remain',
            render: (text, record) => <Tag color="cyan" style={{ direction: "rtl", marginBottom: "2vh", paddingTop: "1vh" }}>{getRemainDateTime(text)}</Tag>,
            width: '3vw'
        },
        {
            title: 'زمان راه اندازی',
            dataIndex: 'startedDateTime',
            key: 'startedDateTime',
            width: '5vw'
        },
        {
            title: 'زمان ایجاد',
            dataIndex: 'creationTime',
            key: 'creationTime',
            render: (text, record) => <Tag color="magenta" style={{ direction: "ltr", marginBottom: "2vh", paddingTop: "1vh" }}>{getDateTime(text)}</Tag>,
            width: '3vw'
        },
        {
            title: "فعال / غیر فعال",
            dataIndex: 'isActive',
            key: 'isActive',
            render: (text, record) => (
                <Button className={record.isActive ? "btn-success mt-1 px-2" : "btn-danger mt-1"} size="sm"
                    onClick={() => handleVehicleStatus(record)}
                >{
                        record.isActive ? "Active" : "Inactive"}
                </Button>
            ),
            width: '5.5vw'
        },
        {
            title: "حذف",
            //dataIndex: 'isActive',
            key: 'Delete',
            render: (text, record) => (
                <Button size="sm"
                    className="mt-1 px-2 btn-warning"
                    onClick={() => handleDeleteVehicleInfo(record)}
                >
                    Delete
                </Button>
            ),
            width: '3vw'
        }
    ];

    const handleLocationOnMap = (record) => {
        const location = {
            lat: record.gpsLocations[0].lat,
            lon: record.gpsLocations[0].lon
        }
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: record,
                currentVehicleCenterLocation: [location.lat, location.lon],
                showMap: true
            }
        })
    }

    const handleReturnToMainMenu = () => {
        setState(prevState => {
            return {
                ...prevState,
                showMap: !prevState.showMap
            }
        })
    }

    const handleVehicleStatus = (vehicle) => {
        console.log(vehicle)
        if (vehicle.isActive) {
            vehicleService.DisableVehicle({ id: vehicle.id }).then(response => {
                console.log(response)
                if (response.data.success && response.data.result) {
                    const vehicles = _.cloneDeep(state.vehiclesList);
                    const index = _(vehicles).findIndex(c => c.id === vehicle.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index].isActive = false;

                    setState(prevState => {
                        return {
                            ...prevState,
                            vehiclesList: vehicles, vehiclesListForGrid: createDataModelForDataTabel(vehicles)
                        }
                    });
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error);
                })
        }
        else {
            vehicleService.EnableVehicle({ id: vehicle.id }).then(response => {
                if (response.data.success && response.data.result) {

                    const vehicles = _.cloneDeep(state.vehiclesList);
                    const index = _(vehicles).findIndex(c => c.id === vehicle.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index].isActive = true;

                    setState(prevState => {
                        return {
                            ...prevState,
                            vehiclesList: vehicles, vehiclesListForGrid: createDataModelForDataTabel(vehicles)
                        }
                    });
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error);
                })
        }

    }

    const [state, setState] = useState({
        gpsTypesList: [{ label: "Coban", value: 0 }, { label: "Concox", value: 1 }],
        vehiclesList: [],
        vehiclesListForGrid: [],
        currentVehicle: {},
        createVehicleInfoModal: false,
        deleteModal: false,
        scan: 0,
        installed: 0,
        active: 0,
        lessThen10Days: 0,
        Expired: 0,
        showMap: false,
        currentVehicleCenterLocation: []
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {
        vehicleService.GetVehicleDetails()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    const scan = result.length;
                    const installed = result.filter(c => c.user !== null).length;
                    const active = result.filter(c => c.user !== null && c.isActive === true).length;
                    const lessThan10Days = 0;
                    console.log(result, result.length, installed, active)
                    setState(prevState => {
                        return {
                            ...prevState,
                            vehiclesList: result, vehiclesListForGrid: createDataModelForDataTabel(result),
                            scan: scan,
                            installed: installed,
                            active: active,
                            lessThen10Days: lessThan10Days
                        }
                    });
                }
                else {
                    return toast.warning("دستگاهی برای نمایش وجود ندارد");
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

        console.log(values);
        //return;
        vehicleService.CreateByAdmin({ ..._.pick(values, ["imei"]), gpsType: values.gpsType.value })
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

    //#region DELETE USER INFO EVENTS ---------------------------------------

    const handleDeleteVehicleInfo = (vehicleInfo) => {
        console.log('userData for delete', vehicleInfo);
        const result = { ..._(state.vehiclesList).filter(c => c.id === vehicleInfo.id).first() };
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: result
            }
        })
        deleteToggle();
    }

    const deleteToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                deleteModal: !state.deleteModal
            }
        });
    }

    const handleCancelDeleteVehicleInfo = () => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: {}
            }
        });
        deleteToggle();
    }

    const handleSubmitDeleteVehicleInfo = () => {
        console.log(state.currentVehicle.id);
        vehicleService.DeleteVehicle(state.currentVehicle.id).then(response => {
            if (response.data.success) {
                toast.success('User info has been delete successfully');
                const originalVehicles = [...state.vehiclesList];
                const vehicles = originalVehicles.filter(c => c.id !== state.currentVehicle.id);
                setState(prevState => {
                    return {
                        ...prevState,
                        vehiclesList: vehicles,
                        vehiclesListForGrid: createDataModelForDataTabel(vehicles),
                        currentVehicle: {}
                    }
                })
                deleteToggle();
            }
            else {
                toast.success('There is an error in deleting vehicle info');
                setState(prevState => {
                    return {
                        ...prevState,
                        currentVehicle: {}
                    }
                });
                deleteToggle();
            }
        }).catch(error => {
            console.log(error.message);
            deleteToggle();
            setState(prevState => {
                return {
                    ...prevState,
                    currentVehicle: {}
                }
            });
        })
    }
    //#endregion -----------------------------------------------------------------------------------------


    return (
        <React.Fragment>

            <Row className="customBackgroundColor " style={{ width: '100%', height: '100%' }}>
                <Col md="12" className="mt-2">
                    {state.showMap &&
                        <FormGroup>
                            <Row className="d-flex justify-content-md-end">
                                <Col md="2">
                                    <button className="btn btn-transparent ltr"
                                        style={{ direction: 'ltr', float: 'left', backgroundColor: '#1597E5' }}
                                        type="button"
                                        onClick={handleReturnToMainMenu}>بازگشت</button>
                                </Col>
                            </Row>
                            <Row className="justify-content-md-center">
                                <Col md="12">
                                    <MapContainer center={state.currentVehicleCenterLocation} zoom={13} style={{ height: '62vh' }}>
                                        <TileLayer
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                                        />
                                        <Marker position={state.currentVehicleCenterLocation}>
                                            <Popup>
                                                <div dir="rtl" className="customFont" style={{ textAlign: "right" }}>
                                                    <span>آخرین  لوکیشن</span>
                                                </div>
                                            </Popup>
                                        </Marker>

                                    </MapContainer>
                                </Col>
                            </Row>
                        </FormGroup>
                    }
                    {!state.showMap &&
                        <FormGroup>
                            <Row className="d-flex justify-content-md-center">

                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1vw", color: 'black' }} className="mt-1 text-md-right"> اسکن : {state.scan}</Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1vw", color: 'black' }} className="mt-1 text-md-right"> فعال : {state.active}</Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1vw", color: 'black' }} className="mt-1 text-md-right"> نصب شده : {state.installed}</Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1vw", color: 'black' }} className="mt-1 text-md-right"> منقضی شده : {state.Expired}</Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1vw", color: 'black' }} className="mt-1 text-md-right"> کمتر از 10 روز باقی مانده : {state.lessThen10Days}</Col>
                                <Col md="2">
                                    <button className="btn btn-transparent rtl"
                                        style={{ direction: 'ltr', float: 'left', backgroundColor: '#1597E5' }}
                                        type="button"
                                        onClick={handleCreateVehicleInfo}>اضافه کردن وسیله</button>
                                </Col>
                            </Row>
                            <Row className="justify-content-md-center">
                                <Col md="12">
                                    <Table
                                        style={{ width: '100%', height: '100%' }}
                                        className={css}
                                        rowClassName={css}
                                        columns={Columns}
                                        dataSource={state.vehiclesListForGrid}
                                        //pagination={true}
                                        pagination={{
                                            onChange(current) {
                                              setPage(current);
                                            }
                                          }}
                                        scroll={{ x: 'max-content', y: '57vh' }}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    }

                </Col>
            </Row>

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
                                        <Row>
                                            <Col md="12">
                                                <FormikControl
                                                    control="customSelect"
                                                    name="gpsType"
                                                    options={state.gpsTypesList}
                                                    id="gpsType"
                                                    className="rtl"
                                                    classN="rtl"
                                                    placeholder="نوع GPS"
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

            <Modal
                isOpen={state.deleteModal}
                toggle={deleteToggle}
                className={props.className}
                backdrop="static"
            >
                <ModalHeader toggle={deleteToggle}>Delete Vehicle Info</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete ?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitDeleteVehicleInfo}>
                        Save
                    </Button>{" "}
                    <Button color="secondary" onClick={handleCancelDeleteVehicleInfo}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
};

export default VehiclesPage;
