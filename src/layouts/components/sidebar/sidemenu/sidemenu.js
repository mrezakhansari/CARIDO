// import external modules
import React, { Component } from "react";

import { ChevronRight } from "react-feather";
import { NavLink } from "react-router-dom";

// Styling
import "../../../../assets/scss/components/sidebar/sidemenu/sidemenu.scss";
// import internal(own) modules
import SideMenu from "../sidemenuHelper";
import ReactRevealText from "react-reveal-text";
import * as auth from "../../../../services/authService";
import config from '../../../../config.json';
import menuList from '../../../../mockData/menuList';
import _ from 'lodash';

class SideMenuContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      showUserInfo: false,
      menuList: []
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ showUserInfo: true });
    }, 1500);
  }

  componentWillMount() {

    //return this.setState({ menuList: menuList });

    if (!config.useAuthentication) {
      this.setState({ menuList: menuList });
    }

    else {
      const user = auth.getCurrentUser();
       console.log(user);

      if (user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] && user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin") {
        this.setState({ menuList: menuList, user: user });
        return;
      }
      else {

        function filterData(data, key) {
          var r = data.filter(function (o) {
            if (o.child) o.child = filterData(o.child, key);
            return o.key !== key;
          });
          return r;
        }

        // let userDoesNotHavePermissions = user.permissions
        //   .filter((m) => m.isGranted == false)
        //   .map((n) => n.name);

        let userDoesNotHavePermissions = ["ADMIN"];

      //  console.log('side menu userDoesNotHavePermissions', userDoesNotHavePermissions)
        let result = menuList;
        userDoesNotHavePermissions.forEach((p) => {
          result = filterData(result, p);
        });

        this.setState({ menuList: result, user: user });
      }
    }
  }
  showMenus = () => {
    let menu = _.cloneDeep(this.state.menuList);
    // console.log(menu);

    let travers = tree => {

      return tree.map(item => {
        if (item.child.length === 0) {
          if (item.url && item.url !== "") {
            return (
              <NavLink to={item.url} key={item.key} exact className="item" activeClassName="active">
                {item.icon &&
                  <i className="menu-icon" dir="rtl">
                    {item.icon()}
                  </i>}
                <span className="menu-item-text">{item.name}</span>
              </NavLink>
            )
          }
          else {
            return (
              <React.Fragment key={item.key}>
                <div hidden={true}></div>
              </React.Fragment>
            )
          }
          //return null
        }
        else {
          return (
            <SideMenu toggleSidebarMenu={this.props.toggleSidebarMenu} key={item.key}>
              <SideMenu.MenuMultiItems
                key={item.key}
                name={item.name}
                Icon={item.icon ? item.icon() : ''}
                ArrowRight={<ChevronRight size={16} />}
                collapsedSidebar={this.props.collapsedSidebar}
              >
                {travers(item.child)}
              </SideMenu.MenuMultiItems>
            </SideMenu>
          )
        }
      })
    }

    return menu.map(item => {
      if (item.child.length === 0) {
        //console.log(item)
        return (
          <SideMenu.MenuSingleItem badgeColor="danger" key={item.key} >
            <NavLink to={item.url} activeclassname="active">
              <i className="menu-icon">
                {item.icon && item.icon()}
              </i>
              <span className="menu-item-text">{item.name}</span>
            </NavLink>
          </SideMenu.MenuSingleItem>)
      }
      else {
        // console.log('node - child > 0', item.child)
        return (
          <SideMenu.MenuMultiItems
            key={item.key}
            name={item.name}
            Icon={item.icon ? item.icon() : ''}
            ArrowRight={<ChevronRight size={16} />}
            collapsedSidebar={this.props.collapsedSidebar}
          >
            {travers(item.child)}
          </SideMenu.MenuMultiItems>

        )
      }
    })
  }

  render() {

    return (
      <SideMenu
        className="sidebar-content"
        toggleSidebarMenu={this.props.toggleSidebarMenu}
      >
        <SideMenu.MenuMultiItems
          collapsedSidebar={this.props.collapsedSidebar}
          name={<ReactRevealText
            style={{ color: "White", fontSize: 18 }}
            className="mr-3 text-right"
            show={this.state.showUserInfo}
            text={this.state.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]}
          ></ReactRevealText>}
        >
        </SideMenu.MenuMultiItems>

        {
          this.state.menuList && this.showMenus(this.state.menuList)
        }

      </SideMenu >
    );
  }
}

export default SideMenuContent;
