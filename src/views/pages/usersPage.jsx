import React, { Component } from 'react';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import { User } from "react-feather";
import { Table, Tag} from 'antd';
import { Card, CardBody, Button, FormGroup, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Formik, Form } from "formik";
import FormikControl from "../../components/common/formik/FormikControl";
import * as Yup from "yup";
//import antdClass from 'antd/dist/antd.css';
//import antdClass2 from "../../assets/css/vendors/customAntdTable.css";
import _ from 'lodash';

import { getUsers, deleteUserInfo, editUserInfo,updateUserStatusToActive,updateUserStatusToInactive } from '../../services/user';

const mapStateToProps = (state) => {
    return state
}


toast.configure({ bodyClassName: "customFont" });

class UsersPage extends Component {

    //#region VARIABLES ----------------------------------------------------

    initialValues = {
        name: "",
        surname: "",
        isActive: "",
        emailAddress: "",
        userStatus: "",
        userName: ""
    };

    validationSchema = Yup.object({
        name: Yup.string().required("!نام را وارد کنید"),
        surname: Yup.string().required("!نام خانوادگی را وارد کنید"),
        emailAddress: Yup.string().email("!ایمیل را درست وارد کنید").required("!ایمیل را وارد کنید"),
        userName: Yup.string().required("!نام کاربری را وارد کنید"),
        // password: Yup.string().required("Enter Password").test("Check Password", value => {
        //     //console.log(value)
        // })
    });

    Columns = [
        {
            title: 'نام و نام خانوادگی',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: {
                compare: (a, b) => a.fullName.localeCompare(b.fullName),
                multiple: 4
            },
            sortDirections: ['ascend', 'descend'],
            defaultSortOrder: 'ascend',
        },
        {
            title: 'نام کاربری',
            dataIndex: 'userName',
            key: 'userName',
            sorter: {
                compare: (a, b) => a.userName.localeCompare(b.userName),
                multiple: 3
            },
            sortDirections: ['ascend', 'descend'],
        },
        // {
        //     title: 'آدرس الکترونیکی',
        //     dataIndex: 'emailAddress',
        //     key: 'emailAddress',
        //     render: text => (
        //         <Tag color="magenta">{
        //             text
        //         }</Tag>
        //     )
        // },
        {
            title: 'وضعیت',
            dataIndex: 'isActive',
            key: 'isActive',
            render: isActive => (
                <Tag color={isActive ? "cyan" : "red"} className={isActive ? 'px-2':''}>{
                    isActive ? "Active" : "Inactive"
                }</Tag>
            )
        }
        // ,
        // {
        //     title: 'عملیات',
        //     key: 'action',
        //     render: (text, record) => (
        //         <Space size="middle">
        //             <Button className={!record.isActive ? "btn-success mt-1 px-2" : "btn-danger mt-1"} size="sm"
        //                 onClick={() => this.handleStatusUser(record)}
        //             >{
        //                     !record.isActive ? 'Active' : "Inactive"}
        //             </Button>
        //             <Button className="btn-warning mt-1 ml-2" size="sm" onClick={() => this.handleEditUser(record)}>
        //                 <Edit2 size={16} />
        //             </Button>
        //             <Button className="btn-danger mt-1 ml-2" size="sm" onClick={() => this.handleDeleteUser(record)}>
        //                 <Trash2 size={16} />
        //             </Button>
        //             {/* <a onClick={() => this.handleDeleteUser(record)}>Delete <Edit2 size={16} /></a> */}
        //         </Space>
        //     ),
        // }
    ];

    //#endregion -----------------------------------------------------------

    //#region INITIAL FUNCTIONS -----------------------------------------

    constructor(props) {
        super(props)
        this.state = { ListOfPermissions: [], ListOfUsers: [], ListOfUsersForTable: [], selectedRowKeys: [], editModal: false, deleteModal: false, currentRow: {} };
    }

    createDataModelForDataTabel(data) {
        return data.map(item => {
            return { ...item, key: item.id }
        })
    }

    componentDidMount() {
        getUsers().then(res => {
            //console.log('resss', res)
            if (res.data.success) {
                this.setState({ ListOfUsers: res.data.result.items, ListOfUsersForTable: this.createDataModelForDataTabel(res.data.result.items) })
            }
        });
    }

    //#endregion -----------------------------------------------------------

