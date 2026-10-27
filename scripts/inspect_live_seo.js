async function inspectLive() {
  const res = await fetch('https://topinstock.ro');
  const html = await res.text();

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const metaRobots = html.match(/<meta[^>]*robots[^>]*>/gi);
  const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi);
  const schemas = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*>/gi);

  console.log('Title:', titleMatch ? titleMatch[1] : 'none');
  console.log('Meta robots:', metaRobots);
  console.log('Canonical:', canonical);
  console.log('Meta description:', metaDesc);
  console.log('Schemas count:', schemas ? schemas.length : 0);
  if (schemas) {
    schemas.forEach((s, idx) => {
      const clean = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
      try {
        const parsed = JSON.parse(clean);
        console.log(`Schema ${idx} (@type: ${parsed['@type']}):`, JSON.stringify(parsed, null, 2).slice(0, 300));
      } catch (e) {
        console.log(`Schema ${idx} (raw):`, clean.slice(0, 150));
      }
    });
  }
}

inspectLive().catch(console.error);

