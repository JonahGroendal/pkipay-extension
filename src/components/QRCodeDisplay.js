import React from 'react'
import QRCode from 'qrcode'

function QRCodeDisplay({ text }) {
  const qrCodeUrl = useQrCodeGenerator(text)
  return (
    <img src={qrCodeUrl} alt='' />
  )
}

function useQrCodeGenerator(text) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState('')

  React.useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, { scale: 8, margin: 0 }, function (err, url) {
        if (err)
          throw new Error(err)
        setQrCodeUrl(url)
      })
    }
  }, [text])

  return qrCodeUrl
}

export default QRCodeDisplay
