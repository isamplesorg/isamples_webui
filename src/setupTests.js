// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
    // src/setupTests.js
    
const enzyme = require('enzyme');
const enzyme-adapter-react-17 = require('@wojtekmaj/enzyme-adapter-react-17');
import '@testing-library/jest-dom'

enzyme.configure({ adapter: new enzyme-adapter-react-17.Adapter() });
