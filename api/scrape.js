const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function (req, res) {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl) {
      return res.status(400).json({ error: 'Chybí parametr "url".' });
    }

    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith('https://www.cedok.cz/')) {
      return res.status(400).json({ error: 'URL musí začínat na https://www.cedok.cz/' });
    }

    const response = await axios.get(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || null;

    const h1 = $('h1').map((i, el) => $(el).text()).get();
    const h2 = $('h2').map((i, el) => $(el).text()).get();
    const h3 = $('h3').map((i, el) => $(el).text()).get();

    const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5); // jen prvních 5 odstavců

    return res.status(200).json({
      originalUrl: decodedUrl,
      title,
      metaDescription,
      headings: {
        h1,
        h2,
        h3
      },
      paragraphs
    });

  } catch (err) {
    console.error('Chyba:', err.message);
    return res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};
