const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (sock, msg) => {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const mime = quoted
      ? Object.keys(quoted)[0]
      : Object.keys(msg.message)[0]

    if (!/image/.test(mime)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Kirim atau reply gambar dengan caption .sticker',
      }, { quoted: msg })
    }

    const media = quoted ? quoted : msg.message
    const buffer = await downloadMediaMessage(
      { message: media },
      'buffer',
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    )

    const id = Date.now()
    const inputPath = path.join(__dirname, `../tmp/${id}.jpg`)
    const outputPath = path.join(__dirname, `../tmp/${id}.webp`)

    fs.writeFileSync(inputPath, buffer)

    // Convert gambar ke webp (sticker)
    exec(`ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease" -vcodec libwebp -lossless 1 -q:v 50 -preset default -loop 0 -an -vsync 0 ${outputPath}`, async (err) => {
      if (err) {
        console.error('❌ ffmpeg error:', err)
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal konversi stiker.' }, { quoted: msg })
      }

      await sock.sendMessage(msg.key.remoteJid, {
        sticker: fs.readFileSync(outputPath)
      }, { quoted: msg })

      // bersihkan file
      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)
    })

  } catch (err) {
    console.error('❌ Error sticker handler:', err)
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Gagal membuat stiker.'
    }, { quoted: msg })
  }
}
