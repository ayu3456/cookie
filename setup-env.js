const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://ayushg23csai_db_user:jvGobn7AmVGXLdtI@cluster0.o7v40ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=cookie-licking-detector

# GitHub Configuration (add your token)
GITHUB_TOKEN=your_github_token_here

# Supabase Configuration (keep for reference)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with MongoDB Atlas configuration');
  console.log('\n📝 Next steps:');
  console.log('1. Add your GitHub token to GITHUB_TOKEN in .env.local');
  console.log('2. Restart your development server');
  console.log('3. Test the application at http://localhost:3001');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\nPlease create .env.local manually with the following content:');
  console.log(envContent);
}
