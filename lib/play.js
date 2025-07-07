const yts = require('yt-search')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (sock, m, text) => {
  const from = m.key.remoteJid
  const reply = (msg) => sock.sendMessage(from, { text: msg }, { quoted: m })

  if (!text) return reply('❌ Masukkan judul lagu atau link YouTube.')

  try {
    await reply('⏳ Sedang mencari lagu, mohon tunggu sekitar 30 detik...')

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return reply('❌ Video tidak ditemukan.')

    const url = video.url
    const title = video.title
    const id = Date.now()
    const tmpDir = path.join(__dirname, '../tmp')
    const filePath = path.join(tmpDir, `${id}.mp3`)

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const command = `yt-dlp -x --audio-format mp3 -o "${filePath}" "${url}"`
    exec(command, async (err) => {
      if (err) {
        console.error('❌ Error yt-dlp:', err)
        return reply('❌ Gagal mendownload audio.')
      }

      if (!fs.existsSync(filePath)) return reply('❌ File audio tidak ditemukan.')

      await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mp4',
        ptt: false,
        caption: `🎵 ${title}`
      }, { quoted: m })

      fs.unlinkSync(filePath)
    })
  } catch (err) {
    console.error('❌ Error di .play:', err)
    return reply('❌ Terjadi kesalahan saat memproses lagu.')
  }
}
