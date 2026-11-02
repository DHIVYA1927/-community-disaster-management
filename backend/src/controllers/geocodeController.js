// @desc Reverse geocode coordinates to human-readable street address using OpenStreetMap Nominatim
// @route GET /api/geocode/reverse?lat=...&lng=...
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude query parameters are required.'
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CommunityDisasterManagementApp/1.0 (disaster-relief@community.org)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding service returned status: ${response.status}`);
    }

    const data = await response.json();
    const address = data.display_name || `${lat}, ${lng}`;
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      '';
    const state = data.address?.state || '';

    return res.status(200).json({
      success: true,
      address,
      city,
      state,
      raw: data.address
    });
  } catch (error) {
    console.warn('[Geocode Error]', error.message);
    // Graceful fallback if external internet/nominatim has temporary timeout
    return res.status(200).json({
      success: true,
      address: `Detected GPS Location (${Number(req.query.lat).toFixed(4)}, ${Number(
        req.query.lng
      ).toFixed(4)})`,
      city: '',
      state: ''
    });
  }
};
