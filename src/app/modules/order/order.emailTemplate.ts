// export const orderConfirmationTemplate = ({
//   customerName,
//   orderNumber,
//   totalAmount,
//   shopName,
//   shopAddress,
//   shopPhone,
//   receiptUrl,
// }: {
//   customerName: string;
//   orderNumber: string;
//   totalAmount: number;
//   shopName: string;
//   shopAddress: string;
//   shopPhone: string;
//   receiptUrl?: string;
// }) => {
//   return `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
//     <h2>Hello, ${customerName || "Customer"}</h2>

//     <p>
//       Great news! We have received your order and our team is getting everything ready for you.
//       We will update you as soon as your order status changes.
//     </p>

//     <p><strong>Shop Name:</strong> ${shopName}</p>
//     <p><strong>Shop Address:</strong> ${shopAddress}</p>
//     <p><strong>Shop Number:</strong> ${shopPhone}</p>
//     <p><strong>Order Number:</strong> ${orderNumber}</p>
//     <p><strong>Total Amount:</strong> ৳${totalAmount}</p>

//     ${
//       receiptUrl
//         ? `
//       <div style="margin: 30px 0;">
//         <a href="${receiptUrl}" 
//            style="background: #0d6efd; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
//           View Receipt
//         </a>
//       </div>
//     `
//         : ""
//     }

//     <p>
//       Thank you for choosing ${shopName}. If you have any questions or need further assistance,
//       feel free to contact us.
//     </p>
//   </div>
//   `;
// };

























