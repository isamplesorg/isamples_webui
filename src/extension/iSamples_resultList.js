import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

class ResultList extends React.Component {
	constructor(props) {
		super(props);
		this.state = { facet: "list" }
	}

	render() {
		const { bootstrapCss } = this.props;

		console.log(this.props.children[0].length !== 0 ? this.props.children[0][0]['props']['doc'] : [])
		console.log(this.props.children[0].length !== 0 ? this.props.children[0][0]['props']['fields'] : [])
		return (
			<ul className={cx({ "list-group": bootstrapCss })}>
				{this.props.children}
			</ul>
		);
	}
}

ResultList.propTypes = {
	bootstrapCss: PropTypes.bool,
	children: PropTypes.array
};

export default ResultList;
