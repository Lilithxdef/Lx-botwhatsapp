const autoReplyTimestamps = {}

const handleAutoResponse = async (sock, msg, from, isCmd) => {
  const isGroup = from.endsWith('@g.us')
  if (isGroup) return

  const now = Date.now()
  const last = autoReplyTimestamps[from] || 0
  const cooldown = 2 * 60 * 60 * 1000 // 2 jam

  if (!msg.key.fromMe && !isCmd && (now - last > cooldown)) {
    autoReplyTimestamps[from] = now

    // Hitung runtime
    const uptime = process.uptime()
    const pad = s => s.toString().padStart(2, '0')
    const h = Math.floor(uptime / 3600)
    const m = Math.floor((uptime % 3600) / 60)
    const d = Math.floor(h / 24)
    const runtime = `${d}d ${pad(h % 24)}h ${pad(m)}m`

    console.log('[AUTO-REPLY] Kirim teks ke', from)

    try {
      await sock.sendMessage(from, {
        text: `👋 Hai kak! Aku *Lx-bot*, asisten Lilith.

Aku sudah aktif selama: *${runtime}*

Kamu bisa pakai perintah ini:

• *.menu* — Lihat semua fitur
• *.owner* — Kontak owner bot

Kalau butuh sesuatu dengan ownerku tinggalkan pesan dibawah 👇
Semoga harimu menyenangkan 🌸🌼`
      }, { quoted: msg })
    } catch (err) {
      console.error('[AUTO-REPLY ERROR]', err)
    }
  }
}

module.exports = handleAutoResponse