    //#region Change Status User -------------------------------------------
    handleStatusUser = (userData) => {
        if (userData.isActive){
            updateUserStatusToInactive({id:userData.id})
            .then(res1=>{
                if (res1.data.success){
                    getUsers().then(res2 => {
                        ////console.log('resss', res)
                        if (res2.data.success) {
                            toast.success("User status has been changed successfully");
                            this.setState({ ListOfUsers: res2.data.result.items, ListOfUsersForTable: this.createDataModelForDataTabel(res2.data.result.items) })
                        }
                    });
                }
                else{
                    return toast.error("Can not change user status");
                }
            }).catch(error=>{
                //
            })
        }
        else{
            updateUserStatusToActive({id:userData.id})
            .then(res3=>{
                if (res3.data.success){
                    getUsers().then(res4 => {
                        ////console.log('resss', res)
                        if (res4.data.success) {
                            toast.success("User status has been changed successfully");
                            this.setState({ ListOfUsers: res4.data.result.items, ListOfUsersForTable: this.createDataModelForDataTabel(res4.data.result.items) })
                        }
                    });
                }
                else{
                    return toast.error("Can not change user status");
                }
            }).catch(error=>{
                //
            })
        }
    }
    //#endregion -----------------------------------------------------------

    //#region EDIT USER INFO EVENTS ----------------------------------------

    handleEditUser = (userData) => {

        //console.log('userData for edit', userData);

        // Use Spread Operator ------------------------------------
        // به این علت که دیپ کلون نکردیم برای اینکه تغییری بدیم که اثرش توی لیست اصلی اعمال نشه
        // مجبوریم از این روش استفاده کنیم که مدام باید برای هر آبجکتی که تو در تو هست
        // const userInfo = { ..._(this.state.ListOfUsers).filter(c => c._id === userData._id).first() };
        // از ... استفاده کنیم
        // userInfo.userId = "123456";
        // const permissions = [..._(this.state.ListOfUsers).filter(c => c._id == userData._id).first().permissions];
        // permissions[0] = { ...permissions[0] };
        // permissions[0].name = "XXXX";
        // userInfo.permissions = permissions;
        // Use Deep Clone -----------------------------------------
        // در این صورت دیگه نیازی نیست که نگران باشیم رفرنس تغییر کرده یا نه
        const userInfo = _.cloneDeep(_(this.state.ListOfUsers).filter(c => c.id === userData.id).first());
        //userInfo.permissions[0].name = "xxxx";
        //let permissions = this.extractUserPermissions(userInfo);

        this.setState({ currentRow: userInfo });
        this.editToggle();
    }

    // extractUserPermissions(userInfo) {
    //     let permissions = _.cloneDeep(this.state.ListOfPermissions);

    //     ////console.log('list of permi', permissions);
    //     let traversNodes = (childPermissions, pp) => {
    //         ////console.log('xxxx',childPermissions,pp)
    //         childPermissions.map(item => {
    //             ////console.log('node',item.key,pp.name)
    //             if (item.key === pp.name) {
    //                 // //console.log('crossnode',item.key,pp.name)
    //                 if (pp.isGranted) {
    //                     item.isGranted = true;
    //                 }
    //                 else {
    //                     item.isGranted = false;
    //                 }
    //             }
    //             else if (item.child && item.child.length > 0) {
    //                 ////console.log('traversnode',item.key,pp.name)
    //                 traversNodes(item.child, pp)
    //             }
    //         })

    //     }

    //     for (let i = 0; i < userInfo.permissions.length; i++) {
    //         for (let j = 0; j < permissions.length; j++) {
    //             if (permissions[j].key === userInfo.permissions[i].name) {
    //                 ////console.log('cross',i,j)
    //                 if (userInfo.permissions[i].isGranted) {
    //                     permissions[j].isGranted = true;
    //                     break;
    //                 }
    //             }
    //             else if (permissions[j].child != null && permissions[j].child.length > 0) {
    //                 ////console.log('traverse', i,userInfo.permissions[i], j,permissions[j]);
    //                 traversNodes(permissions[j].child, userInfo.permissions[i]);
    //             }
    //         }
    //     }
    //     //console.log('user permission extract', permissions);
    //     return permissions;
    // }

    editToggle = () => {
        this.setState({
            editModal: !this.state.editModal
        });
    }

    // handleUserPermissionsChange(checkedValues, permissionName) {
    //     //console.log('checked = ', checkedValues);
    //     const currentRow = { ...this.state.currentRow };

    //     const permissions = [...currentRow.permissions];
    //     const indexOfP = _(permissions).findIndex(c => c.name === permissionName);
    //     permissions[indexOfP] = { ...permissions[indexOfP] };

