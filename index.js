const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const qrcode = require('qrcode-terminal')

// Import fitur
const menu = require('./lib/menu')
const play = require('./lib/play')
const sticker = require('./lib/sticker')
// Tambahan fitur lain di sini (spotify, qc, brat, dll)

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion().then(res => res.version),
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['Ubuntu', 'Firefox', '120.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('📲 Scan QR berikut:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      console.log('❌ Koneksi terputus.')
      console.log('📛 Detail error:', lastDisconnect?.error)

      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('✅ Bot siap! Selamat datang owner!!  Terhubung sebagai:', sock.user.id)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const type = Object.keys(msg.message)[0]
    const body = msg.message.conversation || msg.message[type]?.text || msg.message[type]?.caption || ''
    const command = body.startsWith('.') ? body.trim().split(/ +/).shift().toLowerCase() : ''
    const args = body.trim().split(/ +/).slice(1)

    // Log pesan masuk
    console.log(`📩 ${isGroup ? 'Group' : 'Private'} from ${from}: ${body}`)

    // Handler
    if (command === '.menu') {
      await sock.sendMessage(from, { text: menu() }, { quoted: msg })
    } else if (command === '.play') {
      if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan judul atau link YouTube.' }, { quoted: msg })
      await play(sock, msg, args.join(' '))
   
 } else if (command === '.sc') {
    try {
        await sock.sendMessage(from, {
            text: `📦 *Source Code Lx-bot*\n\n📁 GitHub:\nhttps://github.com/lilithxdef\n\n🧠 Dibuat oleh *LilithXdef* menggunakan *Baileys*.\n📌 Jangan lupa kasih star kalau suka ya ⭐`
        }, { quoted: msg })
    } catch (e) {
        console.error('❌ Error saat mengirim .sc:', e)
        await sock.sendMessage(from, {
            text: '⚠️ Gagal mengirim source code. Coba lagi nanti.'
        }, { quoted: msg })
    }
} else if (command === '.ping') {
    const now = new Date().getTime()
    const latency = now - msg.messageTimestamp * 1000 // konversi detik ke ms

    await sock.sendMessage(from, {
        text: `🏓 *Pong!*\n📶 Respon: *${latency} ms*`,
    }, { quoted: msg })
} else if (command === '.sticker') {
      await sticker(sock, msg)
    }

    // Tambahan lain:
    // else if (command === '.spotify') { ... }
  })
}

startSock()
