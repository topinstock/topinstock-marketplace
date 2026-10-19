async function checkVisible() {
  const res = await fetch('http://localhost:3000/search?q=rucsac');
  let html = await res.text();
  // Strip image URLs and json image arrays
  html = html.replace(/https:\/\/[^"'\s]+flippy[^"'\s]+/gi, '');
  const remainingMatches = [...html.matchAll(/(.{0,50}flippy.{0,50})/gi)].map(m => m[0]);
  console.log('Visible text matches for flippy on search page:', remainingMatches.length);
  remainingMatches.forEach((m, i) => console.log(i, ':', m));

  const teoMatches = [...html.replace(/https:\/\/[^"'\s]+teomarket[^"'\s]+/gi, '').matchAll(/(.{0,50}teomarket.{0,50})/gi)].map(m => m[0]);
  console.log('Visible text matches for teomarket on search page:', teoMatches.length);
  teoMatches.forEach((m, i) => console.log(i, ':', m));
}
checkVisible().then(() => process.exit(0)).catch(console.error);
