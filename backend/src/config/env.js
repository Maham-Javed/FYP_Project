const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Resolve and load configurations
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  HF_API_TOKEN: z.string().min(1, 'HF_API_TOKEN is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n❌ [EnvValidator] Critical Boot-Time Environment Variables Missing or Malformed:\n');
    result.error.errors.forEach((err) => {
      console.error(`   👉 ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check backend/.env configuration file and supply required fields.\n');
    process.exit(1);
  }

  console.log('✅ [EnvValidator] Environment variables successfully validated.');
  return result.data;
}

module.exports = {
  validateEnv
};
