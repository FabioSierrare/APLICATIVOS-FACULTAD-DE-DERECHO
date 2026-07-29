const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Service': 'MiSecretoPro_2026', 
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Exporta la función, NO el resultado de la función
export default getAuthHeaders;