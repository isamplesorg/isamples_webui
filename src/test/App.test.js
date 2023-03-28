import React from 'react';
import ButGroup from 'components/ButGroup';
import { shallow } from 'enzyme';

describe('Button', () => {
  it('button group should contain buttons based on active property ', ()=>{
    // shallowly render component
    const wrapper= shallow(<ButGroup 
      switchFormat= {()=>{}}
      active={"Table"}
    />);
    expect(wrapper.find('button').exists()).toBeTruthy();
  })
});