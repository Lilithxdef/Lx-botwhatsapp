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
const fetch = require('node-fetch')

// Import fitur
const owner = require('./lib/owner')
const handleAutoResponse = require('./lib/autoresponse')
const menu = require('./lib/menu')
const play = require('./lib/play')
const ytmp3 = require('./lib/ytmp3')
const sticker = require('./lib/sticker')
const toimg = require('./lib/toimg')
const ai = require('./lib/ai')
const tiktokdl = require('./lib/tiktokdl')

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
      console.log('✅ Bot siap! Terhubung sebagai:', sock.user.id)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const type = Object.keys(msg.message)[0]
    const body = msg.message.conversation || msg.message[type]?.text || msg.message[type]?.caption || msg.message[type]?.message?.conversation || ''
    const isCmd = body.startsWith('.')
    const command = isCmd ? body.trim().split(/ +/).shift().toLowerCase() : ''
    const args = body.trim().split(/ +/).slice(1)

    // Log pesan
    console.log(`📩 ${isGroup ? 'Group' : 'Private'} from ${from}: ${body}`)

    // Auto Response
    await handleAutoResponse(sock, msg, from, isCmd)

    // Handler command
    if (isCmd) {
      if (command === '.menu') {
        await sock.sendMessage(from, { text: menu() }, { quoted: msg })
      } else if (command === '.play') {
        if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan judul atau link YouTube.' }, { quoted: msg })
        await play(sock, msg, args.join(' '))
      } else if (command === '.ytmp3') {
        if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link YouTube!' }, { quoted: msg })
        await ytmp3(sock, msg, args[0])
      } else if (command === '.tiktokdl') {
        if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan link TikTok!' }, { quoted: msg })
        await tiktokdl(sock, msg, args[0])
      } else if (command === '.sticker') {
        await sticker(sock, msg)
      } else if (command === '.ai') {
        if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukkan pertanyaan!' }, { quoted: msg })
        await ai(sock, msg, args.join(' '))
      } else if (command === '.ping') {
        const now = new Date().getTime()
        const latency = now - msg.messageTimestamp * 1000
        await sock.sendMessage(from, { text: `🏓 *Pong!*\n📶 Respon: *${latency} ms*` }, { quoted: msg })
      } else if (command === '.runtime') {
        const uptime = process.uptime()
        const pad = (s) => s.toString().padStart(2, '0')
        const h = Math.floor(uptime / 3600)
        const m = Math.floor((uptime % 3600) / 60)
        const d = Math.floor(h / 24)
        const format = `${d}d ${pad(h % 24)}h ${pad(m)}m`
        await sock.sendMessage(from, { text: `⏱ Runtime: ${format}` }, { quoted: msg })
      } else if (command === '.sc') {
        await sock.sendMessage(from, {
          text: `📦 *Source Code Lx-bot*\n\n📁 GitHub:\nhttps://github.com/lilithxdef\n\n🧠 Dibuat oleh *LilithXdef* menggunakan *Baileys*.\n📌 Jangan lupa kasih star kalau suka ya ⭐`
        }, { quoted: msg })
      } else if (command === '.owner') {
        await owner(sock, msg)
      }
    }
  })
}

startSock()

