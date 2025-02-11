"use client"; // Required for Next.js 14+ with App Router

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { create } from "zustand";

// Zustand store for undo/redo
interface TableStore {
  history: string[][][];
  currentStep: number;
  setTableData: (newData: string[][]) => void;
  undo: () => void;
  redo: () => void;
}

const useTableStore = create<TableStore>((set) => ({
  history: [[[""]]], // Initial table state
  currentStep: 0,
  setTableData: (newData) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.currentStep + 1);
      return {
        history: [...newHistory, newData],
        currentStep: newHistory.length,
      };
    }),
  undo: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
    })),
  redo: () =>
    set((state) => ({
      currentStep: Math.min(state.history.length - 1, state.currentStep + 1),
    })),
}));

const TableEditor = () => {
  const [numRows, setNumRows] = useState(3);
  const [numCols, setNumCols] = useState(3);
  const { history, currentStep, setTableData, undo, redo } = useTableStore();

  // Generate initial table data
  const generateTableData = (rows: number, cols: number) => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "")
    );
  };

  // Initialize table state
  const [data, setData] = useState(generateTableData(numRows, numCols));

  // Update Zustand state on data change
  const updateData = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    setTableData(newData);
  };

  // Define table columns
  const columns: ColumnDef<string[]>[] = Array.from(
    { length: numCols },
    (_, i) => ({
      accessorKey: `${i}`,
      header: `Column ${i + 1}`,
      cell: ({ row, column }) => (
        <input
          className="border p-1 w-full"
          value={row.getValue(column.id)}
          onChange={(e) =>
            updateData(row.index, Number(column.id), e.target.value)
          }
        />
      ),
    })
  );

  // Initialize Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Apply transformations (Uppercase, Lowercase, Capitalize)
  const transformTable = (type: "uppercase" | "lowercase" | "capitalize") => {
    const newData = data.map((row) =>
      row.map((cell) => {
        if (type === "uppercase") return cell.toUpperCase();
        if (type === "lowercase") return cell.toLowerCase();
        if (type === "capitalize")
          return cell.charAt(0).toUpperCase() + cell.slice(1).toLowerCase();
        return cell;
      })
    );
    setData(newData);
    setTableData(newData);
  };

  // Transpose table rows and columns
  const transposeTable = () => {
    const transposedData = data[0].map((_, colIndex) =>
      data.map((row) => row[colIndex])
    );
    setData(transposedData);
    setTableData(transposedData);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      {/* Table Size Controls */}
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          min="1"
          value={numRows}
          onChange={(e) => setNumRows(Number(e.target.value))}
          className="border p-2"
          placeholder="Rows"
        />
        <input
          type="number"
          min="1"
          value={numCols}
          onChange={(e) => setNumCols(Number(e.target.value))}
          className="border p-2"
          placeholder="Columns"
        />
        <button
          onClick={() => setData(generateTableData(numRows, numCols))}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create Table
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => transformTable("uppercase")}
          className="bg-green-500 text-white p-2 rounded"
        >
          Uppercase
        </button>
        <button
          onClick={() => transformTable("lowercase")}
          className="bg-yellow-500 text-white p-2 rounded"
        >
          Lowercase
        </button>
        <button
          onClick={() => transformTable("capitalize")}
          className="bg-purple-500 text-white p-2 rounded"
        >
          Capitalize
        </button>
        <button
          onClick={transposeTable}
          className="bg-indigo-500 text-white p-2 rounded"
        >
          Transpose
        </button>
        <button
          onClick={undo}
          disabled={currentStep === 0}
          className="bg-gray-400 text-white p-2 rounded"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={currentStep === history.length - 1}
          className="bg-gray-600 text-white p-2 rounded"
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default TableEditor;
