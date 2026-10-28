require('dotenv').config();
const mongoose = require('mongoose');
const Opportunity = require('./models/Opportunity');
const Profile = require('./models/Profile');
const SavedOpportunity = require('./models/SavedOpportunity');
const Reminder = require('./models/Reminder');
const { sampleOpportunities } = require('./seeds/seedData');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opplyra';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] Connected.');

    // Clear existing demonstration data
    await Opportunity.deleteMany({});
    await Profile.deleteMany({});
    await SavedOpportunity.deleteMany({});
    await Reminder.deleteMany({});
    console.log('[Seed] Cleared old collections.');

    // Insert sample opportunities
    const insertedOpps = await Opportunity.insertMany(sampleOpportunities);
    console.log(`[Seed] Successfully inserted ${insertedOpps.length} demonstration opportunities.`);

    // Insert default student profile
    const defaultProfile = await Profile.create({
      userId: 'default_student_user',
      fullName: 'Priya Sharma',
      course: 'B.Tech Computer Science',
      academicYear: '3rd Year',
      cgpa: 8.2,
      location: 'Karnataka, India',
      category: 'General',
      gender: 'Female',
    });
    console.log(`[Seed] Created default student profile for ${defaultProfile.fullName}.`);

    // Insert 1 saved opportunity & reminder for initial demonstration state
    if (insertedOpps.length > 1) {
      const savedItem = await SavedOpportunity.create({
        opportunityId: insertedOpps[1]._id,
        userId: 'default_student_user',
        status: 'Preparing',
        notes: 'Working on Statement of Purpose and brushing up on LeetCode dynamic programming.',
      });

      const deadlineMs = new Date(insertedOpps[1].deadline).getTime();
      await Reminder.create({
        opportunityId: insertedOpps[1]._id,
        userId: 'default_student_user',
        offset: '1_day_before',
        offsetLabel: '1 day before deadline',
        triggerAt: new Date(deadlineMs - 24 * 60 * 60 * 1000),
        status: 'Scheduled',
      });
      console.log(`[Seed] Added initial saved opportunity & reminder for "${insertedOpps[1].title}".`);
    }

    console.log('[Seed] Database seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedDatabase();

