import React from "react";
import _ from "lodash";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { NavLink } from "react-router-dom";

const CustomNavigation = ({ path ,className }) => {
  if (path === null || path === "") {
    return null;
  }
  const items = _(path)
    .split("/")
    .value()
    .filter((c) => c !== "")
    .map((c) => _.startCase(_.camelCase(c)));
  const routes = _(path)
    .split("/")
    .value()
    .filter((c) => c !== "");

  //console.log(items, routes);
  return (
      <Breadcrumb tag="nav"  className ="bg-transparency">
        {items.map((item, index) => {
          if (items.length - 1 === index) {
            return (
              <BreadcrumbItem active key={item} >
                {item}
              </BreadcrumbItem>
            );
          } else {
            let link = "";
            routes.map((r, i) => {
              //console.log("r",r,i,index)
              if (i <= index) link += "/" + r;
              else {
                return link;
              }
            });
            //console.log(link);
            return (
              <BreadcrumbItem key={item} >
                <NavLink to={link}>{item}</NavLink>
              </BreadcrumbItem>
            );
          }
        })}
      </Breadcrumb>
  );
};

export default CustomNavigation;
