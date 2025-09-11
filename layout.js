// src/app/layout.js (server component)
export const metadata = {
  title: "DoNoGo - Fundraising DApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
