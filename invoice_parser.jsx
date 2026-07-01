import React, { useState, useRef } from 'react';
import { Upload, X, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function InvoiceParser() {
  const [invoices, setInvoices] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      // Call Claude API to extract data
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: `Extract invoice data from this image. Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "invoiceDate": "YYYY-MM-DD",
  "invoiceNumber": "string",
  "dealership": "string",
  "totalAmount": "number",
  "items": [
    {
      "partName": "string",
      "quantity": "number",
      "unitPrice": "number",
      "total": "number"
    }
  ]
}

If field is unknown, use null. Be accurate.`,
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();
      const content = result.content[0].text;

      // Parse JSON response
      const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanJson);

      setExtractedData(data);
    } catch (error) {
      console.error('Error processing invoice:', error);
      alert('Failed to process invoice. Please try again.');
    }

    setIsProcessing(false);
  };

  const addToList = () => {
    if (!extractedData) return;

    const newInvoice = {
      id: Date.now(),
      date: extractedData.invoiceDate || new Date().toISOString().split('T')[0],
      number: extractedData.invoiceNumber || 'N/A',
      dealership: extractedData.dealership || 'Unknown',
      total: extractedData.totalAmount || 0,
      items: extractedData.items || [],
    };

    setInvoices([...invoices, newInvoice]);
    setExtractedData(null);
    setUploadedFile(null);
    fileInputRef.current?.click();
  };

  const removeInvoice = (id) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const exportToCSV = () => {
    let csv = 'Invoice Date,Invoice #,Dealership,Part Name,Quantity,Unit Price,Total\n';

    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        csv += `${inv.date},"${inv.number}","${inv.dealership}","${item.partName}",${item.quantity},"$${item.unitPrice}","$${item.total}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Invoice Parser</h1>
          <p className="text-purple-300">Upload invoice photos/PDFs and extract data automatically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Box */}
            <div
              className="border-2 border-dashed border-purple-400 rounded-xl p-8 bg-purple-900/20 cursor-pointer hover:bg-purple-900/40 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Upload Invoice</p>
                <p className="text-purple-300 text-sm">Click to upload invoice photo or PDF</p>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 text-center">
                <div className="inline-block animate-spin mb-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-blue-200 rounded-full"></div>
                </div>
                <p className="text-blue-300">Processing invoice...</p>
              </div>
            )}

            {/* Extracted Data */}
            {extractedData && !isProcessing && (
              <div className="bg-emerald-900/30 border border-emerald-500 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-emerald-300 font-semibold text-lg mb-2">Extracted Data</h3>
                    <p className="text-emerald-400 text-sm">Review and confirm before adding</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">INVOICE DATE</p>
                    <p className="text-white">{extractedData.invoiceDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">INVOICE #</p>
                    <p className="text-white">{extractedData.invoiceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">DEALERSHIP</p>
                    <p className="text-white">{extractedData.dealership || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">TOTAL AMOUNT</p>
                    <p className="text-white">${extractedData.totalAmount || '0.00'}</p>
                  </div>
                </div>

                {extractedData.items && extractedData.items.length > 0 && (
                  <div className="mb-6">
                    <p className="text-emerald-300 text-xs font-semibold mb-3">ITEMS</p>
                    <div className="bg-black/30 rounded p-4 max-h-48 overflow-y-auto">
                      {extractedData.items.map((item, idx) => (
                        <div key={idx} className="text-white text-sm mb-3 pb-3 border-b border-emerald-800 last:border-b-0">
                          <p className="font-medium">{item.partName}</p>
                          <p className="text-emerald-400">
                            Qty: {item.quantity} × ${item.unitPrice} = ${item.total}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={addToList}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Add to Invoice List
                </button>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-6">
              <p className="text-purple-300 text-sm font-semibold mb-2">INVOICES PROCESSED</p>
              <p className="text-4xl font-bold text-white">{invoices.length}</p>
            </div>

            {/* Total */}
            {invoices.length > 0 && (
              <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-6">
                <p className="text-orange-300 text-sm font-semibold mb-2">TOTAL VALUE</p>
                <p className="text-3xl font-bold text-white">
                  ${invoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toFixed(2)}
                </p>
              </div>
            )}

            {/* Export Button */}
            {invoices.length > 0 && (
              <button
                onClick={exportToCSV}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Processed Invoices</h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-semibold text-lg">{invoice.dealership}</p>
                      <p className="text-slate-400 text-sm">
                        Invoice #{invoice.number} • {invoice.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">${invoice.total.toFixed(2)}</p>
                      <button
                        onClick={() => removeInvoice(invoice.id)}
                        className="text-red-400 hover:text-red-300 transition mt-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {invoice.items && invoice.items.length > 0 && (
                    <div className="bg-black/30 rounded p-4 text-sm">
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300 py-1">
                          <span>{item.partName} (×{item.quantity})</span>
                          <span>${item.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {invoices.length === 0 && !extractedData && !isProcessing && (
          <div className="mt-12 text-center py-12 border-2 border-dashed border-purple-500 rounded-lg bg-purple-900/20">
            <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">No invoices yet. Start by uploading an invoice photo or PDF.</p>
          </div>
        )}
      </div>
    </div>
  );
}
