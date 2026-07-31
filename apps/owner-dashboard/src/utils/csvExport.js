export function exportOrdersCSV(orders, filename = 'panache-orders.csv') {
  const headers = [
    'Order ID',
    'Date',
    'Time',
    'Guest Name',
    'Phone',
    'Service Type',
    'Room',
    'Items',
    'Total',
    'Status',
  ];

  const rows = orders.map((o) => {
    const dt = new Date(o.created_at);
    const items = (o.items || [])
      .map((i) => `${i.qty}x ${i.name}`)
      .join('; ');

    return [
      o.id.slice(0, 8).toUpperCase(),
      dt.toLocaleDateString('en-IN'),
      dt.toLocaleTimeString('en-IN'),
      o.guest_name,
      o.guest_phone,
      o.service_type,
      o.room_number || '',
      items,
      o.total,
      o.status,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportEODCSV(report) {
  exportOrdersCSV(report.orders, `panache-eod-${report.date}.csv`);
}
