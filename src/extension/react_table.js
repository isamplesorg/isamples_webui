import React from "react";
import { useTable } from "react-table";
import parse from 'html-react-parser'

// functional components to highlight search text and covert indentifers to the links
// same function from iSamples_results.js
const CellModify = (props) => {
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
      .filter((field) => field.collapse !== true)
      .map((field) => ({
        Header: field.label,
        accessor: field.field,
        Cell: ({ value }) => <CellModify field={field} value={value} />
      })),
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
