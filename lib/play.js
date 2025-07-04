const yts = require('yt-search')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (sock, m, text) => {
  try {
    const reply = (txt) => sock.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
    if (!text) return reply('Contoh: .play judul lagu')

    await reply('⏳ Tunggu sebentar, sedang mencari lagu...')

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return reply('🎵 Video tidak ditemukan.')

    const url = video.url
    const title = video.title
    const id = Date.now()
    const file = path.join(__dirname, `../tmp/${id}.mp3`)

    const command = `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`

    exec(command, async (err) => {
      if (err) {
        console.error('❌ Error yt-dlp:', err)
        return reply('❌ Gagal mendownload audio.')
      }

      if (!fs.existsSync(file)) {
        return reply('❌ File tidak ditemukan setelah download.')
      }

      await sock.sendMessage(m.key.remoteJid, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mp4',
        ptt: false,
        caption: `🎵 ${title}`
      }, { quoted: m })

      fs.unlinkSync(file)
    })

  } catch (err) {
    console.error('❌ Error di .play:', err)
    await sock.sendMessage(m.key.remoteJid, { text: '❌ Terjadi kesalahan saat memproses lagu.' }, { quoted: m })
  }
}
