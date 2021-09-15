// import external modules
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
// import internal(own) modules
import { FoldedContentConsumer } from "../../../../utility/context/toggleContentContext";
import LogoDark from "../../../../assets/img/CARIDO.png";
import { ToggleLeft, ToggleRight, X } from "react-feather";
import Logo from "../../../../assets/img/logo.png";
import templateConfig from "../../../../templateConfig";


class SidebarHeader extends Component {

   handleClick = e => {
      this.props.toggleSidebarMenu("close");
   };

   render() {
      //console.log(this.props.sidebarState,this.state)
      return (
         <FoldedContentConsumer>
            {context => (
               <div className="sidebar-header">
                  <div className="logo clearfix">
                     <NavLink to="/" className="logo-text float-right mr-4">
                        <div className="logo-img">
                            {
                              (this.props.collapsedSidebar !==  true) && <img src={LogoDark} alt="logo" />
                           } 
                                                    
                        </div>
                        {/* <span className="text align-middle">APEX</span> */}
                     </NavLink>

                     <span className="nav-toggle d-none d-sm-none d-md-none d-lg-block">
                        {context.foldedContent ? (
                           <ToggleLeft onClick={context.makeNormalContent} className="toggle-icon" size={16} />
                        ) : (
                           <ToggleRight onClick={context.makeFullContent} className="toggle-icon" size={16} />
                        )}
                     </span>
                     <span href="" className="nav-close d-block d-md-block d-lg-none d-xl-none" id="sidebarClose">
                        <X onClick={this.handleClick} size={20} />
                     </span>
                  </div>
               </div>
            )}
         </FoldedContentConsumer>
      );
   }
}

export default SidebarHeader;

