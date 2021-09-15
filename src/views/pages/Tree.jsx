import React, { Component } from 'react';
import { Row, Col } from "reactstrap";
import { Switch, Tag } from 'antd'

const colors = ["magenta", "geekblue", "cyan", "volcano", "blue", "purple"];
const indexes = ["12", "12", "12"];
const Tree = ({ items, depth = 0, onChangeTree, disabled, colorIndex = 0, sortIndex = 0 }) => {
    if (!items || !items.length) {
        return null
    }

    let selectedColor = colors[colorIndex % colors.length];
    let selectedIndex = indexes[sortIndex % colors.length];
    console.log(selectedColor)

    return items.map(item => (
        // <React.Fragment key={item.name}>
        //     {/* Multiply the depth by a constant to create consistent spacing */}
        //     <div style={{ paddingLeft: depth * 15 }}>{item.name}</div>
        //     <Tree items={item.children} depth={depth + 1} />
        // </React.Fragment>

        <React.Fragment key={item.key}>
            <Col md={`${selectedIndex}`} className="mb-1">
                <Row style={{ paddingLeft: depth * 15 }} >
                    <Col md="6">
                        <Tag color={`${selectedColor}`}>{item.name}</Tag>
                    </Col>
                    <Col md="6" style={{ justifyContent: "right", direction: "ltr", display: "flex" }} >
                        {/* <span className="ml-1 pb-90">{permission.isGranted ? 'Granted' : 'Not Granted'}</span> */}
                        <Switch
                            name={item.key}
                            size="default"
                            // disabled={item.level !=0 && disabledParent}
                            disabled={disabled}
                            defaultChecked={item.isGranted}
                            checkedChildren={item.isGranted ? `Granted` : ""}
                            unCheckedChildren={!item.isGranted ? `Not Granted` : ""}
                            onChange={(value) => onChangeTree(value, item.key)}
                        />
                    </Col>
                </Row>

            </Col>
            <Tree items={item.child}
                depth={depth + 1}
                key={item.key + item.key}
                onChangeTree={onChangeTree}
                disabled={disabled || !item.isGranted}
                colorIndex={colorIndex + 1}
                sortIndex={sortIndex + 1}
            />
        </React.Fragment>
    ))
}

export default Tree;