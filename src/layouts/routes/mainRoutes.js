// import external modules
import React from "react";
import { Route, Redirect } from "react-router-dom";
import _ from 'lodash'

import auth from "../../services/authService";
import config from '../../config.json';
import MainLayout from "../mainLayout";

const MainLayoutRoute = ({ location, path, render, ...rest }) => {

   const doesCurrentUserHaveAuthorization = (permissions) => {

       //console.log('from main route: doesCurrentUserHaveAuthorization', permissions, path);
      if (permissions === null || permissions.length === 0)
         return false;

      const route = _(path)
         .split("/")
         .value()
         .filter((c) => c !== "")
         .map((c) => _.toUpper(c)).join('-');

      if (route.length === 0) return true;

      const result = permissions.filter(c => c.name === route && c.isGranted);
      if (result.length === 1) {
         return true;
      }

      return false;
   }
   const handleRenderMethod = (matchProps) => {

      if (!config.useAuthentication) {
         return <MainLayout>{render(matchProps)}</MainLayout>
      }

      //return (<MainLayout>{render(matchProps)}</MainLayout>);

      const user = auth.getCurrentUser();
      console.log(user);
      if (user) {
        return <MainLayout>{render(matchProps)}</MainLayout>
         if (user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] && user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] === "Admin") {
            return <MainLayout>{render(matchProps)}</MainLayout>
         }
         else if (doesCurrentUserHaveAuthorization(user.permissions)) {
            return <MainLayout>{render(matchProps)}</MainLayout>
         }
         else {
            auth.logout();
            return (<Redirect
               to={{
                  pathname: "/",
                  state: { message: "Access to this section is forbidden" }
               }}
            />)
         }
      }
      return (<Redirect
         to={{
            pathname: "/firstPage",
            state: { from: matchProps.location }
         }}
      />)
   }
   return (
      <Route
         {...rest}
         path={path}
         render={matchProps => handleRenderMethod(matchProps)}
      />
   );
};

export default MainLayoutRoute;
