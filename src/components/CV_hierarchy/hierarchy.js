/**
 * The example from Material UI lab:
 * https://mui.com/material-ui/react-tree-view/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { alpha, styled, Typography } from '@mui/material';
import { TreeView, treeItemClasses } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CustomTreeItem from './customContent';

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

function CustomizedTreeView(props) {
  const { label, value, onClick, facetCounts, facetValues, hierarchy} = props;
  const schema = hierarchy(label);
  const firstLevel = schema[Object.keys(schema)[0]]["label"]["en"];
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState([firstLevel]);
  const [selected, setSelected] = useState(value);
  const [countMap, setCountMap] = useState(new Map());

  /** 
    recursively sets the count of a label
    1. if leaf node : get the count directly by comparing to facetCnt
    2. if non-leaf node: get the count by adding up the childNode counts using countMap 
    @param currSchema an object that is used for recursion 
  */ 
  const calculateCounts = useCallback( (currSchema) => {
    // when all facetValues are fetched
    if(Array.isArray(facetValues)){
      for (const key in currSchema){
        const childLabels = []; // the child labels of this label 
        for (const childSchema of currSchema[key]["children"]){
          // recursively save the counts in countMap
          // and get the child node labels
          let childLabel = calculateCounts(childSchema);
          if (childLabel){
            childLabels.push(childLabel);
          } 
        }
        const label = currSchema[key]["label"]["en"];
        let totalCnt = 0; // total cnt of this label 
        // leaf node
        if (childLabels.length === 0) {
          // get the count by directly comparing to facetValues
          for (const idx in facetValues){
            const facetValue = facetValues[idx];
            if (value.length === 0 && facetValue.toLocaleLowerCase()=== label.toLocaleLowerCase()){ 
              // when no labels are selected for search,
              // display all label count
              totalCnt += facetCounts[idx];
            }
            else if (value.indexOf(facetValue) !== -1 && facetValue.toLocaleLowerCase()=== label.toLocaleLowerCase() ){
              // display only selected labels cnt 
              totalCnt += facetCounts[idx];
            }
          }
        } else{
          // non - leaf node
          for (const childLabel of childLabels){
            // add up the count from child labels
            totalCnt += countMap.get(childLabel); 
          }
        }
        setCountMap(countMap.set(label, totalCnt))
        return label;
      }
    } else {
      return null;
    }
  }, [facetValues,facetCounts, value, countMap]);

  // Update tree view based on the facet filter
  useEffect(() => {
    const path = Array.from(new Set(value.map(v => findPath(schema, v)).flat()));
    setExpanded(prevExpaned => path.length > prevExpaned.length ? path : prevExpaned)
    // calculate the counts 
    if (Array.isArray(facetValues)){
      setCountMap(new Map()); // initialize counts 
      calculateCounts(schema);
    }
    setSelected(value);
  }, [schema, value, facetValues, calculateCounts])

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
    // nodeIds[0] is the selected label 
    if (value.includes(nodeIds[0])){
      // remove the selected label
      onClick(nodeIds[0], "delete");
    } else{
      // add the selected label
      onClick(nodeIds[0], "add" )
    }
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
