import React from 'react';
import { render, screen} from '@testing-library/react';
import UserInfo from 'pages/userInfo';
import '@testing-library/jest-dom';

describe('UserInfo', () => {
  it('should render the button with correct label', () => {
    global.config = {
        "user_info" : ""
      }

    render(<UserInfo/>);
    const jwtBtn = screen.getByRole("button", {name:"Copy JWT"});
    expect(jwtBtn).toBeInTheDocument();
  })
})