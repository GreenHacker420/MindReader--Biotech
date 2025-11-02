"use client";

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function DatasetTable({ columns, rows, isEditable = false, onCellEdit, onRowDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null);

  function handleSort(columnName) {
    let direction = 'asc';
    if (sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnName, direction });
  }

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    
    if (sortConfig.direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  function handleCellEdit(rowIndex, columnName, value) {
    if (onCellEdit) {
      onCellEdit(rowIndex, columnName, value);
    }
    setEditingCell(null);
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-purple-50 to-blue-50 sticky top-0 z-10">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => !isEditable && handleSort(col.name)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                    !isEditable ? 'cursor-pointer hover:bg-purple-100 select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {col.name}
                    {!isEditable && sortConfig.key === col.name && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                    {!isEditable && sortConfig.key !== col.name && (
                      <span className="text-gray-400">↕</span>
                    )}
                  </div>
                </th>
              ))}
              {isEditable && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 transition-colors ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 whitespace-nowrap text-gray-900"
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === col.name ? (
                      <input
                        type="text"
                        defaultValue={row[col.name] ?? ''}
                        onBlur={(e) => handleCellEdit(rowIndex, col.name, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(rowIndex, col.name, e.target.value);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div
                        onClick={() => isEditable && setEditingCell({ row: rowIndex, col: col.name })}
                        className={isEditable ? 'cursor-text hover:bg-blue-50 px-2 py-1 rounded' : ''}
                      >
                        {row[col.name] ?? ''}
                      </div>
                    )}
                  </td>
                ))}
                {isEditable && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRowDelete && onRowDelete(rowIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

