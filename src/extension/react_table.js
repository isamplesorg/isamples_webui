

import React from "react";
import { useTable } from "react-table";
import { ResultWrapper } from "./utilities";

function Table(props) {

  const { docs, fields } = props;

  // https://react-table.tanstack.com/docs/quick-start
  // Setup data and columns for react table
  // We must use "data", "columns" variable names for the useTable
  // or it will throw an error
  const data = React.useMemo(
    () => docs,
    [docs]
  )

  // https://react-table.tanstack.com/docs/api/useTable
  // We could define cell functions to render different format result.
  // Usage: Cell: Function | React.Component => JSX
  const columns = React.useMemo(
    () => fields
      .map((field) => ({
        Header: field.label,
        accessor: field.field,
        Cell: ({ value }) => <ResultWrapper field={field} value={value} />
      })),
    [fields]
  )

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef

      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])

      return <input type="checkbox" ref={resolvedRef} {...rest} />
    }
  )

  // define the react table APIs
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    allColumns,
    getToggleHideAllColumnsProps,
  } = useTable({ columns, data })

  return (
    <>
      <div className="field_select_group">
        <div className="fields">
          <label>
            <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} /> Toggle
            All
          </label>
        </div>
        {allColumns.map(column => (
          <div className="fields" key={column.id}>
            <label>
              <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
              {column.id}
            </label>
          </div>
        ))}
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
                      <td
                        {...cell.getCellProps()}>
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
