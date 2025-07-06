const yts = require('yt-search')
<<<<<<< HEAD
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (sock, m, text) => {
  try {
    const reply = (txt) => sock.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
    if (!text) return reply('Contoh: .play judul lagu')

    await reply('⏳ Tunggu sebentar, sedang mencari lagu...')
=======
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = async function play(sock, m, text) {
  const from = m.key.remoteJid
  const quoted = m
  const reply = (msg) => sock.sendMessage(from, { text: msg }, { quoted })

  if (!text) return reply('❌ Masukkan judul lagu atau link YouTube.')

  try {
    // Kirim pesan 'waiting...'
    await reply('⏳ Sedang mencari lagu, membutuhkan sekitar 30detik\n\nmohon tunggu sebentar...')
>>>>>>> b381d15 (🧠 Update)

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return reply('🎵 Video tidak ditemukan.')

    const url = video.url
    const title = video.title
    const id = Date.now()
<<<<<<< HEAD
    const file = path.join(__dirname, `../tmp/${id}.mp3`)

    const command = `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`

=======
    const tmp = './tmp'
    const file = path.join(tmp, `${id}.mp3`)

    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

    const command = `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`
>>>>>>> b381d15 (🧠 Update)
    exec(command, async (err) => {
      if (err) {
        console.error('❌ Error yt-dlp:', err)
        return reply('❌ Gagal mendownload audio.')
      }

      if (!fs.existsSync(file)) {
        return reply('❌ File tidak ditemukan setelah download.')
      }

<<<<<<< HEAD
      await sock.sendMessage(m.key.remoteJid, {
=======
      await sock.sendMessage(from, {
>>>>>>> b381d15 (🧠 Update)
        audio: fs.readFileSync(file),
        mimetype: 'audio/mp4',
        ptt: false,
        caption: `🎵 ${title}`
<<<<<<< HEAD
      }, { quoted: m })

      fs.unlinkSync(file)
    })

  } catch (err) {
    console.error('❌ Error di .play:', err)
    await sock.sendMessage(m.key.remoteJid, { text: '❌ Terjadi kesalahan saat memproses lagu.' }, { quoted: m })
=======
      }, { quoted })

      fs.unlinkSync(file)
    })
  } catch (err) {
    console.error('❌ Error di .play:', err)
    return reply('❌ Terjadi kesalahan saat memproses lagu.')
>>>>>>> b381d15 (🧠 Update)
  }
}
