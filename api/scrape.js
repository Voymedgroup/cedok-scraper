const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith('https://www.cedok.cz')) {
    return res.status(400).json({ error: 'URL musí být z domény www.cedok.cz' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const destination = $('.TripDetail__titleDestination').text().trim();
    const priceTotal = $('[data-testid="price"]').first().text().trim();
    const board = $('[data-testid="mealType"]').first().text().trim();
    const stars = $('[data-testid="stars"]').first().text().trim() || '–';
    const departureDate = $('[data-testid="trip-date"]').first().text().trim();
    const nights = $('[data-testid="trip-nights"]').first().text().trim();

    const numericPrice = parseInt(priceTotal.replace(/[^\d]/g, '')) || 0;
    const pricePerPerson = numericPrice ? Math.round(numericPrice / 2) + ' Kč' : null;

    res.status(200).json({
      originalUrl: url,
      title,
      destination,
      departureDate,
      nights,
      stars,
      board,
      priceTotal,
      pricePerPerson
    });

  } catch (error) {
    console.error('Chyba při zpracování:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst stránku nebo změnili strukturu HTML.' });
  }
};
