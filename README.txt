THE POCKET BAZAAR – static site (HTML + CSS + JS)
Run: open index.html in a browser (internet needed once for the QR library on cdnjs),
or host the folder free on Netlify / GitHub Pages / Vercel.
Edit app.js -> CONFIG (UPI ID, delivery charge, WhatsApp number, contact) and PRODUCTS (names, stock, category).
To add a product: put image in /images and add a line to PRODUCTS.
images/upi-qr-original.jpg is your uploaded QR (not used by the site, kept for reference).

IMPORTANT LIMITS (no backend):
- Orders/cart are saved only in the customer's own browser (localStorage). You, the seller, cannot see them.
  Customers send payment proof to you via WhatsApp (set CONFIG.whatsapp). You verify payment in your UPI app, then confirm manually.
- Track Order works only on the device that placed the order, and status won't change on its own.
- No secure admin dashboard is possible without a server. For real orders, move to a backend (Supabase / Firebase).
- Verify your UPI ID with a Rs 1 test payment before going live.
