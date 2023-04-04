import React from 'react';
import { render, screen} from '@testing-library/react';
import NavFooter from '../pages/navFooter.js'

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('NavFooter', () => {
    it('footer should render login button when config is enabled', () => {
      global.config = {
        "enable_login" : true 
      }
      render(<NavFooter />);
      const loginBtn = screen.getByRole("button", {name:"Login"});
      expect(loginBtn).toBeInTheDocument();
  
    })
})
  