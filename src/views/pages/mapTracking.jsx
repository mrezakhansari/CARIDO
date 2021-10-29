import React, { Component } from 'react';
import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Popup, Polyline, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import { Table, Tag, Space } from 'antd';
import { toast } from 'react-toastify';
import * as auth from "../../services/authService";
import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import MapPNG from '../../assets/icons/Map.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { Row, Col, FormGroup } from 'reactstrap';
import { DatePicker } from "jalali-react-datepicker";
import CustomDateTimePicker from '../../components/common/customDateTimePicker';

let DefaultIcon = Leaflet.icon({
    ...Leaflet.Icon.Default.prototype.options,
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;

//let center = [35.728954, 51.388721];
var commandTypeName = {
    0: 'نامعلوم',
    1: 'در حال ارسال موقعیت فعلی',
    2: 'درب ماشین باز شده',
    3: 'لرزش و تکان خوردن ماشین',
    4: 'ماشین روشن شده',
    5: 'ماشین خاموش شده',
    6: 'تخطی از سرعت تعیین شده',
    7: 'خارج از محدوده ی تعیین شده'

};

const limeOptions = { color: 'blue' }
toast.configure({ bodyClassName: "customFont" });

class MapTracking extends Component {

    constructor(props) {
        super(props)
    }

    state = {
        trackingList: [],
        trackingListInfo: [],
        userVehiclesList: [],
        userVehiclesListForGrid: [],
        showHistoryForm: false,
        currentVehicle: {},
        selectedDateTo: "",
        selectedDateFrom: "",
        popUpData: "",
        firstPoint: [],
        lastPoint: [],
        center: [35.728954, 51.388721],
        showMap: false
    }
    columns = [
        {
            title: 'دستگاه',
            dataIndex: 'title',
            key: 'title',
            width: '10vw'
        },
        {
            title: 'نوع GPS',
            dataIndex: 'gpsType',
            key: 'gpsType',
            width: '7vw'
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
            width: '10vw'
        },
        {
            title: 'عملیات',
            key: 'action',
            render: (text, record) => (
                <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
                    <div className="btn logo-img mt-1" size="sm" onClick={() => this.handleMapTrackingHistory(record)}>
                        <img src={MapPNG} alt="logo" width="10%" title="Tracking History" />
                    </div>
                </Space>
            ),
            width: '11vw'
        }
    ];

    componentDidMount() {

        const user = auth.getCurrentUser();
        if (user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] &&
            user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin") {
            vehicleService.GetAllVehicles()
                .then(response => {
                    if (response.data.success && response.data.result.length > 0) {
                        const result = response.data.result;
                        console.log('getallvehicle', result)
                        this.setState({
                            userVehiclesList: result, userVehiclesListForGrid: this.createDataModelForDataTabel(result)
                        }
                        );
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
            vehicleService.GetMyVehicles()
                .then(response => {
                    if (response.data.success && response.data.result.length > 0) {
                        const result = response.data.result;
                        this.setState({
                            userVehiclesList: result, userVehiclesListForGrid: this.createDataModelForDataTabel(result)
                        }
                        );
                    }
                    else {
                        return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
                    }
                })
                .catch(error => {
                    //
                })
        }
    }

    createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    handleMapTrackingHistory = (record) => {
        //console.log(record);
        this.setState({ trackingList: [], trackingListInfo: [], firstPoint: [], lastPoint: [], currentVehicle: record,showMap:false })
        // this.setState({ showHistoryForm: true, currentVehicle: record });
    }

    handleDateFromChange = (value) => {
        console.log(value);
        // const date = value.value["_i"].replace("-//", "");
        if (value.length > 10)
            this.setState({ selectedDateFrom: value.replace(' ', 'T') + 'Z' });
        else {
            this.setState({ selectedDateFrom: value.replace(' ', '') + 'T00:00:00Z' });
        }
    }

    handleDateToChange = (value) => {
        // console.log(value);
        // const date = value.value["_i"].replace("-//", "");
        if (value.length > 10)
            this.setState({ selectedDateTo: value.replace(' ', 'T') + 'Z' });
        else {
            this.setState({ selectedDateTo: value.replace(' ', '') + 'T23:59:59Z' });
        }
    }

    handleGetGPSHistory = () => {

        if (this.state.selectedDateFrom === "") {
            return toast.error("تاریخ ابتدای بازه را وارد کنید");
        }
        if (this.state.selectedDateTo === "") {
            return toast.error("تاریخ انتهای بازه را وارد کنید");
        }
        if (this.state.currentVehicle.id 
           // && this.state.showHistoryForm
            ) {
            const FromDate = new Date(this.state.selectedDateFrom);
            const ToDate = new Date(this.state.selectedDateTo);
            if (FromDate > ToDate) {
                return toast.error("بازه ی تاریخ را درست وارد کنید");
            }
            if (this.diffInMonths(ToDate, FromDate) > 2) {
                return toast.error("بازه ی تاریخ نمی تواند بیشتر از دوماه باشد");
            }
            vehicleService.GetVehicleGpsLocationHistory({ from: this.state.selectedDateFrom, to: this.state.selectedDateTo, vehicleId: this.state.currentVehicle.id }).then(response => {
                let { result, success } = response.data;
                console.log(result, success)
                this.setState({ trackingList: [], trackingListInfo: [], firstPoint: [], lastPoint: [] })
                if (result.length === 0) {
                    return toast.error('در این بازه ی تاریخی مسیری ثبت نشده است')
                }
                if (success) {
                    const tempList = result.gpsLocations.filter(f => f.lat !== 0 && f.lon !== 0).map(c => {
                        return ([c.lat, c.lon]);
                    });
                    const firstPoint = _(tempList).orderBy(c => c.creationTime).head();
                    const lastPoint = _(tempList).orderBy(c => c.creationTime).last();
                    console.log('GetVehicleGpsLocationHistory', response.data);
                    if (tempList.length > 1) {
                        //const temp = _(tempList).head();
                        const temp = tempList[tempList.length / 2];
                        // //console.log(temp);
                        //center = temp;
                        this.setState({
                            center: temp
                        })
                    }
                    this.setState({
                        trackingList: tempList,
                        trackingListInfo: result.gpsLocations,
                        firstPoint: firstPoint,
                        lastPoint: lastPoint,
                        showMap: true
                    })
                }
                ////console.log(response);
            })
                .catch(error => {
                    //console.log(error)
                });
        }
    }
    diffInMonths = (end, start) => {
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        return Math.round(timeDiff / (2e3 * 3600 * 365.25));
    }
    // handlePopupData = (e) => 
    //     {
    //         //console.log('mouse over', e);
    //         e.target.openPopup();
    //         this.setState({ popUpData: e.latlng.lat })
    //     }

    render() {
        console.log(this.state);
        return (<React.Fragment>
            <div className="container" >
                <Row className="customBackgroundColor justify-content-md-center">
                    <Col md="6" className="my-2">
                        <Table
                            //className={antdClass2}
                            //rowClassName={antdClass2}
                            columns={this.columns}
                            dataSource={this.state.userVehiclesListForGrid}
                            pagination={false}
                            scroll={{ x: 'max-content', y: 100 }}
                        />

                    </Col>
                    <Col md="3">
                        <Row>
                            <Col md="10" >
                                <FormGroup >
                                    <CustomDateTimePicker name="FromDate" key="FromDate" datePlaceholder="از تاریخ" timePlaceholder="از ساعت" onSelectedChanged={this.handleDateFromChange} />
                                    {/* <DatePicker label="از تاریخ" className="DatePickerCustomFont" key="FromDate" timePicker={false} onClickSubmitButton={(value) => this.handleDateFromChange(value)} /> */}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="10">
                                <FormGroup>
                                    <CustomDateTimePicker name="ToDate" key="ToDate" datePlaceholder="تا تاریخ" timePlaceholder="تا ساعت" onSelectedChanged={this.handleDateToChange} />
                                    {/* <DatePicker className="DatePickerCustomFont" label="تا تاریخ" key="FromDate" timePicker={false} onClickSubmitButton={(value) => this.handleDateToChange(value)} /> */}
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        {this.state.currentVehicle.id && 
                        //this.state.showHistoryForm &&
                            <React.Fragment>
                                <Row>
                                    <Col className="d-flex align-items-center justify-content-center mt-3">
                                        <Tag color="green" style={{ fontSize: "1rem" }}>وسیله: {this.state.currentVehicle.title} </Tag>
                                    </Col>


                                </Row>
                                <Row>
                                    <Col className="d-flex align-items-center justify-content-center mt-3">
                                        <button className="btn btn-warning mt-3" type="button" style={{ float: "right" }} onClick={this.handleGetGPSHistory}>جستجو</button>
                                    </Col></Row>
                            </React.Fragment>

                        }
                    </Col>
                </Row>
                {this.state.currentVehicle.id && this.state.showMap &&
                    <Row className="customBackgroundColor mt-1">
                        <Col md="12" className="mt-2">

                            <Row>
                                <Col md="12 mb-2">
                                    
                                        <MapContainer center={this.state.center} zoom={13} style={{ height: '62vh' }}>
                                            <TileLayer
                                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                                            />
                                            <Polyline pathOptions={limeOptions} positions={this.state.trackingList}
                                                eventHandlers={{
                                                    click: () => {
                                                        //console.log('marker clicked')
                                                    }
                                                    ,
                                                    mouseover: (e) => {
                                                        const lat = e.latlng.lat.toFixed(2);
                                                        const lng = e.latlng.lng.toFixed(2);
                                                        //console.log('mouse over', e.latlng, lat, lng);
                                                        const data = _(this.state.trackingListInfo).filter(c => c.lat.toFixed(2) === lat && c.lon.toFixed(2) === lng).head();
                                                        //console.log(data);
                                                        if (data !== undefined) {
                                                            e.target.openPopup();
                                                            this.setState({
                                                                popUpData:
                                                                    <div dir="rtl" className="customFont" style={{ textAlign: "right" }}>
                                                                        <span>سرعت: </span>
                                                                        <strong>KM/H {data.speed}</strong>
                                                                        <br />
                                                                        <span>وضعیت خودرو: </span>
                                                                        <strong>{commandTypeName[data.commandType]}</strong>
                                                                    </div>
                                                            });

                                                        }
                                                    }
                                                }
                                                }>
                                                {/* <Tooltip sticky>sticky Tooltip for Polygon</Tooltip> */}
                                                <Popup>{this.state.popUpData}</Popup>
                                            </Polyline>
                                            {this.state.firstPoint.length > 0 && <Marker position={this.state.firstPoint}>
                                                <Popup>
                                                    <div dir="rtl" className="customFont" style={{ textAlign: "right" }}>
                                                        <span>شروع </span>
                                                    </div>
                                                </Popup>
                                            </Marker>}
                                            {this.state.lastPoint.length > 0 && <Marker position={this.state.lastPoint}>
                                                <Popup>
                                                    <div dir="rtl" className="customFont" style={{ textAlign: "right" }}>
                                                        <span>پایان </span>
                                                    </div>
                                                </Popup>
                                            </Marker>}

                                        </MapContainer>
                                    
                                </Col>
                            </Row>
                        </Col>
                    </Row>}


            </div>

        </React.Fragment>
        );
    }
}

export default MapTracking;


//#region Simple Map Tracking ------------------------------------------------------------
// import React, { Component } from 'react'
// import Leaflet from 'leaflet';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';



// // Leaflet.Icon.Default.imagePath =
// //     '../node_modules/leaflet'
// //  //   node_modules\leaflet\dist\images\marker-icon-2x.png
// // delete Leaflet.Icon.Default.prototype._getIconUrl;

// // Leaflet.Icon.Default.mergeOptions({
// //     iconRetinaUrl: require('../node_modules/leaflet/dist/images/marker-icon-2x.png'),
// //     iconUrl: require('../node_modules/leaflet/dist/images/marker-icon.png'),
// //     shadowUrl: require('../node_modules/leaflet/dist/images/marker-shadow.png')
// // });

// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// let DefaultIcon = Leaflet.icon({
//             ...Leaflet.Icon.Default.prototype.options,
//             iconUrl: icon,
//             iconRetinaUrl: iconRetina,
//             shadowUrl: iconShadow
//         });
//         Leaflet.Marker.prototype.options.icon = DefaultIcon;



// export default class MapTracking extends Component {
//     state = {
//         lat: 35.728954,
//         lng: 51.388721,
//         zoom: 13,
//     }


//     render() {
//         const position = [this.state.lat, this.state.lng]
//         return (
//             <MapContainer center={position} zoom={this.state.zoom} style={{ height: '400px' }}>
//                 <TileLayer
//                     attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <Marker position={position}>
//                     <Popup>
//                         tehran
//         </Popup>
//                 </Marker>
//             </MapContainer>
//         )
//     }
// }

//#endregion ------------------------------------------------------------------------------
