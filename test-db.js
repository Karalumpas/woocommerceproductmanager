import { db } from './src/lib/db/index.js'
import { users } from './src/lib/db/schema.js'

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    const result = await db.select().from(users).limit(1)
    console.log('✅ Database connection successful')
    console.log('Users table exists and is accessible')
    
    if (result.length > 0) {
      console.log('Found existing users:', result.length)
    } else {
      console.log('No users found (empty table)')
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testDatabase().then(() => {
  console.log('Database test completed')
  process.exit(0)
})
