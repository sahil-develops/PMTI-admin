export async function loginUser(credentials: { email: string; password: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    return response.json()
  }
  
  export async function fetchClasses(params?: {
    limit?: number
    page?: number
    sort?: string
  }) {
    const queryParams = new URLSearchParams(params as any).toString()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class/?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.json()
  }
  