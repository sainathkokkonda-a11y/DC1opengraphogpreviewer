async function fetchOgData() {
  let url = document.getElementById('urlInput').value.trim();
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    document.getElementById('urlInput').value = url;
  }

  const loading = document.getElementById('loading');
  const previewBox = document.getElementById('previewBox');
  const previewLabel = document.getElementById('previewLabel');

  loading.style.display = 'block';
  previewBox.style.display = 'none';

  try {
    // Primary API Request
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const result = await response.json();

    if (result.status === 'success' && (result.data.title || result.data.image)) {
      renderPreview(
        result.data.title || 'No Title Found',
        result.data.description || 'No Description Found',
        result.data.publisher || new URL(url).hostname,
        result.data.image ? result.data.image.url : 'https://via.placeholder.com/600x315?text=No+OG+Image'
      );
    } else {
      // Fallback Mechanism using Open Graph HTML Parsing
      fetchFallback(url);
    }
  } catch (error) {
    fetchFallback(url);
  } finally {
    loading.style.display = 'none';
  }
}

async function fetchFallback(targetUrl) {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
    const data = await res.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    const title = doc.querySelector('meta[property="og:title"]')?.content || doc.querySelector('title')?.innerText || 'No Title Found';
    const desc = doc.querySelector('meta[property="og:description"]')?.content || doc.querySelector('meta[name="description"]')?.content || 'No Description Found';
    const image = doc.querySelector('meta[property="og:image"]')?.content || 'https://via.placeholder.com/600x315?text=No+OG+Image';

    renderPreview(title, desc, new URL(targetUrl).hostname, image);
  } catch (err) {
    alert('Could not fetch details for this URL. Please try another public web link.');
  }
}

function renderPreview(title, desc, domain, image) {
  document.getElementById('ogTitle').innerText = title;
  document.getElementById('ogDesc').innerText = desc;
  document.getElementById('ogDomain').innerText = domain;
  document.getElementById('ogImage').src = image;

  document.getElementById('previewLabel').style.display = 'block';
  document.getElementById('previewBox').style.display = 'block';
}
