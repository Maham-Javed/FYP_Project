const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, './.env') });
const InterviewRepository = require('./src/repositories/interview.repository');

async function test() {
  try {
    const data = await InterviewRepository.getQuestionsAndAnswers('a6e37afe-d9d4-417f-b2cf-9ad71bf8e390');
    console.log('Returned questions from Supabase JS client:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
