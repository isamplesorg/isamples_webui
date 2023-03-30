import React from 'react';
import { render, screen} from '@testing-library/react';
import ButGroup from 'components/ButGroup';

describe('ButGroup', () => {
  it('should render the button with correct label', () => {
    render(<ButGroup switchFormat={() => {}} active="List"/>);
    const listBtn = screen.getByRole("button", {name:"List"});
    const tableBtn = screen.getByRole("button", {name:"Table"});
    const mapBtn = screen.getByRole("button", {name:'Map'});
    expect(listBtn).toBeInTheDocument();
    expect(tableBtn).toBeInTheDocument();
    expect(mapBtn).toBeInTheDocument();
  });

})
