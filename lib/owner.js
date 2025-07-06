<<<<<<< HEAD
module.exports = () => {
  return `
👤 *Owner Bot*

• Nama: *Lilith Xdef*
• WhatsApp: wa.me/62881023683976
• GitHub: https://github.com/lilithxdef

Silakan hubungi jika ada bug, request fitur, atau kerja sama 💌
`
=======
module.exports = async (sock, msg) => {
  const number = '62881023683976' // Nomor owner (tanpa +)

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Lilith Xdef
ORG:Lx-bot
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`

  await sock.sendMessage(msg.key.remoteJid, {
    contacts: {
      displayName: 'Lilith Xdef',
      contacts: [
        { vcard }
      ]
    }
  }, { quoted: msg })
>>>>>>> b381d15 (🧠 Update)
}
