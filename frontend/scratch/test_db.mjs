import { db } from '../lib/db.js';

async function testStorage() {
  console.log("🚀 Testing Dexie storage in Terminal...");

  try {
    const testSession = {
      id: 'test-terminal-' + Date.now(),
      name: 'Terminal Test Session',
      course: 'Science',
      focusDetail: 'Photosynthesis',
      createdAt: Date.now()
    };

    console.log("📦 Adding test session...");
    await db.sessions.put(testSession);
    console.log("✅ Session added successfully.");

    console.log("🔍 Retrieving all sessions...");
    const allSessions = await db.sessions.toArray();
    console.log(`📊 Found ${allSessions.length} sessions.`);
    
    const found = allSessions.find(s => s.id === testSession.id);
    if (found) {
      console.log("🎉 SUCCESS: Test session retrieved correctly!");
      console.log(JSON.stringify(found, null, 2));
    } else {
      console.error("❌ FAILURE: Test session not found in database.");
    }

  } catch (err) {
    console.error("💥 ERROR during storage test:", err);
  } finally {
    process.exit(0);
  }
}

testStorage();
