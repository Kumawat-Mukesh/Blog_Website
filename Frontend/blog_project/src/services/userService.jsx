// services/userService.jsx
export const getUserProfile = async (token) => {
    const response = await fetch('http://127.0.0.1:8000/api/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }
    
    return response.json();
  };
  