    //     const permission = { ...permissions[indexOfP] };
    //     const access = [...permission.access];

    //     access.map((item, index) => {
    //         if (checkedValues.length === 0) {
    //             access[index] = { ...access[index] };
    //             access[index].value = false;
    //         }

    //         else {
    //             const existItemInSelectedValues = _(checkedValues).filter(c => c === item.key).first();

    //             if (existItemInSelectedValues) {
    //                 ////console.log(existItemInSelectedValues)
    //                 access[index] = { ...access[index] };
    //                 access[index].value = true;
    //             }
    //             else {
    //                 access[index] = { ...access[index] };
    //                 access[index].value = false;
    //             }
    //         }
    //     });

    //     permission.access = access;
    //     permissions[indexOfP] = permission;
    //     currentRow.permissions = permissions;
    //     this.setState({ currentRow: currentRow });
    // }

    // handleUserPermissionGrantedChange = (switchValue, key) => {
    //     const currentRow = { ...this.state.currentRow };
    //     const permissions = [...currentRow.permissions];
    //     // const indexOfP = _(permissions).findIndex(c => c.name === permissionName);
    //     // permissions[indexOfP] = { ...permissions[indexOfP] };
    //     // permissions[indexOfP].isGranted = switchValue;
    //     // currentRow.permissions = permissions;
    //     // this.setState({ currentRow: currentRow })
    //     ////console.log(switchValue);
    //     const temp = this.updateTreePermissionsWithKey(switchValue, key, permissions);
    //     currentRow.permissions = temp;
    //     //console.log(temp)
    //     this.setState({ currentRow })
    // }

    // updateTreePermissionsWithKey = (switchValue, key, permissions) => {

    //     let travvv = (switchValue, key, childPermissions) => {
    //         childPermissions.map(item => {
    //             if (item.key === key) {
    //                 item.isGranted = switchValue;
    //             }
    //             else if (item.child && item.child.length > 0) {

    //                 travvv(switchValue, key, item.child);
    //             }
    //         });
    //     }

    //     permissions.map(item => {
    //         if (item.key === key) {
    //             item.isGranted = switchValue;
    //         }
    //         else if (item.child && item.child.length > 0) {

    //             travvv(switchValue, key, item.child);
    //         }
    //     });
    //     return permissions;
    // }

    handleUserTypeChange = ({ value }) => {
        ////console.log('handleUserTypeChange', value);
        const currentRow = { ...this.state.currentRow };
        currentRow.userType = value;
        this.setState({ currentRow })
    }

    handleUserStatusChange = ({ value }) => {
        ////console.log('handleUserStatusChange', value);
        const currentRow = { ...this.state.currentRow };
        currentRow.isActive = value === "Active" ? true : false;
        this.setState({ currentRow })
    }

    handleCancelEditUserInfo = () => {
        this.setState({ currentRow: {} });
        this.editToggle();
    }

    // convertUserTreePermissionsToLinerPermissions = (permissions, tempList) => {
    //     if (!permissions || !permissions.length) {
    //         return tempList;
    //     }
    //     else {
    //         permissions.map(item => {
    //             tempList.push({ name: item.key, isGranted: item.isGranted });
    //             this.convertUserTreePermissionsToLinerPermissions(item.child, tempList);
    //         });
    //         return tempList;
    //     }
    // }

    handleSubmitEditUserInfo = (values) => {
        //console.log('submit edit user info', this.state.currentRow);
        const userData = _.cloneDeep(this.state.currentRow);
        userData.userName=values.userName;
        userData.emailAddress=values.emailAddress;
        userData.name=values.name;
        userData.surname=values.surname;
        userData.fullName=values.name + ' ' + values.surname;
        //const temp = [];
        //const userPermissions = this.convertUserTreePermissionsToLinerPermissions(userData.permissions, temp);
        //userData.permissions = userPermissions;
        ////console.log(userData);
        //delete userData.password;
        ////console.log('delete password from user data edit', userData);
        editUserInfo({
            id:userData.id,
            userName:values.userName,
            emailAddress:values.emailAddress,
            name:values.name,
            surname:values.surname
        }).then(response => {
            if (response.data.success) {
                toast.success('User info has been updated successfully');
                const users = [...this.state.ListOfUsers];
                const index = _(users).findIndex(c => c.id === userData.id);
                users[index] = { ...users[index] };
                users[index] = userData;

                this.setState({ ListOfUsers: users, ListOfUsersForTable: this.createDataModelForDataTabel(users), currentRow: {} });
                this.editToggle();
            }
            else {
                ////console.log(response)
                toast.success('There is an error in editing user info');
                this.setState({ currentRow: {} });
                this.editToggle();
            }
        }).catch(error => {
            this.editToggle();
            this.setState({ currentRow: {} });
            //return toast.error(error.message);

        })
    }

