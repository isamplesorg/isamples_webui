/**
 * The example from Material UI lab:
 * https://mui.com/material-ui/react-tree-view/
 */

import React, { useState, useEffect } from 'react';
import { alpha, styled, Typography } from '@mui/material';
import { TreeView, treeItemClasses } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CustomTreeItem from './customContent';

import material from 'CVJSON/material_hierarchy.json';
import sampledFeature from "CVJSON/sampledFeature_hierarchy.json";
import specimanType from "CVJSON/specimenType_hierarchy.json";

// Use mui styled function to add style to TreeItem
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

/**
 * A function to wrap field and field number
 * @param {String} label the term name
 * @param {String} labelInfo the number of records
 * @returns
 */
const labelContent = (label, labelInfo) => {
  return <>
    {label}{" "}
    <Typography variant="caption" color="inherit" style={{ fontSize: '14px' }} className='facet-item-amount'>
      {labelInfo}
    </Typography>
  </>
}

/**
 * A function to create Tree view by recursion
 * @param {Object} param0
 * @returns
 */
const CreateTree = ({ data, onClick, countMap }) => {
  // The function to create tree items
  const treeItems = (json) => {
    return Object.entries(json).map(([key, val]) => {
      const label = val["label"]["en"];
      let labelCnt = countMap && countMap.get(label) ? countMap.get(label) : 0 ;
      if (val["children"].length === 0) {
        return <StyledTreeItem key={label} nodeId={label} label={labelContent(label, labelCnt)} onClick={onClick} />;
      } else {
        return (
          <StyledTreeItem key={label} nodeId={label} label={labelContent(label, labelCnt)} onClick={onClick}>
            <CreateTree data={val["children"]} onClick={onClick} countMap={countMap}/>
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

/**
 * Static json for now.
 * Will use REST api to get json file from server
 */
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
  const { label, value, onClick, facetCounts, facetValues} = props;
  const schema = hierarchy(label);
  const firstLevel = schema[Object.keys(schema)[0]]["label"]["en"];
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState([firstLevel]);
  const [selected, setSelected] = useState(value);
  const [countMap, setCountMap] = useState(new Map());
  
  /** 
    calculate the total counts of a label 
    we also account for the child labels and include those records when getting the total count
    @param currSchema an object that is used for recursion 
  */ 
  const calculateCounts = (currSchema) => {
    let totalCnt = 0 
    // when all the facet values are fetched
    if(Array.isArray(facetValues)){
      for (const key in currSchema){
        for (const childSchema of currSchema[key]["children"]){
          totalCnt += calculateCounts(childSchema)
        }
       // no children labels exists anymore 
        const label = currSchema[key]["label"]["en"]
        // search for this label in facetValues
        for (const idx in facetValues){
          const facetValue = facetValues[idx].toLocaleLowerCase()
          if (facetValue.includes(label.toLocaleLowerCase())){
            totalCnt += facetCounts[idx];
          }
        }
        setCountMap(countMap.set(label, totalCnt)); 
      }
      return totalCnt;
    } else {
      return 0;
    }
  }

  // Update tree view based on the facet filter
  useEffect(() => {
    const path = Array.from(new Set(value.map(v => findPath(schema, v)).flat()));
    setExpanded(prevExpaned => path.length > prevExpaned.length ? path : prevExpaned)
    setSelected(value)
    // calculate the count of labels when full facet values are fetched
    if (Array.isArray(facetValues)){
      calculateCounts(schema);
    }
  }, [schema, value, facetValues, facetCounts])

  const handleToggle = (event, nodeIds) => {
    const difference = nodeIds
      .filter(x => !expanded.includes(x))
      .concat(expanded.filter(x => !nodeIds.includes(x)));

    // For toggle items, we could use ctrl + enter to select the tree item
    if (event.ctrlKey && event.code === 'Enter') {
      onClick(difference[0]);
    } else {
      setExpanded(nodeIds);
    }
  };

  const handleSelect = (event, nodeIds) => {
    const difference = nodeIds
      .filter(x => !value.includes(x))
      .concat(value.filter(x => !nodeIds.includes(x)));
    onClick(difference[0]);
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
          <CreateTree data={schema} onClick={onClick} countMap={countMap} />
        </TreeView>
        <input onChange={handleFilter} value={filter} placeholder="Filter..." />
   
    </div> 
  )
}

export default CustomizedTreeView;
