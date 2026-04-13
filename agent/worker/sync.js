#!/usr/bin/env node
/**
 * Sync published/ markdown files to D1 via the content API.
 *
 * Usage:
 *   node sync.js                          # sync all published/ files
 *   node sync.js published/blog/my-post.md  # sync a single file
 *
 * Requires: CONTENT_API_KEY env var (or set in .env)
 *           API_URL env var (default: https://api.5thdim.ai)
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'https://api.5thdim.ai';
const API_KEY = process.env.CONTENT_API_KEY;

if (!API_KEY) {
  console.error('Error: CONTENT_API_KEY env var is required');
  console.error('  export CONTENT_API_KEY=your-secret-key');
  process.exit(1);
}

// Simple frontmatter parser (no dependencies)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const data = {};
  match[1].split('\n').forEach(line => {
    const m = line.match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (!m) return;
    let val = m[2].trim();
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Parse arrays
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    data[m[1]] = val;
  });

  return { data, body: match[2].trim() };
}

// Map file path to collection name
function getCollection(filePath) {
  if (filePath.includes('/letter/')) return 'letter';
  if (filePath.includes('/paths/')) return 'paths';
  if (filePath.includes('/media-kit/')) return 'media-kit';
  if (filePath.includes('/deep-dives/')) return 'deep-dives';
  if (filePath.includes('/current/')) return 'current';
  return 'blog';
}

// Find all markdown files in published/
function findFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath));
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      results.push(fullPath);
    }
  }
  return results;
}

async function syncFiles(files) {
  const items = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);

    if (data.status && data.status !== 'published') {
      console.log(`  skip: ${file} (status: ${data.status})`);
      continue;
    }

    if (!data.slug || !data.title) {
      console.log(`  skip: ${file} (missing slug or title)`);
      continue;
    }

    items.push({
      slug: data.slug,
      title: data.title,
      title_zh: data.title_zh || null,
      body,
      language: data.language || 'en',
      collection: getCollection(file),
      series: data.series || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date || null,
      og_description: data.og_description || null,
    });

    console.log(`  add: ${data.slug} → ${getCollection(file)}`);
  }

  if (items.length === 0) {
    console.log('Nothing to sync.');
    return;
  }

  console.log(`\nSyncing ${items.length} items to ${API_URL}/api/content ...`);

  const res = await fetch(`${API_URL}/api/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(items),
  });

  const result = await res.json();

  if (res.ok) {
    console.log(`Done. ${result.upserted} items upserted.`);
  } else {
    console.error(`Error: ${res.status}`, result);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const publishedDir = path.resolve(__dirname, '../../published');

let files;
if (args.length > 0) {
  files = args.map(f => path.resolve(f));
} else {
  files = findFiles(publishedDir);
}

console.log(`Found ${files.length} files\n`);
syncFiles(files);
