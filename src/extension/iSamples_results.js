// This is the customized result component of solr-faceted-search-react
import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import parse from 'html-react-parser'

class iSamples_Result extends React.Component {

	renderValue(field, doc) {
		const value = [].concat(doc[field] || null).filter((v) => v !== null);

		return value.join(", ");
	}


	// Highlight the search words in the result text.
	HighlightWords(field, text) {
		if (field.type === 'text' && field.value !== undefined) {
			// replace "&", "|", "(", ")", "*", "'", """ and duplicated whitespace with only one whitespace
			const values = field.value.replaceAll(/&|\*|\(|\)|\||"|'/g, "").replaceAll(/\s+/g, " ").split(" ");

			// split original text by search words insensitively by regex pattern
			// g is for regex global and i is for insensitive.
			values.map((value) => {
				const regex = new RegExp(value, "gi");
				text = text.split(regex).join("<span style='background-color:yellow;'>" + value + "</span>");
				return text;
			})
		}

		// https://www.npmjs.com/package/html-react-parser
		// Rather than using dangerouslySetInnerHTML. This library will convert HTML string to react elements
		return parse(text);
	}

	render() {
		const { bootstrapCss, doc, fields } = this.props;

		return (
			<li className={cx({ "list-group-item": bootstrapCss })} onClick={() => this.props.onSelect(doc)}>
				<ul>
					{fields.filter((field) => field.field !== "*").map((field, i) =>
						<li key={i}>
							<label>{field.label || field.field}</label>
							{field.field === "id" ?
								<a href={"https://n2t.net/" + this.renderValue(field.field, doc)}>
									{this.HighlightWords(field, this.renderValue(field.field, doc))}
								</a>
								:
								this.HighlightWords(field, this.renderValue(field.field, doc))
							}
						</li>
					)}
				</ul>
			</li>
		);
	}
}

iSamples_Result.propTypes = {
	bootstrapCss: PropTypes.bool,
	doc: PropTypes.object,
	fields: PropTypes.array,
	onSelect: PropTypes.func.isRequired
};

export default iSamples_Result;
