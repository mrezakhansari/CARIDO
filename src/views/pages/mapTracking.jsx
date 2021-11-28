import React, { Component } from "react";
import Leaflet from "leaflet";
import {
  MapContainer,
  TileLayer,
  Popup,
  Polyline,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import * as vehicleService from "../../services/vehicleService";
import { Table, Tag, Space, ConfigProvider } from "antd";
import { toast } from "react-toastify";
import * as auth from "../../services/authService";
import "antd/dist/antd.css";
import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import MapPNG from "../../assets/icons/Map.png";
import HistoryTrackingPNG from "../../assets/icons/LocationConstraint.png";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconStop from "leaflet/dist/images/stop-icon.png";
import iconStopRetina from "leaflet/dist/images/stop-icon-2x.png";
import { Row, Col, FormGroup, Button } from "reactstrap";
import { DatePicker } from "jalali-react-datepicker";
import CustomDateTimePicker from "../../components/common/customDateTimePicker";
import he_IL from "antd/es/locale/fa_IR";
import config from '../../config.json';
import * as signalR from "@microsoft/signalr";

let DefaultIcon = Leaflet.icon({
  ...Leaflet.Icon.Default.prototype.options,
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

let StopIcon = Leaflet.icon({
  ...Leaflet.Icon.Default.prototype.options,
  iconUrl: iconStop,
  iconRetinaUrl: iconStopRetina,
  shadowUrl: iconShadow,
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;

//let center = [35.728954, 51.388721];
var commandTypeName = {
  0: "نامعلوم",
  1: "در حال ارسال موقعیت فعلی",
  2: "درب ماشین باز شده",
  3: "لرزش و تکان خوردن ماشین",
  4: "ماشین روشن شده",
  5: "ماشین خاموش شده",
  6: "تخطی از سرعت تعیین شده",
  7: "خارج از محدوده ی تعیین شده",
};


const limeOptions = { color: "blue" };
toast.configure({ bodyClassName: "customFont" });

class MapTracking extends Component {
  getStopDateTime = (text) => {
    if (text) {
      let day = parseInt(text.split(":")[0]);
      let hour = parseInt(text.split(":")[1]);
      let minute = parseInt(text.split(":")[2]);
      let second = parseInt(text.split(":")[3]);

      let s = day > 0 ? ` ${day} روز و  ` : "";
      s += hour > 0 ? ` ${hour} ساعت و  ` : "";
      s += minute ? ` ${minute} دقیقه و  ` : "";
      s += second ? ` ${second} ثانیه` : "";
      return s;
    }
    return "";
  };

  getDateTime = (text) => {
    if (text) {
      let result = "";
      let temp = _(text).split("-").value();
      if (temp.length == 3) {
        result = `${temp[0]}/${temp[1]}/`;
        let day = temp[2].split("T");
        if (day.length == 2) {
          result += day[0];
          let time = day[1].split(":");
          result += ` ${time[0]}:${time[1]}`;
        }
      }
      return result;
    }
    return "";
  };

  constructor(props) {
    super(props);
  
  }



  state = {
    trackingList: [],
    trackingListInfo: [],
    stopListInfo: [],
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
    showMap: false,
    showMapMenu: false,
    currentPage: 1,
  };
  columns = [
    {
      title: "ردیف",
      key: "row",
      render: (text, record, index) =>
        (this.state.currentPage - 1) * 10 + index + 1,
      width: "4em",
    },
    {
      title: "دستگاه",
      dataIndex: "title",
      key: "title",
      width: "10em",
    },
    {
      title: "نوع GPS",
      dataIndex: "gpsType",
      key: "gpsType",
      render: (text) => (
        <Tag color="geekblue">{text === 0 ? "Coban" : "Concox"}</Tag>
      ),
      width: "5em",
    },
    {
      title: "IMEI",
      dataIndex: "imei",
      key: "imei",
      render: (text) => <Tag color="geekblue">{text}</Tag>,
      width: "10em",
    },
    {
      title: "تاریخچه ردیابی",
      key: "action",
      render: (text, record) => (
        <Space
          size="middle"
          style={{ alignContent: "center", alignItems: "center" }}
        >
          <div
            className="btn logo-img mt-1"
            size="sm"
            onClick={() => this.handleMapTrackingHistory(record)}
          >
            <img src={MapPNG} alt="logo" width="10%" title="Tracking History" />
          </div>
        </Space>
      ),
      width: "6em",
    },
    {
      title: "موقعیت فعلی",
      key: "action",
      render: (text, record) => (
        <Space
          size="middle"
          style={{ alignContent: "center", alignItems: "center" }}
        >
          <div
            className="btn logo-img mt-1"
            size="sm"
            onClick={() => this.handleMapTrackingCurrent(record)}
          >
            <img
              src={HistoryTrackingPNG}
              alt="logo"
              width="20%"
              title="Tracking History"
            />
          </div>
        </Space>
      ),
      width: "6em",
    },
  ];

  componentWillUnmount() {
       
    }

  
  componentDidMount() {

    const hubConnection = new signalR.HubConnectionBuilder().withUrl(config.socketAddress, {
      accessTokenFactory: () => localStorage.getItem('token')
    })
    .build();
     
    hubConnection.start().then(x=>console.log(x));
    hubConnection.on("getmessage", message => {
      console.log(message)
    })

    const user = auth.getCurrentUser();
    if (
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] &&
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ===
        "Admin"
    ) {
      vehicleService
        .GetAllVehicles()
        .then((response) => {
          if (response.data.success && response.data.result.length > 0) {
            const result = response.data.result;
            console.log("getallvehicle", result);
            this.setState({
              userVehiclesList: result,
              userVehiclesListForGrid: this.createDataModelForDataTabel(result),
            });
          } else {
            return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
          }
        })
        .catch((error) => {
          //
        });
    } else {
      // vehicleService.GetMyVehicles()
      //     .then(response => {
      //         if (response.data.success && response.data.result.length > 0) {
      //             const result = response.data.result;
      //             this.setState({
      //                 userVehiclesList: result, userVehiclesListForGrid: this.createDataModelForDataTabel(result)
      //             }
      //             );
      //         }
      //         else {
      //             return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
      //         }
      //     })
      //     .catch(error => {
      //         //
      //     })
      vehicleService
        .GetMyAndAssignVehicles()
        .then((response) => {
          console.log("result my and assign vehicles", response);
          if (
            response.data.success &&
            ((response.data.result.myVehicles &&
              response.data.result.myVehicles.length > 0) ||
              (response.data.result.assignVehicles &&
                response.data.result.assignVehicles.length > 0))
          ) {
            const result = response.data.result;
            let vehicles = [];
            result.myVehicles.map((item) => {
              vehicles.push({
                ...item,
                isAssign: false,
              });
            });
            result.assignVehicles.map((item) => {
              vehicles.push({
                ...item,
                isAssign: true,
              });
            });
            console.log(vehicles);
            this.setState({
              userVehiclesList: vehicles,
              userVehiclesListForGrid:
                this.createDataModelForDataTabel(vehicles),
            });
          } else {
            return toast.warning("هیچ دستگاهی برای شما ثبت نشده است");
          }
        })
        .catch((error) => {
          //
        });
    }
  }

  createDataModelForDataTabel = (data) => {
    return data.map((item) => {
      return { ...item, key: item.id };
    });
  };

  handleMapTrackingHistory = (record) => {
    //console.log(record);
    this.setState({
      trackingList: [],
      trackingListInfo: [],
      stopListInfo: [],
      firstPoint: [],
      lastPoint: [],
      currentVehicle: record,
      showMap: false,
      showMapMenu: true,
    });
    // this.setState({ showHistoryForm: true, currentVehicle: record });
  };

  handleMapTrackingCurrent = (record) => {


    this.setState({
      trackingList: [],
      trackingListInfo: [],
      stopListInfo: [],
      firstPoint: [],
      lastPoint: [],
      currentVehicle: record,
      showMap: false,
      showMapMenu: true,
    });
  };

  handleDateFromChange = (value) => {
    console.log(value);
    // const date = value.value["_i"].replace("-//", "");
    if (value.length > 10)
      this.setState({ selectedDateFrom: value.replace(" ", "T") + "Z" });
    else {
      this.setState({
        selectedDateFrom: value.replace(" ", "") + "T00:00:00Z",
      });
    }
  };

  handleDateToChange = (value) => {
    // console.log(value);
    // const date = value.value["_i"].replace("-//", "");
    if (value.length > 10)
      this.setState({ selectedDateTo: value.replace(" ", "T") + "Z" });
    else {
      this.setState({ selectedDateTo: value.replace(" ", "") + "T23:59:59Z" });
    }
  };

  handleGetGPSHistory = () => {
    if (this.state.selectedDateFrom === "") {
      return toast.error("تاریخ ابتدای بازه را وارد کنید");
    }
    if (this.state.selectedDateTo === "") {
      return toast.error("تاریخ انتهای بازه را وارد کنید");
    }
    if (
      this.state.currentVehicle.id
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
      vehicleService
        .GetVehicleGpsLocationHistory({
          from: this.state.selectedDateFrom,
          to: this.state.selectedDateTo,
          vehicleId: this.state.currentVehicle.id,
        })
        .then((response) => {
          let { result, success } = response.data;
          //console.log(result, success)
          this.setState({
            trackingList: [],
            trackingListInfo: [],
            firstPoint: [],
            lastPoint: [],
          });
          if (result.length === 0) {
            return toast.error("در این بازه ی تاریخی مسیری ثبت نشده است");
          }
          if (success) {
            const tempList = result.gpsLocations
              .filter((f) => f.lat !== 0 && f.lon !== 0)
              .map((c) => {
                return [c.lat, c.lon];
              });
            const firstPoint = _(tempList)
              .orderBy((c) => c.creationTime)
              .head();
            const lastPoint = _(tempList)
              .orderBy((c) => c.creationTime)
              .last();
            //console.log('GetVehicleGpsLocationHistory', response.data);
            if (tempList.length > 1) {
              const temp1 = _(tempList).head();
              const index = Math.floor(tempList.length / 2);
              const temp = tempList[index];
              //console.log(temp,temp1,tempList,tempList.length,index);
              //center = temp;
              this.setState({
                center: temp,
              });
            }
            this.setState({
              trackingList: tempList,
              trackingListInfo: result.gpsLocations,
              stopListInfo: result.stop,
              firstPoint: firstPoint,
              lastPoint: lastPoint,
              showMap: true,
            });
          }
          ////console.log(response);
        })
        .catch((error) => {
          //console.log(error)
        });
    }
  };

  diffInMonths = (end, start) => {
    var timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.round(timeDiff / (2e3 * 3600 * 365.25));
  };

  // handlePopupData = (e) =>
  //     {
  //         //console.log('mouse over', e);
  //         e.target.openPopup();
  //         this.setState({ popUpData: e.latlng.lat })
  //     }

  handleReturnToMainMenu = () => {
    this.setState({
      showMap: true,
      showMapMenu: false,
    });
  };
  render() {
    console.log(this.state);
    return (
      <React.Fragment>
        <div className="">
          {!this.state.showMapMenu && (
            <Row className=" justify-content-md-center">
              <Col md="12" className="my-2">
                <ConfigProvider direction={"rtl"} locale={he_IL}>
                  <Table
                    className={antdClass2}
                    columns={this.columns}
                    dataSource={this.state.userVehiclesListForGrid}
                    rowClassName={(record, index) =>
                      !record.isAssign ? "table-row-light" : "table-row-dark"
                    }
                    //pagination={false}
                    //tableLayout="auto"
                    pagination={{
                      total: this.state.userVehiclesListForGrid.length,
                      current: this.state.currentPagee,
                      position: ["topLeft"],
                      onChange: (page, pageSize) => {
                        console.log("current page: ", page);
                        this.setState({ currentPage: page });
                      },
                    }}
                    scroll={{ y: "calc(100vh - 250px)", x: "max-content" }}
                  />
                </ConfigProvider>
              </Col>
            </Row>
          )}

          {this.state.showMapMenu && (
            <React.Fragment>
              <Row>
                {this.state.currentVehicle.id && (
                  <Col
                    md="3"
                    style={{
                      marginTop: "1%",
                      marginBottom: "1%",
                      fontWeight: "bold",
                      fontSize: "1em",
                    }}
                    className="d-flex align-items-start justify-content-start"
                  >
                    وسیله انتخاب شده:{" "}
                    <Tag color="orange">{this.state.currentVehicle.title}</Tag>
                  </Col>
                )}
                <Col
                  md="3"
                  className="d-flex align-items-start justify-content-start"
                >
                  <div style={{ marginTop: "-7%" }}>
                    <CustomDateTimePicker
                      name="FromDate"
                      key="FromDate"
                      datePlaceholder="از تاریخ"
                      timePlaceholder="از ساعت"
                      onSelectedChanged={this.handleDateFromChange}
                    />
                  </div>
                </Col>
                <Col
                  md="3"
                  className="d-flex align-items-start justify-content-start"
                >
                  <div style={{ marginTop: "-7%" }}>
                    <CustomDateTimePicker
                      name="ToDate"
                      key="ToDate"
                      datePlaceholder="تا تاریخ"
                      timePlaceholder="تا ساعت"
                      onSelectedChanged={this.handleDateToChange}
                    />
                  </div>
                </Col>
                <Col
                  md="3"
                  className="d-flex align-items-end justify-content-end"
                >
                  <Button
                    color="success"
                    className=" ml-1"
                    onClick={this.handleGetGPSHistory}
                  >
                    جستجو
                  </Button>
                  <Button
                    className="customBackColor"
                    onClick={this.handleReturnToMainMenu}
                  >
                    بازگشت
                  </Button>
                </Col>
              </Row>

              <React.Fragment>
                {this.state.currentVehicle.id &&
                  this.state.showMap &&
                  this.state.trackingList.length > 0 && (
                    <Row className=" mt-2">
                      <Col md="12" className="mt-2">
                        <Row>
                          <Col md="12 mb-2">
                            <MapContainer
                              center={this.state.center}
                              zoom={13}
                              style={{ height: "50em" }}
                              zoomAnimation={true}
                              markerZoomAnimation={true}
                            >
                              <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                              />
                              <Polyline
                                pathOptions={limeOptions}
                                positions={this.state.trackingList}
                                eventHandlers={{
                                  click: () => {
                                    //console.log('marker clicked')
                                  },
                                  mouseover: (e) => {
                                    const lat = e.latlng.lat.toFixed(2);
                                    const lng = e.latlng.lng.toFixed(2);
                                    //console.log('mouse over', e.latlng, lat, lng);
                                    const data = _(this.state.trackingListInfo)
                                      .filter(
                                        (c) =>
                                          c.lat.toFixed(2) === lat &&
                                          c.lon.toFixed(2) === lng
                                      )
                                      .head();
                                    //console.log(data);
                                    if (data !== undefined) {
                                      e.target.openPopup();
                                      this.setState({
                                        popUpData: (
                                          <div
                                            dir="rtl"
                                            className="customFont"
                                            style={{ textAlign: "right" }}
                                          >
                                            <span>سرعت: </span>
                                            <strong>KM/H {data.speed}</strong>
                                            <br />
                                            <span>وضعیت خودرو: </span>
                                            <strong>
                                              {
                                                commandTypeName[
                                                  data.commandType
                                                ]
                                              }
                                            </strong>
                                          </div>
                                        ),
                                      });
                                    }
                                  },
                                }}
                              >
                                {/* <Tooltip sticky>sticky Tooltip for Polygon</Tooltip> */}
                                <Popup>{this.state.popUpData}</Popup>
                              </Polyline>
                              {this.state.firstPoint.length > 0 && (
                                <Marker position={this.state.firstPoint}>
                                  <Popup>
                                    <div
                                      dir="rtl"
                                      className="customFont"
                                      style={{ textAlign: "right" }}
                                    >
                                      <span>شروع </span>
                                    </div>
                                  </Popup>
                                </Marker>
                              )}
                              {this.state.lastPoint.length > 0 && (
                                <Marker position={this.state.lastPoint}>
                                  <Popup>
                                    <div
                                      dir="rtl"
                                      className="customFont"
                                      style={{ textAlign: "right" }}
                                    >
                                      <span>پایان </span>
                                    </div>
                                  </Popup>
                                </Marker>
                              )}
                              {this.state.stopListInfo.length > 0 &&
                                this.state.stopListInfo.map((item, index) => {
                                  return (
                                    <Marker
                                      position={[item.lat, item.lon]}
                                      key={`M${index}`}
                                      icon={StopIcon}
                                    >
                                      <Popup>
                                        <div
                                          dir="rtl"
                                          className="customFont"
                                          style={{ textAlign: "right" }}
                                        >
                                          <span>از زمان: </span>
                                          <strong>
                                            {this.getDateTime(item.from)}
                                          </strong>
                                          <br />
                                          <span>تا زمان: </span>
                                          <strong>
                                            {this.getDateTime(item.to)}
                                          </strong>
                                          <br />
                                          <span>به مدت: </span>
                                          <strong>
                                            {this.getStopDateTime(item.wait)}
                                          </strong>
                                        </div>
                                      </Popup>
                                    </Marker>
                                  );
                                })}
                            </MapContainer>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  )}
                {!this.state.showMap && (
                  <Row className=" mt-1">
                    <Col md="12" className="mt-2">
                      <MapContainer
                        center={this.state.center}
                        zoom={13}
                        zoomAnimation={true}
                        markerZoomAnimation={true}
                        style={{ height: "50em" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          //url="http://194.36.174.178/{z}/{x}/{y}.pbf"
                        />
                      </MapContainer>
                    </Col>
                  </Row>
                )}
              </React.Fragment>
            </React.Fragment>
          )}
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
