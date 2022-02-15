import React from "react";

class PopUp extends React.Component{

  render() {
    return (
      <div className="popBox">
        <ul>
          <li>Using "<b>*</b>" for the wildcard search (eg. IGSN*).</li>
          <li><b>&&</b> for the AND operator, <b>||</b> for the OR operator.</li>
          <li>Using parenthesis "<b>()</b>" to group the multiple keywrods (eg. (water && great)).</li>
          <li>If there are special characters (eg. : ) in the search words, Please put entire string in a quote, (eg. "IGSN:NHB0005J0").</li>
        </ul>
      </div>
    )
  }
};

export default PopUp;
