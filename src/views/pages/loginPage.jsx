import React, { useState } from "react";
import { Card, CardBody, Row, Col, Button,FormGroup } from "reactstrap";
import { LogIn } from "react-feather";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import * as auth from "../../services/authService"
import FormikControl from "../../components/common/formik/FormikControl";
import ClientCaptcha from "react-client-captcha";
import ReactRevealText from 'react-reveal-text';
import retry from "../../assets/icons/svg/retry.svg";


toast.configure({ bodyClassName: "customFont" });

//#region INITIAL VALUES ---------------------------------------------------

const initialValues = {
  username: "",
  password: "",
  captchaText: ""
};

const validationSchema = Yup.object({
  username: Yup.string().required("! نام کاربری را وارد کنید"),
  password: Yup.string().required("! کلمه عبور را وارد کنید"),
  captchaText: Yup.string().required("! کد امنیتی را وارد کنید"),
});

//#endregion ---------------------------------------------------------------

//#region SUBMIT FORMIK ----------------------------------------------------

const onSubmit = async (values, props) => {

  let parameters = {
    userNameOrEmailAddress: values.username,
    password: values.password,
    rememberClient:true
  };
  console.log(parameters)
  //return props.history.replace("/userProfile")

  try {
    //const { result, message } = await auth.login(_.pick(parameters, ["userNameOrEmailAddress", "password","rememberClient"]));
    const data = await auth.login(_.pick(parameters, ["userNameOrEmailAddress", "password","rememberClient"]));
    //console.log(data)
    // if (!result)
    //   return toast.error(message);
    // else 
    {
      const { state } = props.location;
      //console.log(props, state);
      //console.log('ssssssss', props.location.state);
      //window.location = state && state.from ? state.from.pathname : "/";
      if (state && state.from)
        return props.history.replace(state && state.from ? state.from.pathname : '/userProfile', { ...state.from.state })
      else
      props.history.replace("/userProfile")
        //window.location = "/userProfile";
    }
  } catch (err) {
    if (err.response && err.response.status === 401)
      return toast.error(err.response.data.data[0])
  }
};
//#endregion ---------------------------------------------------------------

const LoginPage = (props) => {

  //#region STATE ------------------------------------------

  const [state, setState] = useState({
    captchaCode: "",
    captchaTextIsValid: false,
  });
  const [show, setShow] = useState(false);
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);

  //#endregion -----------------------------------------------------------

  //#region INITAL FUNCTIONS ---------------------------------------------

  useEffect(() => {
    //console.log(props);
    if (props.location.state) {
      const { message } = props.location.state;
      if (props.location.state && message && message.length > 0) {
        toast.error(message);
      }
    }

    ////console.log('from login effevt', props)

    setTimeout(() => {
      setShow(true);
    }, 1000);

  }, []);

  useEffect(() => {
    let errorMessage = "";
  }, []);

  const handleCaptchaText = (text) => {
    setState((prevState) => {
      return {
        ...prevState,
        captchaTextIsValid: _.isEqual(text, _.toUpper(state.captchaCode)),
      };
    });
  };

  //#endregion -----------------------------------------------------------

  return (


    <div className="container">
      <Row className="full-height-vh">
        <Col
          xs="12"
          className="d-flex align-items-center justify-content-center"
        >
          <Card className=" text-center width-400 customBackgroundColor" >
            <CardBody>
              <h2 className="white py-4">
                <ReactRevealText show={show}>
                  GPS Tracking
                </ReactRevealText>
              </h2>
              <div className="pt-2">

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {
                    ////console.log("values", values);
                    await onSubmit(values, props);
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
                            <Col md="12">
                              <FormikControl
                                control="input"
                                type="text"
                                name="username"
                                id="username"
                                className="ltr"
                                placeholder="Username"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col md="12">
                              <FormikControl
                                control="input"
                                type="password"
                                id="password"
                                name="password"
                                className="ltr"
                                placeholder="Password"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col md="6">
                              <FormGroup style={{ paddingTop: "2rem" }}>
                                <ClientCaptcha
                                  backgroundColor = "MediumSeaGreen"
                                  charsCount={4}
                                  retryIcon={retry}
                                  captchaCode={(code) =>
                                    setState((prevState) => {
                                      return {
                                        ...prevState,
                                        captchaTextIsValid: false,
                                        captchaCode: code,
                                      };
                                    })
                                  }
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6" style={{ paddingTop: "0.5rem" }}>
                              <FormikControl 
                                control="inputMaskDebounce"
                                name="captchaText"
                                mask="****"
                                debounceTime={0}
                                placeholder="Security Code"
                                className="ltr"
                                onChange={() =>
                                  handleCaptchaText(formik.values.captchaText)
                                }
                                toUppercase={true}
                              />
                            </Col>
                          </Row>
                          <div className="form-actions center">

                            <Button color="primary" type="submit" className="mr-1" 
                            disabled={
                                !formik.isValid || !state.captchaTextIsValid
                              }>
                              <LogIn size={16} color="#FFF" /> Enter
                            </Button>

                          </div>
                        </Form>
                      </React.Fragment>
                    );
                  }}
                </Formik>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>


  );
};

export default LoginPage;
