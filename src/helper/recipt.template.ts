export const buildReceiptHtml = (order: any) => {
  const rows = order.items
    .map(
      (item: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.productTitle}</td>
          <td>${item.selectedColor || "-"}</td>
          <td>${item.selectedSize || "-"}</td>
          <td>${item.quantity}</td>
          <td>৳${item.unitPrice}</td>
          <td>৳${item.lineTotal}</td>
        </tr>
      `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Receipt - ${order.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #111;
          font-size: 14px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          border-bottom: 2px solid #222;
          padding-bottom: 12px;
        }
        .title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .muted {
          color: #555;
        }
        .section {
          margin-top: 20px;
        }
        .box {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 14px;
          margin-top: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          vertical-align: middle;
        }
        th {
          background: #f5f5f5;
        }
        .summary {
          width: 320px;
          margin-left: auto;
          margin-top: 20px;
        }
        .summary td {
          border: none;
          padding: 6px 0;
        }
        .right {
          text-align: right;
        }
        .footer {
          margin-top: 28px;
          font-size: 12px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">Order Receipt</div>
          <div class="muted">Order Number: ${order.orderNumber}</div>
          <div class="muted">Date: ${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <div><strong>Courier:</strong> ${order.courierProvider || "-"}</div>
          <div><strong>Tracking:</strong> ${order.trackingCode || "-"}</div>
          <div><strong>Consignment:</strong> ${order.consignmentId || "-"}</div>
        </div>
      </div>

      <div class="section">
        <strong>Customer Information</strong>
        <div class="box">
          <div><strong>Name:</strong> ${order.fullName}</div>
          <div><strong>Phone:</strong> ${order.phone}</div>
          <div><strong>Email:</strong> ${order.email || "-"}</div>
          <div><strong>Address:</strong> ${[
            order.addressLine,
            order.area,
            order.city,
            order.country,
          ]
            .filter(Boolean)
            .join(", ")}</div>
        </div>
      </div>

      <div class="section">
        <strong>Order Items</strong>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Color</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <table class="summary">
        <tr>
          <td>Subtotal</td>
          <td class="right">৳${order.subtotal}</td>
        </tr>
        <tr>
          <td>Delivery Charge</td>
          <td class="right">৳${order.deliveryCharge}</td>
        </tr>
        <tr>
          <td><strong>Total Amount</strong></td>
          <td class="right"><strong>৳${order.totalAmount}</strong></td>
        </tr>
        <tr>
          <td>Payment Method</td>
          <td class="right">${order.paymentMethod}</td>
        </tr>
        <tr>
          <td>Payment Status</td>
          <td class="right">${order.paymentStatus}</td>
        </tr>
      </table>

      <div class="footer">
        This is an auto-generated receipt for shipment confirmation.
      </div>
    </body>
  </html>
  `;
};