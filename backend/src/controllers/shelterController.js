const Shelter = require('../models/Shelter');

// @desc Get all shelters with status or search filter
// @route GET /api/shelters
exports.getShelters = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const shelters = await Shelter.find(query).sort({ status: 1, currentOccupancy: -1 });

    const stats = {
      totalCapacity: 0,
      totalOccupied: 0,
      availableSlots: 0,
      activeSheltersCount: 0
    };

    shelters.forEach((s) => {
      stats.totalCapacity += s.capacity || 0;
      stats.totalOccupied += s.currentOccupancy || 0;
      if (s.status === 'Active' || s.status === 'Near Full') {
        stats.activeSheltersCount++;
      }
    });
    stats.availableSlots = Math.max(0, stats.totalCapacity - stats.totalOccupied);

    res.status(200).json({
      success: true,
      count: shelters.length,
      stats,
      shelters
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single shelter
// @route GET /api/shelters/:id
exports.getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      shelter
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create shelter (Admin only)
// @route POST /api/shelters
exports.createShelter = async (req, res, next) => {
  try {
    const {
      name,
      address,
      city,
      coordinates,
      capacity,
      currentOccupancy,
      contactPerson,
      contactPhone,
      facilities
    } = req.body;

    let parsedCoords = [77.2090, 28.6139];
    if (coordinates) {
      if (typeof coordinates === 'string') {
        try {
          parsedCoords = JSON.parse(coordinates);
        } catch (e) {
          parsedCoords = [77.2090, 28.6139];
        }
      } else if (Array.isArray(coordinates)) {
        parsedCoords = coordinates;
      }
    }

    const shelter = await Shelter.create({
      name,
      address,
      city: city || '',
      location: {
        coordinates: parsedCoords
      },
      capacity: Number(capacity) || 100,
      currentOccupancy: Number(currentOccupancy) || 0,
      contactPerson,
      contactPhone,
      facilities: Array.isArray(facilities) && facilities.length > 0
        ? facilities
        : ['Drinking Water', 'Medical Aid', 'Food Ration', 'Sanitation']
    });

    res.status(201).json({
      success: true,
      message: 'Relief shelter / camp added successfully.',
      shelter
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update shelter occupancy or details (Admin/Coordinator)
// @route PUT /api/shelters/:id
exports.updateShelter = async (req, res, next) => {
  try {
    const {
      name,
      address,
      city,
      coordinates,
      capacity,
      currentOccupancy,
      contactPerson,
      contactPhone,
      facilities,
      status
    } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    if (name) shelter.name = name;
    if (address) shelter.address = address;
    if (city) shelter.city = city;
    if (capacity !== undefined) shelter.capacity = Number(capacity);
    if (currentOccupancy !== undefined) shelter.currentOccupancy = Number(currentOccupancy);
    if (contactPerson) shelter.contactPerson = contactPerson;
    if (contactPhone) shelter.contactPhone = contactPhone;
    if (facilities) shelter.facilities = facilities;
    if (status) shelter.status = status;
    if (coordinates && coordinates.length === 2) {
      shelter.location.coordinates = coordinates;
    }

    await shelter.save();

    res.status(200).json({
      success: true,
      message: 'Shelter details updated.',
      shelter
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete shelter (Admin only)
// @route DELETE /api/shelters/:id
exports.deleteShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    await shelter.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Shelter deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
