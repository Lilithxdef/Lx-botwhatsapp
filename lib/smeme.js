const axios = require('axios')
const { writeFileSync } = require('fs')
const FormData = require('form-data')

module.exports = async (conn, m, teks) => {
  let q = m.message?.imageMessage
  if (!q) return conn.sendMessage(m.key.remoteJid, { text: 'Reply gambar dengan .smeme teks1|teks2' }, { quoted: m })

  const [atas, bawah] = teks.split('|')
  const img = await conn.downloadMediaMessage(m)

  const form = new FormData()
  form.append('image', img, { filename: 'image.jpg' })
  form.append('top', atas || '')
  form.append('bottom', bawah || '')

  const res = await axios.post('https://api.memegen.link/images/custom', form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer'
  })

  await conn.sendMessage(m.key.remoteJid, { sticker: res.data }, { quoted: m })
}
