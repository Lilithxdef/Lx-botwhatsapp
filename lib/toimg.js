const fs = require('fs')
const { exec } = require('child_process')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = async function toimg(sock, msg) {
  console.log('[TOIMG] Dipanggil')

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quoted?.stickerMessage) {
    return sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Balas stiker dengan perintah *.toimg*'
    }, { quoted: msg })
  }

  try {
    const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console })
    const webp = `./tmp/${Date.now()}.webp`
    const png = webp.replace('.webp', '.png')
    fs.writeFileSync(webp, buffer)

    exec(`dwebp ${webp} -o ${png}`, async (err) => {
      if (err) {
        console.log('[TOIMG] Error dwebp:', err)
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert stiker ke gambar.' }, { quoted: msg })
      }

      const result = fs.readFileSync(png)
      await sock.sendMessage(msg.key.remoteJid, {
        image: result,
        caption: '✅ Berhasil mengubah stiker ke gambar.'
      }, { quoted: msg })

      fs.unlinkSync(webp)
      fs.unlinkSync(png)
    })

  } catch (e) {
    console.log('[TOIMG] Error:', e)
    sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Terjadi kesalahan saat proses.'
    }, { quoted: msg })
  }
}
