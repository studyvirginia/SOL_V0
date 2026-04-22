import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { embed } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to bypass RLS for systemic ingest
);

import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // OpenRouter is OpenAI-compatible for embeddings
  baseURL: 'https://openrouter.ai/api/v1',
});

const DATA_DIR = path.join(process.cwd(), '..', 'backend', 'data');
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

async function getEmbedding(text) {
  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text,
    });
    return embedding;
  } catch (err) {
    console.error(`  [Embedding Error]: ${err.message}`);
    return null;
  }
}

async function processFile(filePath, subject, course) {
  console.log(`[Processing] ${subject} > ${course}...`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  
  const memories = [];

  for (const domain of json.domains || []) {
    for (const standard of domain.standards || []) {
      const description = standard.description;
      const code = standard.code;
      
      // Create a semantic chunk
      const fullContent = `[${subject} | ${course}] Standard ${code}: ${description}`;
      
      // Add standard itself
      memories.push({
        content: fullContent,
        metadata: {
          subject,
          course,
          domain: domain.name,
          code,
          type: 'standard'
        }
      });

      // Add granular skills
      for (const skill of standard.skills || []) {
        const skillContent = `[${subject} | ${course}] ${code} Skill: ${skill.description}. Keywords: ${(skill.keywords || []).join(', ')}`;
        memories.push({
          content: skillContent,
          metadata: {
            subject,
            course,
            domain: domain.name,
            code,
            type: 'skill',
            keywords: skill.keywords
          }
        });
      }
    }
  }

  console.log(`  Found ${memories.length} memory chunks. Generating embeddings...`);

  // Batch embed and insert
  for (let i = 0; i < memories.length; i++) {
    const mem = memories[i];
    const embedding = await getEmbedding(mem.content);
    if (!embedding) continue;

    const { error } = await supabase
      .from('cognitive_memory')
      .insert({
        content: mem.content,
        embedding,
        metadata: mem.metadata,
        user_id: null, // System Global
        session_id: '00000000-0000-0000-0000-000000000000' // Generic UUID for global
      });

    if (error) {
      console.error(`  [DB Error] ${error.message}`);
    } else {
      process.stdout.write('.');
    }
  }
  console.log(`\n  Completed ${course}\n`);
}

async function run() {
  const filter = process.argv.find(arg => arg.startsWith('--filter='))?.split('=')[1] || null;
  const subjects = ['Math', 'Science', 'English', 'History'];
  
  for (const sub of subjects) {
    const subPath = path.join(DATA_DIR, sub);
    if (!fs.existsSync(subPath)) continue;

    const files = fs.readdirSync(subPath).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const course = path.basename(file, '.json');
      if (filter && !course.includes(filter) && !sub.includes(filter)) continue;
      
      const filePath = path.join(subPath, file);
      await processFile(filePath, sub, course);
    }
  }
}

run().catch(console.error);
