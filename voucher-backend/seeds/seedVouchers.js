const mongoose = require('mongoose');
const Voucher = require('../models/Voucher.model');
const User = require('../models/User.model');
const { generateReferralCode } = require('../utils/referral.util');
require('dotenv').config();

const VOUCHERS = [
  // ── FOOD (4) ────────────────────────────────────────────────────────────────
  {
    title: 'McDonald\'s Value Meal Discount',
    description: 'Enjoy 20% off any value meal at McDonald\'s. Valid for dine-in and takeaway. One redemption per visit.',
    category: 'food',
    discountType: 'percentage',
    discountValue: 20,
    originalPrice: 15.90,
    pointsCost: 50,
    merchant: 'McDonald\'s Malaysia',
    merchantLogo: 'https://logo.clearbit.com/mcdonalds.com',
    terms: 'Valid at all McDonald\'s Malaysia outlets. Not valid with other promotions. Dine-in and takeaway only.',
    totalLimit: 200,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['fastfood', 'meal', 'discount'],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Starbucks RM10 Cashback',
    description: 'Get RM10 off your next Starbucks purchase of RM30 and above. Perfect for your morning coffee fix.',
    category: 'food',
    discountType: 'fixed',
    discountValue: 10,
    originalPrice: 30,
    pointsCost: 80,
    merchant: 'Starbucks Malaysia',
    merchantLogo: 'https://logo.clearbit.com/starbucks.com',
    terms: 'Minimum purchase of RM30. Valid for all beverages and food items. One per customer per day.',
    totalLimit: 150,
    perUserLimit: 2,
    isFeatured: true,
    tags: ['coffee', 'beverage', 'cafe'],
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Grab Food 15% Off',
    description: 'Save 15% on your next GrabFood delivery order. Applicable to all participating restaurants.',
    category: 'food',
    discountType: 'percentage',
    discountValue: 15,
    pointsCost: 60,
    merchant: 'GrabFood',
    merchantLogo: 'https://logo.clearbit.com/grab.com',
    terms: 'Minimum order RM20. Valid for delivery orders only. Cannot be combined with other vouchers.',
    totalLimit: 300,
    perUserLimit: 1,
    tags: ['delivery', 'online', 'restaurant'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Secret Recipe Free Slice',
    description: 'Redeem a complimentary slice of cake with any main course order at Secret Recipe.',
    category: 'food',
    discountType: 'fixed',
    discountValue: 12,
    originalPrice: 12,
    pointsCost: 100,
    merchant: 'Secret Recipe',
    merchantLogo: 'https://logo.clearbit.com/secretrecipe.com.my',
    terms: 'Valid for dine-in only. One free slice per table per visit. Subject to availability.',
    totalLimit: 100,
    perUserLimit: 1,
    isFeatured: false,
    tags: ['cake', 'dessert', 'dining'],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },

  // ── SHOPPING (4) ────────────────────────────────────────────────────────────
  {
    title: 'Shopee RM20 Voucher',
    description: 'RM20 off your Shopee cart with minimum spend of RM100. Valid for all categories.',
    category: 'shopping',
    discountType: 'fixed',
    discountValue: 20,
    originalPrice: 100,
    pointsCost: 150,
    merchant: 'Shopee Malaysia',
    merchantLogo: 'https://logo.clearbit.com/shopee.com.my',
    terms: 'Min spend RM100. One use per account. Cannot be stacked with other platform vouchers.',
    totalLimit: 500,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['ecommerce', 'online', 'sale'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'AEON 10% Weekend Special',
    description: '10% off total bill at AEON stores every Saturday and Sunday. Valid for groceries and fashion.',
    category: 'shopping',
    discountType: 'percentage',
    discountValue: 10,
    pointsCost: 70,
    merchant: 'AEON Malaysia',
    merchantLogo: 'https://logo.clearbit.com/aeon.com.my',
    terms: 'Valid on weekends only (Saturday & Sunday). Not valid on public holidays. Max discount RM50.',
    totalLimit: 400,
    perUserLimit: 2,
    tags: ['grocery', 'supermarket', 'weekend'],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Lazada Flash Sale Extra 25% Off',
    description: 'Extra 25% off on top of existing sale prices. Best deals on electronics, fashion and more.',
    category: 'shopping',
    discountType: 'percentage',
    discountValue: 25,
    pointsCost: 200,
    merchant: 'Lazada Malaysia',
    merchantLogo: 'https://logo.clearbit.com/lazada.com.my',
    terms: 'Min spend RM80. Max discount RM100. Applicable to selected items only.',
    totalLimit: 250,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['flash-sale', 'electronics', 'fashion'],
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Parkson Gift Voucher RM50',
    description: 'RM50 gift voucher redeemable at any Parkson department store nationwide.',
    category: 'shopping',
    discountType: 'fixed',
    discountValue: 50,
    originalPrice: 200,
    pointsCost: 300,
    merchant: 'Parkson',
    merchantLogo: 'https://logo.clearbit.com/parkson.com.my',
    terms: 'Valid at all Parkson outlets in Malaysia. Min purchase RM200. Not redeemable for cash.',
    totalLimit: 80,
    perUserLimit: 1,
    tags: ['department-store', 'fashion', 'gift'],
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
  },

  // ── TRAVEL (4) ───────────────────────────────────────────────────────────────
  {
    title: 'AirAsia 30% Off Domestic Flights',
    description: '30% off selected domestic flights within Malaysia. Book now, fly anytime in the next 3 months.',
    category: 'travel',
    discountType: 'percentage',
    discountValue: 30,
    pointsCost: 250,
    merchant: 'AirAsia',
    merchantLogo: 'https://logo.clearbit.com/airasia.com',
    terms: 'Valid for domestic routes only. Min 1 pax. Must book at least 14 days in advance. Seat taxes not included.',
    totalLimit: 200,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['flight', 'domestic', 'airline'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Agoda Hotel RM100 Off',
    description: 'RM100 off your hotel booking for stays of 2 nights or more. Choose from 1000+ hotels across Asia.',
    category: 'travel',
    discountType: 'fixed',
    discountValue: 100,
    originalPrice: 400,
    pointsCost: 350,
    merchant: 'Agoda',
    merchantLogo: 'https://logo.clearbit.com/agoda.com',
    terms: 'Min 2 nights stay. Min booking value RM400. Valid for Asia-Pacific destinations.',
    totalLimit: 150,
    perUserLimit: 1,
    tags: ['hotel', 'accommodation', 'asia'],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Grab Car 20% Weekend Rides',
    description: 'Save 20% on all Grab car rides during weekends. Applicable to GrabCar, GrabCar Plus.',
    category: 'travel',
    discountType: 'percentage',
    discountValue: 20,
    pointsCost: 40,
    merchant: 'Grab Malaysia',
    merchantLogo: 'https://logo.clearbit.com/grab.com',
    terms: 'Valid Saturday and Sunday 6am-11pm. Max discount RM10 per ride. Auto-applied in app.',
    totalLimit: 1000,
    perUserLimit: 4,
    tags: ['ridehailing', 'car', 'weekend'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Bus Ticket 15% Off (Nationwide)',
    description: '15% off intercity bus tickets with Transnasional, Plusliner, and more. Travel Malaysia affordably.',
    category: 'travel',
    discountType: 'percentage',
    discountValue: 15,
    pointsCost: 30,
    merchant: 'BusOnlineTicket',
    merchantLogo: 'https://logo.clearbit.com/busonlineticket.com',
    terms: 'Valid for selected operators. Advance booking required. Not valid during peak holiday periods.',
    totalLimit: 500,
    perUserLimit: 2,
    tags: ['bus', 'intercity', 'transport'],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },

  // ── ENTERTAINMENT (4) ────────────────────────────────────────────────────────
  {
    title: 'GSC Movie Ticket Buy 1 Free 1',
    description: 'Buy 1 movie ticket and get 1 absolutely free at any GSC Cinema nationwide. All movies included.',
    category: 'entertainment',
    discountType: 'percentage',
    discountValue: 50,
    originalPrice: 16,
    pointsCost: 120,
    merchant: 'GSC Cinemas',
    merchantLogo: 'https://logo.clearbit.com/gsc.com.my',
    terms: 'Valid for standard halls only. Not valid for IMAX, 4DX, or MX4D. Weekdays only (Mon-Thu).',
    totalLimit: 300,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['movie', 'cinema', 'buy1free1'],
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Spotify Premium 3 Months Free',
    description: 'Get Spotify Premium for 3 months absolutely free. Enjoy ad-free music, offline downloads, and more.',
    category: 'entertainment',
    discountType: 'percentage',
    discountValue: 100,
    originalPrice: 44.97,
    pointsCost: 400,
    merchant: 'Spotify',
    merchantLogo: 'https://logo.clearbit.com/spotify.com',
    terms: 'For new Spotify Premium subscribers only. Malaysian accounts only. One redemption per email.',
    totalLimit: 100,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['music', 'streaming', 'subscription'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Sunway Lagoon 30% Off Entry',
    description: '30% off entrance tickets to Sunway Lagoon Theme Park. Valid for all 6 parks.',
    category: 'entertainment',
    discountType: 'percentage',
    discountValue: 30,
    originalPrice: 168,
    pointsCost: 200,
    merchant: 'Sunway Lagoon',
    merchantLogo: 'https://logo.clearbit.com/sunwaylagoon.com',
    terms: 'Not valid during school holidays and public holidays. Online redemption only. Subject to availability.',
    totalLimit: 200,
    perUserLimit: 1,
    tags: ['theme-park', 'family', 'outdoor'],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Netflix 1 Month Subscription',
    description: 'Enjoy 1 month of Netflix Standard (with ads) for free. Stream movies and shows on any device.',
    category: 'entertainment',
    discountType: 'fixed',
    discountValue: 17,
    originalPrice: 17,
    pointsCost: 180,
    merchant: 'Netflix',
    merchantLogo: 'https://logo.clearbit.com/netflix.com',
    terms: 'For new subscribers or returning subscribers inactive for 12+ months. Malaysian accounts only.',
    totalLimit: 150,
    perUserLimit: 1,
    tags: ['streaming', 'movies', 'subscription'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },

  // ── HEALTH (4) ───────────────────────────────────────────────────────────────
  {
    title: 'Guardian Pharmacy 15% Off',
    description: '15% off all health supplements and vitamins at Guardian Pharmacy. Stay healthy, save more!',
    category: 'health',
    discountType: 'percentage',
    discountValue: 15,
    pointsCost: 60,
    merchant: 'Guardian Malaysia',
    merchantLogo: 'https://logo.clearbit.com/guardian.com.my',
    terms: 'Valid for supplements and vitamins only. Not valid with member discounts. Instore and online.',
    totalLimit: 400,
    perUserLimit: 2,
    isFeatured: false,
    tags: ['pharmacy', 'supplements', 'wellness'],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Fitness First Free Trial Week',
    description: '7-day free trial membership at any Fitness First gym in Malaysia. Access to all facilities.',
    category: 'health',
    discountType: 'percentage',
    discountValue: 100,
    originalPrice: 120,
    pointsCost: 150,
    merchant: 'Fitness First Malaysia',
    merchantLogo: 'https://logo.clearbit.com/fitnessfirst.com.my',
    terms: 'For non-members only. Valid at all Fitness First Malaysia outlets. Bring valid ID.',
    totalLimit: 100,
    perUserLimit: 1,
    isFeatured: true,
    tags: ['gym', 'fitness', 'trial'],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Caring Pharmacy RM15 Off',
    description: 'RM15 off with min spend RM60 on health and beauty products at Caring Pharmacy.',
    category: 'health',
    discountType: 'fixed',
    discountValue: 15,
    originalPrice: 60,
    pointsCost: 80,
    merchant: 'Caring Pharmacy',
    merchantLogo: 'https://logo.clearbit.com/caringpharmacy.com',
    terms: 'Minimum purchase RM60. One voucher per transaction. Not valid with other promotions.',
    totalLimit: 300,
    perUserLimit: 1,
    tags: ['pharmacy', 'beauty', 'health'],
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Full Body Health Screening 20% Off',
    description: '20% off comprehensive health screening packages at participating clinics and labs nationwide.',
    category: 'health',
    discountType: 'percentage',
    discountValue: 20,
    originalPrice: 350,
    pointsCost: 200,
    merchant: 'KPJ Healthcare',
    merchantLogo: 'https://logo.clearbit.com/kpj.com.my',
    terms: 'Prior appointment required. Valid at participating KPJ outlets. Report included.',
    totalLimit: 80,
    perUserLimit: 1,
    isFeatured: false,
    tags: ['healthcare', 'screening', 'checkup'],
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create or find admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@vouchersystem.com',
        password: 'Admin@123456',
        role: 'admin',
        referralCode: 'ADMIN001',
        points: 0,
        isVerified: true,
        isActive: true,
      });
      console.log('Admin user created: admin@vouchersystem.com / Admin@123456');
    } else {
      console.log('Admin user already exists:', admin.email);
    }

    // Seed vouchers
    const existingCount = await Voucher.countDocuments();
    if (existingCount >= 20) {
      console.log(`Already have ${existingCount} vouchers. Skipping seed.`);
    } else {
      await Voucher.deleteMany({});
      const vouchers = await Voucher.insertMany(
        VOUCHERS.map(v => ({ ...v, createdBy: admin._id }))
      );
      console.log(`Seeded ${vouchers.length} vouchers across 5 categories:`);
      const categories = {};
      vouchers.forEach(v => { categories[v.category] = (categories[v.category] || 0) + 1; });
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  - ${cat}: ${count} vouchers`);
      });
    }

    // Create a demo user
    let demoUser = await User.findOne({ email: 'user@demo.com' });
    if (!demoUser) {
      const { generateReferralCode } = require('../utils/referral.util');
      demoUser = await User.create({
        name: 'Demo User',
        email: 'user@demo.com',
        password: 'User@123456',
        role: 'user',
        referralCode: generateReferralCode(),
        points: 500,
        pointsHistory: [{
          type: 'bonus', points: 500,
          description: 'Demo account starter points', reference: 'DEMO_BONUS',
        }],
        isVerified: true,
        isActive: true,
      });
      console.log('Demo user created: user@demo.com / User@123456 (500 pts)');
    }

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
