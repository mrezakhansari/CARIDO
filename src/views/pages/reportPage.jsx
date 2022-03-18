import React, { useEffect, useState } from "react";
import { Row, Col, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag, Space, ConfigProvider } from 'antd';
import _ from 'lodash';
import * as vehicleService from '../../services/vehicleService';
import "antd/dist/antd.css";
import css from '../../assets/css/vendors/customAntdTableReport.css';
import MapPNG from '../../assets/icons/Map.png';
import { Trash2, Users, X, Check } from "react-feather";
import he_IL from "antd/es/locale/fa_IR";

toast.configure({ bodyClassName: "customFont" });

const ReportPage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------

    const [currentPage, setPage] = React.useState(1);

    const Columns = [
        {
            title: 'ردیف',
            key: 'row',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
            width: '4em'
        },
        {
            title: 'خودرو',
            dataIndex: 'title',
            key: 'title',
            width: '7em',
            render: (text) => <Tag color="cyan">{text}</Tag>
        },
        {
            title: 'تعداد',
            dataIndex: 'count',
            key: 'count',
            width: '5em'
        }
    ];

    const [state, setState] = useState({
        reportData: [],
        reportDataForGrid: []
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {
        vehicleService.GetVehicleModelReport()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    console.log(result, result.length)
                    setState(prevState => {
                        return {
                            ...prevState,
                            reportData: result, reportDataForGrid: createDataModelForDataTabel(result)
                        }
                    });
                }
                else {
                    return toast.warning("اطلاعاتی برای نمایش وجود ندارد");
                }
            })
            .catch(error => {
                //
            })
    }, [])

    //#endregion ---------------------------------------------------------

    return (
        <React.Fragment>
            <Row className="customBackgroundColor " style={{ width: '100%', height: '100%' }}>
                <Col md="12" >
                    <Row className="justify-content-md-center">
                        <Col md="12">
                            <ConfigProvider direction={"rtl"} locale={he_IL}>

                                <Table
                                    style={{ width: '100%', height: '100%' }}
                                    className={css}
                                    rowClassName={css}
                                    columns={Columns}
                                    dataSource={state.reportDataForGrid}
                                    //pagination={true}
                                    // pagination={{
                                    //     onChange(current) {
                                    //         setPage(current);
                                    //     }
                                    // }}

                                    pagination={{
                                        total: state.reportDataForGrid.length,
                                        current: currentPage,
                                        position: ['topLeft'],
                                        onChange: (page, pageSize) => {
                                            //console.log('current page: ', page)
                                            setPage(page);
                                        }
                                    }}
                                    scroll={{ x: 'max-content', y: '30em' }}
                                />
                            </ConfigProvider>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default ReportPage;
