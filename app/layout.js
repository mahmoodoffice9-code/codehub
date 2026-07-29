export const metadata = {
  title: 'CodeHub - AI Asset Marketplace',
  description: 'Buy and sell n8n workflows, Make scenarios, and Python bots',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
