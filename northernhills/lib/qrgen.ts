// lib/qrgen.ts
import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    // Returns base64 data URL
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a0a2e',
        light: '#ffffff'
      }
    })
    return qrDataURL
  } catch (err) {
    console.error('QR generation failed:', err)
    throw new Error('Failed to generate QR code')
  }
}

export async function generateQRBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 300,
      margin: 2
    })
    return buffer
  } catch (err) {
    console.error('QR buffer generation failed:', err)
    throw new Error('Failed to generate QR buffer')
  }
}