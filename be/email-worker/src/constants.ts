export function getTemplate(data:{
    username: string;
    notification: {
        message: string;
        email: string;
        balance: {
            usd_balance: number;
            locked_balance: number;
        };
        cta_link?: string;
    };
}): string {
	return `
    <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <style>
    body { background-color: #1e1e1e; color: #f1f1f1; font-family: Arial, sans-serif; padding: 20px; }
    .container { background-color: #2a2a2a; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; }
    h1 { color: #fff; }
    .highlight { color: #00ffcc; }
    .data-box { background-color: #333; padding: 10px; border-radius: 5px; font-family: monospace; }
    .button { display:inline-block; padding: 10px 20px; background-color:#00ffcc; color:#1e1e1e; text-decoration:none; font-weight:bold; border-radius:5px; margin-top:10px;}
  </style>
  </head>
  <body>
    <div class="container">
      <h1>Hello, <span class="highlight">${data.username}</span>!</h1>
      <p>${data.notification.message}</p>
      <div class="data-box">
        <strong>Email:</strong> ${data.notification.email}<br>
        <strong>Balance:</strong> $${data.notification.balance.usd_balance} (Locked: $${
		data.notification.balance.locked_balance
	})
      <a href="${data.notification.cta_link || "#"}" class="button">View Details</a>
    </div>
  </body>
  </html>`;
}
