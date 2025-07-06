const axios = require('axios')

module.exports = async function ai(prompt) {
  try {
    const res = await axios.post('https://gpt-gateway.vercel.app/api/gpt', {
      prompt: prompt
    })

    return res.data.response.trim()
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message)
    return '❌ Gagal mendapatkan jawaban dari AI (server gratis mungkin down).'
  }
}
