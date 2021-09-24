import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import React from "react";
import { Column, useTable, usePagination } from "react-table";

interface TableProps {
  columns: TablePropsColumn;
  data: TablePropsData;
  title?: string;
}

export type TablePropsColumn = Column<any>[];
export type TablePropsData = any[];

const Table = ({ columns, data, title }: TableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageCount,
    gotoPage,
    state: { pageIndex },
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    usePagination
  );

  return (
    <div className="flex flex-col p-4">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            {title && (
              <div className="flex justify-center px-6 py-3 text-gray-900 font-medium">
                {title}
              </div>
            )}
            <table
              {...getTableProps()}
              className="min-w-full divide-y divide-gray-200"
            >
              <thead className="bg-gray-50">
                {columns.length > 0 ? (
                  headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps()}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.render("Header")}
                        </th>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    ></th>
                  </tr>
                )}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="bg-white divide-y divide-gray-200"
              >
                {data.length > 0 ? (
                  page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex p-4 align-middle justify-center gap-2">
              {pageCount > 0 && (
                <>
                  <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                  >
                    <ChevronLeftIcon
                      className={`h-5 w-5 ${
                        !canPreviousPage && "text-gray-300"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-1">
                    <div className="w-20">
                      <input
                        type="number"
                        value={pageIndex + 1}
                        onChange={(e) => gotoPage(e.target.valueAsNumber - 1)}
                      />
                    </div>
                    /
                    <div className="w-20">
                      <input type="text" value={pageCount} disabled={true} />
                    </div>
                  </div>
                  <button onClick={() => nextPage()} disabled={!canNextPage}>
                    <ChevronRightIcon
                      className={`h-5 w-5 ${!canNextPage && "text-gray-300"}`}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
