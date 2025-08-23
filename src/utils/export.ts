import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GridColumn, ExportOptions } from '@/types';

// Build local timestamp suffix like 20250823_140845
const buildTimestampSuffix = (): string => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  // 12-hour format with AM/PM
  const h24 = d.getHours();
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hh = pad(h12);
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}${period}`;
};

export const exportToCSV = (data: any[], columns: GridColumn[], options: ExportOptions) => {
  const headers = columns.map(col => col.headerName);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.field];
      if (col.type === 'currency') {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }
      if (col.type === 'date') {
        return value ? new Date(value).toLocaleDateString() : '';
      }
      return value || '';
    })
  );

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const stampedName = `${options.filename}_${buildTimestampSuffix()}`;
  link.setAttribute('download', `${stampedName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: any[], columns: GridColumn[], options: ExportOptions) => {
  const headers = columns.map(col => col.headerName);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.field];
      if (col.type === 'currency') {
        return typeof value === 'number' ? value : 0;
      }
      if (col.type === 'date') {
        return value ? new Date(value) : '';
      }
      return value || '';
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths
  const colWidths = columns.map(col => ({ wch: Math.max(col.headerName.length, 15) }));
  worksheet['!cols'] = colWidths;

  // Format currency columns
  columns.forEach((col, index) => {
    if (col.type === 'currency') {
      for (let row = 1; row <= data.length; row++) {
        const cellAddress = XLSX.utils.encode_cell({ c: index, r: row });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = '"₹"#,##0.00';
        }
      }
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  const stampedName = `${options.filename}_${buildTimestampSuffix()}`;
  XLSX.writeFile(workbook, `${stampedName}.xlsx`);
};

export const exportToPDF = (data: any[], columns: GridColumn[], options: ExportOptions) => {
  const doc = new jsPDF();
  
  // Add title
  if (options.title) {
    doc.setFontSize(16);
    doc.text(options.title, 14, 20);
  }

  // Prepare table data
  const headers = columns.map(col => col.headerName);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.field];
      if (col.type === 'currency') {
        return typeof value === 'number' ? `₹${value.toFixed(2)}` : value;
      }
      if (col.type === 'date') {
        return value ? new Date(value).toLocaleDateString() : '';
      }
      return value?.toString() || '';
    })
  );

  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: options.title ? 30 : 20,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.type === 'currency') {
        acc[index] = { halign: 'right' };
      }
      return acc;
    }, {} as any),
  });

  const stampedName = `${options.filename}_${buildTimestampSuffix()}`;
  doc.save(`${stampedName}.pdf`);
};
