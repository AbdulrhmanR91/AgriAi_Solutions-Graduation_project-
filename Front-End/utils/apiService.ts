const API_BASE_URL = 'https://agri-backend-production.up.railway.app/';

export const registerUser = async (formData: FormData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        // حفظ التوكن في localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.userType);
        
        return data;
    } catch (error) {
        throw error;
    }
}; 