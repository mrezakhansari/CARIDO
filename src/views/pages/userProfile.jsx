//#region ------------ Imports ----------------------------------------------
import React, { useEffect, useState } from "react";
import { Row, Col, Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';
import { Edit2, Trash2, Users, Check } from "react-feather";
import { Planet } from 'react-planet';
import { toast } from 'react-toastify';
import { Menu } from 'react-feather';
import { Table, Tag, Space, Switch, ConfigProvider } from 'antd';
import "antd/dist/antd.css";
import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import * as assignService from '../../services/assignService';
import * as auth from "../../services/authService";
import SpeedometerPNG from '../../assets/icons/Speedometer.png';
import BatterytheftPNG from '../../assets/icons/Batterytheft.png';
import LocationConstraintPNG from '../../assets/icons/LocationConstraint.png';
import TrackerModePNG from '../../assets/icons/TrackerMode.png';
import MonitorModePNG from '../../assets/icons/MonitorMode.png';
import VehicleTurnOnPNG from '../../assets/icons/VehicleTurnOn.png';
import OpenDoorCarPNG from '../../assets/icons/OpenDoorCar.png';
import ShockCarPNG from '../../assets/icons/ShockCar.png';
import StopCarPNG from '../../assets/icons/StopCar.png';
import VehicleAccAlarmOnPNG from '../../assets/icons/VehicleAccAlarmOn.png';
import VehicleAccAlarmOffPNG from '../../assets/icons/VehicleAccAlarmOff.png';
import Select from "react-select";
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from 'yup';
import config from '../../config.json';
import he_IL from "antd/es/locale/fa_IR";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

import Leaflet from "leaflet";
// import {
//     Map as MapContainer,
//     //MapContainer,
//     TileLayer,
//     Popup,
//     Marker,useLeaflet
// } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Map, TileLayer, Popup, Marker, withLeaflet } from "react-leaflet";

let DefaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;


const MyMarker = props => {

    const initMarker = ref => {
        if (ref) {
            ref.leafletElement.openPopup()
        }
    }

    return <Marker ref={initMarker} {...props} />
}

//#endregion -------------------------------------------------------------------------------

toast.configure({ bodyClassName: "customFont rtl" });

const UserProfile = (props) => {

    const [currentPos, setCurrentPos] = useState(null);

    const [currentPage, setPage] = React.useState(1);

    const handleClick = e => {
        //console.log('dd', e.latlng)
        setCurrentPos(e.latlng);
        setState(preState => {
            return {
                ...preState,
                latlng: e.latlng
            }
        });
    }

    //#region Variables and Initial Functions -----------------------------------------

    const vehicleType = [
        { label: 'موتور', value: 0 },
        { label: 'اتومبیل', value: 1 }
    ];

    const vehicleSize = [
        { label: 'سبک', value: 0 },
        { label: 'سنگین', value: 1 }
    ];

    const CreateVehicleInitialValues = {
        phoneNumber: '',
        imei: '',
        title: '',
        carPlateNo: '',
        motorPlateNo: '',
        driverName: '',
        selectVehicleType: '',
        selectVehicleSize: '',
        selectVehicleBrand: '',
        selectVehicleModel: ''
    }

    const CreateVehicleAssignInitialValue = {
        mobileNoAssign: ''
    }

    const CreateVehicleAssignValidationSchema = Yup.object({
        mobileNoAssign: Yup.string().required("!شماره موبایل را وارد کنید")
    });

    const CreateVehicleValidationSchema = Yup.object({
        title: Yup.string().required("!نام وسیله را وارد کنید"),
        phoneNumber: Yup.string().required("!شماره موبایل را وارد کنید"),
        driverName: Yup.string().required("!نام راننده را وارد کنید"),
        imei: Yup.string().required("!را وارد کنید IMEI کد"),
        selectVehicleType: Yup.object().required("نوع وسیله را انتخاب کنید"),
        selectVehicleSize: Yup.object().test("validSelectVehicleSize", "اندازه وسیله را انتخاب کنید", (value) => {
            if (state.selectedVehicleType && state.selectedVehicleType.value === 1) {
                if (value === "" || value === undefined || value === null)
                    return false;
                else return true;
            }
            else {
                return true;
            }
        }),
        selectVehicleBrand: Yup.object().test("validSelectVehicleBrand", "برند خودرو را انتخاب کنید", (value) => {
            if (state.selectedVehicleType && state.selectedVehicleType.value === 1) {
                if (value === "" || value === undefined || value === null)
                    return false;
                else return true;
            }
            else {
                return true;
            }
        }),
        selectVehicleModel: Yup.object().test("validSelectVehicleModel", "مدل خودرو را انتخاب کنید", (value) => {
            if (state.selectedVehicleType && state.selectedVehicleType.value === 1) {
                if (value === "" || value === undefined || value === null)
                    return false;
                else return true;
            }
            else {
                return true;
            }
        }),
        motorPlateNo: Yup.string().test("validMotorPlateNo", "شماره پلاک را وارد کنید", (value) => {
            if (state.selectedVehicleType && state.selectedVehicleType.value === 0) {
                if (value === "" || value === undefined || value === null)
                    return false;
                else return true;
            }
            else {
                return true;
            }
        }),
        carPlateNo: Yup
            .object()
            //    .required("شماره پلاک را وارد کنید !")
            .test("validPlateNo", "شماره پلاک را وارد کنید", (value) => {
                if (state.selectedVehicleType && state.selectedVehicleType.value === 1) {
                    //console.log("validPlateNo", value)
                    if (value &&
                        (value.firstPart !== '' && value.firstPart !== undefined && value.firstPart.length === 2) &&
                        (value.secondPart !== '' && value.secondPart !== undefined && value.secondPart.length === 1) &&
                        (value.thirdPart !== '' && value.thirdPart !== undefined && value.thirdPart.length === 3) &&
                        (value.forthPart !== '' && value.forthPart !== undefined && value.forthPart.length === 2)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
            })
    });

    const Columns = [
        {
            title: 'ردیف',
            key: 'row',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
            width: '4em'
        },
        {
            title: 'دستگاه',
            dataIndex: 'title',
            key: 'title',
            width: '10em'
        },
        {
            title: 'نوع GPS',
            dataIndex: 'gpsType',
            key: 'gpsType',
            render: text => (
                <span >{
                    text === 0 ? "Coban" : "Concox"
                }</span>
            ),
            width: '7em'
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
            width: '10em'
        },
        {
            title: 'عملیات',
            key: 'action',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    <Button className="btn btn-success mt-1"
                        size="sm"
                        disabled={record.isAssign}
                        onClick={() => handleEditVehicleInfo(record)}>
                        <Edit2 size={16} />
                    </Button>
                    {/* <Button className="btn-danger mt-1 ml-2" size="sm" onClick={() => handleDeleteVehicleInfo(record)}>
                        <Trash2 size={16} />
                    </Button> */}
                    <Button className="btn btn-info mt-1 mr-1"
                        size="sm"
                        disabled={record.isAssign}
                        onClick={() => handleMenuVehicleManagement(record)}>
                        <Menu size={16} />
                    </Button>
                    <Button className="btn btn-warning mt-1 mr-1"
                        size="sm"
                        disabled={record.isAssign}
                        onClick={() => handleAssignVehicleInfo(record)}>
                        <Users size={16} />
                    </Button>
                </Space>
            ),
            width: '11em'
        }
    ];

    const AssignColumns = [
        {
            title: 'شخص تخصیص داده شده',
            key: 'userAssignName',
            render: (text, record) => (
                <Tag color="orange" >{record.user.name}  -  {record.user.userName}</Tag>
            ),
            width: '10vw'
        },
        {
            title: 'عملیات',
            key: 'action',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    <Button className="btn btn-danger mt-1"
                        size="sm"
                        disabled={record.isAssign}
                        onClick={() => handleDeleteAssignVehicleInfo(record)}>
                        <Trash2 size={16} />
                    </Button>
                </Space>
            ),
            width: '11vw'
        }
    ];

    const [state, setState] = useState({
        gpsTypesList: [{ label: "Type 0", value: 0 }, { label: "Type 1", value: 1 }],
        userVehiclesList: [],
        userVehiclesListForGrid: [],
        currentVehicle: {},
        currentVehicleAssignInfo: {},

        overSpeedModal: false,
        overSpeed: 0,
        overSpeedStatus: false,

        overDistanceModal: false,
        overDistance: 0,
        overDistanceStatus: false,

        editVehicleInfoModal: false,
        deleteVehicleInfoModal: false,
        createVehicleInfoModal: false,
        assignVehicleInfoModal: false,

        companyTypes: [],
        brands: [],
        models: [],
        selectedBrand: {},
        selectedModel: {},
        selectedVehicleType: {},
        selectedVehicleSize: {},

        showVehicleMenu: false,
        latlng: {},
        center: [35.728954, 51.388721]
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {

        vehicleService.GetCompanyType()
            .then(res1 => {
                if (res1.data.success && res1.data.result.length > 0) {
                    //   console.log(res1)
                    setState(prevState => {
                        return {
                            ...prevState,
                            companyTypes: res1.data.result,
                            brands: res1.data.result.map(c => {
                                return {
                                    label: c.title,
                                    value: c.id
                                }
                            })
                        }
                    })
                }
            })

        if (!config.useAuthentication) {
            return;
        }
        const user = auth.getCurrentUser();
        if (user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] &&
            user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin") {
            vehicleService.GetAllVehicles()
                .then(response => {
                    if (response.data.success && response.data.result.length > 0) {
                        const result = response.data.result;
                        //console.log(result)
                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: result, userVehiclesListForGrid: createDataModelForDataTabel(result)
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
        }
        else {
            // vehicleService.GetMyVehicles()
            //     .then(response => {
            //         if (response.data.success && response.data.result.length > 0) {
            //             const result = response.data.result;
            //             //console.log(result)
            //             setState(prevState => {
            //                 return {
            //                     ...prevState,
            //                     userVehiclesList: result, userVehiclesListForGrid: createDataModelForDataTabel(result)
            //                 }
            //             });
            //         }
            //         else {
            //             return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
            //         }
            //     })
            //     .catch(error => {
            //         //
            //     })
            vehicleService.GetMyAndAssignVehicles()
                .then(response => {
                    //  console.log('result my and assign vehicles', response)
                    if (response.data.success && (
                        (response.data.result.myVehicles && response.data.result.myVehicles.length > 0) ||
                        (response.data.result.assignVehicles && response.data.result.assignVehicles.length > 0))) {
                        const result = response.data.result;
                        let vehicles = [];
                        result.myVehicles.map(item => {
                            vehicles.push({
                                ...item,
                                isAssign: false
                            })
                        });
                        result.assignVehicles.map(item => {
                            vehicles.push({
                                ...item,
                                isAssign: true
                            })
                        })
                        //  console.log(vehicles)
                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
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
        }
        return () => {
            setState({});
        }

    }, [])

    //#endregion ---------------------------------------------------------

    const handleMenuVehicleManagement = (record) => {
        setState(prevState => {
            // Object.assign would also work
            return {
                ...prevState,
                currentVehicle: record,
                overSpeedStatus: record.isOverSpeedAlarmEnabled,
                overSpeed: record.overSpeed,
                overDistanceStatus: record.isOverDistanceAlarmEnabled,
                overDistance: record.overDistance,
                showVehicleMenu: true
            };
        });
        //  console.log("menu device managemenet", record);
    }

    //#region Vehicle Switch On Off and Shock Alarm Enable and Battery Cut Off Enable and ACC Alarm-------------

    const handleVehicleAccAlarm = (vehicleInfo) => {
        ////console.log(vehicleInfo);
        if (vehicleInfo.isAccAlarmEnabled) {
            vehicleService.DisableVehicleAccAlarm({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isAccAlarmEnabled = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار دزدگیر وسیله غیر فعال شد")
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
            vehicleService.EnableVehicleAccAlarm({ id: vehicleInfo.id, isSendSms: false }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isAccAlarmEnabled = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار دزدگیر وسلیه فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    const handleVehicleSwitchOnOff = (vehicleInfo) => {
        ////console.log(vehicleInfo);
        if (vehicleInfo.switchState) {
            vehicleService.SwitchOffVehicle({ id: vehicleInfo.id, isSendSms: false }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.switchState = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار روشن بودن وسیله غیر فعال شد")
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
            vehicleService.SwitchOnVehicle({ id: vehicleInfo.id, isSendSms: false }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.switchState = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار روشن بودن وسلیه فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    const handleShockAlarmEnable = (vehicleInfo) => {
        ////console.log(device);
        if (vehicleInfo.isShockAlarmEnabled) {
            vehicleService.DisableVehicleShockAlarm({ id: vehicleInfo.id }).then(response => {
                //console.log("shock", response)
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isShockAlarmEnabled = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار تکان خوردن و ضربه به وسیله غیر فعال شد")
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
            vehicleService.EnableVehicleShockAlarm({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isShockAlarmEnabled = true;
                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار تکان خوردن و ضربه به وسیله فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    const handleDoorAlarmEnable = (vehicleInfo) => {
        ////console.log(device);
        if (vehicleInfo.isDoorAlarmEnabled) {
            vehicleService.DisableVehicleDoorAlarm({ id: vehicleInfo.id }).then(response => {
                //console.log("shock", response)
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isDoorAlarmEnabled = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار باز و بسته شدن درب وسیله غیر فعال شد")
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
            vehicleService.EnableVehicleDoorAlarm({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isDoorAlarmEnabled = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار باز و بسته شدن درب وسیله فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    const handleBatteryCutOffAlarmEnable = (vehicleInfo) => {
        //console.log(vehicleInfo);
        if (vehicleInfo.isBatteryCutOffAlarmEnabled) {
            vehicleService.DisableVehicleBatteryCutOffAlarm({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isBatteryCutOffAlarmEnabled = false;
                    //console.log("data disabled", response)
                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار قطع کردن باتری غیر فعال شد")
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
            vehicleService.EnableVehicleBatteryCutOffAlarm({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isBatteryCutOffAlarmEnabled = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;
                    //console.log("data disabled", response)
                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("هشدار قطع کردن باتری فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    const handleStopAndResumeVehicle = (vehicleInfo) => {
        if (vehicleInfo.isStopVehicle) {
            vehicleService.ResumeVehicle({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isStopVehicle = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("وسیله به حالت قبلی برگشت")
                }
                else {
                    toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error);
                })
        }
        else {
            vehicleService.StopVehicle({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isStopVehicle = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("وسیله خاموش شد")
                }
                else {
                    toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    //#endregion -----------------------------------------------------------------------

    //#region Set Tracker Mode On or Monitor Mode On ------------------------------------

    const handleTrackerModeOrMonitorMode = (vehicleInfo) => {
        ////console.log(vehicleInfo);
        if (vehicleInfo.isTrackerMode) {
            vehicleService.EnableVehicleMonitorMode({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isTrackerMode = false;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("مانتیورنیگ و کنترل وسیله فعال گردید")
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
            vehicleService.EnableVehicleTrackerMode({ id: vehicleInfo.id }).then(response => {
                if (response.data.success && response.data.result) {
                    const data = _.cloneDeep(state.currentVehicle);
                    data.isTrackerMode = true;

                    const vehicles = [...state.userVehiclesList];
                    const index = _(vehicles).findIndex(c => c.id === data.id);
                    vehicles[index] = { ...vehicles[index] };
                    vehicles[index] = data;

                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                            , currentVehicle: data
                        }
                    });
                    return toast.success("رد یابی وسیله فعال شد")
                }
                else {
                    return toast.error("سیستم قادر به انجام این درخواست نیست");
                }
            })
                .catch(error => {
                    //console.log(error)
                })
        }
    }

    //#endregion ------------------------------------------------------------------------ 

    //#region Over Speed Alarm ------------------------------------------

    const overSpeedToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                overSpeedModal: !prevState.overSpeedModal
            }
        });
    }

    const handleOverSpeedAlarm = () => {
        overSpeedToggle();
    }

    const handleOverSpeedChange = (value) => {
        setState(prevState => {
            return {
                ...prevState,
                overSpeed: value
            }
        });
    }

    const handleCancelOverSpeedEnable = () => {
        setState(prevState => {
            return {
                ...prevState,
                overSpeed: 0
            }
        });
        overSpeedToggle();
    }

    const handleSubmitOverSpeedEnable = () => {
        if (state.currentVehicle && state.overSpeedStatus) {
            //console.log(state);
            vehicleService.EnableVehicleOverSpeed({ id: state.currentVehicle.id, overSpeed: state.overSpeed })
                .then(response => {
                    if (response.data.success && response.data.result) {
                        const data = _.cloneDeep(state.currentVehicle);
                        data.overSpeed = state.overSpeed;
                        data.isOverSpeedAlarmEnabled = state.overSpeedStatus;

                        const vehicles = [...state.userVehiclesList];
                        const index = _(vehicles).findIndex(c => c.id === data.id);
                        vehicles[index] = { ...vehicles[index] };
                        vehicles[index] = data;

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: data,
                                overSpeed: 0,
                                overSpeedStatus: false
                            }
                        });
                        overSpeedToggle();
                        return toast.success("هشدار تخطی از سرعت تعیین شده برای وسیله فعال شد")
                    }
                    else {
                        return toast.error("سیستم قادر به انجام این درخواست نیست");
                    }
                }
                ).catch(error => {
                    //console.log(error);
                })
        }
        else if (state.currentVehicle && !state.overSpeedStatus) {
            vehicleService.DisableVehicleOverSpeed({ id: state.currentVehicle.id })
                .then(response => {
                    if (response.data.success && response.data.result) {
                        const data = _.cloneDeep(state.currentVehicle);
                        //data.overSpeed = 0;
                        data.isOverSpeedAlarmEnabled = state.overSpeedStatus;

                        const vehicles = [...state.userVehiclesList];
                        const index = _(vehicles).findIndex(c => c.id === data.id);
                        vehicles[index] = { ...vehicles[index] };
                        vehicles[index] = data;

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: data,
                                //overSpeed:0,
                                overSpeedStatus: false
                            }
                        });
                        overSpeedToggle();
                        return toast.success("هشدار تخطی از سرعت تعیین شده برای وسیله غیر فعال شد")
                    }
                    else {
                        return toast.error("سیستم قادر به انجام این درخواست نیست");
                    }
                }
                ).catch(error => {
                    //
                })
        }
    }

    const handleOverSpeedEnableDisableSwitchChange = (value) => {
        setState(prevState => {
            return {
                ...prevState,
                overSpeedStatus: value
            };
        });
    }

    //#endregion ---------------------------------------------------------------------

    //#region Over Distance Alarm ---------------------------------------

    const overDistanceToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                overDistanceModal: !prevState.overDistanceModal
            }
        });
    }

    const handleOverDistanceAlarm = () => {
        overDistanceToggle();
    }

    const handleOverDistanceChange = (value) => {
        setState(prevState => {
            return {
                ...prevState,
                overDistance: value
            }
        });
    }

    const handleCancelOverDistanceEnable = () => {
        setState(prevState => {
            return {
                ...prevState,
                overDistance: 0
            }
        });
        overDistanceToggle();
    }

    const handleSubmitOverDistanceEnable = () => {
        if (state.currentVehicle && state.overDistanceStatus) {
            //console.log(state);
            vehicleService.EnableVehicleOverDistanceAlarm({
                id: state.currentVehicle.id,
                overDistance: state.overDistance,
                lat: state.latlng.lat,
                lon: state.latlng.lng,
                isSendSms: true
            })
                .then(response => {
                    if (response.data.success && response.data.result) {
                        const data = _.cloneDeep(state.currentVehicle);
                        data.overDistance = state.overDistance;
                        data.isOverDistanceAlarmEnabled = state.overDistanceStatus;

                        const vehicles = [...state.userVehiclesList];
                        const index = _(vehicles).findIndex(c => c.id === data.id);
                        vehicles[index] = { ...vehicles[index] };
                        vehicles[index] = data;

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: data,
                                overDistance: 0,
                                overDistanceStatus: false
                            }
                        });
                        overDistanceToggle();
                        return toast.success("هشدار تخطی از محدوده ی تعیین شده برای وسیله فعال شد")
                    }
                    else {
                        return toast.error("سیستم قادر به انجام این درخواست نیست");
                    }
                }
                ).catch(error => {
                    //console.log(error);
                })
        }
        else if (state.currentVehicle && !state.overDistanceStatus) {
            vehicleService.DisableVehicleOverDistanceAlarm({ id: state.currentVehicle.id })
                .then(response => {
                    if (response.data.success && response.data.result) {
                        const data = _.cloneDeep(state.currentVehicle);
                        //data.overSpeed = 0;
                        data.isOverDistanceAlarmEnabled = state.overDistanceStatus;

                        const vehicles = [...state.userVehiclesList];
                        const index = _(vehicles).findIndex(c => c.id === data.id);
                        vehicles[index] = { ...vehicles[index] };
                        vehicles[index] = data;

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: data,
                                //overSpeed:0,
                                overDistanceStatus: false
                            }
                        });
                        overDistanceToggle();
                        return toast.success("هشدار تخطی از محدوده ی تعیین شده برای وسیله غیر فعال شد")
                    }
                    else {
                        return toast.error("سیستم قادر به انجام این درخواست نیست");
                    }
                }
                ).catch(error => {
                    //
                })
        }
    }

    const handleOverDistanceEnableDisableSwitchChange = (value) => {
        setState(prevState => {
            return {
                ...prevState,
                overDistanceStatus: value
            };
        });
    }

    //#endregion ---------------------------------------------------------------------

    //#region Edit Vehicle Info ------------------------------------------

    const handleEditVehicleInfo = (record) => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: record
            }
        });

        editVehicleInfoToggle();
    }

    const editVehicleInfoToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                editVehicleInfoModal: !prevState.editVehicleInfoModal
            }
        });
    }

    const handleEditVehicleTitleChange = (value) => {

        const data = { ...state.currentVehicle };
        data.title = value;

        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: data
            }
        });
    }

    const handleEditVehicleIMEIChange = (value) => {
        const data = { ...state.currentVehicle };
        data.imei = value;

        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: data
            }
        });
    }

    const handleEditVehiclePhoneNumberChange = (value) => {
        const data = { ...state.currentVehicle };
        data.phoneNumber = value;

        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: data
            }
        });
    }

    const handleEditVehicleGpsTypeChange = (object) => {
        const data = { ...state.currentVehicle };
        data.gpsType = object.value;
        //console.log(object.value)
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: data
            }
        });
    }

    const handleSubmitEditVehicleInfo = () => {
        if (state.currentVehicle) {
            //console.log(_.pick(state.currentVehicle, ["title", "phoneNumber", "imei", "gpsType", "id"]))
            vehicleService.UpdateVehicle(_.pick(state.currentVehicle, ["title", "phoneNumber", "id"]))
                .then(response => {
                    if (response.data.success) {

                        const vehicles = [...state.userVehiclesList];
                        const index = _(vehicles).findIndex(c => c.id === state.currentVehicle.id);
                        vehicles[index] = { ...vehicles[index] };
                        vehicles[index] = state.currentVehicle;

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: {}
                            }
                        });
                        editVehicleInfoToggle();
                        return toast.success("اطلاعات وسیله ویرایش شد")
                    }
                    else {
                        return toast.error("امکان ویرایش اطلاعات وسیله مقدور نیست");
                    }
                })
                .catch(error => {
                    //
                })
        }

    }

    const handleCancelEditVehicleInfo = () => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: {}
            }
        });
        editVehicleInfoToggle();
    }

    //#endregion -----------------------------------------------------------

    //#region Delete Vehicle Info ----------------------------------------

    const handleDeleteVehicleInfo = (record) => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: record
            }
        });

        deleteVehicleInfoToggle();
    }

    const deleteVehicleInfoToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                deleteVehicleInfoModal: !prevState.deleteVehicleInfoModal
            }
        });
    }

    const handleSubmitDeleteVehicleInfo = () => {
        if (state.currentVehicle) {
            vehicleService.DeleteVehicle(state.currentVehicle.id)
                .then(response => {
                    if (response.data.success) {

                        const originalVehicles = [...state.userVehiclesList];
                        const vehicles = originalVehicles.filter(c => c.id !== state.currentVehicle.id);

                        setState(prevState => {
                            return {
                                ...prevState,
                                userVehiclesList: vehicles, userVehiclesListForGrid: createDataModelForDataTabel(vehicles)
                                , currentVehicle: {}
                            }
                        });
                        deleteVehicleInfoToggle();
                        return toast.success("وسیله ی انتخاب شده حذف گردید")
                    }
                    else {
                        return toast.error("امکان حذف وسیله ی انتخاب شده مقدور نیست");
                    }
                })
                .catch(error => {
                    //
                })
        }
    }

    const handleCancelDeleteVehicleInfo = () => {
        setState(prevState => {
            return {
                ...prevState,
                currentVehicle: {}
            }
        });
        deleteVehicleInfoToggle();
    }

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
    const handleSubmitCreateVehicleInfo = (values) => {

        //console.log('submit', values);
        let parameters = {
            ..._.pick(values, ["title", "phoneNumber", "imei", "driverName"]),
            vehicleType: values.selectVehicleType.value
        };
        if (state.selectedVehicleType && state.selectedVehicleType.value === 1) {
            parameters = {
                ...parameters,
                plaque: values.carPlateNo.firstPart + "-" +
                    values.carPlateNo.secondPart + "-" +
                    values.carPlateNo.thirdPart + "-" +
                    values.carPlateNo.forthPart,
                vehicleSizeType: values.selectVehicleSize.value,
                modelId: values.selectVehicleModel.value
            }
        }
        else {
            const modelId = _(state.companyTypes).last().models[0].id;
            //console.log(modelId)
            parameters = {
                ...parameters,
                plaque: values.motorPlateNo,
                vehicleSizeType: 0,
                modelId: modelId
            }
        }
        vehicleService.CreateVehicle(parameters)
            .then(response => {
                if (response.data.success) {

                    const originalVehicles = [...state.userVehiclesList];
                    originalVehicles.push(response.data.result);
                    //console.log(response);
                    setState(prevState => {
                        return {
                            ...prevState,
                            userVehiclesList: originalVehicles, userVehiclesListForGrid: createDataModelForDataTabel(originalVehicles)
                            , currentVehicle: {}
                        }
                    });
                    createVehicleInfoToggle();
                    return toast.success("وسیله ی جدید اضافه گردید")
                }
                else {
                    return toast.error("امکان اضافه کردن وسیله ی جدید مقدور نیست");
                }
            })
            .catch(error => {
                // console.log(error.message);
                // toast.error('asdf')
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
    const handleSelectedVehicleType = (value) => {
        //console.log('handle selected vehicle type', value, state);
        setState(prevState => {
            return {
                ...prevState,
                selectedVehicleType: value
            }
        })
    }
    const handleSelectedVehicleBrand = (selectedValue) => {
        //console.log('handle selected vehicle brand', selectedValue);
        let temp = state.companyTypes.filter(c => c.id === selectedValue.value);
        if (temp.length > 0) {
            setState(prevState => {
                return {
                    ...prevState,
                    selectedBrand: selectedValue,
                    selectedModel: null,
                    models: temp[0].models.map(c => {
                        return {
                            label: c.title,
                            value: c.id
                        }
                    })
                }
            })
        }
    }
    const handleSelectedVehicleModel = (selectedValue) => {
        //console.log('handle selected vehicle model', selectedValue);
        setState(prevState => {
            return {
                ...prevState,
                selectedModel: selectedValue
            }
        })
    }

    //#endregion ---------------------------------------------------------

    //#region Assign Vehicle Info --------------------------------------

    const handleAssignVehicleInfo = async (record) => {
        //console.log('vehicle info for assigning', record);
        try {

            const { data } = await vehicleService.GetVehicleAssignUser(record.id);
            //console.log(data)
            if (data.success && data.result.length > 0) {
                //console.log('assign', data)
                setState(prevState => {
                    return {
                        ...prevState,
                        currentVehicleAssignInfo: data.result,
                        currentVehicle: record,
                        showVehicleMenu: false
                    }
                })
                assignVehicleInfoToggle();
            }
            else if (data.success === false || data.result.length === 0) {
                //toast.error('نتایجی یافت نشد')
                setState(prevState => {
                    return {
                        ...prevState,
                        currentVehicleAssignInfo: [],
                        currentVehicle: record,
                        showVehicleMenu: false
                    }
                })
                assignVehicleInfoToggle();
            }
        } catch (error) {
            //console.log(error)
        }
    }

    const assignVehicleInfoToggle = () => {
        //console.log('modal assign')
        setState(prevState => {
            return {
                ...prevState,
                assignVehicleInfoModal: !prevState.assignVehicleInfoModal
            }
        });
    }

    const handleDeleteAssignVehicleInfo = async (record) => {
        //console.log('vehicle info for delete assign', record);
        try {

            const { data } = await assignService.DeleteAssign(record.id);
            //console.log(data)
            if (data.success) {
                const temp = state.currentVehicleAssignInfo.filter(c => c.id !== record.id);
                //console.log('assign', temp)
                setState(prevState => {
                    return {
                        ...prevState,
                        currentVehicleAssignInfo: temp
                    }
                })
                assignVehicleInfoToggle();
            }

        } catch (error) {
            //console.log(error)
        }
    }

    const handleSubmitAssignVehicleInfo = async (values, { setSubmitting }) => {
        setSubmitting(true);
        //console.log('state submitting', state, values);
        if (state.currentVehicle && state.currentVehicle.id) {
            try {

                const { data } = await assignService.CreateAssign({
                    vehicleId: state.currentVehicle.id,
                    phoneNumber: values.mobileNoAssign
                });
                //console.log(data)
                if (data.success) {
                    const response = await vehicleService.GetVehicleAssignUser(state.currentVehicle.id);
                    //console.log(response.data)
                    if (response.data.success && response.data.result.length > 0) {
                        //console.log('assign', data)
                        setState(prevState => {
                            return {
                                ...prevState,
                                currentVehicleAssignInfo: response.data.result,
                                showVehicleMenu: false
                            }
                        })
                    }
                }
            } catch (error) {
                //console.log(error)
            }
        }
        else {
            return toast.error('وسیله ای انتخاب نشده است')
        }
    }

    //#endregion ----------------------------------------------------------

    const handleReturnToMainMenu = () => {
        setState(prevState => {
            return {
                ...prevState,
                showVehicleMenu: !prevState.showVehicleMenu
            }
        })
    }

    const openPopup = (marker) => {
        if (marker && marker.leafletElement) {
            window.setTimeout(() => {
                marker.leafletElement.openPopup()
            })
        }
    }

    const MyComponent = () => {
        // const map = useLeaflet({
        //     click: (e) => {
        //         if (state.latlng && state.latlng.lat && state.latlng.lng) {

        //             console.log(state.latlng)
        //             // Leaflet.marker([state.latlng.lat, state.latlng.lng], { DefaultIcon }).removeFrom(map);
        //         }
        //         const { lat, lng } = e.latlng;
        //         //Leaflet.marker([lat, lng], { DefaultIcon }).addTo(map);
        //         setState(preState => {
        //             return {
        //                 ...preState,
        //                 latlng: e.latlng
        //             }
        //         });
        //     }
        // });
        return null;
    }

    return (
        <React.Fragment>
            <div className="">
                {!state.showVehicleMenu &&
                    <Row className=" justify-content-md-center">
                        <Col md="12" className="mt-2">
                            <FormGroup>
                                <Row>
                                    <Col>
                                        <button className="btn ltr"
                                            style={{
                                                direction: 'ltr', float: 'left',
                                                backgroundColor: '#1597E5', marginBottom: '0.01em'
                                            }}
                                            type="button"
                                            onClick={handleCreateVehicleInfo}>اضافه کردن وسیله</button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <ConfigProvider direction={"rtl"} locale={he_IL}>

                                            <Table
                                                className={antdClass2}
                                                rowClassName={(record, index) => !record.isAssign ? 'table-row-light' : 'table-row-dark'}
                                                columns={Columns}
                                                dataSource={state.userVehiclesListForGrid}
                                                //pagination={false}
                                                //tableLayout="auto"
                                                pagination={{
                                                    total: state.userVehiclesListForGrid.length,
                                                    current: currentPage,
                                                    position: ['topLeft'],
                                                    onChange: (page, pageSize) => {
                                                        //console.log('current page: ', page)
                                                        setPage(page);
                                                    }
                                                }}
                                                scroll={{ y: 'calc(100vh - 250px)', x: 'max-content' }}
                                            />
                                        </ConfigProvider>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>
                }
                {state.showVehicleMenu &&
                    <React.Fragment>
                        <Row >
                            <Col>
                                <button className="btn btn-transparent ltr"
                                    style={{ direction: 'ltr', float: 'left', backgroundColor: '#1597E5' }}
                                    type="button"
                                    onClick={handleReturnToMainMenu}>بازگشت</button>
                            </Col>
                        </Row>
                        <Row className="customBackgroundColor justify-content-md-center" style={{ marginTop: "15em" }}>
                            <Col md="2"></Col>
                            <Col md="10" className="d-flex align-items-center justify-content-center"
                            >
                                <div className="d-flex align-items-center" >
                                    {state.showVehicleMenu && state.currentVehicle.id &&
                                        <Planet

                                            centerContent={

                                                <Tag color="success" style={{ fontWeight: "bold", padding: '10px', borderRadius: "3", fontSize: "2em", textAlign: "center" }}>{state.currentVehicle.title}</Tag>
                                            }
                                            hideOrbit={false}
                                            autoClose
                                            open={true}
                                            orbitRadius={139}
                                            bounceOnClose
                                            rotation={0}
                                            // the bounce direction is minimal visible
                                            // but on close it seems the button wobbling a bit to the bottom
                                            bounceDirection="BOTTOM"
                                            mass={2}
                                            tension={400}
                                            friction={30}
                                        >

                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isAccAlarmEnabled === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleVehicleAccAlarm(state.currentVehicle)}
                                                id="vehicleAccAlarmButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={state.currentVehicle.isAccAlarmEnabled === true ? VehicleAccAlarmOnPNG : VehicleAccAlarmOffPNG} alt="AccAlarm" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="top" target="vehicleAccAlarmButton">
                                                    هشدار دزدگیر
                                                </UncontrolledTooltip>
                                            </button>

                                            {/* <Button
                                    // active={state.currentDevice.isOverSpeedEnable == true}
                                    color={state.currentVehicle.isVehicleTurnOnAlarmEnabled === true ? 'info' : 'transparent'}
                                    style={{ borderColor: '#1CBCD8', textAlign: "center" }}
                                    onClick={() => handleVehicleTurnOnEnable(state.currentVehicle)}
                                    id="vehicleTurnOnButton"
                                >
                                    <div className="logo-img">
                                        <img src={VehicleTurnOnPNG} alt="VehicleTurnOnPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="top" target="vehicleTurnOnButton">
                                        Vehicle Turn ON
                                    </UncontrolledTooltip>
                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.switchState === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleVehicleSwitchOnOff(state.currentVehicle)}
                                                id="vehicleTurnOnButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={VehicleTurnOnPNG} alt="VehicleTurnOnPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="top" target="vehicleTurnOnButton">
                                                    روشن/خاموش کردن وسیله
                                                </UncontrolledTooltip>
                                            </button>
                                            {/* <Button
                                    color={state.currentVehicle.isBatteryCutOffAlarmEnabled === true ? 'warning' : 'transparent'}
                                    style={{ borderColor: '#FF8D60', textAlign: "center" }}
                                    onClick={() => handleBatteryCutOffAlarmEnable(state.currentVehicle)}
                                    id="batteryCutOffButton"
                                >
                                    <div className="logo-img">
                                        <img src={BatterytheftPNG} alt="BatterytheftPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="left" target="batteryCutOffButton">
                                        Battery Cut Off
                                    </UncontrolledTooltip>

                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isBatteryCutOffAlarmEnabled === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleBatteryCutOffAlarmEnable(state.currentVehicle)}
                                                id="batteryCutOffButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={BatterytheftPNG} alt="BatterytheftPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="left" target="batteryCutOffButton">
                                                    جداشدن باتری از خودرو
                                                </UncontrolledTooltip>

                                            </button>
                                            {/* <Button
                                    // active={state.currentDevice.isOverSpeedEnable == true}
                                    color={state.currentVehicle.isOverDistanceAlarmEnabled === true ? 'primary' : 'transparent'}
                                    style={{ borderColor: '#009DA0', textAlign: "center" }}
                                    onClick={() => handleOverDistanceAlarm()}
                                    id="overDistanceButton"
                                >
                                    <div className="logo-img">
                                        <img src={LocationConstraintPNG} alt="LocationConstraintPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="top" target="overDistanceButton">
                                        Over Distance {state.currentVehicle.overDistance}
                                    </UncontrolledTooltip>

                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isOverDistanceAlarmEnabled === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleOverDistanceAlarm()}
                                                id="overDistanceButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={LocationConstraintPNG} alt="LocationConstraintPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="top" target="overDistanceButton">
                                                    خروج از محدوده ی تعیین شده {state.currentVehicle.overDistance} KM
                                                </UncontrolledTooltip>

                                            </button>
                                            {/* <Button
                                    // active={state.currentDevice.isOverSpeedEnable == true}
                                    color={(state.currentVehicle.isDoorAlarmEnabled) === true ? 'success' : 'transparent'}
                                    style={{ borderColor: '#0CC27E', textAlign: "center" }}
                                    onClick={() => handleDoorAlarmEnable(state.currentVehicle)}
                                    id="openDoorCarButton"
                                >
                                    <div className="logo-img">
                                        <img src={OpenDoorCarPNG} alt="OpenDoorCarPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="bottom" target="openDoorCarButton">
                                        Doors Alarm
                                    </UncontrolledTooltip>
                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: (state.currentVehicle.isDoorAlarmEnabled) === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleDoorAlarmEnable(state.currentVehicle)}
                                                id="openDoorCarButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={OpenDoorCarPNG} alt="OpenDoorCarPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="bottom" target="openDoorCarButton">
                                                    باز شدن درب خودرو
                                                </UncontrolledTooltip>
                                            </button>
                                            {/* <Button
                                    // active={state.currentDevice.isOverSpeedEnable == true}
                                    color={(state.currentVehicle.isShockAlarmEnabled) === true ? 'success' : 'transparent'}
                                    style={{ borderColor: '#0CC27E', textAlign: "center" }}
                                    onClick={() => handleShockAlarmEnable(state.currentVehicle)}
                                    id="shockCarButton"
                                >
                                    <div className="logo-img">
                                        <img src={ShockCarPNG} alt="ShockCarPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="bottom" target="shockCarButton">
                                        Shock Alarm
                                    </UncontrolledTooltip>
                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: (state.currentVehicle.isShockAlarmEnabled) === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleShockAlarmEnable(state.currentVehicle)}
                                                id="shockCarButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={ShockCarPNG} alt="ShockCarPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="bottom" target="shockCarButton">
                                                    لرزش و تکان خوردن خودرو
                                                </UncontrolledTooltip>
                                            </button>
                                            {/* <Button
                                    // active={state.currentDevice.isOverSpeedEnable == true}
                                    color={state.currentVehicle.isOverSpeedAlarmEnabled === true ? 'danger' : 'transparent'}
                                    style={{ borderColor: '#FF586B', textAlign: "center" }}
                                    onClick={() => handleOverSpeedAlarm()}
                                    id="overSpeedButton"
                                >
                                    <div className="logo-img">
                                        <img src={SpeedometerPNG} alt="SpeedometerPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="bottom" target="overSpeedButton">
                                        Over Speed {state.currentVehicle.overSpeed} KM/H
                                    </UncontrolledTooltip>

                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isOverSpeedAlarmEnabled === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleOverSpeedAlarm()}
                                                id="overSpeedButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={SpeedometerPNG} alt="SpeedometerPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="bottom" target="overSpeedButton">
                                                    تخطی از سرعت تعیین شده {state.currentVehicle.overSpeed} KM/H
                                                </UncontrolledTooltip>

                                            </button>
                                            {/* <Button
                                    color={state.currentVehicle.isStopVehicle === true ? 'secondary' : 'transparent'}
                                    style={{ borderColor: '#757575', textAlign: "center" }}
                                    onClick={() => handleStopAndResumeVehicle(state.currentVehicle)}
                                    id="StopCarButton"
                                >
                                    <div className="logo-img">
                                        <img src={StopCarPNG} alt="StopCarPNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="bottom" target="StopCarButton">
                                        Stop Car
                                    </UncontrolledTooltip>

                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: '#1597E5', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isStopVehicle === true ? '#1597E5' : 'transparent'
                                                }}
                                                onClick={() => handleStopAndResumeVehicle(state.currentVehicle)}
                                                id="StopCarButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={StopCarPNG} alt="StopCarPNG" width="50wh" />
                                                </div>
                                                <UncontrolledTooltip placement="bottom" target="StopCarButton">
                                                    متوقف کردن خودرو
                                                </UncontrolledTooltip>

                                            </button>
                                            {/* <Button
                                    color={state.currentVehicle.isTrackerMode === true ? 'secondary' : 'primary'}
                                    style={{ borderColor: state.currentVehicle.isTrackerMode === true ? '#757575' : '#009DA0', textAlign: "center" }}
                                    onClick={() => handleTrackerModeOrMonitorMode(state.currentVehicle)}
                                    id="TrackerModeOrMonitorModeButton"
                                >
                                    <div className="logo-img">
                                        <img src={state.currentVehicle.isTrackerMode === true ? TrackerModePNG : MonitorModePNG} alt="MonitorModePNG" width="50wh" />
                                    </div>
                                    <UncontrolledTooltip placement="right" target="TrackerModeOrMonitorModeButton">
                                        {state.currentVehicle.isTrackerMode === true ? 'Tracker Mode On' : 'Monitor Mode On'}
                                    </UncontrolledTooltip>

                                </Button> */}
                                            <button
                                                className="btn"
                                                style={{
                                                    borderColor: state.currentVehicle.isTrackerMode === true ? '#1597E5' : '#009DA0', textAlign: "center",
                                                    backgroundColor: state.currentVehicle.isTrackerMode === true ? '#1597E5' : 'primary'
                                                }}
                                                onClick={() => handleTrackerModeOrMonitorMode(state.currentVehicle)}
                                                id="TrackerModeOrMonitorModeButton"
                                            >
                                                <div className="logo-img">
                                                    <img src={state.currentVehicle.isTrackerMode === true ? TrackerModePNG : MonitorModePNG} alt="MonitorModePNG" width="50wh" />
                                                </div>
                                                {/* <UncontrolledTooltip placement="right" target="TrackerModeOrMonitorModeButton">
                                                    {state.currentVehicle.isTrackerMode === true ? 'Tracker Mode On' : 'Monitor Mode On'}
                                                </UncontrolledTooltip> */}
                                                <UncontrolledTooltip placement="right" target="TrackerModeOrMonitorModeButton">
                                                    {state.currentVehicle.isTrackerMode === true ? 'حالت ردیابی' : 'حالت مانیتورینگ'}
                                                </UncontrolledTooltip>

                                            </button>
                                        </Planet>}

                                </div>
                            </Col>
                        </Row>
                    </React.Fragment>
                }
            </div>


            {/* Over Speed Modal ---------------------------------------------------------------------*/}
            <Modal
                isOpen={state.overSpeedModal}
                toggle={overSpeedToggle}
                className={props.className + " customFont"}
                backdrop="static"
            >
                <ModalHeader toggle={overSpeedToggle} className="customFont rtl">وارد کردن حداکثر سرعت</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col><input
                            disabled={!state.overSpeedStatus}
                            className="form-control"
                            value={state.overSpeed}
                            type="text"
                            onChange={(e) => handleOverSpeedChange(e.target.value)}
                            placeholder="حداکثر سرعت"
                        /></Col>
                        <Col md="4" style={{ justifyContent: "right", direction: "rtl", display: "flex" }} >
                            {/* <span className="ml-1 pb-90">{permission.isGranted ? 'Granted' : 'Not Granted'}</span> */}
                            <Switch
                                name="overSpeedSwitch"
                                size="default"
                                defaultChecked={state.overSpeedStatus}
                                checkedChildren={state.overSpeedStatus ? "فعال" : ""}
                                unCheckedChildren={!state.overSpeedStatus ? "غیر فعال" : ""}
                                onChange={(value) => handleOverSpeedEnableDisableSwitchChange(value)}
                            />
                        </Col>
                    </Row>


                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitOverSpeedEnable}>
                        ثبت
                    </Button>{" "}
                    <Button color="danger" onClick={handleCancelOverSpeedEnable}>
                        لغو
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Over Distance Modal ------------------------------------------------------------------*/}
            <Modal
                isOpen={state.overDistanceModal}
                toggle={overDistanceToggle}
                className={props.className + " customFont"}
                backdrop="static"
            >
                <ModalHeader toggle={overDistanceToggle} className="customFont rtl">وارد کردن حداکثر فاصله</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col><input
                            disabled={!state.overDistanceStatus}
                            className="form-control"
                            value={state.overDistance}
                            type="text"
                            onChange={(e) => handleOverDistanceChange(e.target.value)}
                            placeholder="حداکثر فاصله"
                        /></Col>
                        <Col md="4" style={{ justifyContent: "right", direction: "rtl", display: "flex" }} >
                            {/* <span className="ml-1 pb-90">{permission.isGranted ? 'Granted' : 'Not Granted'}</span> */}
                            <Switch
                                name="overDistanceSwitch"
                                size="default"
                                defaultChecked={state.overDistanceStatus}
                                checkedChildren={state.overDistanceStatus ? "فعال" : ""}
                                unCheckedChildren={!state.overDistanceStatus ? "غیر فعال" : ""}
                                onChange={(value) => handleOverDistanceEnableDisableSwitchChange(value)}
                            />
                        </Col>
                    </Row>

                    <Row className=" mt-1">
                        <Col md="12" className="mt-2">

                            <Map center={state.center} zoom={13} onClick={handleClick} style={{ height: "20em" }}>
                                <TileLayer
                                    url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                                />

                                {state.latlng && state.latlng.lat && state.latlng.lng && <MyMarker position={state.latlng}>
                                    <Popup position={state.latlng}>
                                        Current location: <pre>{JSON.stringify(state.latlng, null, 2)}</pre>
                                    </Popup>
                                </MyMarker>}
                            </Map>
                            {/* <MapContainer
                                center={state.center}
                                zoom={13}
                                zoomAnimation={true}
                                markerZoomAnimation={true}
                                style={{ height: "20em" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                                />
                                <MyComponent />
                                {state.latlng && state.latlng.lat && state.latlng.lng &&
                                    <Marker position={state.latlng} ref={openPopup}>
                                        <Popup position={state.latlng}>
                                            Current location: <pre>{JSON.stringify(state.latlng, null, 2)}</pre>
                                        </Popup>
                                    </Marker>}
                            </MapContainer> */}
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitOverDistanceEnable}>
                        ثبت
                    </Button>{" "}
                    <Button color="danger" onClick={handleCancelOverDistanceEnable}>
                        لغو
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Edit Vehicle Modal -------------------------------------------------------------------*/}
            <Modal
                isOpen={state.editVehicleInfoModal}
                toggle={editVehicleInfoToggle}
                className={props.className + " customFont"}
                backdrop="static"
            >
                <ModalHeader toggle={editVehicleInfoToggle} className="customFont rtl">ویرایش اطلاعات وسیله {state.currentVehicle.title}</ModalHeader>
                <ModalBody>
                    {state.currentVehicle.id && <React.Fragment>
                        <Row>
                            <Col md="12">
                                <input
                                    className="form-control"
                                    value={state.currentVehicle.title}
                                    type="text"
                                    onChange={(e) => handleEditVehicleTitleChange(e.target.value)}
                                    placeholder="نام وسیله"
                                />
                            </Col>
                            {/* <Col md="6">
                                <input
                                    className="form-control"
                                    value={state.currentVehicle.imei}
                                    type="text"
                                    onChange={(e) => handleEditVehicleIMEIChange(e.target.value)}
                                    placeholder="IMEI"
                                />
                            </Col> */}
                        </Row>
                        <Row>
                            <Col md="12" className="mt-1">
                                <input
                                    className="form-control"
                                    value={state.currentVehicle.phoneNumber}
                                    type="text"
                                    onChange={(e) => handleEditVehiclePhoneNumberChange(e.target.value)}
                                    placeholder="شماره موبایل"
                                />
                            </Col>
                            {/* <Col md="6" className="mt-1">
                                <Select
                                    className="basic-single"
                                    classNamePrefix="select"
                                    defaultValue={{ label: `Type ${state.currentVehicle.gpsType}`, value: state.currentVehicle.gpsType }}
                                    name="selectGpsType"
                                    options={state.gpsTypesList}
                                    placeholder="نوع GPS"
                                    onChange={(value) => handleEditVehicleGpsTypeChange(value)}
                                />
                            </Col> */}
                        </Row>
                    </React.Fragment>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitEditVehicleInfo}>
                        ثبت
                    </Button>{" "}
                    <Button color="danger" onClick={handleCancelEditVehicleInfo}>
                        لغو
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Vehicle Modal -----------------------------------------------------------------*/}
            <Modal
                isOpen={state.deleteVehicleInfoModal}
                toggle={state.deleteVehicleInfoToggle}
                className={props.className + ' customFont'}
                backdrop="static"
            >
                <ModalHeader toggle={deleteVehicleInfoToggle} className="customFont text-right">حذف کردن وسیله</ModalHeader>
                <ModalBody className="customFont text-right">
                    آیا مطمئن هستید وسیله {state.currentVehicle.title} حذف شود ؟
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitDeleteVehicleInfo}>
                        ثبت
                    </Button>{" "}
                    <Button color="danger" onClick={handleCancelDeleteVehicleInfo}>
                        لغو
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Create Vehicle Modal ------------------------------------------------------------------*/}
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
                            await handleSubmitCreateVehicleInfo(values);
                        }}
                        validateOnBlur={true}
                        validateOnMount={true}
                        enableReinitialize
                    >
                        {(formik) => {
                            ////console.log("Formik props values", formik);
                           // console.log(formik)
                            return (
                                <React.Fragment>
                                    <Form>
                                        <Row>
                                            <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                <FormikControl
                                                    control="inputMaskDebounce"
                                                    mask="09999999999"
                                                    type="text"
                                                    name="phoneNumber"
                                                    id="phoneNumber"
                                                    className="ltr"
                                                    placeholder="شماره سیم کارت دستگاه"
                                                />
                                            </Col>
                                            <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                <FormikControl
                                                    control="input"
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    className="rtl"
                                                    placeholder="نام وسیله"
                                                //label="نام وسیله"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                <FormikControl
                                                    control="input"
                                                    type="text"
                                                    name="driverName"
                                                    id="driverName"
                                                    className="rtl"
                                                    placeholder="نام راننده"
                                                />
                                            </Col>
                                            <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                <FormikControl
                                                    control="inputMaskDebounce"
                                                    mask="999999999999999"
                                                    type="text"
                                                    name="imei"
                                                    id="imei"
                                                    className="ltr"
                                                    placeholder="کد وسیله"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="12" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                <FormikControl
                                                    control="customSelect"
                                                    name="selectVehicleType"
                                                    options={vehicleType}
                                                    id="selectVehicleType"
                                                    className="rtl"
                                                    classN="rtl"
                                                    placeholder="نوع وسیله"
                                                    onSelectedChanged={handleSelectedVehicleType}
                                                />
                                            </Col>
                                        </Row>
                                        {state.selectedVehicleType &&
                                            state.selectedVehicleType.value == 1 &&
                                            <Row>
                                                <Col md="12" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                    <FormikControl
                                                        control="customSelect"
                                                        name="selectVehicleSize"
                                                        options={vehicleSize}
                                                        id="selectVehicleSize"
                                                        className="rtl"
                                                        classN="rtl"
                                                        placeholder="اندازه وسیله"
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                        {state.selectedVehicleType &&
                                            //state.selectedVehicleType.value &&
                                            state.selectedVehicleType.value === 1 &&
                                            state.brands &&
                                            state.brands.length > 0 &&
                                            <Row className="d-flex justify-content-md-end">
                                                {
                                                    state.selectedVehicleType &&
                                                    ///    state.selectedVehicleType.value &&
                                                    state.selectedVehicleType.value === 1 &&
                                                    state.brands &&
                                                    state.brands.length > 0 &&
                                                    state.selectedBrand &&
                                                    state.models &&
                                                    state.models.length > 0 &&
                                                    <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                        <FormikControl
                                                            control="customSelect"
                                                            name="selectVehicleModel"
                                                            options={state.models}
                                                            selectedValue={state.selectedModel}
                                                            id="selectVehicleModel"
                                                            className="rtl"
                                                            classN="rtl"
                                                            placeholder="مدل"
                                                            onSelectedChanged={handleSelectedVehicleModel}
                                                        />
                                                    </Col>
                                                }
                                                <Col md="6" style={{ marginTop: "0.1vh", marginBottom: "-4vh" }}>
                                                    <FormikControl
                                                        control="customSelect"
                                                        name="selectVehicleBrand"
                                                        options={state.brands}
                                                        id="selectVehicleBrand"
                                                        className="rtl"
                                                        classN="rtl"
                                                        placeholder="برند"
                                                        onSelectedChanged={handleSelectedVehicleBrand}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                        {
                                            state.selectedVehicleType &&
                                            state.selectedVehicleType.value == 1 &&
                                            <Row>
                                                <Col md="12" className={"ltr"} style={{ marginTop: "2vh" }}>
                                                    <FormikControl
                                                        control="customPlate"
                                                        type="text"
                                                        name="carPlateNo"
                                                        id="carPlateNo"
                                                        className="ltr"
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                        {
                                            state.selectedVehicleType &&
                                            state.selectedVehicleType.value == 0 &&
                                            <Row className="d-flex justify-content-md-center">
                                                <Col md="12">
                                                    <FormikControl
                                                        control="input"
                                                        type="text"
                                                        name="motorPlateNo"
                                                        id="motorPlateNo"
                                                        className="rtl"
                                                        placeholder="شماره پلاک موتور"
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                        <div className="form-actions center">
                                            <Button color="primary" type="submit" className="mr-1" disabled={!formik.isValid}>
                                                {/* <LogIn size={16} color="#FFF" />  */}
                                                ثبت
                                            </Button>
                                            <Button color="danger" type="button" onClick={handleCancelCreateVehicleInfo}>
                                                لغو
                                            </Button>
                                        </div>
                                    </Form>
                                </React.Fragment>
                            );
                        }}
                    </Formik>

                </ModalBody>
            </Modal>

            {/* Assign Vehicle Modal ------------------------------------------------------------------*/}
            <Modal
                isOpen={state.assignVehicleInfoModal}
                toggle={assignVehicleInfoToggle}
                className={props.className}
                backdrop="static"
            >
                <ModalHeader toggle={assignVehicleInfoToggle} className="customFont">
                </ModalHeader>
                <ModalBody className="customFont text-center">
                    <Formik
                        initialValues={CreateVehicleAssignInitialValue}
                        validationSchema={CreateVehicleAssignValidationSchema}
                        onSubmit={handleSubmitAssignVehicleInfo}
                        validateOnBlur={true}
                        validateOnMount={true}
                        enableReinitialize
                    >
                        {(formik) => {
                            ////console.log("Formik props values", formik);
                            //console.log(formik)
                            return (
                                <React.Fragment>
                                    <Form>
                                        <Row>
                                            <Col md="10" style={{ marginTop: "-1.9em" }} className="justify-content-md-start">
                                                <FormikControl
                                                    control="inputMaskDebounce"
                                                    mask="09999999999"
                                                    type="text"
                                                    name="mobileNoAssign"
                                                    id="mobileNoAssign"
                                                    className="ltr"
                                                    placeholder="شماره موبایل"
                                                />
                                            </Col>
                                            <Col md="2" style={{ marginTop: "-0.5em" }}
                                                className="d-flex justify-content-md-start"
                                            >
                                                <Button color="transparent" type="submit" disabled={!formik.isValid || formik.isSubmitting}>
                                                    <Check size={24} color="rgb(65,105,225)" />
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </React.Fragment>
                            );
                        }}
                    </Formik>
                    <Row>
                        <Col md="12" className="rtl">
                            <Table
                                //className={antdClass2}
                                // rowClassName={(record, index) => !record.isAssign ? 'table-row-light' : 'table-row-dark'}
                                columns={AssignColumns}
                                dataSource={state.currentVehicleAssignInfo}
                                pagination={false}
                            //scroll={{ x: 'max-content', y: 200 }}
                            />
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

        </React.Fragment>
    );
};

export default UserProfile;
