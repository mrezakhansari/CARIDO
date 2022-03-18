import React, { useEffect, useState } from "react";
import { Row, Col, Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag, Space, ConfigProvider, Input } from 'antd';
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from 'yup';
import "antd/dist/antd.css";
import css from '../../assets/css/vendors/customAntdTableReport.css';
import MapPNG from '../../assets/icons/Map.png';
import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Popup, Marker, Map as LeafletMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { Trash2, Users, X, Check } from "react-feather";
import he_IL from "antd/es/locale/fa_IR";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import RotatedMarker from '../../components/common/RotatedMarker';

toast.configure({ bodyClassName: "customFont" });

let DefaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;


var searchInput;

const VehiclesPage = (props) => {

    const [markerAngle, setMarkerAngle] = useState(0);

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
            return `${temp} روز`
        }
        return ""
    }

    const getRemainDay = (text) => {
        if (text) {
            // console.log(text)
            let temp = text.split(":")[0];
            return parseInt(temp);
        }
        return 0
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

    const [currentPage, setPage] = React.useState(1);



    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchInput = node;
                        // setSearchInput({searchInput:node});
                    }}
                    placeholder='جستجو'
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        جستجو
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        لغو
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setState(prevState => {
                                return {
                                    ...prevState,
                                    searchText: selectedKeys[0],
                                    searchedColumn: dataIndex,
                                }
                            })
                        }}
                    >
                        فیلتر
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() =>
                    searchInput.select()
                    // searchInput.select()
                    , 100);
            }
        },
        render: text =>
            state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });


    const Columns = [
        {
            title: 'ردیف',
            key: 'row',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
            width: '4em'
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
            width: '7em',
            ...getColumnSearchProps('imei'),
            render: (text) => <Tag color="cyan">{text}</Tag>
        },
        {
            title: 'خودرو',
            dataIndex: 'title',
            key: 'carName',
            width: '5em',
            ...getColumnSearchProps('title'),
        },
        {
            title: 'نام کاربر',
            //dataIndex: 'user.fullName',
            key: 'fullName',
            width: '6em',
            // ...getColumnSearchProps('fullName'),
            render: (text, record) => <span style={{ direction: "ltr" }}>{record.user && record.user.name}</span>,
        },
        {
            title: 'سیم کارت GPS',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            ...getColumnSearchProps('phoneNumber'),
            render: (text, record) => <span style={{ direction: "ltr" }}>{text}</span>,
            width: '5em'
        },
        {
            title: 'شماره مدیر دستگاه',
            key: 'userName',
            //...getColumnSearchProps('userName'),
            render: (text, record) => <span style={{ direction: "ltr" }}>{record.user && record.user.userName}</span>,
            width: '5em'
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
            width: '4em'
        },
        {
            title: 'آخرین لوکیشن',
            key: 'location',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    {
                        record.gpsLocations && record.gpsLocations.length > 0 && <div className="btn logo-img " size="sm"
                            onClick={() => handleLocationOnMap(record)}>
                            <img src={MapPNG} alt="logo" width="40%"
                                title={`lat: ${record.gpsLocations[0].lat}, lon:${record.gpsLocations[0].lon}`} />
                        </div>
                    }

                </Space>
            ),
            width: '5em'
        },
        {
            title: 'میزان طرح باقیمانده',
            dataIndex: 'remain',
            key: 'remain',
            defaultSortOrder: 'descend',
            //sortDirections: ['descend'],
            // Callback function, return value boolean type
            sorter: (a, b) => getRemainDay(a.remain) - getRemainDay(b.remain),
            render: (text, record) => <Tag color="cyan" style={{ direction: "rtl", marginBottom: "2vh", paddingTop: "1vh" }}>{getRemainDateTime(text)}</Tag>,
            width: '6em'
        },
        {
            title: 'زمان راه اندازی',
            dataIndex: 'beginTime',
            key: 'beginTime',
            render: (text, record) => text !== null && text !== "" ? <Tag color="red" style={{ direction: "ltr", marginBottom: "2vh", paddingTop: "1vh" }}>{getDateTime(text)}</Tag> : "",
            width: '5em'
        },
        {
            title: 'زمان ایجاد',
            dataIndex: 'creationTime',
            key: 'creationTime',
            render: (text, record) => text !== null && text !== "" ? <Tag color="magenta" style={{ direction: "ltr", marginBottom: "2vh", paddingTop: "1vh" }}>{getDateTime(text)}</Tag> : "",
            width: '5em'
        },
        {
            title: 'عملیات',
            key: 'operation',
            width: '8em',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    {
                        record.isActive ?
                            <Button className="btn-success mt-1" size="sm"
                                onClick={() => handleVehicleStatus(record)}>
                                <Check size={16} />
                            </Button> :
                            <Button className="mt-1" size="sm" color="secondary"
                                onClick={() => handleVehicleStatus(record)}>
                                <X size={16} />
                            </Button>
                    }

                    <Button className="btn-danger mt-1 mr-1" size="sm"
                        onClick={() => handleDeleteVehicleInfo(record)}>
                        <Trash2 size={16} />
                    </Button>
                    <Button className="btn-warning mt-1 mr-1 " size="sm"
                        onClick={() => handleAssignVehicleInfo(record)}>
                        <Users size={16} color="red" />
                    </Button>
                </Space>
            )
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
        //console.log(vehicle)
        if (vehicle.isActive) {
            vehicleService.DisableVehicle({ id: vehicle.id }).then(response => {
                //console.log(response)
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
        assignModal: false,
        scan: 0,
        installed: 0,
        active: 0,
        lessThen10Days: 0,
        Expired: 0,
        showMap: false,
        currentVehicleCenterLocation: [],
        currentVehicleAssignInfo: [],
        searchText: '',
        searchedColumn: ''
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
                    //console.log('414 vehicle page', result);
                    const scan = result.length;
                    const installed = result.filter(c => c.user !== null && c.user.userName != null).length;
                    const active = result.filter(c => c.user !== null && c.isActive === true).length;
                    const lessThan10Days = result.filter(c=>c.remain && c.remain !=="" && getRemainDay(c.remain) < 10).length;
                    //console.log(result, result.length, installed, active)
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

        //console.log(values);
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

    //#region DELETE Vehicle INFO EVENTS ---------------------------------------

    const handleDeleteVehicleInfo = (vehicleInfo) => {
        //console.log('userData for delete', vehicleInfo);
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
        //console.log(state.currentVehicle.id);
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
            //console.log(error.message);
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

    //#region Assign Vehicle INFO EVENTS-----------------------------------------------------------------

    const handleAssignVehicleInfo = async (vehicleInfo) => {
       // console.log('vehicle info for assigning', vehicleInfo);
        try {

            const { data } = await vehicleService.GetVehicleAssignUser(vehicleInfo.id);
            //console.log(data)
            if (data.success && data.result.length > 0) {
                //console.log('assign', data)
                setState(prevState => {
                    return {
                        ...prevState,
                        currentVehicleAssignInfo: data.result
                    }
                })
                assignToggle();
            }
            else if (data.success === false || data.result.length === 0) {
                toast.error('نتایجی یافت نشد')
            }
        } catch (error) {
           // console.log(error)
        }
    }

    const assignToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                assignModal: !state.assignModal
            }
        });
    }
    //#endregion --------------------------------------------------------------

    //#region Search Box ----------------------
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setState(prevState => {
            return {
                ...prevState,
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
            }
        })
    };

    const handleReset = clearFilters => {
        clearFilters();
        setState(prevState => {
            return {
                ...prevState,
                searchText: ''
            }
        })
    };
    //#endregion  --------------------------------

    return (
        <React.Fragment>

            <Row className="customBackgroundColor " style={{ width: '100%', height: '100%' }}>
                <Col md="12" >
                    {state.showMap &&
                        <React.Fragment>
                            <Row className="d-flex justify-content-md-end">
                                <Col md="2">
                                    <button className="btn btn-transparent ltr"
                                        style={{ direction: 'ltr', float: 'left', backgroundColor: '#1597E5' }}
                                        type="button"
                                        onClick={handleReturnToMainMenu}>بازگشت</button>
                                </Col>
                            </Row>
                            <Row className=" mt-1">
                                <Col md="12" className="mt-2">
                                    <LeafletMap center={state.currentVehicleCenterLocation}
                                        zoom={13} style={{ height: "100vh" }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <RotatedMarker
                                            position={state.currentVehicleCenterLocation}
                                            icon={DefaultIcon}
                                            rotationAngle={markerAngle}
                                            rotationOrigin="center"
                                        />
                                    </LeafletMap>
                                    {/* <MapContainer
                                        center={state.currentVehicleCenterLocation}
                                        zoom={13}
                                        zoomAnimation={true}
                                        markerZoomAnimation={true}
                                        //style={{ height: "45em" }}
                                        className="leaflet-container"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                                        />

                                        <Marker position={state.currentVehicleCenterLocation}>
                                            <div dir="rtl" className="customFont" style={{ textAlign: "right" }}>
                                                <span>آخرین  لوکیشن</span>
                                            </div>
                                        </Marker>
                                    </MapContainer> */}
                                </Col>
                            </Row>
                        </React.Fragment>
                    }
                    {!state.showMap &&
                        <React.Fragment>
                            <Row className="d-flex justify-content-md-end">
                                <Col md="2">
                                    <button className="btn btn-transparent"
                                        style={{ direction: 'ltr', float: 'left', backgroundColor: '#1597E5' }}
                                        type="button"
                                        onClick={handleCreateVehicleInfo}>اضافه کردن وسیله</button>
                                </Col>
                            </Row>
                            <Row className="d-flex justify-content-md-start" style={{ marginBottom: '-1em', marginTop: '-1.25em' }}>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1em", color: 'white' }} className="mt-1 text-md-center"> اسکن : <Tag color="magenta">{state.scan}</Tag></Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1em", color: 'white' }} className="mt-1 text-md-right"> فعال : <Tag color="orange">{state.active}</Tag></Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1em", color: 'white' }} className="mt-1 text-md-right"> نصب شده : <Tag color="pink">{state.installed}</Tag></Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1em", color: 'white' }} className="mt-1 text-md-right"> منقضی شده : <Tag color="processing">{state.Expired}</Tag></Col>
                                <Col md="2" style={{ fontWeight: "bold", fontSize: "1em", color: 'white' }} className="mt-1 text-md-right"> کمتر از 10 روز  : <Tag color="purple">{state.lessThen10Days}</Tag></Col>

                            </Row>
                            <Row className="justify-content-md-center">
                                <Col md="12">
                                    <ConfigProvider direction={"rtl"} locale={he_IL}>

                                        <Table
                                            style={{ width: '100%', height: '100%' }}
                                            className={css}
                                            rowClassName={css}
                                            columns={Columns}
                                            dataSource={state.vehiclesListForGrid}
                                            //pagination={true}
                                            // pagination={{
                                            //     onChange(current) {
                                            //         setPage(current);
                                            //     }
                                            // }}

                                            pagination={{
                                                total: state.vehiclesListForGrid.length,
                                                current: currentPage,
                                                position: ['topLeft'],
                                                onChange: (page, pageSize) => {
                                                   // console.log('current page: ', page)
                                                    setPage(page);
                                                }
                                            }}
                                            scroll={{ x: 'max-content', y: '30em' }}
                                        />
                                    </ConfigProvider>
                                </Col>
                            </Row>
                        </React.Fragment>
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

            {/* Delete Modal */}
            <Modal
                isOpen={state.deleteModal}
                toggle={deleteToggle}
                className={props.className}
                backdrop="static"
            >
                <ModalHeader toggle={deleteToggle} className="customFont text-right">حذف اطلاعات وسیله</ModalHeader>
                <ModalBody>
                    آیا مطمئن هستید ؟
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitDeleteVehicleInfo}>
                        بله
                    </Button>{" "}
                    <Button color="danger" onClick={handleCancelDeleteVehicleInfo}>
                        خیر
                    </Button>
                </ModalFooter>
            </Modal>

            {/* assign Modal */}
            <Modal
                isOpen={state.assignModal}
                toggle={assignToggle}
                className={props.className}
                backdrop="static"
            >
                <ModalHeader toggle={assignToggle} className="customFont text-right">اطلاعات افراد تخصیص داده شده</ModalHeader>
                <ModalBody className="customFont text-center">
                    {state.currentVehicleAssignInfo && state.currentVehicleAssignInfo.length > 0 &&
                        state.currentVehicleAssignInfo.map(item => {
                            return (<p key={item.user.userName}>
                                <Tag color="orange" >{item.user.name}  -  {item.user.userName}</Tag>
                            </p>)
                        })}
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default VehiclesPage;
