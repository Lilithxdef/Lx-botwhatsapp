module.exports = async (sock, msg) => {
  const contactMessage = {
    contacts: {
      displayName: 'Owner',
      contacts: [
        {
          displayName: 'Lilith Xdef',
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:Lilith Xdef
TEL;type=CELL;type=VOICE;waid=62881023683976:+62 881-0236-83976
END:VCARD`
        }
      ]
    }
  }

  await sock.sendMessage(msg.key.remoteJid, contactMessage, { quoted: msg })
}
