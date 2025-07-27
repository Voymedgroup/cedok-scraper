const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('cedok.cz')) {
    return res.status(400).json({ error: 'URL musí být z domény www.cedok.cz' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0' // kvůli ochraně proti botům
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const destination = $('meta[property="og:description"]').attr('content') || '';
    const rawPrice = $('.ProductDetailHeader__price').first().text().replace(/\s+/g, ' ').trim();
    const departureDate = $('.TripDetail__headerInfo .TripDetail__item').eq(0).text().trim();
    const nights = $('.TripDetail__headerInfo .TripDetail__item').eq(1).text().trim();
    const board = $('.TripDetail__headerInfo .TripDetail__item').eq(2).text().trim();

    const numericPrice = parseInt(rawPrice.replace(/[^\d]/g, '')) || 0;
    const priceTotal = numericPrice ? rawPrice : '';
    const pricePerPerson = numericPrice ? Math.round(numericPrice / 2) + ' Kč' : null;

    res.json({
      originalUrl: url,
      title,
      destination,
      departureDate,
      nights,
      board,
      priceTotal,
      pricePerPerson
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst nebo zpracovat stránku.' });
  }
};
