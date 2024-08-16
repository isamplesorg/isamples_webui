/**
 * The example from Material UI lab:
 * https://mui.com/material-ui/react-tree-view/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { alpha, styled, Typography } from '@mui/material';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { SimpleTreeView } from '@mui/x-tree-view';
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
const CreateTree = ({ data, onClick, countMap, renderZeroCount }) => {
  // The function to create tree items
  const treeItems = (json) => {
    return Object.entries(json).map(([key, val]) => {
      // console.log("Creating tree item for value " + val);
      const label = val["label"]["en"];
      // console.log("using label for value: " + label);
      var labelCnt = countMap && countMap.get(label) ? countMap.get(label) : 0;
      if (labelCnt === 0) {
        // console.log("getting count for key: " + key);
        labelCnt = countMap && countMap.get(key) ? countMap.get(key) : 0;
      }
      if (labelCnt === 0 && !renderZeroCount && val["children"].length === 0) { // condition to not render 
        // console.log("not rendering " + label);
        return null; 
      }
      else {
        if (val["children"].length === 0) {
          return <StyledTreeItem key={label} itemId={key} label={labelContent(label, labelCnt)} onClick={onClick} />;
        } else {
          return (
            <StyledTreeItem key={label} itemId={key} label={labelContent(label, labelCnt)} onClick={onClick}>
              <CreateTree data={val["children"]} onClick={onClick} countMap={countMap} renderZeroCount={renderZeroCount} />
            </StyledTreeItem>
          );
        }
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

// Use BFS to find all possible paths of expanded nodes
const findPath = (tree, target) => {
  // console.log("looking for " + target + " in tree");  
  // for (let [key, value] of tree) {
  //   console.log(`Key: ${key}, Value: ${value}`);
  // }
  let res = [];
  const expanded = [{ obj: tree, path: [] }];
  while (expanded.length > 0) {
    let { obj, path } = expanded.shift();
    const val = Object.entries(obj)[0][1];
    const label = Object.entries(obj)[0][0];
    // console.log("examining " + val + " in label " + label);
    path = [...path, label];
    if (label.toLocaleLowerCase().includes(target.trim().toLocaleLowerCase())) {
      // console.log("pushing path " + path);
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
  const { label, value, onClick, facetCounts, facetValues, hierarchy, renderZeroCount } = props;
  const schema = hierarchy(label);
  const firstLevel = schema[Object.keys(schema)[0]]["label"]["en"];
  const [idToLabelMap, setIdToLabelMap] = useState(new Map());
  const [labelToIdMap, setLabelToIdMap] = useState(new Map());
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [countMap, setCountMap] = useState(new Map());

  /** 
    recursively sets the count of a label
    1. if leaf node : get the count directly by comparing to facetCnt
    2. if non-leaf node: get the count by adding up the childNode counts using countMap 
    @param currSchema an object that is used for recursion 
  */ 
  const calculateCounts = useCallback( (currSchema) => {
    // when all facetValues are fetched
    // console.log("facetValues are " + facetValues);
    if(Array.isArray(facetValues)){
      // console.log("currSchema is " + currSchema);
      for (const key in currSchema){
        const childLabels = []; // the child labels of this label 
        for (const childSchema of currSchema[key]["children"]){
          // recursively save the counts in countMap
          // and get the child node labels
          // console.log("child schema is " + childSchema);
          let childLabel = calculateCounts(childSchema);
          if (childLabel){
            // console.log("pushing child label " + childLabel);
            childLabels.push(childLabel);
          } 
        }
        // console.log("checking against key " + key + " and value " + value);
        const currVocab = currSchema[key];
        const label = currVocab["label"]["en"];
        let totalCnt = 0; // total cnt of this label 
        // leaf node
        var facetValueLabel = "";
        if (childLabels.length === 0 ) {
          // get the count by directly comparing to facetValues
          for (const idx in facetValues){
            const facetValue = facetValues[idx];
            const vocabularyDict = currSchema[facetValue];
            if (typeof vocabularyDict !== "undefined") {
              // console.log("found vocabulary dict!" + vocabularyDict);
              facetValueLabel = vocabularyDict["label"]["en"];
            }
            // Value is the selected facet value we are comparing against.
            if (value.length === 0 && facetValueLabel.toLocaleLowerCase()=== label.toLocaleLowerCase()){ 
              // when no labels are selected for search,
              // display all label count
              totalCnt += facetCounts[idx];
            } else if (value.length !== 0 && value.indexOf(facetValueLabel) !== -1 && facetValueLabel.toLocaleLowerCase()=== label.toLocaleLowerCase() ){
              // display only selected labels cnt 
              totalCnt += facetCounts[idx];
            } else if (value.length !== 0 && value.indexOf(key) !== -1) {
              totalCnt += facetCounts[idx];
            }
          }
        } else{
          // non - leaf node
          // add itself label count
          for (const idx in facetValues){
            const facetValue = facetValues[idx];
            const vocabularyDict = currSchema[facetValue];
            if (typeof vocabularyDict !== "undefined") {
              facetValueLabel = vocabularyDict["label"]["en"];
            }
            if ( (value.length === 0 || value.indexOf(facetValueLabel) !== -1) && facetValueLabel.toLocaleLowerCase()=== label.toLocaleLowerCase()){ 
              // when no labels are selected for search, or itself is selected for search
              // when another label is selected, do not add up counts 
              // add itself's label count 
              totalCnt += facetCounts[idx];
            } else if (value.length !== 0 && value.indexOf(key) !== -1) {
              totalCnt += facetCounts[idx];
            }
          }
          for (const childLabel of childLabels){
            // add up the count from child labels
            totalCnt += countMap.get(childLabel); 
          }
        }
        // console.log("setting count " + totalCnt + " for label " + label);
        setCountMap(countMap.set(label, totalCnt))
        return label;
      }
    } else {
      return null;
    }
  }, [facetValues,facetCounts, value, countMap]);

  /**
  * Convert an array of ids to its labels 
  */
  const parseIdArrayToLabelArray = (idArray, idToLabelMap) => {
    let labelArray = [];
    // Apply map values to each element in the original array
    idArray.forEach(element => {
        if (idToLabelMap.has(element)) {
            labelArray.push(idToLabelMap.get(element));
        }
    });
    return labelArray;
  }

  /**
   * Convert an array of labels to its ids
   */
  const parseLabelArrayToIdArray = (labelArray, labelToIdMap) => {
    // console.log("going to select result of " + labelArray + " out of labelToIdMap");
    // for (let [key, value] of labelToIdMap) {
    //   console.log(`Key: ${key}, Value: ${value}`);
    // }
      let idArray = [];
      // Apply map values to each element in the original array
      labelArray.forEach(element => {
          if (labelToIdMap.has(element)) {
              idArray.push(labelToIdMap.get(element));
          }
      });
      return idArray;
  }

  const valueForSelection = (value) => {
    return (value && value.length > 0) ? value : [];  
  }

  // Update tree view based on the facet filter
  useEffect(() => {
    if (idToLabelMap.size === 0 && labelToIdMap.size === 0) {
      const newIdToLabelMap = new Map(idToLabelMap);
      const newLabelToIdMap = new Map(labelToIdMap);

      // Function to recursively populate idToLabelMap and labelToIdMap
      const updateMaps = (currSchema) => {
        for (let key in currSchema) {
          newIdToLabelMap.set(key, currSchema[key]["label"]["en"]);
          newLabelToIdMap.set(currSchema[key]["label"]["en"], key);

          for (const childSchema of currSchema[key]["children"]) {
            updateMaps(childSchema); // Recursively update maps
          }
        }
      };

      // Call the recursive function to update maps
      updateMaps(schema);

      // Update state after the recursion is completed
      setIdToLabelMap(newIdToLabelMap);
      setLabelToIdMap(newLabelToIdMap);
    }
    // console.log("Looking for value: " + value);
    const path = Array.from(new Set(value.map(v => findPath(schema, v)).flat()));
    // console.log("Setting expanded items to " + valueForSelection(value));
    setExpandedItems(prevExpaned => path.length !== prevExpaned.length ? valueForSelection(path) : prevExpaned)
    // calculate the counts 
    if (Array.isArray(facetValues)){
      setCountMap(new Map()); // initialize counts 
      calculateCounts(schema);
    }
    setSelectedItems(valueForSelection(value));
  }, [schema, value, facetValues, calculateCounts, labelToIdMap, idToLabelMap])

  const handleToggle = (event, itemIds) => {
    // console.log("handling toggle");
    const difference = itemIds
      .filter(x => !expandedItems.includes(x))
      .concat(expandedItems.filter(x => !itemIds.includes(x)));
    // For toggle items, we could use ctrl + enter to select the tree item
    if (event.ctrlKey && event.code === 'Enter') {
      onClick(parseIdArrayToLabelArray(difference[0], idToLabelMap), "add");
    } else {
        setExpandedItems(itemIds);
    }
  };

  const handleSelect = (event, itemIds) => {
    // console.log("handling select");
    if (value.includes(itemIds[0])){
      // remove the selected label
      onClick(itemIds[0], "delete");
    } else{
      // add the selected label
      onClick(itemIds[0], "add" )
    }
  };

  const handleFilter = (event) => {
    const { value } = event.target;
    // console.log("handling filter using value " + value);
    setFilter(value);
    if (value.trim().length === 0) {
      setExpandedItems(parseLabelArrayToIdArray([firstLevel], labelToIdMap));
    } else {
      setExpandedItems(valueForSelection(findPath(schema, value)));
    }
  };

  return (
  <div className='list-facet__custom'>
    
     <SimpleTreeView
          aria-label="customized"
          slotes = {{
            collapseIcon: ExpandLessIcon,
            expandIcon : ExpandMoreIcon
          }}
          expandedItems={expandedItems}
          selectedItems={selectedItems}
          onExpandedItemsChange={handleToggle}
          onSelectedItemsChange={handleSelect}
          multiSelect
        >
          <CreateTree data={schema} onClick={onClick} countMap={countMap} renderZeroCount={renderZeroCount}/>
        </SimpleTreeView>
        <input onChange={handleFilter} value={filter} placeholder="Filter..." />
   
    </div> 
  )
}

export default CustomizedTreeView;
