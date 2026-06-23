import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Reusable Export Button component
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions: { header: 'Name', dataKey: 'name' }
 * @param {String} filename - Base name for the exported file
 */
const ExportButton = ({ data, columns, filename = 'export' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prepareData = () => {
    return data.map(item => {
      const row = {};
      columns.forEach(col => {
        // Handle nested paths like 'student.personalDetails.fullName'
        const value = col.dataKey.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', item);
        row[col.header] = value;
      });
      return row;
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = prepareData();
    const headers = columns.map(col => col.header);
    
    // Convert object rows to array of values in header order
    const body = tableData.map(row => headers.map(h => row[h]));

    doc.setFontSize(16);
    doc.text(filename.replace(/_/g, ' ').toUpperCase(), 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    doc.autoTable({
      head: [headers],
      body: body,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] } // Brand color
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsOpen(false);
  };

  const exportToExcel = () => {
    const tableData = prepareData();
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Auto-adjust column widths
    const maxWidths = columns.map(col => Math.max(
      col.header.length,
      ...tableData.map(row => String(row[col.header] || '').length)
    ));
    worksheet['!cols'] = maxWidths.map(w => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!data || data.length === 0}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-700 dark:bg-dark-900 dark:text-slate-200 dark:hover:bg-dark-800"
      >
        <Download size={16} />
        Export
        <ChevronDown size={14} className="ml-1 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-900 z-10">
          <button
            onClick={exportToPDF}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-dark-800"
          >
            <FileText size={16} className="text-red-500" />
            Download PDF
          </button>
          <div className="h-px bg-slate-100 dark:bg-dark-800"></div>
          <button
            onClick={exportToExcel}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-dark-800"
          >
            <FileSpreadsheet size={16} className="text-green-500" />
            Download Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
