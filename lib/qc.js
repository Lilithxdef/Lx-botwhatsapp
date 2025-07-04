const axios = require('axios')
const { writeFileSync } = require('fs')

module.exports = async (conn, m, text) => {
  if (!text) return conn.sendMessage(m.key.remoteJid, { text: 'Contoh: .qc Halo saya bot' }, { quoted: m })

  const name = m.pushName || 'Pengguna'
  const res = await axios.get(`https://lxapi.xyz/qc?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}`, {
    responseType: 'arraybuffer'
  })

  await conn.sendMessage(m.key.remoteJid, { sticker: res.data }, { quoted: m })
}
