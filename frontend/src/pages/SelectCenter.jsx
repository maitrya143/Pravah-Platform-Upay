import React, { useEffect, useState } from 'react';

function SelectCenter() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem('pravah_token');
      if (!token) {
        setError('Missing auth token. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/center/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load centers');
        }

        const data = await response.json();
        setCenters(data);
      } catch (err) {
        setError(err.message || 'Unable to fetch centers');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const handleSelectCenter = (centerId) => {
    localStorage.setItem('pravah_center_id', centerId);
    window.location.href = '/dashboard';
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Loading centers...</p>;
  }

  if (error) {
    return <p style={{ padding: 24, color: 'red' }}>{error}</p>;
  }

  if (!centers.length) {
    return <p style={{ padding: 24 }}>No centers assigned.</p>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Select Center</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {centers.map((center) => (
          <button
            key={center.center_id}
            onClick={() => handleSelectCenter(center.center_id)}
            style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, background: '#fff', textAlign: 'left' }}
          >
            <strong>{center.center_id}</strong>
            {center.city && <div style={{ color: '#666', fontSize: 14 }}>{center.city}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectCenter;

