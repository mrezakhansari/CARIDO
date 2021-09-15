// import external modules
import React from "react";
import { Route } from "react-router-dom";

// import internal(own) modules
import FirstPageLayout from "../firstPageLayout";

const FirstPageRoute = ({ render, ...rest }) => {
   return (
      <Route
         {...rest}
         render={matchProps => <FirstPageLayout>{render(matchProps)}</FirstPageLayout>}
      />
   );
};

export default FirstPageRoute;
