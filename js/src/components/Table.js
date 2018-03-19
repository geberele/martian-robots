const TableRow = ({row}) => (
  <tr>
    {row.map((column , i) => (
        <td key={i}>{column}</td>
      )
    )}
  </tr>
)

const Table = ({data}) => (
  <table>
    <tbody>
    {data.map((row, i) => (
        <TableRow row={row} key={i} />
      )
    )}
    </tbody>
  </table>
)

export default Table
