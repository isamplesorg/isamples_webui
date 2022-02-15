import React from "react";
import { useTable } from "react-table";

function Table(props) {

  const { data } = props;

  console.log(data.length != 0 ? Object.keys(data[0]) : null)
  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   rows,
  //   prepareRow,
  // } = useTable({})



  return (
    <div>{data.length != 0 ? data[0]['id'] : null}</div>
  )

};


export default Table;
