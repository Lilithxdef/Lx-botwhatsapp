
const axios = require('axios');

async function getTiktok(url) {
  try {
    const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
    if (!res.data || !res.data.data) return null;
    return {
      video: res.data.data.play,
      desc: res.data.data.title
    };
  } catch (e) {
    console.error('❌ TikTok error:', e);
    return null;
  }
}

module.exports = { getTiktok };
