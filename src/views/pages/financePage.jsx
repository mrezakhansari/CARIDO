import React, { useEffect, useState } from "react";
import { Row, Col, FormGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import { Table, Tag } from 'antd';
//import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import * as financeService from '../../services/financeService';
import * as productService from '../../services/productService';
import MinimalStatisticsBG from "../../components/cards/minimalStatisticsBGCard";

toast.configure({ bodyClassName: "customFont" });

const ProductsStyles = ['bg-success btn', 'bg-danger btn', 'bg-warning btn', 'bg-primary btn'];

const FinancePage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------

    const Columns = [
        {
            title: 'عنوان',
            dataIndex: 'title',
            key: 'title',
            width: '10vw'
        },
        {
            title: 'قیمت محصول (برحسب ریال)',
            dataIndex: 'price',
            key: 'price',
            width: '7vw'
        },
        {
            title: "وضعیت پرداخت",
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: text => (
                <Tag color="geekblue">{
                    text
                }</Tag>
            ),
            width: '10vw'
        },
        {
            title: "تاریخ پرداخت",
            dataIndex: 'creationTime',
            key: 'creationTime',
            render: text => (
                <Tag color="green">{
                    text.toLocaleDateString('fa-IR')
                }</Tag>
            ),
            width: '10vw'
        }
        // ,
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (text, record) => (
        //         <Space size="middle" style={{ alignContent: "center", alignItems: "center" }}>
        //             <Button className="btn-warning mt-1" size="sm" onClick={() => handleEditProductInfo(record)}>
        //                 <Edit2 size={16} />
        //             </Button>
        //             <Button className="btn-danger mt-1 mr-2" size="sm" onClick={() => handleDeleteProductInfo(record)}>
        //                 <Trash2 size={16} />
        //             </Button>
        //         </Space>
        //     ),
        //     width: '11vw'
        // }
    ];

    const [state, setState] = useState({
        transactionsList: [],
        transactionsListForGrid: [],
        productsList: [],
        showProductMenu: false
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {

        financeService.getAllTransactions()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    ////console.log('getAllTransactions', result)
                    setState(prevState => {
                        return {
                            ...prevState,
                            transactionsList: result, transactionsListForGrid: createDataModelForDataTabel(result)
                        }
                    });
                }
                else {
                    return toast.warning("خریدی تاکنون انجام نگرفته است");
                }
            })
            .catch(error => {
                //
            });

        productService.getAllProducts()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result2 = response.data.result;
                    //console.log('product list fetch', result2)
                    setState(prevState => {
                        return {
                            ...prevState,
                            productsList: result2
                        }
                    });
                }
                else {
                    return toast.warning("محصولی برای نمایش وجود ندارد");
                }
            })
            .catch(error => {
                //
            })

    }, [])

    //#endregion ---------------------------------------------------------

    const handleShowProducts = () => {
        setState(prevState => {
            return { ...prevState, showProductMenu: true }
        })
    }

    const handleOrderProduct = (value) => {
        //console.log(value)
    }


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
                                        onClick={handleShowProducts}>لیست محصولات</button>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Table
                                        //className={antdClass2}
                                        columns={Columns}
                                        dataSource={state.transactionsListForGrid}
                                        pagination={false}
                                        scroll={{ x: 'max-content', y: 600 }}
                                    />
                                </Col>
                            </Row>
                            {state.showProductMenu && state.productsList.length > 0 &&

                                <Row>
                                    {state.productsList.map((p, index) => (
                                        <Col sm="3" md="3" key={p.id} className="customFont">
                                            <MinimalStatisticsBG
                                                cardBgColor={ProductsStyles[index % ProductsStyles.length]}
                                                statistics={p.id.toString()}
                                                textElement={
                                                    <React.Fragment>
                                                        <div className="customFont rtl">
                                                            <strong style={{ fontWeight: "5vw", textAlign: "center" }}>
                                                                {p.title}
                                                            </strong>
                                                            <hr />
                                                            <span style={{ fontWeight: "1vw", color: "white" }}>
                                                                مدت زمان: {p.days} روز
                                                        </span>
                                                            <br />
                                                            <span style={{ fontWeight: "1vw", color: "white" }}>
                                                                قیمت: {p.price} ریال
                                                            </span>
                                                        </div>
                                                    </React.Fragment>
                                                }
                                                // text={"asdfasdf"}
                                                //iconSide="left"
                                                onClick={handleOrderProduct}
                                                key={p.id}
                                                textAlign="center"
                                            >
                                            </MinimalStatisticsBG>

                                        </Col>
                                    ))}
                                </Row>
                            }
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        </React.Fragment >
    );
};

export default FinancePage;
