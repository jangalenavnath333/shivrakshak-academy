'use client'

import { FileSpreadsheet, Printer } from 'lucide-react'

type ExportButtonsProps = {
  data: Record<string, string | number>[]
  filename: string
  title: string
}

export default function ExportButtons({ data, filename, title }: ExportButtonsProps) {
  
  const handleExportCSV = () => {
    if (!data || data.length === 0) return alert('No data to export')
    
    const headersList = Object.keys(data[0])
    // Header row
    const headers = headersList.map(h => `"${h.replace(/"/g, '""')}"`).join(',')
    
    // Data rows
    const rows = data.map(row => {
      return headersList.map(h => {
        const value = row[h]
        const strValue = value === null || value === undefined ? '' : String(value)
        return `"${strValue.replace(/"/g, '""')}"`
      }).join(',')
    })
    
    const csvContent = [headers, ...rows].join('\n')
    
    // Add UTF-8 BOM for Excel Marathi support
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    if (!data || data.length === 0) return alert('No data to print')
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return alert('Pop-ups are blocked. Please allow pop-ups to print.')
    
    const headersList = Object.keys(data[0])
    const tableHeaders = headersList.map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">${h}</th>`).join('')
    const tableRows = data.map(row => {
      const cells = headersList.map(h => {
        const value = row[h]
        return `<td style="border: 1px solid #ddd; padding: 8px;">${value === null || value === undefined ? '' : value}</td>`
      }).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    const html = `
      <!DOCTYPE html>
      <html lang="mr">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          @media print {
            body { margin: 0; }
            button { display: none; }
            @page { margin: 1cm; size: A4 landscape; }
          }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `
    
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button type="button" onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
        <FileSpreadsheet size={15} style={{ marginRight: '6px' }} /> Excel
      </button>
      <button type="button" onClick={handlePrint} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
        <Printer size={15} style={{ marginRight: '6px' }} /> Print / PDF / Word
      </button>
    </div>
  )
}
