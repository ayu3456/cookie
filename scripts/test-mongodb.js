const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DATABASE || 'cookie-licking-detector';
  
  const options = {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    retryWrites: true,
    w: 'majority'
  };
  
  const client = new MongoClient(uri, options);
  
  try {
    console.log('Testing MongoDB connection...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    console.log(`✅ Connected to database: ${dbName}`);
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test basic operations
    const testCollection = db.collection('test_connection');
    const testDoc = { 
      message: 'MongoDB connection test', 
      timestamp: new Date() 
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Insert test successful:', insertResult.insertedId);
    
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Find test successful:', findResult.message);
    
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete test successful');
    
    console.log('\n🎉 MongoDB integration test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Set up your environment variables in .env.local');
    console.log('2. Run: npm run setup-mongodb');
    console.log('3. Update your components to use MongoDB actions');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MongoDB is running locally or check your MONGODB_URI');
    console.log('2. Check your network connection if using MongoDB Atlas');
    console.log('3. Verify your database credentials');
  } finally {
    await client.close();
  }
}

testMongoDBConnection();
