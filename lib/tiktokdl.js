const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async function tiktokdl(sock, msg, text) {
  const from = msg.key.remoteJid
  const quoted = msg
  const tmpPath = './tmp'
  const filename = path.join(tmpPath, 'tiktok.mp4')

  if (!text || !text.includes('tiktok.com')) {
    return await sock.sendMessage(from, { text: '❌ Kirim link TikTok yang valid!' }, { quoted })
  }

  try {
    // Hapus file lama
    if (fs.existsSync(filename)) fs.unlinkSync(filename)

    // Pastikan folder tmp ada
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath)

    // Jalankan yt-dlp
    const command = `yt-dlp -o "${filename}" "${text}"`
    await new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err) return reject(stderr || stdout)
        resolve(stdout)
      })
    })

    // Kirim hasil
    const buffer = fs.readFileSync(filename)
    await sock.sendMessage(from, {
      video: buffer,
      caption: '✅ Berhasil unduh video TikTok!'
    }, { quoted })

    // Hapus setelah dikirim
    fs.unlinkSync(filename)
  } catch (err) {
    console.error('[TIKTOKDL ERROR]', err)
    await sock.sendMessage(from, { text: '❌ Gagal unduh video TikTok.' }, { quoted })
  }
}
