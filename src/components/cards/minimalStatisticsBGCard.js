import React, { PureComponent } from "react";
import { Card, CardBody, Media } from "reactstrap";
import classnames from "classnames";
import PropTypes from "prop-types";
class MinimalStatisticsBG extends PureComponent {
  render() {
    let iconLeft;
    let iconRight;
    let textDirection;

    if (this.props.iconSide === "right") {
      iconRight = this.props.children;
    } else {
      iconLeft = this.props.children;
      textDirection = "text-right";
    }
    return (
      <Card className={classnames(this.props.cardBgColor)}>
        <CardBody
          className="px-3 py-3"
          onClick={() => {
            return this.props.onClick
              ? this.props.onClick(this.props.statistics)
              : null;
          }}
        >
          <Media>
            {iconLeft}
            <Media body className={classnames("white", textDirection)}>
              <h5 className={classnames("mb-1", this.props.statisticsColor)} style={{textAlign:this.props.textAlign}}>
                {/* {this.props.statistics} */}
                {this.props.textElement}
              </h5>
              <span style={{textAlign:this.props.textAlign}}>{this.props.text}</span>
            </Media>
            {iconRight}
          </Media>
        </CardBody>
      </Card>
    );
  }
}

MinimalStatisticsBG.propTypes = {
  iconSide: PropTypes.string,
  cardBgColor: PropTypes.string,
  statisticsColor: PropTypes.string,
  statistics: PropTypes.string,
  text: PropTypes.string,
};

export default MinimalStatisticsBG;
