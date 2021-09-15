// import external modules
import React from "react";
import { Route } from "react-router-dom";

// import internal(own) modules
import LoginLayout from "../loginLayout";

const LoginLayoutRoute = ({ render, ...rest }) => {
   return (
      <Route
         {...rest}
         render={matchProps => <LoginLayout>{render(matchProps)}</LoginLayout>}
      />
   );
};

export default LoginLayoutRoute;
