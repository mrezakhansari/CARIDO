import React, { useEffect, useState } from "react";
import { Row, Col, FormGroup, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag } from 'antd';
import customAntdTableReport from "../../assets/css/vendors/customAntdTableReport.css";
import * as reportService from '../../services/reportService';

toast.configure({ bodyClassName: "customFont" });

const DashboardPage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------

    const Columns = [
        {
            title: 'ردیف',
            //dataIndex: 'row',
            key: 'row',
            render: (text, record, index) => index,
            width: '1vw'
        },
        {
            title: 'سریال دستگاه',
            dataIndex: 'serialNo',
            key: 'serialNo',
            width: '15vw'
        },
        {
            title: 'IMEI',
            dataIndex: 'imei',
            key: 'imei',
            width: '8vw'
        },
        {
            title: 'خودرو',
            dataIndex: 'carName',
            key: 'carName',
            width: '10vw'
        },
        {
            title: 'نام کاربر',
            dataIndex: 'driverName',
            key: 'driverName',
            width: '10vw'
        },
        {
            title: 'شماره سیم کارت',
            dataIndex: 'simNo',
            key: 'simNo',
            width: '10vw'
        },
        {
            title: 'شماره مدیر دستگاه',
            dataIndex: 'userPhoneNo',
            key: 'userPhoneNo',
            width: '10vw'
        },
        {
            title: 'زمان آخرین نقطه ی دریافتی',
            dataIndex: 'receivedLastPointDateTime',
            key: 'receivedLastPointDateTime',
            width: '13vw'
        },
        {
            title: 'لوکیشن گرفتن',
            dataIndex: 'location',
            key: 'location',
            width: '8vw'
        },
        {
            title: 'سایر کاربران',
            dataIndex: 'otherUsers',
            key: 'otherUsers',
            width: '7vw'
        },
        {
            title: 'میزان طرح باقیمانده',
            dataIndex: 'remainedValidDateTime',
            key: 'remainedValidDateTime',
            width: '10vw'
        },
        {
            title: 'زمان راه اندازی',
            dataIndex: 'startedDateTime',
            key: 'startedDateTime',
            width: '10vw'
        },
        {
            title: 'زمان ایجاد',
            dataIndex: 'createdDateTime',
            key: 'createdDateTime',
            width: '10vw'
        },
        {
            title: "فعال / غیر فعال",
            dataIndex: 'isActive',
            key: 'isActive',
            render: (text, record) => (
                <Button className={!record.isActive ? "btn-success mt-1 px-2" : "btn-danger mt-1"} size="sm"
                    onClick={() => this.handleStatusUser(record)}
                >{
                        !record.isActive ? 'Active' : "Inactive"}
                </Button>
            ),
            width: '8vw'
        }
    ];

    const [state, setState] = useState({
        reportList: [],
        reportListForGrid: []
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {

        reportService.getAllVehiclesInfoForReport()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    ////console.log('getAllTransactions', result)
                    setState(prevState => {
                        return {
                            ...prevState,
                            reportList: result, reportListForGrid: createDataModelForDataTabel(result)
                        }
                    });
                }
                else {
                    return toast.warning("تاکنون وسیله ای ثبت نشده است");
                }
            })
            .catch(error => {
                //
            });
    }, [])

    //#endregion ---------------------------------------------------------

    return (
        <React.Fragment>
            <div className="container">
                <Row className="customBackgroundColor">
                    <Col md="12" className="mt-2">
                        <FormGroup>
                            <Row>
                                <Col>
                                    <button className="btn btn-warning rtl"
                                        style={{ direction: 'rtl', float: 'right' }}
                                        type="button"
                                        //onClick={handleShowProducts}
                                        >لیست محصولات
                                        </button>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Table
                                        className={customAntdTableReport}
                                        columns={Columns}
                                        dataSource={state.reportListForGrid}
                                        pagination={false}
                                        scroll={{ x: 'max-content'}}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        </React.Fragment >
    );
};

export default DashboardPage;