    //#endregion -----------------------------------------------------------------------------------------

    //#region DELETE USER INFO EVENTS ---------------------------------------

    handleDeleteUser = (userData) => {
        ////console.log('userData for delete', userData);
        const userInfo = { ..._(this.state.ListOfUsers).filter(c => c.id === userData.id).first() };
        this.setState({ currentRow: userInfo })
        this.deleteToggle();
    }

    deleteToggle = () => {
        this.setState({
            deleteModal: !this.state.deleteModal
        });
    }

    handleCancelDeleteUserInfo = () => {
        this.setState({ currentRow: {} });
        this.deleteToggle();
    }

    handleSubmitDeleteUserInfo = () => {
        ////console.log(this.state.currentRow.id);
        deleteUserInfo(this.state.currentRow.id).then(response => {
            if (response.data.success) {
                toast.success('User info has been delete successfully');
                const originalUsers = [...this.state.ListOfUsers];
                const users = originalUsers.filter(c => c.id !== this.state.currentRow.id);
                this.setState({ ListOfUsers: users, ListOfUsersForTable: this.createDataModelForDataTabel(users), currentRow: {} });
                this.deleteToggle();
            }
            else {
                toast.success('There is an error in deleting user info');
                this.setState({ currentRow: {} });
                this.deleteToggle();
            }
        }).catch(error => {
            this.deleteToggle();
            this.setState({ currentRow: {} });
            //return toast.error(error.message);

        })
    }
    //#endregion -----------------------------------------------------------------------------------------

    //#region show old menu permission -------------------------------------------------
    // showMenuPermissions = (permissions) => {
    //     return permissions.map(item => {
    //         if (!item.child || item.child.length == 0) {
    //             return (
    //                 <Col md="12" key={item.key} className="mb-1">
    //                     <Row>
    //                         <Col md="6">
    //                             <Tag color="magenta">{item.name}</Tag>
    //                         </Col>
    //                         <Col md="6" style={{ justifyContent: "right", direction: "ltr", display: "flex" }} >
    //                             {/* <span className="ml-1 pb-90">{permission.isGranted ? 'Granted' : 'Not Granted'}</span> */}
    //                             <Switch
    //                                 name={item.key}
    //                                 size="default"
    //                                 // disabled={item.level !=0 && disabledParent}
    //                                 //disabled={disabled}
    //                                 defaultChecked={item.isGranted}
    //                                 checkedChildren={item.isGranted ? `Granted` : ""}
    //                                 unCheckedChildren={!item.isGranted ? `Not Granted` : ""}
    //                                 onChange={(value) => this.handleUserPermissionGrantedChange(value, item.key)}
    //                             />
    //                         </Col>
    //                     </Row>
    //                 </Col>
    //             )
    //         }
    //         else {
    //             return (
    //                 <Col md="12" key={item.key} className="mb-1">
    //                     <Row>
    //                         <Col md="6">
    //                             <Tag color="magenta">{item.name}</Tag>
    //                         </Col>
    //                         <Col md="6" style={{ justifyContent: "right", direction: "rtl", display: "flex" }} >
    //                             {/* <span className="ml-1 pb-90">{permission.isGranted ? 'Granted' : 'Not Granted'}</span> */}
    //                             <Switch
    //                                 name={item.key}
    //                                 size="default"
    //                                 //disabled={disabledParent}
    //                                 //disabled={disabled}
    //                                 defaultChecked={item.isGranted}
    //                                 checkedChildren={item.isGranted ? `Granted` : ""}
    //                                 unCheckedChildren={!item.isGranted ? `Not Granted` : ""}
    //                                 onChange={(value) => this.handleUserPermissionGrantedChange(value, item.key)}
    //                             />
    //                         </Col>
    //                     </Row>
    //                     <Row>
    //                         <Col md="12" className="ml-1 mt-1">
    //                             {this.showMenuPermissions(item.child)}
    //                         </Col>
    //                     </Row>
    //                 </Col>
    //             )
    //         }
    //     })
    // }
    //end
    //#endregion -----------------------------------------------------------------------

