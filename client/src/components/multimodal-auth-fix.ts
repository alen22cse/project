// Fix for multimodal authentication
export const createFormDataWithAuth = (fileData: FormData) => {
  const token = localStorage.getItem("auth_token");
  
  return async (url: string) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fileData,
      credentials: "include",
    });
    
    if (!response.ok) {
      const text = (await response.text()) || response.statusText;
      throw new Error(`${response.status}: ${text}`);
    }
    
    return response.json();
  };
};