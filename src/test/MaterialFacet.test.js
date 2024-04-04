import React, { useEffect }from 'react';
import { render, screen } from '@testing-library/react';
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';

function mockedHierarchyFunc (label) {
    return {
        "https://w3id.org/isample/vocabulary/material/1.0/material": {
         "label": {
            "en": "Material"
          },
          "children": [
            {
                "https://w3id.org/isample/vocabulary/material/1.0/anyanthropogenicmaterial": {
                "label": {
                  "en": "Any anthropogenic material"
                },
                "children": []
              }
            },
            ]
        }
    }
}

const mockMaterialId = "https://w3id.org/isample/vocabulary/material/1.0/material";
const mockChildMaterialId = "https://w3id.org/isample/vocabulary/material/1.0/anyanthropogenicmaterial";
const mockIdToLabelMap = new Map([[mockMaterialId,"Material"],[mockChildMaterialId, "Any anthropogenic material"]]);
const mockLabelToIdMap = new Map([["Material", mockMaterialId], ["Any anthropogenic material", mockChildMaterialId]])
jest.mock('react', () => ({
    ...jest.requireActual('react'), // Use the actual react module
    useEffect: jest.fn(), // Mock the useEffect hook
  }));
  

describe('MaterialFacet', () => {
    useEffect.mockImplementation(() => {
        // Mocked implementation goes here...
        callback();
        setIdToLabelMap(mockIdToLabelMap);
        setLabelToIdMap(mockLabelToIdMap);
        setCountMap(mockCountMap);
        setSelectedItems([mockContextId, mockChildContextId]);
        setExpandedItems([mockContextId, mockChildContextId])
      });

      
    it('should render the highest label of material hierarchy', () => {
        const highestMaterialLabel = "Material"; // hardcoded value
        render(<CustomizedTreeView 
            label={"Material"} 
            value={[]} 
            facetValues={["Material", "Any anthropogenic material"]} 
            facetCounts={[1000,100]}
            hierarchy={mockedHierarchyFunc} 
            renderZeroCount={true}/>
        );
        const material = screen.getAllByText(highestMaterialLabel);
        let materialTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < material.length ; i++){
            let materialComponent = material[i];
            if (materialComponent.getAttribute("data-testid") === "tree-item"){
                materialTreeItem = materialComponent;
            }
        }
        expect(materialTreeItem).not.toBeNull();
    });
})