import React, { useState, useEffect } from 'react';
import { alpha, styled, Typography } from '@mui/material';
import { TreeView, treeItemClasses } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CustomTreeItem from './customContent';

import material from 'CVJSON/material_hierarchy.json';
import sampledFeature from "CVJSON/sampledFeature_hierarchy.json";
import specimanType from "CVJSON/specimenType_hierarchy.json";

const StyledTreeItem = styled((props) => <CustomTreeItem {...props} />)(
  ({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      "& .close": {
        opacity: 0.3
      }
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    }
  })
);

const labelContent = (label, labelInfo) => {
  return <>
    {label}{" "}
    <Typography variant="caption" color="inherit" style={{ fontSize: '14px' }} className='facet-item-amount'>
      {labelInfo}
    </Typography>
  </>
}

const CreateTree = ({ data, onClick }) => {
  // The function to create tree items
  const treeItems = (json) => {
    return Object.entries(json).map(([key, val]) => {
      const label = val["label"]["en"];
      if (val["children"].length === 0) {
        return <StyledTreeItem key={label} nodeId={label} label={labelContent(label, 0)} onClick={onClick} />;
      } else {
        return (
          <StyledTreeItem key={label} nodeId={label} label={labelContent(label, 0)} onClick={onClick}>
            <CreateTree data={val["children"]} onClick={onClick} />
          </StyledTreeItem>
        );
      }
    });
  };

  // If the data is an array
  if (Array.isArray(data)) {
    return data.map((obj) => {
      return treeItems(obj);
    });
  }

  // If the data is an Object (the inital object)
  return treeItems(data);
};

// Use BFS to find all possible paths of expaneded nodes
const findPath = (tree, target) => {
  let res = [];
  const expanded = [{ obj: tree, path: [] }];
  while (expanded.length > 0) {
    let { obj, path } = expanded.shift();
    const val = Object.entries(obj)[0][1];
    const label = val["label"]["en"];
    path = [...path, label];
    if (label.toLocaleLowerCase().includes(target.trim().toLocaleLowerCase())) {
      res.push(path);
    }

    if (!val["children"].length) {
      continue;
    }

    val["children"].forEach((child) => {
      expanded.push({ obj: child, path: path });
    });
  }

  res = Array.from(new Set(res.flat()));
  return res;
};

const hierarchy = (label) => {
  switch (label) {
    case "Material":
      return material;
    case "Context":
      return sampledFeature;
    case "Specimen":
      return specimanType;
    default:
      return null;
  }
}

function CustomizedTreeView(props) {
  const { label, value, onClick } = props;
  const schema = hierarchy(label);
  const firstLevel = schema[Object.keys(schema)[0]]["label"]["en"];

  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState([firstLevel]);
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    const path = Array.from(new Set(value.map(v => findPath(schema, v)).flat()));
    setExpanded(prevExpaned => path.length > prevExpaned.length ? path : prevExpaned)
    setSelected(value)
  }, [schema, value])

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleFilter = (event) => {
    const { value } = event.target;
    setFilter(value);
    if (value.trim().length === 0) {
      setExpanded([firstLevel]);
    } else {
      setExpanded(findPath(schema, value));
    }
  };

  return (
    <div className='list-facet__custom'>
      <TreeView
        aria-label="customized"
        defaultCollapseIcon={<ExpandLessIcon />}
        defaultExpandIcon={<ExpandMoreIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        <CreateTree data={schema} onClick={onClick} />
      </TreeView>
      <input onChange={handleFilter} value={filter} placeholder="Filter..." />
    </div>
  );
}

export default CustomizedTreeView;
