const axios = require('axios')

module.exports = async (conn, m, query) => {
  if (!query) return conn.sendMessage(m.key.remoteJid, { text: 'Contoh: .spotify judul lagu' }, { quoted: m })

  const search = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`) // pakai dummy API contoh
  const result = search.data?.data?.[0]
  if (!result) return conn.sendMessage(m.key.remoteJid, { text: 'Lagu tidak ditemukan 😔' }, { quoted: m })

  conn.sendMessage(m.key.remoteJid, { text: `🔎 Menemukan: *${result.title}*\nMencari audio...` }, { quoted: m })
  require('./play')(conn, m, result.title)
}
