export default async function handler(req, res) {
  // Read backend base URL from env variables
  const baseUrl = process.env.VITE_BASE_URL || 'https://hubstream.sujanbotz.workers.dev';
  
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch sitemap from backend: ${response.statusText}`);
    }
    const xml = await response.text();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
