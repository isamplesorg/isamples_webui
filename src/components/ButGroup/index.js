import React from 'react';
import cx from "classnames";

const ButGroup = (props) => {
  const { switchFormat, bootstrapCss, active } = props;

  return (
    <div className={cx({ "paginationBox": bootstrapCss })}>
      <div className={cx({ "swithButtonBox": bootstrapCss })}>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'List'
        })} onClick={() => switchFormat("List")}>List</button>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'Table'
        })} onClick={() => switchFormat("Table")}>Table</button>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'Map'
        })} onClick={() => switchFormat("Map")}>Map</button>
      </div>
      {props.children}
    </div>
  );
};

export default ButGroup;
