import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';

function mockedHierarchyFunc (){
    return {
        "https://w3id.org/isample/vocabulary/specimentype/0.9/physicalspecimen": {
        "label": {
            "en": "Physical specimen"
          },
          "children": [
            {
                "https://w3id.org/isample/vocabulary/specimentype/0.9/anyaggregation": {
                "label": {
                  "en": "Any aggregation specimen"
                },
                "children": []
              }
            },
        ]
    }
    }
}

const mockSpecimenId = "https://w3id.org/isample/vocabulary/specimentype/0.9/physicalspecimen";
const mockChildSpecimenId = "https://w3id.org/isample/vocabulary/specimentype/0.9/anyaggregation";

const mockIdToLabelMap = new Map([[mockSpecimenId,"Physical specimen"],[mockChildSpecimenId,  "Any aggregation specimen"]]);
const mockLabelToIdMap = new Map([["Physical specimen", mockSpecimenId], [ "Any aggregation specimen", mockChildSpecimenId]])
jest.mock('react', () => ({
    ...jest.requireActual('react'), // Use the actual react module
    useEffect: jest.fn(), // Mock the useEffect hook
  }));
  
  
describe('SpecimenFacet', () => {
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

    it('should render the highest label of specimen hierarchy', () => {
        const highestSpecimenLabel = "Physical specimen"; // hardcoded value
        render(<CustomizedTreeView 
            label={"Specimen"} 
            value={[]} 
            facetValues={["Physical specimen", "Any aggregation specimen"]} 
            facetCounts={[1000,100]} 
            hierarchy={mockedHierarchyFunc} 
            renderZeroCount={true}/>
        );

        const specimen = screen.getAllByText(highestSpecimenLabel);
        let specimenTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < specimen.length ; i++){
            let specimenComponent = specimen[i];
            if (specimenComponent.getAttribute("data-testid") === "tree-item"){
                specimenTreeItem = specimenComponent;
            }
        }
        expect(specimenTreeItem).not.toBeNull();
    });
})