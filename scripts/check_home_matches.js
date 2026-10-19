async function check() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  
  // Find all occurrences of flippy and teomarket with 50 chars of context
  const flippyMatches = [...html.matchAll(/(.{0,50}flippy.{0,50})/gi)].map(m => m[0]);
  const teoMatches = [...html.matchAll(/(.{0,50}teomarket.{0,50})/gi)].map(m => m[0]);

  console.log(`Found ${flippyMatches.length} matches for 'flippy'`);
  flippyMatches.slice(0, 5).forEach((m, i) => console.log(`  [flippy ${i}]:`, m.trim()));

  console.log(`\nFound ${teoMatches.length} matches for 'teomarket'`);
  teoMatches.slice(0, 5).forEach((m, i) => console.log(`  [teomarket ${i}]:`, m.trim()));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
