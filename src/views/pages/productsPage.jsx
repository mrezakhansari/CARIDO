import React, { useEffect, useState } from "react";
import { Row, Col, Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Edit2, Trash2 } from "react-feather";
import { toast } from 'react-toastify';
import { Table, Tag, Space } from 'antd';
//import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import _ from 'lodash';
import * as ProductService from '../../services/productService';
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from 'yup';

toast.configure({ bodyClassName: "customFont" });

const ProductPage = (props) => {

    //#region Variables and Initial Functions -----------------------------------------

    const CreateProductInitialValues = {
        title: '',
        price: '',
        days: ''
    }

    const CreateProductValidationSchema = Yup.object({
        title: Yup.string().required("! عنوان محصول را وارد کنید"),
        price: Yup.string().required("! قیمت محصول را وارد کنید"),
        days: Yup.string().required("! بازه زمانی مورد استفاده از محصول را وارد کنید"),
    });

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
            title: "بازه زمانی (برحسب روز)",
            dataIndex: 'days',
            key: 'days',
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
                    <Button className="btn-warning mt-1" size="sm" onClick={() => handleEditProductInfo(record)}>
                        <Edit2 size={16} />
                    </Button>
                    <Button className="btn-danger mt-1 mr-2" size="sm" onClick={() => handleDeleteProductInfo(record)}>
                        <Trash2 size={16} />
                    </Button>
                </Space>
            ),
            width: '11vw'
        }
    ];

    const [state, setState] = useState({
        productsList: [],
        productsListForGrid: [],
        currentProduct: {},

        editProductInfoModal: false,
        deleteProductInfoModal: false,
        createProductInfoModal: false
    });

    const createDataModelForDataTabel = (data) => {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    useEffect(() => {

        ProductService.getAllProducts()
            .then(response => {
                if (response.data.success && response.data.result.length > 0) {
                    const result = response.data.result;
                    ////console.log(result)
                    setState(prevState => {
                        return {
                            ...prevState,
                            productsList: result, productsListForGrid: createDataModelForDataTabel(result)
                        }
                    });
                }
                else {
                    return toast.warning("محصولی تاکنون ثبت نگردیده است");
                }
            })
            .catch(error => {
                //
            })

    }, [])

    //#endregion ---------------------------------------------------------

    //#region Edit Product Info ------------------------------------------

    const handleEditProductInfo = (record) => {
        setState(prevState => {
            return {
                ...prevState,
                currentProduct: record
            }
        });

        editProductInfoToggle();
    }

    const editProductInfoToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                editProductInfoModal: !prevState.editProductInfoModal
            }
        });
    }

    const handleEditProductTitleChange = (value) => {

        const data = { ...state.currentProduct };
        data.title = value;

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: data
            }
        });
    }

    const handleEditProductPriceChange = (value) => {
        const data = { ...state.currentProduct };
        data.price = value;

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: data
            }
        });
    }

    const handleEditProductDaysChange = (value) => {
        const data = { ...state.currentProduct };
        data.days = value;

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: data
            }
        });
    }

    const handleSubmitEditProductInfo = () => {

        if (state.currentProduct) {
            ////console.log('submit edit into', _.pick(state.currentProduct, ["title", "price", "days", "id"]))
            ProductService.editProduct(_.pick(state.currentProduct, ["title", "price", "days", "id"]))
                .then(response => {
                    if (response.data.success) {

                        const products = [...state.productsList];
                        const index = _(products).findIndex(c => c.id === state.currentProduct.id);
                        products[index] = { ...products[index] };
                        products[index] = state.currentProduct;

                        setState(prevState => {
                            return {
                                ...prevState,
                                productsList: products, productsListForGrid: createDataModelForDataTabel(products)
                                , currentProduct: {}
                            }
                        });
                        editProductInfoToggle();
                        return toast.success("اطلاعات محصول ویرایش شد")
                    }
                    else {
                        return toast.error("امکان ویرایش اطلاعات محصول مقدور نیست");
                    }
                })
                .catch(error => {
                    //
                })
        }

    }

    const handleCancelEditProductInfo = () => {

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: {}
            }
        });

        editProductInfoToggle();

    }

    //#endregion -----------------------------------------------------------

    //#region Delete Product Info ----------------------------------------

    const handleDeleteProductInfo = (record) => {
        setState(prevState => {
            return {
                ...prevState,
                currentProduct: record
            }
        });

        deleteProductInfoToggle();
    }

    const deleteProductInfoToggle = () => {
        setState(prevState => {
            return {
                ...prevState,
                deleteProductInfoModal: !prevState.deleteProductInfoModal
            }
        });
    }

    const handleSubmitDeleteProductInfo = () => {

        if (state.currentProduct) {
            ProductService.deleteProduct(state.currentProduct.id)
                .then(response => {
                    if (response.data.success) {

                        const originalProducts = [...state.productsList];
                        const products = originalProducts.filter(c => c.id !== state.currentProduct.id);

                        setState(prevState => {
                            return {
                                ...prevState,
                                productsList: products, productsListForGrid: createDataModelForDataTabel(products)
                                , currentProduct: {}
                            }
                        });
                        deleteProductInfoToggle();
                        return toast.success("محصول انتخاب شده حذف گردید")
                    }
                    else {
                        return toast.error("امکان حذف اطلاعات محصول مقدور نیست");
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
                currentProduct: {}
            }
        });

        deleteProductInfoToggle();

    }

    //#endregion ---------------------------------------------------------

    //#region Create Product Info ----------------------------------------

    const handleCreateProductInfo = () => {

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: {}
            }
        });

        createProductInfoToggle();

    }

    const createProductInfoToggle = () => {

        setState(prevState => {
            return {
                ...prevState,
                createProductInfoModal: !prevState.createProductInfoModal
            }
        });

    }

    const handleSubmitCreateProductInfo = (values) => {

        ProductService.createProduct(_.pick(values, ["title", "price", "days"]))
            .then(response => {
                if (response.data.success) {

                    const originalProducts = [...state.productsList];
                    originalProducts.push(response.data.result);
                    ////console.log('response create prodcut', response);
                    setState(prevState => {
                        return {
                            ...prevState,
                            productsList: originalProducts, productsListForGrid: createDataModelForDataTabel(originalProducts)
                            , currentProduct: {}
                        }
                    });
                    createProductInfoToggle();
                    return toast.success("محصول جدید اضافه گردید")
                }
                else {
                    return toast.error("امکان اضافه کردن محصول جدید مقدور نیست");
                }
            })
            .catch(error => {
                ////console.log('error in submit new product ', error.message);
            })
    }

    const handleCancelCreateProductInfo = () => {

        setState(prevState => {
            return {
                ...prevState,
                currentProduct: {}
            }
        });

        createProductInfoToggle();

    }

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
                                        onClick={handleCreateProductInfo}>اضافه کردن محصول</button>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Table
                                        //className={antdClass2}
                                        columns={Columns}
                                        dataSource={state.productsListForGrid}
                                        pagination={false}
                                        scroll={{ x: 'max-content', y: 600 }}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
            {/* Edit Product Modal -------------------------------------------------------------------*/}
            <Modal
                isOpen={state.editProductInfoModal}
                toggle={editProductInfoToggle}
                className={props.className + " customFont"}
                backdrop="static"
            >
                <ModalHeader toggle={editProductInfoToggle} className="customFont rtl">ویرایش اطلاعات محصول {state.currentProduct.title}</ModalHeader>
                <ModalBody className="customFont">
                    {state.currentProduct.id && <React.Fragment>
                        <Row>
                            <Col md="12">
                                <input
                                    className="form-control rtl"
                                    value={state.currentProduct.title}
                                    type="text"
                                    onChange={(e) => handleEditProductTitleChange(e.target.value)}
                                    placeholder="عنوان محصول"
                                    id="productTitle"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6" className="mt-1">
                                <input
                                    className="form-control"
                                    value={state.currentProduct.price}
                                    type="number"
                                    onChange={(e) => handleEditProductPriceChange(e.target.value)}
                                    placeholder="قیمت محصول (برحسب ریال)"
                                    id="productPrice"
                                />
                            </Col>
                            <Col md="6" className="mt-1">
                                <input
                                    className="form-control"
                                    value={state.currentProduct.days}
                                    type="number"
                                    onChange={(e) => handleEditProductDaysChange(e.target.value)}
                                    placeholder="بازه زمانی (برحسب روز)"
                                    id="productDays"
                                />
                            </Col>
                        </Row>
                    </React.Fragment>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitEditProductInfo}>
                        ذخیره
                        </Button>{" "}
                    <Button color="secondary" onClick={handleCancelEditProductInfo}>
                        انصراف
                        </Button>
                </ModalFooter>
            </Modal>
            {/* Delete Product Modal -----------------------------------------------------------------*/}
            <Modal
                isOpen={state.deleteProductInfoModal}
                toggle={state.deleteVehicleInfoToggle}
                className={props.className + ' customFont'}
                backdrop="static"
            >
                <ModalHeader toggle={deleteProductInfoToggle} className="customFont text-right">حذف کردن محصول</ModalHeader>
                <ModalBody className="customFont text-right">
                    آیا مطمئن هستید محصول {state.currentProduct.title} حذف شود ؟
               </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmitDeleteProductInfo}>
                        بله
                        </Button>{" "}
                    <Button color="secondary" onClick={handleCancelDeleteVehicleInfo}>
                        خیر
                        </Button>
                </ModalFooter>
            </Modal>
            {/* Create Product Modal -------------------------------------------------------------------*/}
            <Modal
                isOpen={state.createProductInfoModal}
                toggle={createProductInfoToggle}
                className={props.className + " customFont"}
                backdrop="static"
            // dir="rtl"
            >
                <ModalHeader toggle={createProductInfoToggle} className="customFont text-right">اضافه کردن محصول جدید</ModalHeader>
                <ModalBody className="text-center customFont">
                    <Formik
                        initialValues={CreateProductInitialValues}
                        validationSchema={CreateProductValidationSchema}
                        onSubmit={async (values) => {
                            //////console.log("values", values);
                            await handleSubmitCreateProductInfo(values);
                        }}
                        validateOnBlur={true}
                        validateOnMount={true}
                        enableReinitialize
                    >
                        {(formik) => {
                            //////console.log("Formik props values", formik);

                            return (
                                <React.Fragment>
                                    <Form>
                                        <Row>
                                            <Col md="12">
                                                <FormikControl
                                                    control="input"
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    className="rtl"
                                                    placeholder="عنوان محصول"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <FormikControl
                                                    control="input"
                                                    type="number"
                                                    id="price"
                                                    name="price"
                                                    className="rtl"
                                                    placeholder="قیمت محصول (برحسب ریال)"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <FormikControl
                                                    control="input"
                                                    type="number"
                                                    id="days"
                                                    name="days"
                                                    className="rtl"
                                                    placeholder="بازه ی زمانی (برحسب روز)"
                                                />
                                            </Col>
                                        </Row>
                                        <div className="form-actions center">
                                            <Button color="primary" type="submit" className="mr-1" disabled={!formik.isValid}>
                                                {/* <LogIn size={16} color="#FFF" />  */}
                                                            ذخیره
                                                        </Button>
                                            <Button color="secondary" type="button" onClick={handleCancelCreateProductInfo}>
                                                انصراف
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

export default ProductPage;
