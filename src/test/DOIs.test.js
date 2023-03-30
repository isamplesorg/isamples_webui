import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import DOIs from 'pages/DOIs';
import '@testing-library/jest-dom';

jest.mock('../fields.js', () => {
    global.config = {
        "datacite_prefix" : "",
        "datacite_publisher": [""]
      }
    return {
        DOIFIELDS_REQUIRED:{},
        DOIFIELDS_RECOMMENDED:{},
        ISAMPLES_RECOMMENDED : {},
    };
})


describe('DOIs', () => {
  it('should render a read only textarea', () => {
    render(<DOIs/>);
    fireEvent.submit(screen.getByTestId("form"));
    const textArea = screen.getByRole("textbox");
    expect(textArea).toBeInTheDocument();
  });

})