import React, { Component } from "react";
import { Button, ButtonGroup } from "reactstrap";

class ButtonsCheckbox extends Component {
   state = { cSelected: [] };

   onCheckboxBtnClick = selected => {
      const index = this.state.cSelected.indexOf(selected);
      if (index < 0) {
         this.state.cSelected.push(selected);
      } else {
         this.state.cSelected.splice(index, 1);
      }
      this.setState({ cSelected: [...this.state.cSelected] });
   };

   render() {
      return (
         <div>
            <ButtonGroup>
               <button
                  //color="primary"
                  //className="btn"
                  type="button"
                  className={!this.state.cSelected.includes(1)?"btn btn-outline-danger":"btn btn-danger"}
                  onClick={() => this.onCheckboxBtnClick(1)}
                  active={this.state.cSelected.includes(1)}
                  style={{ "backgroundColor": "#55D4A5"}}
                  //outline={!this.state.cSelected.includes(1)}
               >
                  One
               </button>
               <Button
                  //color="blue"
                  className="color"
                  style={{ "backgroundColor": "#55D4A5"}}
                  onClick={() => this.onCheckboxBtnClick(2)}
                  active={this.state.cSelected.includes(2)}
                  outline={!this.state.cSelected.includes(2)}

               >
                  Two
               </Button>
               <Button
                  color="primary"
                  onClick={() => this.onCheckboxBtnClick(3)}
                  active={this.state.cSelected.includes(3)}
               >
                  Three
               </Button>
            </ButtonGroup>
            <p>Selected: {JSON.stringify(this.state.cSelected)}</p>
         </div>
      );
   }
}

export default ButtonsCheckbox;