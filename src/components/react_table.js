import React, { useState } from "react";
import { useTable } from "react-table";
import { ResultWrapper } from "./utilities";
import cx from "classnames";
import { store } from "redux/store";
function Table(props) {

  const { docs, fields, handleHiddenCols  } = props;
  const [collapse, setCollapse] = useState(false);
  // https://react-table.tanstack.com/docs/quick-start
  // Setup data and columns for react table
  // We must use "data", "columns" variable names for the useTable
  // or it will throw an error
  const data = React.useMemo(
    () => docs,
    [docs]
  );

  // https://react-table.tanstack.com/docs/api/useTable
  // We could define cell functions to render different format result.
  // Usage: Cell: Function | React.Component => JSX
  const columns = React.useMemo(
    () => fields.filter((field) => field.hidden !== true)
      .map((field) => ({
        Header: field.label,
        accessor: field.field,
        Cell: ({ value }) => <ResultWrapper field={field} value={value} />
      })),
    [fields]
  );

  // https://react-table.tanstack.com/docs/examples/column-hiding
  // React table APIs for the columns hidden.
  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef

      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])

      return <input type="checkbox" ref={resolvedRef} {...rest} />
    }
  );

  // define the react table APIs
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    allColumns,
    getToggleHideAllColumnsProps,
  } = useTable({ columns, data, initialState : { hiddenColumns:  store.getState()['query']['view']['hiddenColumns'] } });

  const toggleExpand = () => {
    setCollapse(!collapse)
  };

  // handler function that is invoked when user clicks the checkbox
  // this will receive the selected field and pass it to the parent component
  // in the parent component, this selected field will be stored in redux store
  const handleClick = (e, column) =>{
    handleHiddenCols(column);
  }
  
  return (
    <>
      <div className="field_select_group">
        <span onClick={toggleExpand.bind(this)}
          className={cx("glyphicon fieldsIcon", {
            "glyphicon-collapse-down": !collapse,
            "glyphicon-collapse-up": collapse
          })} />
        {collapse ?
          <div className="popBoxField">
            <div >
              <label>
                <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} /> Toggle All
              </label>
            </div>
            {allColumns.map(column => (
              <div key={column.id}>
                <label>
                  <input type="checkbox" {...column.getToggleHiddenProps()}  onClick={(e) => handleClick(e, column)} />{' '}
                  {column.Header}
                </label>
              </div>
            ))}
          </div>
          :
          null
        }
      </div>
      <div className="recordTable">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
};

export default Table;
