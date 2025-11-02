"use client";

import { Download, Save, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export function DatasetToolbar({ 
  title, 
  accessLevel, 
  columns, 
  rows, 
  onSave, 
  onExportCSV, 
  onExportExcel,
  isEditable = false 
}) {
  function handleExportCSV() {
    if (onExportCSV) {
      onExportCSV();
      return;
    }

    // Default CSV export
    const csvData = rows.map(row => {
      const csvRow = {};
      columns.forEach(col => {
        csvRow[col.name] = row[col.name] ?? '';
      });
      return csvRow;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'dataset'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportExcel() {
    if (onExportExcel) {
      onExportExcel();
      return;
    }

    // Default Excel export
    const wsData = [
      columns.map(col => col.name),
      ...rows.map(row => columns.map(col => row[col.name] ?? ''))
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${title || 'dataset'}.xlsx`);
  }

  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${
              accessLevel === 'PRO'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {accessLevel}
            </span>
            <span className="text-xs text-gray-500">
              {rows.length} rows • {columns.length} columns
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <FileText className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
        {isEditable && onSave && (
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

