import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HierarchyFacet from 'extension/iSamples_hierarchyFacet';

describe('ContextFacet', () => {
    it('should render the highest label of context hierarchy', () => {
        const highestSpecimenLabel = "Any sampled feature"; // hardcoded value 
        render(<HierarchyFacet label={"Context"} expanded={true} facets={[]} field={""}/>);
        
        const context = screen.getAllByText(highestSpecimenLabel);
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

    it('should render the extension label of context hierarchy', () => {
        const extensionContextLabel = "Atmosphere";
        render(<HierarchyFacet label={"Context"} expanded={true} facets={[]} field={""}/>);
        const toggles = screen.getAllByTestId("tree-toggle");
        // expand toggles to see extensions
        for ( let i = 0; i< toggles.length ; i++ ){
            let toggle = toggles[i];
            fireEvent.click(toggle);
        }
        expect(screen.getByText(extensionContextLabel)).toBeInTheDocument();
    });
})
