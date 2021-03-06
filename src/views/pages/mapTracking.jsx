import React, { Component, useEffect, useState, useRef } from "react";
import Leaflet from "leaflet";
import {
  Map as MapContainer,
  //MapContainer,
  TileLayer,
  Popup,
  Polyline,
  Marker
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
import iconStop from "../../assets/img/stop-icon.png";
import iconStopRetina from "../../assets/img/stop-icon-2x.png";
import iconGps from "../../assets/img/gps-icon.png";
import iconGpsRetina from "../../assets/img/gps-icon-2x.png";
import { Row, Col, Button, Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import { DatePicker } from "jalali-react-datepicker";
import CustomDateTimePicker from "../../components/common/customDateTimePicker";
import he_IL from "antd/es/locale/fa_IR";
import config from '../../config.json';
import * as signalR from '@aspnet/signalr';
import RotatedMarker from '../../components/common/RotatedMarker';
import * as Icon from "react-feather";


import { Line } from 'react-chartjs-2';



export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};


var connection;
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

let GpsIcon = Leaflet.icon({
  ...Leaflet.Icon.Default.prototype.options,
  iconUrl: iconGps,
  iconRetinaUrl: iconGpsRetina,
  shadowUrl: iconShadow,
  shadowSize: [0, 0],
  iconSize: [20, 20],
  iconAnchor: [0, 0]
});

Leaflet.Marker.prototype.options.icon = DefaultIcon;

//let center = [35.728954, 51.388721];
var commandTypeName = {
  0: "??????????????",
  1: "???? ?????? ?????????? ???????????? ????????",
  2: "?????? ?????????? ?????? ??????",
  3: "???????? ?? ???????? ?????????? ??????????",
  4: "?????????? ???????? ??????",
  5: "?????????? ?????????? ??????",
  6: "???????? ???? ???????? ?????????? ??????",
  7: "???????? ???? ???????????? ?? ?????????? ??????",
  8: "?????? ?????? ?????????? ???? ??????????",
  9: "?????????? ????????????"
};


const limeOptions = { color: "blue" };
toast.configure({ bodyClassName: "customFont" });

const MyMarker = props => {

  const initMarker = ref => {
    if (ref) {
      ref.leafletElement.openPopup()
    }
  }

  return <Marker ref={initMarker} {...props} />
}

const MapTracking = () => {


  const bearingBetweenLocations = (latLng1, latLng2) => {

    let PI = 3.14159;
    let lat1 = latLng1.lat * PI / 180;
    let long1 = latLng1.lon * PI / 180;
    let lat2 = latLng2.lat * PI / 180;
    let long2 = latLng2.lon * PI / 180;


    let dLon = (long2 - long1);

    let y = Math.sin(dLon) * Math.cos(lat2);
    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
      * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);

    brng = brng * 180 / PI
    //console.log('asdf')
    brng = (brng + 360) % 360;

    return brng;
  }

  const getStopDateTime = (text) => {
    if (text) {
      let day = parseInt(text.split(":")[0]);
      let hour = parseInt(text.split(":")[1]);
      let minute = parseInt(text.split(":")[2]);
      let second = parseInt(text.split(":")[3]);

      let s = day > 0 ? ` ${day} ??????  ` : "";
      s += hour > 0 && day > 0 ? `??` : ``
      s += hour > 0 ? ` ${hour} ????????  ` : "";
      s += minute > 0 && hour > 0 ? `??` : ``
      s += minute > 0 ? ` ${minute} ??????????  ` : "";
      s += minute > 0 && second > 0 ? `??` : ``
      s += second > 0 ? ` ${second} ??????????` : "";
      //console.log(s, day, hour, minute, second)
      return s;
    }
    return "";
  };

  const getDateTime = (text) => {
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

  const [consumption, setConsumption] = useState(0);

  const [state, setState] = useState({
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
    hideGrid: false,
    showSpeedReport: false,
    toggle: false,
    currentPage: 1,
    latlng: {},
    showOnlineMap: false,
    connection: {},
    onlineInfo: {},
    gpsNav: [],
    totalDistance: 0,
    totalConsumption: 0
  });

  const columns = [
    {
      title: "????????",
      key: "row",
      render: (text, record, index) =>
        (state.currentPage - 1) * 10 + index + 1,
      width: "4em",
    },
    {
      title: "????????????",
      dataIndex: "title",
      key: "title",
      width: "10em",
    },
    {
      title: "?????? GPS",
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
      title: "?????????????? ????????????",
      key: "action",
      render: (text, record) => (
        <Space
          size="middle"
          style={{ alignContent: "center", alignItems: "center" }}
        >
          <div
            className="btn logo-img mt-1"
            size="sm"
            onClick={() => handleMapTrackingHistory(record)}
          >
            <img src={MapPNG} alt="logo" width="10%" title="Tracking History" />
          </div>
        </Space>
      ),
      width: "6em",
    },
    {
      title: "???????????? ????????",
      key: "action",
      render: (text, record) => (
        <Space
          size="middle"
          style={{ alignContent: "center", alignItems: "center" }}
        >
          <div
            className="btn logo-img mt-1"
            size="sm"
            onClick={() => handleMapTrackingOnline(record)}
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
    {
      title: "?????????? ??????????",
      key: "action",
      render: (text, record) => (
        <Space
          size="middle"
          style={{ alignContent: "center", alignItems: "center" }}
        >
          <Button className="btn btn-warning mt-1 mr-1"
            size="sm"
            onClick={() => handleSpeedReportInfo(record)}>
            <Icon.BarChart size={16} />
          </Button>
        </Space>
      ),
      width: "6em",
    }
  ];

  useEffect(() => {

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
            // console.log("getallvehicle", result);
            setState(preState => {
              return {
                ...preState,
                userVehiclesList: result,
                userVehiclesListForGrid: createDataModelForDataTabel(result),
              }
            });
          } else {
            return toast.warning("?????? ?????????????? ???????? ?????? ?????? ???????? ??????");
          }
        })
        .catch((error) => {
          //
        });
    } else {
      vehicleService
        .GetMyAndAssignVehicles()
        .then((response) => {
          //console.log("result my and assign vehicles", response);
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
            //console.log(vehicles);
            setState(preState => {
              return {
                ...preState,
                userVehiclesList: vehicles,
                userVehiclesListForGrid:
                  createDataModelForDataTabel(vehicles),
              }
            });
          } else {
            return toast.warning("?????? ?????????????? ???????? ?????? ?????? ???????? ??????");
          }
        })
        .catch((error) => {
          //
        });
    }
    // return () => {
    //   if (connection && connection.off) {
    //     console.log('disconnecterd')
    //     connection.off('getNotification')
    //   }
    // }
  }, []);

  const createDataModelForDataTabel = (data) => {
    return data.map((item) => {
      return { ...item, key: item.id };
    });
  };

  const handleMapTrackingHistory = (record) => {
    setState(preState => {
      return {
        ...preState,
        trackingList: [],
        trackingListInfo: [],
        stopListInfo: [],
        firstPoint: [],
        lastPoint: [],
        currentVehicle: record,
        showMap: false,
        hideGrid: true,
        showSpeedReport: false
      }
    });
  };


  const handleSpeedReportInfo = async (record) => {
    setState(preState => {
      return {
        ...preState,
        trackingList: [],
        trackingListInfo: [],
        stopListInfo: [],
        firstPoint: [],
        lastPoint: [],
        currentVehicle: record,
        showMap: false,
        hideGrid: true,
        showSpeedReport: true,
        showOnlineMap: false
      }
    });
  }

  const handleMapTrackingOnline = async (record) => {

    setState(preState => {
      return {
        ...preState,
        trackingList: [],
        trackingListInfo: [],
        stopListInfo: [],
        firstPoint: [],
        lastPoint: [],
        currentVehicle: record,
        showMap: false,
        hideGrid: true,
        showOnlineMap: false,
        center: [35.728954, 51.388721],
        toggle: !preState.toggle
      }
    });

    try {
      const { data } = await vehicleService.GetLastLocation(record.id);
      //console.log(record, data)
      if (data.result && data.success) {
        // console.log(data.result);
        setState(preState => {
          return {
            ...preState,
            trackingList: [],
            trackingListInfo: [],
            stopListInfo: [],
            firstPoint: [],
            lastPoint: [],
            currentVehicle: record,
            showMap: false,
            hideGrid: false,
            showOnlineMap: true,
            toggle: !preState.toggle,
            center: [data.result.lat, data.result.lon],
            onlineInfo: {
              Lat: data.result.lat,
              Lon: data.result.lon,
              Speed: data.result.speed,
              Title: record.title
            }
          }
        });
      }
    } catch (error) {
      //console.log(error)
    }

  };

  const handleDateFromChange = (value) => {
    //console.log(value);
    // const date = value.value["_i"].replace("-//", "");
    if (value.length > 10)
      setState(preState => {
        return { ...preState, selectedDateFrom: value.replace(" ", "T") + "Z" }
      });
    else {
      setState(preState => {
        return {
          ...preState, selectedDateFrom: value.replace(" ", "") + "T00:00:00Z",
        }
      });
    }
  };

  const handleDateToChange = (value) => {
    //console.log(value);
    if (value.length > 10)
      setState(preState => {
        return { ...preState, selectedDateTo: value.replace(" ", "T") + "Z" }
      });
    else {
      setState(preState => {
        return { ...preState, selectedDateTo: value.replace(" ", "") + "T23:59:59Z" }
      });
    }
  };

  const handleGetGPSHistory = () => {
    if (state.selectedDateFrom === "") {
      return toast.error("?????????? ???????????? ???????? ???? ???????? ????????");
    }
    if (state.selectedDateTo === "") {
      return toast.error("?????????? ???????????? ???????? ???? ???????? ????????");
    }
    if (
      state.currentVehicle.id
      // && this.state.showHistoryForm
    ) {
      const FromDate = new Date(state.selectedDateFrom);
      const ToDate = new Date(state.selectedDateTo);
      if (FromDate > ToDate) {
        return toast.error("???????? ?? ?????????? ???? ???????? ???????? ????????");
      }
      if (diffInMonths(ToDate, FromDate) > 2) {
        return toast.error("???????? ?? ?????????? ?????? ?????????? ?????????? ???? ?????????? ????????");
      }
      //console.log(state)
      vehicleService
        .GetVehicleGpsLocationHistory({
          from: state.selectedDateFrom,
          to: state.selectedDateTo,
          vehicleId: state.currentVehicle.id,
        })
        .then((response) => {
          let { result, success } = response.data;
          //console.log(result, success)
          setState(preState => {
            return {
              ...preState,
              trackingList: [],
              trackingListInfo: [],
              firstPoint: [],
              lastPoint: [],
              totalDistance: 0
            }
          });

          if (success) {

            if (result.gpsLocations.length === 0) {
              return toast.error("???? ?????? ???????? ?? ?????????? ?????????? ?????? ???????? ??????");
            }
            const tempList = result.gpsLocations
              .filter((f) => f.lat !== 0 && f.lon !== 0)
              .map((c) => {
                return [c.lat, c.lon];
              });

            // let totalDistance = 0;
            // if (tempList.length > 1) {
            //   for (let d = 0; d < tempList.length - 1; d++) {
            //     totalDistance += getDistance(tempList[d][0], tempList[d + 1][0], tempList[d][1], tempList[d + 1][1])
            //   }
            // }
            const firstPoint = _(result.gpsLocations)
              .orderBy((c) => c.id).map((m) => {
                return [m.lat, m.lon]
              })
              .head();
            const lastPoint = _(result.gpsLocations)
              .orderBy((c) => c.id).map((m) => {
                return [m.lat, m.lon]
              })
              .last();
            //console.log('templist', totalDistance, firstPoint, lastPoint, result);
            //console.log('GetVehicleGpsLocationHistory', response.data);
            if (tempList.length > 1) {
              const temp1 = _(tempList).head();
              const index = Math.floor(tempList.length / 2);
              const temp = tempList[index];
              //console.log(temp,temp1,tempList,tempList.length,index);
              //center = temp;
              setState(preState => {
                return {
                  ...preState,
                  center: temp,
                }
              });
            }

            ///////////////////////////////////////////////////////////////
            let gpsNav = [];
            let lastIndex = 0;
            //console.log(gpsNav, tempList)
            for (let i = 0; i < tempList.length; i++) {
              if (i === 0) {
                gpsNav.push({ lat: tempList[i][0], lon: tempList[i][1], deg: 0 });
              }
              else if (i % 5 === 0) {
                let bre = bearingBetweenLocations({ lat: tempList[lastIndex][0], lon: tempList[lastIndex][1] },
                  { lat: tempList[i][0], lon: tempList[i][1] });
                gpsNav.push({ lat: tempList[i][0], lon: tempList[i][1], deg: bre });
                lastIndex = i;
              }
            }

            // if (firstPoint.length > 0 && lastPoint.length > 0) {

            //   let stopList = result.stop.filter(c=>c.lat !== firstPoint[0] && c.lat !== lastPoint[0]);
            //   setState(preState => {
            //     return {
            //       ...preState,
            //       stopListInfo: stopList,
            //     }
            //   });
            // }



            //console.log(gpsNav)

            setState(preState => {
              return {
                ...preState,
                trackingList: tempList,
                trackingListInfo: result.gpsLocations,
                stopListInfo: result.stop,
                firstPoint: firstPoint,
                lastPoint: lastPoint,
                showMap: true,
                gpsNav: gpsNav
              }
            });
          }

        })
        .catch((error) => {
        });
    }
  };

  const handleGetSpeedHistory = () => {
    if (state.selectedDateFrom === "") {
      return toast.error("?????????? ???????????? ???????? ???? ???????? ????????");
    }
    if (state.selectedDateTo === "") {
      return toast.error("?????????? ???????????? ???????? ???? ???????? ????????");
    }
    if (
      state.currentVehicle.id
      // && this.state.showHistoryForm
    ) {
      const FromDate = new Date(state.selectedDateFrom);
      const ToDate = new Date(state.selectedDateTo);
      if (FromDate > ToDate) {
        return toast.error("???????? ?? ?????????? ???? ???????? ???????? ????????");
      }
      if (diffInMonths(ToDate, FromDate) > 2) {
        return toast.error("???????? ?? ?????????? ?????? ?????????? ?????????? ???? ?????????? ????????");
      }
      //console.log(state)
      vehicleService
        .GetVehicleGpsLocationHistory({
          from: state.selectedDateFrom,
          to: state.selectedDateTo,
          vehicleId: state.currentVehicle.id,
        })
        .then((response) => {
          let { result, success } = response.data;
          console.log(result, success)

          if (success) {

            if (result.gpsLocations.length === 0) {
              return toast.error("???? ?????? ???????? ?? ?????????? ?????????? ?????? ????????");
            }

            const tempListForDis = result.gpsLocations
            .filter((f) => f.lat !== 0 && f.lon !== 0)
            .map((c) => {
              return [c.lat, c.lon];
            });
            let totalDistance = 0;
            if (tempListForDis.length > 1) {
              for (let d = 0; d < tempListForDis.length - 1; d++) {
                totalDistance += getDistance(tempListForDis[d][0], tempListForDis[d + 1][0], tempListForDis[d][1], tempListForDis[d + 1][1])
              }
            }

            let tempList = result.gpsLocations
              .filter((f) => f.lat !== 0 && f.lon !== 0);
            var sortedObjs = tempList.sort(function (a, b) {
              return b.id - a.id;
            });

            
            //console.log(tempList,sortedObjs);
            const temp = {
              labels: [],
              datasets: []
            };
            temp.labels = _.cloneDeep(sortedObjs.map(item => getDateTime(item.creationTime)));
            temp.datasets = [
              {
                label: 'Based On KM/H',
                data: _.cloneDeep(sortedObjs.map(item => item.speed)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              }];
            setState(preState => {
              return {
                ...preState,
                trackingListInfo: [temp],
                showMap: false,
                showSpeedReport: true,
                totalDistance: totalDistance.toFixed(2)
              }
            });
          }

        })
        .catch((error) => {
        });
    }
  }

  const diffInMonths = (end, start) => {
    var timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.round(timeDiff / (2e3 * 3600 * 365.25));
  };

  const handleReturnToMainMenu = () => {
    setState(preState => {
      return {
        ...preState,
        showMap: true,
        hideGrid: false,
        showOnlineMap: false,
        showSpeedReport: false
      }
    });
  };

  const getDistance = (lat1, lat2, lon1, lon2) => {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
      + Math.cos(lat1) * Math.cos(lat2)
      * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return (c * r);
  }

  const handleConsumption = (event) => {
    if (event.key === 'Enter') {
      if (state.totalDistance !== 0 && consumption !== 0) {
        let temp = (state.totalDistance * consumption) / 100;
        setState(preState => {
          return {
            ...preState,
            totalConsumption: temp
          }
        });
      }
    }
  }

  return (

    <React.Fragment>

      {
        state.showOnlineMap && state.center &&
        <React.Fragment>
          <Row >
            <Col>
              <Button
                className="customBackColor"
                onClick={handleReturnToMainMenu}
              >
                ????????????
              </Button>
            </Col>
          </Row>
          <Row className=" mt-1">
            <Col md="12" className="mt-2">
              <MapContainer
                center={state.center}
                zoom={13}
                zoomAnimation={true}
                markerZoomAnimation={true}
                //style={{ height: "45em" }}
                className="leaflet-container"
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {state.onlineInfo && state.onlineInfo.Lat && state.onlineInfo.Lon &&
                  <Marker position={[state.onlineInfo.Lat, state.onlineInfo.Lon]}>
                    <Popup>
                      <div
                        dir="rtl"
                        className="customFont"
                        style={{ textAlign: "right" }}
                      >
                        <span>????????: </span>
                        <strong>
                          {state.onlineInfo.Speed}
                        </strong>
                        <br />
                        <span>??????????: </span>
                        <strong>
                          {state.onlineInfo.Title}
                        </strong>
                      </div>
                    </Popup>
                  </Marker>}
              </MapContainer>
            </Col>
          </Row>
        </React.Fragment>

      }
      {
        !state.showOnlineMap && <div className="">

          {!state.hideGrid && (
            <Row className=" justify-content-md-center">
              <Col md="12" className="my-2">
                <ConfigProvider direction={"rtl"} locale={he_IL}>
                  <Table
                    className={antdClass2}
                    columns={columns}
                    dataSource={state.userVehiclesListForGrid}
                    rowClassName={(record, index) =>
                      !record.isAssign ? "table-row-light" : "table-row-dark"
                    }
                    //pagination={false}
                    //tableLayout="auto"
                    pagination={{
                      total: state.userVehiclesListForGrid.length,
                      current: state.currentPagee,
                      position: ["topLeft"],
                      onChange: (page, pageSize) => {
                        //console.log("current page: ", page);
                        setState(preState => {
                          return { ...preState, currentPage: page }
                        });
                      },
                    }}
                    scroll={{ y: "calc(100vh - 250px)", x: "max-content" }}
                  />
                </ConfigProvider>
              </Col>
            </Row>
          )}

          {state.hideGrid && (
            <React.Fragment>
              <Row className="mb-2">
                {state.currentVehicle.id && (
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
                    <span>?????????? ???????????? ??????:</span>
                    <Tag color="orange">{state.currentVehicle.title}</Tag>
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
                      datePlaceholder="???? ??????????"
                      timePlaceholder="???? ????????"
                      onSelectedChanged={handleDateFromChange}
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
                      datePlaceholder="???? ??????????"
                      timePlaceholder="???? ????????"
                      onSelectedChanged={handleDateToChange}
                    />
                  </div>
                </Col>
                <Col
                  md="3"
                  className="d-flex align-items-end justify-content-end"
                >
                  {state.showSpeedReport &&
                    <Button
                      color="success"
                      className=" ml-1"
                      onClick={handleGetSpeedHistory}
                    >
                      ????????????
                    </Button>
                  }
                  {!state.showSpeedReport &&
                    <Button
                      color="success"
                      className=" ml-1"
                      onClick={handleGetGPSHistory}
                    >
                      ??????????
                    </Button>
                  }
                  <Button
                    className="customBackColor"
                    onClick={handleReturnToMainMenu}
                  >
                    ????????????
                  </Button>
                </Col>
              </Row>

              {state.showSpeedReport &&
                <Row className="mb-2">
                  <Col md="3">
                    <Row>
                      <Col md="9" style={{
                        marginTop: "4%",
                        marginBottom: "1%",
                        fontWeight: "bold",
                        fontSize: "1em",
                      }}
                        className="d-flex align-items-start justify-content-start">
                        <span >?????????? ???????? ???????? ???? 100 ??????????????:</span>
                      </Col>
                      <Col md="3">
                        <input type="number" className="form-control"
                          onChange={e => setConsumption(e.target.value)}
                          onKeyDown={handleConsumption} />
                      </Col>
                    </Row>

                  </Col>
                  <Col
                    md="5"
                    style={{
                      marginTop: "1%",
                      marginBottom: "1%",
                      fontWeight: "bold",
                      fontSize: "1em",
                    }}
                    className="d-flex align-items-start justify-content-start"
                  >
                    <span className="mr-1">?????????? ???? ??????:</span>
                    <Tag color="geekblue">{state.totalDistance + ' ??????????????'}</Tag>

                    <span className="mr-4">?????????? ???? ???????? ????????:</span>
                    <Tag color="geekblue">{state.totalConsumption + ' ????????'}</Tag>

                  </Col>
                </Row>
              }


              {!state.showSpeedReport &&
                <React.Fragment>
                  {state.currentVehicle.id &&
                    state.showMap &&
                    state.trackingList.length > 0 && (
                      <Row className=" mt-2">
                        <Col md="12" className="mt-2">
                          <Row>
                            <Col md="12 mb-2">
                              <MapContainer
                                center={state.center}
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
                                <Polyline
                                  pathOptions={limeOptions}
                                  positions={state.trackingList}
                                  eventHandlers={{
                                    click: () => {
                                      //console.log('marker clicked')
                                    },
                                    mouseover: (e) => {
                                      const lat = e.latlng.lat.toFixed(2);
                                      const lng = e.latlng.lng.toFixed(2);
                                      //console.log('mouse over', e.latlng, lat, lng);
                                      const data = _(state.trackingListInfo)
                                        .filter(
                                          (c) =>
                                            c.lat.toFixed(2) === lat &&
                                            c.lon.toFixed(2) === lng
                                        )
                                        .head();
                                      //console.log(data);
                                      if (data !== undefined) {
                                        e.target.openPopup();
                                        setState(preState => {
                                          return {
                                            ...preState,
                                            popUpData: (
                                              <div
                                                dir="rtl"
                                                className="customFont"
                                                style={{ textAlign: "right" }}
                                              >
                                                <span>????????: </span>
                                                <strong>KM/H {data.speed}</strong>
                                                <br />
                                                <span>?????????? ??????????: </span>
                                                <strong>
                                                  {
                                                    commandTypeName[
                                                    data.commandType
                                                    ]
                                                  }
                                                </strong>
                                              </div>
                                            ),
                                          }
                                        });
                                      }
                                    },
                                  }}
                                >
                                  {/* <Tooltip sticky>sticky Tooltip for Polygon</Tooltip> */}
                                  <Popup>{state.popUpData}</Popup>
                                </Polyline>
                                {state.firstPoint.length > 0 && (
                                  <Marker position={state.firstPoint} >
                                    <Popup>
                                      <div
                                        dir="rtl"
                                        className="customFont"
                                        style={{ textAlign: "right" }}
                                      >
                                        <span>???????? </span>
                                      </div>
                                    </Popup>
                                  </Marker>
                                )}
                                {state.lastPoint.length > 0 && (
                                  <Marker position={state.lastPoint}>
                                    <Popup>
                                      <div
                                        dir="rtl"
                                        className="customFont"
                                        style={{ textAlign: "right" }}
                                      >
                                        <span>?????????? </span>
                                      </div>
                                    </Popup>
                                  </Marker>
                                )}
                                {state.stopListInfo.length > 0 &&
                                  state.stopListInfo.map((item, index) => {
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
                                            <span>???? ????????: </span>
                                            <strong>
                                              {getDateTime(item.from)}
                                            </strong>
                                            <br />
                                            <span>???? ????????: </span>
                                            <strong>
                                              {getDateTime(item.to)}
                                            </strong>
                                            <br />
                                            <span>???? ??????: </span>
                                            <strong>
                                              {getStopDateTime(item.wait)}
                                            </strong>
                                          </div>
                                        </Popup>
                                      </Marker>
                                    );
                                  })}

                                {state.gpsNav.length > 0 &&
                                  state.gpsNav.map((item, index) => {
                                    return (
                                      // <Marker
                                      //   position={[item.lat, item.lon]}
                                      //   key={`M${index}`}
                                      //   icon={GpsIcon}
                                      // >
                                      // </Marker>
                                      <RotatedMarker
                                        key={`M${index}`}
                                        position={[item.lat, item.lon]}
                                        icon={GpsIcon}
                                        rotationAngle={item.deg}
                                        rotationOrigin="center"
                                      />
                                    );
                                  })}
                              </MapContainer>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    )}
                  {!state.showMap && (
                    <Row className=" mt-1">
                      <Col md="12" className="mt-2">
                        <MapContainer
                          center={state.center}
                          zoom={13}
                          //style={{ height: "45em" }}
                          className="leaflet-container"
                        >
                          <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                        </MapContainer>
                      </Col>
                    </Row>
                  )}
                </React.Fragment>
              }

              {state.showSpeedReport &&
                <React.Fragment>
                  {
                    state.currentVehicle.id &&
                    state.trackingListInfo.length > 0 &&
                    (
                      <Row>
                        <Col sm="12">
                          <Card>
                            <CardHeader>
                              <CardTitle className="customFont">?????????????? ???????? ?????????? ???? ?????? ????????</CardTitle>
                            </CardHeader>
                            <CardBody>
                              {/* <ChartistGraph
                                data={state.trackingListInfo[0]}
                                type="Line"
                                options={{
                                  // low: 650,
                                  height: "400px",
                                  low: 0,
                                  showArea: true,
                                  fullWidth: true,
                                  
                                }}
                              /> */}
                              <Line options={options} data={state.trackingListInfo[0]} />
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    )
                  }
                </React.Fragment>
              }

            </React.Fragment>
          )}

        </div>
      }

    </React.Fragment>
  );
}

export default MapTracking;