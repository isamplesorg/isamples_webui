import React from "react";
import { useTable } from "react-table";

function Table(props) {

  const { docs, fields } = props;

  // https://react-table.tanstack.com/docs/quick-start
  // Setup data and columns for react table
  // We must use "data", "columns" variable names for the useTable
  // or it will throw an error
  console.log(docs.map((record) => record['id']))
  const data = React.useMemo(
    () => docs,
    [docs]
  )

  const columns = React.useMemo(
    () => fields.map((field) => ({ Header: field.label, accessor: field.field })),
    [fields]
  )

  // define the react table APIs
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
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
  )
};

export default Table;
