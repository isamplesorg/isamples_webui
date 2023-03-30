import Table from "components/react_table";
import { render, screen, fireEvent, queryByAttribute} from '@testing-library/react';
import { store } from '../redux/store.js';
import '@testing-library/jest-dom';

jest.mock('../redux/store.js')

const mockState = {
  query: {
    view: {
        facet: 'Table'
    },
  }
};
store.getState = () => mockState

describe('ReactTable', () => {
    it('toggle to see all the checkboxes and record table', () => {
        render(<Table  docs={null} fields={[]} handleHiddenCols={()=>{}} />);
        const table = screen.getByRole("table");
        const toggle = screen.getByTestId("toggle-span")
        fireEvent.click(toggle)
        expect(table).toBeInTheDocument();
    })
})
  