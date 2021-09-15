// import external modules
import React from "react";
import { Route } from "react-router-dom";

// import internal(own) modules
import LogoutLayout from "../logoutLayout";

const LogoutLayoutRoute = ({ render, ...rest }) => {
    return (
        <Route
            {...rest}
            render={matchProps => <LogoutLayout>{render(matchProps)}</LogoutLayout>}
        />
    );
};

export default LogoutLayoutRoute;
