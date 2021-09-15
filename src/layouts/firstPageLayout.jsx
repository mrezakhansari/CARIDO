import React from "react";
import templateConfig from "../templateConfig";
import classnames from "classnames";

const FirstPageLayout = ({ children, ...rest }) => {
   return (
      <div
         className={classnames("error-layout bg-gallery-1 ", {
            "layout-dark": templateConfig.layoutDark
         })}
      >
         <main className="main">{children}</main>
      </div>
   );
};

export default FirstPageLayout;
