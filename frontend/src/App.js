import React, { useState } from 'react';
import axios from 'axios';
import FaultyTerminal from './components/FaultyTerminal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://k8s-urlshort-urlshort-473648339e-480246510.eu-central-1.elb.amazonaws.com';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      setError('Please enter a URL!');
      return;
    }

    try {
      new URL(longUrl);
    } catch {
      setError('Please enter a valid URL!');
      return;
    }

    setLoading(true);
    setError('');
    setShortUrl('');
    setStats(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/shorten`, {
        url: longUrl
      });
      
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while shortening the URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shortUrl);
        alert('URL copied to clipboard!');
      } else {
        // Fallback for HTTP or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback for HTTP or older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('URL copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Failed to copy URL. Please copy manually: ' + shortUrl);
      }
    }
  };

  const fetchStats = async () => {
    if (!shortUrl) return;
    
    const shortCode = shortUrl.split('/').pop();
    try {
      const response = await axios.get(`http://k8s-urlshort-urlshort-473648339e-480246510.eu-central-1.elb.amazonaws.com/api/stats/${shortCode}`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <FaultyTerminal
          scale={2.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#ff0000"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={1}
        />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  URL Shortener
                </h1>
          <p className="text-xl text-white/90 leading-relaxed drop-shadow-md">
            Shorten your long URLs simply and quickly
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* URL Form */}
          <div className="card animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="input-field flex-1"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Shortening...
                    </span>
                  ) : (
                    'Shorten'
                  )}
                </button>
              </div>
            </form>
          </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg animate-slide-up">
                    <div className="flex items-center gap-2">
                      {error}
                    </div>
                  </div>
                )}

          {/* Result Section */}
          {shortUrl && (
            <div className="card animate-slide-up space-y-6">
              {/* Short URL Display */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-white">
                  Short URL:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={shortUrl} 
                    readOnly 
                    className="input-field font-mono text-sm bg-black text-white"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Stats Section */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <button
                  onClick={fetchStats}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Show Statistics
                </button>
                
                {stats && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 space-y-4 animate-fade-in border border-white/20" style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
                        }}>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Statistics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                        boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="font-medium text-white/90">Click Count:</span>
                        <span className="font-bold text-white text-lg">
                          {stats.clickCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                        boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="font-medium text-white/90">Created:</span>
                        <span className="font-mono text-sm text-white/80">
                          {new Date(stats.createdAt).toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/70 text-sm drop-shadow-sm">
          <p>DevOps Portfolio Project - URL Shortener Microservice</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
