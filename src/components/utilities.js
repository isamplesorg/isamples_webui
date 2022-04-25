// The utilities files to store functions that would be used in mutiple components.
import parse from 'html-react-parser'

// functional components to highlight search text and covert indentifers to the links
// same function from iSamples_results.js
export function ResultWrapper(props) {
  const { field, value } = props
  let text = [].concat(value || null).filter((v) => v !== null).join(", ");

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

  return field.field === 'id' ? <a href={"https://n2t.net/" + value}>{parse(text)}</a> : parse(text)
}

// default function to convert field names to well format one
export function wellFormatField(field) {
  let name = "";
  // check if '_' in the string
  if (field.includes('_')) {
    name = field.split('_')
  } else {
    name = field.split(/(?=[A-Z])/);
  }
  name = name.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  name = name.join(' ');
  return name
}

/**
 * a function to check if at least one field has value
 * @param {*} fields a hashtable variable
 */
export function checkAllValue(fields) {
  const values = fields.filter((field) => field.value && (Object.keys(field.value).length >0 || field.value.length > 0));
  return values.length > 0;
}

/**
 * a function to return only fields with values
 * @param {*} fields a array of field hashtable
 * @returns
 */
export function getAllValueField(fields){
  return fields.filter((field) => field.value && (Object.keys(field.value).length >0 || field.value.length > 0));
}

