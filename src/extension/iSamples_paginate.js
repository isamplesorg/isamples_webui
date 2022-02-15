import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

class Pagination extends React.Component {

	onPageChange(page, pageAmt) {
		if (page >= pageAmt || page < 0) {
			return;
		}
		this.props.onChange(page);
	}

	renderPage(page, currentPage, key) {
		return (
			<li className={cx({ "active": page === currentPage })} key={key}>
				<a href="/#" onClick={this.onPageChange.bind(this, page)}>{page + 1}</a>
			</li>
		);
	}

	render() {
		const { bootstrapCss, query, results } = this.props;
		const { start, rows } = query;
		const { numFound } = results;
		const pageAmt = Math.ceil(numFound / rows);
		const currentPage = start / rows;

		let rangeStart = currentPage - 2 < 0 ? 0 : currentPage - 2;
		let rangeEnd = rangeStart + 5 > pageAmt ? pageAmt : rangeStart + 5;

		if (rangeEnd - rangeStart < 5 && rangeStart > 0) {
			rangeStart = rangeEnd - 5;
			if (rangeStart < 0) {
				rangeStart = 0;
			}
		}

		let pages = [];
		for (let page = rangeStart; page < rangeEnd; page++) {
			if (pages.indexOf(page) < 0) {
				pages.push(page);
			}
		}

		return (
			<div className={cx({ "paginationBox": bootstrapCss })}>
				<div className={cx({ "swithButtonBox": bootstrapCss })}>
					<button className={cx({
						"btn": bootstrapCss,
						"btn-default": bootstrapCss,
						"btn-sm": bootstrapCss,
						"pull-left": bootstrapCss,
						"margin-right-xs": bootstrapCss
					})}>List</button>
					<button className={cx({
						"btn": bootstrapCss,
						"btn-default": bootstrapCss,
						"btn-sm": bootstrapCss,
						"pull-left": bootstrapCss,
						"margin-right-xs": bootstrapCss
					})}>Table</button>
				</div>
				<div className={cx({ "panel-body": bootstrapCss, "text-center": bootstrapCss })}>
					<ul className={cx("pagination", { "pagination-sm": bootstrapCss })}>
						<li className={cx({ "disabled": currentPage === 0 })} key="start">
							<a href="/#" onClick={this.onPageChange.bind(this, 0)}>&lt;&lt;</a>
						</li>
						<li className={cx({ "disabled": currentPage - 1 < 0 })} key="prev">
							<a href="/#" onClick={this.onPageChange.bind(this, currentPage - 1)}>&lt;</a>
						</li>
						{pages.map((page, idx) => this.renderPage(page, currentPage, idx))}
						<li className={cx({ "disabled": currentPage + 1 >= pageAmt })} key="next">
							<a href="/#" onClick={this.onPageChange.bind(this, currentPage + 1, pageAmt)}>&gt;</a>
						</li>
						<li className={cx({ "disabled": currentPage === pageAmt - 1 })} key="end">
							<a href="/#" onClick={this.onPageChange.bind(this, pageAmt - 1)}>&gt;&gt;</a>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

Pagination.propTypes = {
	bootstrapCss: PropTypes.bool,
	onChange: PropTypes.func,
	query: PropTypes.object,
	results: PropTypes.object
};

export default Pagination;