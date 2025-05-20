const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log('Backend URL:', backendUrl); 

export async function getData() {
  const response = await fetch(`${backendUrl}/data-endpoint`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function postData(data) {
  const response = await fetch(`${backendUrl}/data-endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}