require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Volunteer = require('./models/Volunteer');
const Disaster = require('./models/Disaster');
const EmergencyRequest = require('./models/EmergencyRequest');
const Resource = require('./models/Resource');
const ResourceAllocation = require('./models/ResourceAllocation');
const Shelter = require('./models/Shelter');
const Task = require('./models/Task');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/disaster_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database:', mongoUri);

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Volunteer.deleteMany({}),
      Disaster.deleteMany({}),
      EmergencyRequest.deleteMany({}),
      Resource.deleteMany({}),
      ResourceAllocation.deleteMany({}),
      Shelter.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const admin = await User.create({
      name: 'Disaster Relief Admin',
      email: 'admin@disaster.org',
      password: 'admin123',
      role: 'administrator',
      phone: '+91 9811002233',
      address: 'Central Disaster Response Headquarters, New Delhi',
      location: {
        coordinates: [77.2090, 28.6139],
        address: 'HQ Central Command, New Delhi'
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    const volunteer1 = await User.create({
      name: 'Captain Vikram Singh',
      email: 'volunteer@disaster.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 9876543210',
      address: 'Sector 15, Rohini, New Delhi',
      location: {
        coordinates: [77.1150, 28.7100],
        address: 'Sector 15, Rohini'
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const volunteer2 = await User.create({
      name: 'Dr. Sarah Matthews',
      email: 'sarah.res@disaster.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 9811223344',
      address: 'Lajpat Nagar IV, New Delhi',
      location: {
        coordinates: [77.2400, 28.5680],
        address: 'Lajpat Nagar IV'
      },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    });

    const volunteer3 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.ops@disaster.org',
      password: 'volunteer123',
      role: 'volunteer',
      phone: '+91 9822334455',
      address: 'Connaught Place Area, New Delhi',
      location: {
        coordinates: [77.2167, 28.6315],
        address: 'Connaught Place'
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    });

    const citizen1 = await User.create({
      name: 'Amit Kumar',
      email: 'citizen@disaster.org',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 9911224488',
      address: 'Yamuna Khadar Flood Plains, Delhi',
      location: {
        coordinates: [77.2600, 28.6250],
        address: 'Yamuna Riverbank Colony, Delhi'
      },
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
    });

    const citizen2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.s@gmail.com',
      password: 'citizen123',
      role: 'citizen',
      phone: '+91 9833445566',
      address: 'Old Subzi Mandi Area, North Delhi',
      location: {
        coordinates: [77.2000, 28.6700],
        address: 'North Delhi Ward 12'
      },
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    });

    // 2. Create Volunteer Profiles
    console.log('[Seed] Creating volunteer profiles...');
    await Volunteer.create({
      user: volunteer1._id,
      skills: ['Search & Rescue', 'Boat Operation', 'Flood Evacuation', 'Heavy Machinery'],
      availabilityStatus: 'Available',
      bloodGroup: 'O+',
      contactNumber: volunteer1.phone,
      address: volunteer1.address,
      location: volunteer1.location,
      totalTasksCompleted: 14,
      badge: 'Gold Guardian'
    });

    await Volunteer.create({
      user: volunteer2._id,
      skills: ['Medical Care', 'First Aid', 'Triage Assessment', 'Trauma Care'],
      availabilityStatus: 'On-Mission',
      bloodGroup: 'B+',
      contactNumber: volunteer2.phone,
      address: volunteer2.address,
      location: volunteer2.location,
      totalTasksCompleted: 22,
      badge: 'Medical Commander'
    });

    await Volunteer.create({
      user: volunteer3._id,
      skills: ['Logistics', 'Cooking & Distribution', 'Child Care', 'First Aid'],
      availabilityStatus: 'Available',
      bloodGroup: 'A+',
      contactNumber: volunteer3.phone,
      address: volunteer3.address,
      location: volunteer3.location,
      totalTasksCompleted: 8,
      badge: 'Silver Responder'
    });

    // 3. Create Shelters & Relief Camps
    console.log('[Seed] Creating relief shelters...');
    const shelter1 = await Shelter.create({
      name: 'Yamuna Sports Complex Relief Camp',
      address: 'Surajmal Vihar, East Delhi',
      city: 'Delhi',
      location: { coordinates: [77.3050, 28.6600] },
      capacity: 800,
      currentOccupancy: 420,
      contactPerson: 'Harish Mehta (Camp Superintendent)',
      contactPhone: '+91 9811445522',
      facilities: ['Clean Drinking Water', 'Field Hospital', 'Sanitation Blocks', 'Kitchen Hall', 'Power Backup'],
      status: 'Active'
    });

    const shelter2 = await Shelter.create({
      name: 'Thyagaraj Stadium Emergency Shelter',
      address: 'INA Colony, New Delhi',
      city: 'Delhi',
      location: { coordinates: [77.2200, 28.5800] },
      capacity: 1200,
      currentOccupancy: 1050,
      contactPerson: 'Dr. Sunita Rao',
      contactPhone: '+91 9822114433',
      facilities: ['Medical Center', 'Food Supply', 'Child Care', 'Wheelchair Accessible', 'Security Post'],
      status: 'Near Full'
    });

    const shelter3 = await Shelter.create({
      name: 'Civil Lines Community Center',
      address: 'Rajpur Road, Civil Lines, North Delhi',
      city: 'Delhi',
      location: { coordinates: [77.2250, 28.6800] },
      capacity: 350,
      currentOccupancy: 110,
      contactPerson: 'Suresh Chandra',
      contactPhone: '+91 9877665544',
      facilities: ['Blanket & Cot Distribution', 'Hot Meals', 'First Aid Post', 'Clean Water'],
      status: 'Active'
    });

    // 4. Create Resources Inventory
    console.log('[Seed] Creating resource inventory...');
    const resFood = await Resource.create({
      resourceName: 'Ready-to-Eat Emergency Food Packets',
      category: 'Food packets',
      unit: 'Packets',
      availableQuantity: 4500,
      requiredQuantity: 8000,
      allocatedQuantity: 2500,
      storageLocation: 'Central Civil Defense Depot, New Delhi',
      distributionStatus: 'In-Stock',
      minimumThreshold: 500
    });

    const resWater = await Resource.create({
      resourceName: 'Packaged Drinking Water (20L Cans & Pouches)',
      category: 'Drinking water',
      unit: 'Liters',
      availableQuantity: 12000,
      requiredQuantity: 20000,
      allocatedQuantity: 6500,
      storageLocation: 'Warehouse 3, Okhla Industrial Area',
      distributionStatus: 'In-Stock',
      minimumThreshold: 2000
    });

    const resMed = await Resource.create({
      resourceName: 'Emergency Trauma & Antibiotic Medicines Kit',
      category: 'Medicines',
      unit: 'Kits',
      availableQuantity: 380,
      requiredQuantity: 600,
      allocatedQuantity: 220,
      storageLocation: 'State Medical Supply Depot, Daryaganj',
      distributionStatus: 'In-Stock',
      minimumThreshold: 100
    });

    const resClothes = await Resource.create({
      resourceName: 'Waterproof Raincoats & Dry Clothing Bundles',
      category: 'Clothes',
      unit: 'Sets',
      availableQuantity: 1500,
      requiredQuantity: 3000,
      allocatedQuantity: 900,
      storageLocation: 'Red Cross Relief Depot, Anand Vihar',
      distributionStatus: 'In-Stock',
      minimumThreshold: 300
    });

    const resBlankets = await Resource.create({
      resourceName: 'Thermal Woolen Blankets',
      category: 'Blankets',
      unit: 'Pieces',
      availableQuantity: 240,
      requiredQuantity: 2500,
      allocatedQuantity: 1800,
      storageLocation: 'Central Civil Defense Depot, New Delhi',
      distributionStatus: 'Low-Stock',
      minimumThreshold: 300
    });

    const resFirstAid = await Resource.create({
      resourceName: 'Sterile Field First Aid Kits',
      category: 'First aid kits',
      unit: 'Kits',
      availableQuantity: 850,
      requiredQuantity: 1200,
      allocatedQuantity: 350,
      storageLocation: 'Hospital Emergency Cache, Safdarjung',
      distributionStatus: 'In-Stock',
      minimumThreshold: 150
    });

    const resEquipment = await Resource.create({
      resourceName: 'Inflatable Motorized Rescue Boats & Lifejackets',
      category: 'Rescue equipment',
      unit: 'Sets',
      availableQuantity: 28,
      requiredQuantity: 50,
      allocatedQuantity: 18,
      storageLocation: 'Disaster Rapid Action Base, Mayur Vihar',
      distributionStatus: 'Low-Stock',
      minimumThreshold: 30
    });

    // 5. Create Disasters
    console.log('[Seed] Creating disaster incidents...');
    const disaster1 = await Disaster.create({
      title: 'Yamuna River Flash Flood Inundation',
      disasterType: 'Flood',
      incidentDescription:
        'Yamuna water level has crossed danger mark by 1.8 meters. Over 2,500 families evacuated; water entering residential low-lying colonies. Urgent rescue boats and rations required.',
      location: {
        address: 'Yamuna Bazar & Kashmere Gate Lowlands',
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: [77.2350, 28.6650]
      },
      affectedPeople: 3200,
      severityLevel: 'Critical',
      status: 'Verified',
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
      reportedBy: citizen1._id,
      verifiedBy: admin._id,
      verifiedAt: new Date(Date.now() - 3600000 * 24),
      reportDateTime: new Date(Date.now() - 3600000 * 24)
    });

    const disaster2 = await Disaster.create({
      title: 'Commercial Complex Structural Fire Outbreak',
      disasterType: 'Fire',
      incidentDescription:
        'Major fire broke out in a 4-storey commercial electronic market. Multiple individuals trapped on the second floor. Smoke inhalation hazard high.',
      location: {
        address: 'Bhagirath Palace, Chandni Chowk',
        city: 'Delhi',
        state: 'Delhi',
        coordinates: [77.2300, 28.6550]
      },
      affectedPeople: 180,
      severityLevel: 'High',
      status: 'In-Progress',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      reportedBy: citizen2._id,
      verifiedBy: admin._id,
      verifiedAt: new Date(Date.now() - 3600000 * 12),
      reportDateTime: new Date(Date.now() - 3600000 * 12)
    });

    const disaster3 = await Disaster.create({
      title: 'Seismic Tremor & Building Cracks Incident',
      disasterType: 'Earthquake',
      incidentDescription:
        'Moderate earthquake of magnitude 5.2 caused collapse of boundary walls and severe structural cracks in older apartment buildings. Citizens gathered on streets.',
      location: {
        address: 'Sector 62 Institutional Belt',
        city: 'Noida',
        state: 'Uttar Pradesh',
        coordinates: [77.3600, 28.6200]
      },
      affectedPeople: 650,
      severityLevel: 'Medium',
      status: 'Verified',
      imageUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&auto=format&fit=crop&q=80',
      reportedBy: citizen1._id,
      verifiedBy: admin._id,
      verifiedAt: new Date(Date.now() - 3600000 * 48),
      reportDateTime: new Date(Date.now() - 3600000 * 48)
    });

    const disaster4 = await Disaster.create({
      title: 'Heavy Gale Winds & Cyclone Warning Alert',
      disasterType: 'Cyclone',
      incidentDescription:
        'Severe storm depression accompanied by 80 km/h winds, uprooting trees, damaging power transformers, and causing grid blackout across suburban settlements.',
      location: {
        address: 'Western Fringe Border, Najafgarh',
        city: 'Delhi',
        state: 'Delhi',
        coordinates: [76.9800, 28.6100]
      },
      affectedPeople: 1100,
      severityLevel: 'High',
      status: 'Pending',
      imageUrl: 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=800&auto=format&fit=crop&q=80',
      reportedBy: citizen2._id,
      verifiedBy: null,
      reportDateTime: new Date(Date.now() - 3600000 * 4)
    });

    // 6. Create Emergency Help Requests
    console.log('[Seed] Creating emergency assistance requests...');
    const req1 = await EmergencyRequest.create({
      disasterId: disaster1._id,
      citizenId: citizen1._id,
      requestType: 'Rescue',
      urgencyLevel: 'Critical',
      description: 'Family of 6 including two elderly grandparents stranded on the terrace. Water level rising on ground floor. Need immediate boat evacuation.',
      peopleCount: 6,
      location: {
        address: 'House 42, Bela Road, Kashmere Gate Near Yamuna',
        coordinates: [77.2340, 28.6670]
      },
      contactPhone: '+91 9911224488',
      status: 'In-Progress',
      assignedVolunteer: volunteer1._id
    });

    const req2 = await EmergencyRequest.create({
      disasterId: disaster1._id,
      citizenId: citizen2._id,
      requestType: 'Food',
      urgencyLevel: 'High',
      description: '15 laborers and their children stranded at municipal school shelter. No dry food or baby milk available for past 16 hours.',
      peopleCount: 15,
      location: {
        address: 'MCD Primary School, Yamuna Bazar',
        coordinates: [77.2370, 28.6630]
      },
      contactPhone: '+91 9833445566',
      status: 'Pending',
      assignedVolunteer: null
    });

    const req3 = await EmergencyRequest.create({
      disasterId: disaster2._id,
      citizenId: citizen2._id,
      requestType: 'Medical',
      urgencyLevel: 'Critical',
      description: 'Severe burn and smoke inhalation victim needing immediate oxygen and ambulance transfer.',
      peopleCount: 3,
      location: {
        address: 'Gate 2, Bhagirath Palace, Chandni Chowk',
        coordinates: [77.2305, 28.6548]
      },
      contactPhone: '+91 9833445566',
      status: 'Assigned',
      assignedVolunteer: volunteer2._id
    });

    const req4 = await EmergencyRequest.create({
      disasterId: disaster3._id,
      citizenId: citizen1._id,
      requestType: 'Shelter',
      urgencyLevel: 'Medium',
      description: 'Building declared structurally unsafe. 4 family members need temporary cots and shelter accommodation tonight.',
      peopleCount: 4,
      location: {
        address: 'Block C, Sector 62, Noida',
        coordinates: [77.3620, 28.6210]
      },
      contactPhone: '+91 9911224488',
      status: 'Fulfilled',
      assignedVolunteer: volunteer3._id,
      fulfillmentNotes: 'Accommodated at Civil Lines Relief Center.'
    });

    // 7. Create Rescue Tasks
    console.log('[Seed] Creating operational tasks...');
    await Task.create({
      title: 'Yamuna Terrace Boat Rescue Operation',
      description: 'Evacuate 6 trapped civilians at House 42, Bela Road using Motorized Inflatable Boat.',
      emergencyRequest: req1._id,
      disaster: disaster1._id,
      assignedVolunteer: volunteer1._id,
      priority: 'Critical',
      status: 'In-Progress',
      location: req1.location,
      notes: 'Lifejackets dispatched. Boat unit 4 deployed.',
      progressUpdates: [
        {
          updateText: 'Task assigned to Captain Vikram Singh. Moving towards flood channel.',
          timestamp: new Date(Date.now() - 3600000 * 2),
          updatedBy: admin._id
        },
        {
          updateText: 'Boat dispatched at Bela Ghat. Contact established with family.',
          timestamp: new Date(Date.now() - 1800000),
          updatedBy: volunteer1._id
        }
      ]
    });

    await Task.create({
      title: 'Emergency Medical Triage & Oxygen Dispatch',
      description: 'Triage smoke inhalation casualties at Bhagirath Palace and coordinate ambulance routing.',
      emergencyRequest: req3._id,
      disaster: disaster2._id,
      assignedVolunteer: volunteer2._id,
      priority: 'Critical',
      status: 'In-Progress',
      location: req3.location,
      notes: 'Carrying 2 oxygen cylinders and burn dressings.'
    });

    await Task.create({
      title: 'Shelter Transfer & Bedding Provision',
      description: 'Escort displaced residents to Civil Lines Community Center and allocate bedding.',
      emergencyRequest: req4._id,
      disaster: disaster3._id,
      assignedVolunteer: volunteer3._id,
      priority: 'Medium',
      status: 'Completed',
      location: req4.location,
      notes: 'Completed successfully. Family checked into room 14.',
      completedAt: new Date(Date.now() - 3600000 * 18)
    });

    // 8. Create Resource Allocations
    console.log('[Seed] Creating resource allocations...');
    await ResourceAllocation.create({
      resource: resFood._id,
      disaster: disaster1._id,
      shelter: shelter1._id,
      allocatedQuantity: 1500,
      allocatedBy: admin._id,
      purpose: 'Daily food distribution for flood displaced families',
      priority: 'High',
      status: 'Dispatched',
      notes: 'Truck convoy 04 en route to Yamuna Sports Complex.'
    });

    await ResourceAllocation.create({
      resource: resWater._id,
      disaster: disaster1._id,
      shelter: shelter1._id,
      allocatedQuantity: 4000,
      allocatedBy: admin._id,
      purpose: 'Drinking water tankers for relief camp',
      priority: 'Critical',
      status: 'Delivered',
      deliveryDate: new Date(Date.now() - 3600000 * 10),
      notes: 'Delivered and verified by Camp Superintendent.'
    });

    await ResourceAllocation.create({
      resource: resEquipment._id,
      disaster: disaster1._id,
      emergencyRequest: req1._id,
      allocatedQuantity: 2,
      allocatedBy: admin._id,
      purpose: 'Inflatable rescue boats for Kashmere gate flood evacuation',
      priority: 'Critical',
      status: 'Dispatched'
    });

    // 9. Create Alerts & Notifications
    console.log('[Seed] Creating disaster alerts & notifications...');
    await Notification.create({
      title: '🚨 CRITICAL FLOOD WARNING: Yamuna River Rising',
      message: 'All residents residing within 500m of Yamuna flood plains are instructed to immediately evacuate to marked relief shelters.',
      type: 'Emergency Alert',
      severity: 'Critical',
      isBroadcast: true
    });

    await Notification.create({
      title: '⚠️ Fire Hazard Alert in Chandni Chowk Area',
      message: 'Avoid Chandni Chowk main corridor. Fire fighting vehicles and medical rescue teams active in Bhagirath Palace vicinity.',
      type: 'Emergency Alert',
      severity: 'High',
      isBroadcast: true
    });

    await Notification.create({
      title: 'ℹ️ Additional Beds Opened at Thyagaraj Stadium',
      message: 'Thyagaraj relief center has received additional cots, dry rations, and medical doctors. Walk-in helpdesk operational 24/7.',
      type: 'Shelter Notice',
      severity: 'Info',
      isBroadcast: true
    });

    console.log('========================================================');
    console.log('🎉 Seed Data Imported Successfully!');
    console.log('--------------------------------------------------------');
    console.log('Demo Credentials for Evaluator:');
    console.log('Administrator : admin@disaster.org     / admin123');
    console.log('Volunteer     : volunteer@disaster.org / volunteer123');
    console.log('Citizen       : citizen@disaster.org   / citizen123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error populating database:', error);
    process.exit(1);
  }
};

seedData();
