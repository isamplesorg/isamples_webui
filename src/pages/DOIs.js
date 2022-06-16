import Cookies from 'universal-cookie';
import {
  useState
} from "react";
import {
  DOIFIELDS_REQUIRED,
  DOIFIELDS_RECOMMENDED,
  ISAMPLES_RECOMMENDED
} from "fields";
import 'css/DOIs.css';

const recommended_fields = [...Object.keys(ISAMPLES_RECOMMENDED), ...Object.keys(DOIFIELDS_RECOMMENDED)]
const recommended_info = {}
recommended_fields.forEach((field) => recommended_info[field] = false);

function DOIs() {
  const cookie = new Cookies();
  const [inputs, setInputs] = useState({});
  const [info, setInfo] = useState(recommended_info);

  const json_dict = () => {
    const { suffix, titles, creators, ...fields } = inputs;
    return {
      'orcid_id': cookie.get('orcid'),
      'datacite_metadata': {
        'data': {
          'type': 'dois',
          'attributes': {
            'prefix': window.config.datacite_prefix,
            'suffix': suffix,
            'types': {
              'resourceTypeGeneral': 'PhysicalObject',
            },
            'creators': [
              creators
            ],
            'titles': [
              {
                'title': titles
              }
            ],
            'publisher': window.config.datacite_publisher[0],
            ...fields
          }
        }
      }
    }
  }

  // Handle textarea content
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: !value.trim() ? undefined : value }))
  }

  // Handle submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    // let res = await fetch(`${window.config.dois_create}`, {
    //   'method': 'POST',
    //   'Authorization': cookie.get('access_token'),
    //   'body': json_dict()
    // })

    // console.log(res)
  }

  // Clear all inputs
  const handleClear = () => {
    setInputs({});
  }

  const toggle = (event) => {
    const name = event.target.getAttribute('name');
    setInfo({ ...info, [name]: !info[name] });
  }

  // Handle the required field inputs
  const inputGroupRequired = (field) => {
    if (Object.keys(DOIFIELDS_REQUIRED[field]).includes('value')) {
      if (DOIFIELDS_REQUIRED[field]['type'] === 'string') {
        return <input name={field} type="text" disabled value={DOIFIELDS_REQUIRED[field]['value']} />
      } else if (DOIFIELDS_REQUIRED[field]['type'] === 'array') {
        const value = DOIFIELDS_REQUIRED[field]['value'];
        return (
          <>
            {
              value.length > 1 ?
                <select name={field} onChange={handleChange} required>
                  <option></option>
                  {value.map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>
                :
                <input name={field} type="text" disabled value={DOIFIELDS_REQUIRED[field]['value'][0]} />
            }
          </>
        )
      }
    }

    if (DOIFIELDS_REQUIRED[field]['type'] === 'number') {
      return <input name={field} type="number" min="0" onChange={handleChange} value={inputs[field] || ""} required />
    }
    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} required />
  }

  // Handle recommended field input
  const inputGroupRecommended = (schema, field) => {
    if (schema[field]['type'] === 'number') {
      return <input name={field} type="number" min="0" onChange={handleChange} value={inputs[field] || ""} required />
    }

    if (Object.keys(schema[field]).includes('items')) {
      return <select name={field} onChange={handleChange}>
        <option></option>
        {
          schema[field]['items'].map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))
        }
      </select>
    }

    if (schema[field]['type'] === 'string') {
      return <textarea name={field} onChange={handleChange} value={inputs[field] || ""} />
    }

    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} />
  }

  const createInputsGroup = (schema, heading) => {
    return (
      <div className="panel panel-default">
        <div className="panel-heading"><h2 className="panel-title">{heading}</h2></div>
        <div className="panel-body">
          <ul>
            {Object.keys(schema).map((field, i) => (
              <li key={i}>
                <span
                  onMouseOver={toggle}
                  onMouseOut={toggle}
                  className="span__info glyphicon glyphicon-info-sign"
                  name={field} />
                <label className="label__input" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {inputGroupRecommended(schema, field)}
                <div className={info[field] ? "form__popbox form_popbox--show" : "form__popbox"}>
                  {schema[field]['description']}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="dois__container">
      <form className="form__container" onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Required Fields</h2></div>
          <div className="panel-body">
            <ul>
              {Object.keys(DOIFIELDS_REQUIRED).map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {inputGroupRequired(field)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Recommended Fields</h2></div>
          {createInputsGroup(ISAMPLES_RECOMMENDED, "iSample Schema")}
          {createInputsGroup(DOIFIELDS_RECOMMENDED, "DOIs Schema")}
        </div>
        <div className="btn__group">
          <input className="btn btn-default" type="button" value='Clear' onClick={handleClear} />
          <input className="btn btn-default" type="Submit" />
        </div>
      </form>
      <div>
        <textarea className='textarea__json' value={JSON.stringify(json_dict(), null, "\t")} readOnly />
      </div>
    </div>
  )
}

export default DOIs;
