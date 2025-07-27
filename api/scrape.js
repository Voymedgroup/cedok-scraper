const axios = require('axios');

module.exports = async function (req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://www.cedok.cz')) {
    return res.status(400).json({ error: 'Chybná nebo chybějící URL.' });
  }

  try {
    const parsedUrl = new URL(url);
    const tripId = parsedUrl.searchParams.get('id');

    if (!tripId) {
      return res.status(400).json({ error: 'URL neobsahuje platný parametr id.' });
    }

    const apiUrl = `https://www.cedok.cz/api/trips/preview?id=${tripId}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.product || !data.departureDate) {
      return res.status(404).json({ error: 'Nepodařilo se načíst údaje o zájezdu.' });
    }

    const title = data.product.name || 'Neznámý hotel';
    const destination = `${data.product.country?.name || ''} – ${data.product.resort?.name || ''}`;
    const departureDate = data.departureDate.split('T')[0];
    const nights = data.nights + ' nocí';
    const stars = data.product.stars?.toString() || '–';
    const board = data.board?.name || 'neuvedeno';
    const priceTotal = data.price?.formatted || 'neuvedeno';
    const pricePerPerson = data.price?.value
      ? Math.round(data.price.value / 2) + ' Kč'
      : null;

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
    console.error('Chyba:', error.message);
    res.status(500).json({ error: 'Nepodařilo se načíst data z Čedok API.' });
  }
};