    render() {
        //console.log('render state', this.state);
        return (
            <React.Fragment>
                <Row className="row-eq-height">
                    <Col sm="12" md="12">
                        <Card>
                            <CardBody>
                                {/* <CardTitle>Users</CardTitle> */}
                                {/* <CardText>With supporting text below as a natural lead-in to additional content.</CardText> */}
                                <div className="form-body">
                                    <h4 className="form-section customFont" style={{color:"red"}}>
                                        <User size={20} color="#212529" /> لیست کاربران به تعداد {this.state.ListOfUsersForTable.length}
                                        </h4>
                                    <Row>
                                        <Col md="12">
                                            <FormGroup>
                                                {/* <Input type="text" id="projectinput1" name="fname" placeholder="First Name" /> */}
                                                <Table
                                                    //className={antdClass + antdClass2}
                                                    columns={this.Columns}
                                                    dataSource={this.state.ListOfUsersForTable}
                                                    pagination={{ position: ["bottomCenter"] }}
                                                    scroll={{ x: 'max-content', y: 400 }}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    isOpen={this.state.editModal}
                    toggle={this.editToggle}
                    className={this.props.className + " customFont"}
                    backdrop="static"
                   // dir="rtl"
                >
                    <ModalHeader toggle={this.editToggle} className="customFont rtl">ویرایش اطلاعات</ModalHeader>
                    <ModalBody className="text-center">
                        {
                            // <Tree items={this.state.currentRow.permissions}
                            //     onChangeTree={this.handleUserPermissionGrantedChange}
                            //     disabled={false}
                            // />

                            this.state.currentRow && this.state.currentRow &&
                            <Formik
                                initialValues={this.state.currentRow}
                                validationSchema={this.validationSchema}
                                onSubmit={async (values) => {
                                    ////console.log("values", values);
                                    await this.handleSubmitEditUserInfo(values);
                                }}
                                //validateOnBlur={true}
                                validateOnMount={true}
                                enableReinitialize
                            >
                                {(formik) => {
                                    ////console.log("Formik props values", formik);

                                    return (
                                        <React.Fragment>
                                            <Form>
                                                <Row>
                                                <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="text"
                                                            id="surname"
                                                            name="surname"
                                                            className="rtl"
                                                            placeholder="نام خانوادگی"
                                                            label="نام خانوادگی"
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            className="rtl"
                                                            placeholder="نام"
                                                            label="نام"
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="text"
                                                            id="emailAddress"
                                                            name="emailAddress"
                                                            className="rtl"
                                                            placeholder="Email"
                                                            label="ایمیل"
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="text"
                                                            id="userName"
                                                            name="userName"
                                                            className="rtl"
                                                            placeholder="نام کاربری"
                                                            label="نام کاربری"
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    {/* <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="password"
                                                            id="newPassword"
                                                            name="newPassword"
                                                            className="ltr"
                                                            placeholder="New Password"
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <FormikControl
                                                            control="input"
                                                            type="password"
                                                            id="confirmNewPassword"
                                                            name="confirmNewPassword"
                                                            className="ltr"
                                                            placeholder="Confirm New Password"
                                                        />
                                                    </Col> */}
                                                </Row>
                                                <Row>
                                                    <Col md="6">
                                                        {/* <Tag color="magenta">User Type</Tag> */}
                                                        {/* {this.state.ListOfUserTypes &&
                                                                <Radio.Group
                                                                options={this.state.ListOfUserTypes.map(c => c.name)}
                                                                value={this.state.currentRow.userType}
                                                                onChange={(e) => this.handleUserTypeChange(e.target)} />
                                                        } */}

                                                    </Col>
                                                </Row>
                                                <div className="form-actions center">
                                                    <Button color="primary" type="submit" className="mr-1" disabled={!formik.isValid}>
                                                        {/* <LogIn size={16} color="#FFF" />  */}
                                                            Save
                                                        </Button>
                                                    <Button color="secondary" type="button" onClick={this.handleCancelEditUserInfo}>
                                                        Cancel
                                                         </Button>
                                                </div>
                                            </Form>
                                        </React.Fragment>
                                    );
                                }}
                            </Formik>
                        }
                    </ModalBody>
                </Modal>
                <Modal
                    isOpen={this.state.deleteModal}
                    toggle={this.deleteToggle}
                    className={this.props.className}
                    backdrop="static"
                >
                    <ModalHeader toggle={this.deleteToggle}>Delete User Info</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete {this.state.currentRow.fullName + '\'s info'} ?
               </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmitDeleteUserInfo}>
                            Save
                        </Button>{" "}
                        <Button color="secondary" onClick={this.handleCancelDeleteUserInfo}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps)(UsersPage);