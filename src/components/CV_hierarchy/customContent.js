/**
 * The example from Material UI lab:
 * https://mui.com/material-ui/react-tree-view/
 *
 * The main purpose is to customize the behavior of tree items.
 */
import React from 'react';
import PropTypes from 'prop-types';
import TreeItem, { useTreeItem } from "@mui/lab/TreeItem";
import clsx from 'clsx';
import { Typography } from '@mui/material';

const CustomContent = React.forwardRef(function CustomContent(props, ref) {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
    onClick
  } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
    onClick(nodeId)
  };


  return (
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled
      }) + " list-facet__custom--item"}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {icon &&
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>}
      <Typography
        onClick={handleSelectionClick}
        component="div"
        className={classes.label}
        style={{ fontSize: '14px' }}
      >
        {label}
      </Typography>
    </div>
  );
});

CustomContent.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object.isRequired,
  /**
   * className applied to the root element.
   */
  className: PropTypes.string,
  /**
   * The icon to display next to the tree node's label. Either a parent or end icon.
   */
  displayIcon: PropTypes.node,
  /**
   * The icon to display next to the tree node's label. Either an expansion or collapse icon.
   */
  expansionIcon: PropTypes.node,
  /**
   * The icon to display next to the tree node's label.
   */
  icon: PropTypes.node,
  /**
   * The tree node label.
   */
  label: PropTypes.node,
  /**
   * The id of the node.
   */
  nodeId: PropTypes.string.isRequired,

};

const CustomTreeItem = (props) => (
  <TreeItem ContentComponent={CustomContent} {...props} onKeyDown={(e) => console.log(e)} />
);

export default CustomTreeItem;
