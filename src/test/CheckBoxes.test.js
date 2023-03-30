import React from 'react';
import { render, screen} from '@testing-library/react';
import CheckBoxes from 'components/checkBoxes';
import { store } from '../redux/store.js';

jest.mock('../fields.js', () => {
  return { colorbind: []};
})

jest.mock('../redux/store.js')

const mockState = {
  query: {
    searchFields: [
      { name: 'field1', hidden: false },
      { name: 'field2', hidden: true },
    ],
  }
};

// in this point store.getState is going to be mocked
store.getState = () => mockState

describe('check boxes test', () => {
    it('should render a checkbox that toggles all checkboxes', () => {
      render(<CheckBoxes collapse={false} onSetFields={()=>{}} />);
      const checkBox = screen.getByRole('checkbox', {name: "Toggle All"});
  
      expect(checkBox).toBeInTheDocument();
    })
})
  