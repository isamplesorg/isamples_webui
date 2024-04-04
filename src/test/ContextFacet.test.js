import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import  CustomizedTreeView from 'components/CV_hierarchy/hierarchy';

const mockContextId =  "https://w3id.org/isample/vocabulary/sampledfeature/0.9/anysampledfeature";
const mockChildContextId = "https://w3id.org/isample/vocabulary/sampledfeature/0.9/activehumanoccupationsite";

function mockedHierarchyFunc(){
    return {
        "https://w3id.org/isample/vocabulary/sampledfeature/0.9/anysampledfeature": {
          "label": {
            "en": "Any sampled feature"
          },
          "children": [
            {
              "https://w3id.org/isample/vocabulary/sampledfeature/0.9/activehumanoccupationsite": {
                "label": {
                  "en": "Active human occupation site"
                },
                "children": []
              }
            },
        ]
    }
    }
  }

// Define mock values for idToLabelMap and labelToIdMap
const mockIdToLabelMap = new Map([[mockContextId,"Any sampled feature"],[mockChildContextId, "Active human occupation site"]]);
const mockLabelToIdMap = new Map([["Any sampled feature", mockContextId], ["Active human occupation site", mockChildContextId]])
const mockCountMap = new Map([["Any sampled feature",1000],["Active human occupation site",100]])

jest.mock('react', () => ({
  ...jest.requireActual('react'), // Use the actual react module
  useEffect: jest.fn(), // Mock the useEffect hook
}));

describe('ContextFacet', () => {
    // Mocked implementation for useEffect
    useEffect.mockImplementation(() => {
      // Mocked implementation goes here...
      callback();
      setIdToLabelMap(mockIdToLabelMap);
      setLabelToIdMap(mockLabelToIdMap);
      setCountMap(mockCountMap);
      setSelectedItems([mockContextId, mockChildContextId]);
      setExpandedItems([mockContextId, mockChildContextId])
    });

    it('should render the highest label of context hierarchy', () => {
        const highestContextLabel = "Any sampled feature"; // hardcoded value
        render(<CustomizedTreeView 
          label={"Context"} 
          value={[]} 
          facetValues={["Any sampled feature", "Active human occupation site"]} 
          facetCounts={[1000,100]} 
          hierarchy={mockedHierarchyFunc} 
          renderZeroCount={true}/>
        );
        const context = screen.getAllByText(highestContextLabel);
        let contextTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < context.length ; i++){
            let contextComponent = context[i];
            if (contextComponent.getAttribute("data-testid") === "tree-item"){
                contextTreeItem = contextComponent;
            }
        }
        expect(contextTreeItem).not.toBeNull();
    });
})
