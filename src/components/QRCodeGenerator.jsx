import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

const QRCodeGenerator = ({ value, size = 200 }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        imageSettings={{
          src: '/favicon.svg',
          height: 24,
          width: 24,
          excavate: true,
        }}
      />
    </div>
  )
}

export default QRCodeGenerator