type OrderEmailItem = {
  productTitle: string;
  productImage?: string;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export const orderConfirmationTemplate = ({
  customerName,
  orderNumber,
  orderDate,
  totalAmount,
  subtotal,
  deliveryCharge,
  discountAmount,
  paymentMethod,
  paymentStatus,
  addressLine,
  city,
  area,
  note,
  shopName,
  shopAddress,
  shopPhone,
  receiptUrl,
  items,
}: {
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  addressLine: string;
  city?: string;
  area?: string;
  note?: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  receiptUrl?: string;
  items: OrderEmailItem[];
}) => {
  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            ${
              item.productImage
                ? `<img src="${item.productImage}" alt="${item.productTitle}" width="60" height="60" style="width:60px;height:60px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;display:block;" />`
                : `<div style="width:60px;height:60px;border-radius:8px;background:#f3f4f6;border:1px solid #e5e7eb;"></div>`
            }

            <div style="font-family: Arial, sans-serif;">
              <p style="margin:0 0 6px 0; font-size:14px; font-weight:700; color:#111827;">
                ${item.productTitle}
              </p>

              ${
                item.selectedColor || item.selectedSize
                  ? `
                  <p style="margin:0; font-size:12px; color:#6b7280; line-height:1.6;">
                    ${item.selectedColor ? `Color: ${item.selectedColor}` : ""}
                    ${
                      item.selectedColor && item.selectedSize ? "&nbsp; | &nbsp;" : ""
                    }
                    ${item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                  </p>
                `
                  : ""
              }

              <p style="margin:6px 0 0 0; font-size:12px; color:#6b7280;">
                Unit Price: ${formatCurrency(item.unitPrice)}
              </p>
            </div>
          </div>
        </td>

        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size:14px; color:#111827; text-align:center; vertical-align: top;">
          ${item.quantity}
        </td>

        <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size:14px; font-weight:700; color:#111827; text-align:right; vertical-align: top;">
          ${formatCurrency(item.lineTotal)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <div style="max-width:700px; margin:0 auto; padding:32px 16px;">
      
      <div style="background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #111827, #1f2937); padding:32px 24px; text-align:center;">
          <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">${shopName}</h1>
          <p style="margin:10px 0 0 0; font-size:14px; color:#d1d5db;">
            Order Confirmation
          </p>
        </div>

        <!-- Intro -->
        <div style="padding:32px 24px 20px 24px;">
          <h2 style="margin:0 0 14px 0; font-size:26px; color:#111827;">
            Hello, ${customerName || "Customer"} 👋
          </h2>

          <p style="margin:0; font-size:15px; line-height:1.8; color:#4b5563;">
            Great news! We have successfully received your order and our team is now preparing it.
            You will be updated as soon as your order status changes.
          </p>
        </div>

        <!-- Order Summary Box -->
        <div style="padding:0 24px 24px 24px;">
          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Order Number</td>
                <td style="padding:6px 0; font-size:14px; color:#111827; font-weight:700; text-align:right;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Order Date</td>
                <td style="padding:6px 0; font-size:14px; color:#111827; text-align:right;">${orderDate || "-"}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Payment Method</td>
                <td style="padding:6px 0; font-size:14px; color:#111827; text-align:right;">${paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Payment Status</td>
                <td style="padding:6px 0; font-size:14px; color:#111827; text-align:right;">${paymentStatus}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Delivery Address</td>
                <td style="padding:6px 0; font-size:14px; color:#111827; text-align:right;">
                  ${addressLine}
                  ${area ? `, ${area}` : ""}
                  ${city ? `, ${city}` : ""}
                </td>
              </tr>
              ${
                note
                  ? `
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#6b7280;">Customer Note</td>
                  <td style="padding:6px 0; font-size:14px; color:#111827; text-align:right;">${note}</td>
                </tr>
              `
                  : ""
              }
            </table>
          </div>
        </div>

        <!-- Items -->
        <div style="padding:0 24px 24px 24px;">
          <h3 style="margin:0 0 14px 0; font-size:18px; color:#111827;">Ordered Items</h3>

          <div style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:14px 12px; text-align:left; font-size:13px; color:#374151; border-bottom:1px solid #e5e7eb;">Product</th>
                  <th style="padding:14px 12px; text-align:center; font-size:13px; color:#374151; border-bottom:1px solid #e5e7eb;">Qty</th>
                  <th style="padding:14px 12px; text-align:right; font-size:13px; color:#374151; border-bottom:1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div style="padding:0 24px 24px 24px;">
          <div style="margin-left:auto; max-width:320px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#6b7280;">Subtotal</td>
                <td style="padding:8px 0; font-size:14px; color:#111827; text-align:right;">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#6b7280;">Delivery Charge</td>
                <td style="padding:8px 0; font-size:14px; color:#111827; text-align:right;">${formatCurrency(deliveryCharge)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#6b7280;">Discount</td>
                <td style="padding:8px 0; font-size:14px; color:#111827; text-align:right;">-${formatCurrency(discountAmount || 0)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:6px 0;">
                  <div style="height:1px; background:#e5e7eb;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0 0 0; font-size:16px; color:#111827; font-weight:700;">Total</td>
                <td style="padding:10px 0 0 0; font-size:18px; color:#111827; font-weight:700; text-align:right;">${formatCurrency(totalAmount)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Button -->
        ${
          receiptUrl
            ? `
          <div style="padding:0 24px 28px 24px; text-align:center;">
            <a href="${receiptUrl}" 
              style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:14px 28px; border-radius:10px;">
              View Order Details
            </a>
          </div>
        `
            : ""
        }

        <!-- Footer -->
        <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:24px;">
          <p style="margin:0 0 10px 0; font-size:14px; color:#111827; font-weight:700;">
            Need help?
          </p>
          <p style="margin:0; font-size:14px; line-height:1.8; color:#6b7280;">
            Thank you for choosing ${shopName}. If you have any questions or need further assistance,
            feel free to contact us.
          </p>

          <div style="margin-top:16px; font-size:13px; color:#6b7280; line-height:1.8;">
            <div><strong>Shop Name:</strong> ${shopName}</div>
            <div><strong>Address:</strong> ${shopAddress}</div>
            <div><strong>Phone:</strong> ${shopPhone}</div>
          </div>
        </div>

      </div>
    </div>
  </div>
  `;
};