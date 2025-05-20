import React, { useEffect, useState } from 'react';
import { getData, postData } from '../app/api'; 

const MyPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getData().then(response => setData(response)).catch(error => console.error(error));
  }, []);

  const handleSubmit = (formData) => {
    postData(formData).then(response => {
      console.log('Data submitted successfully:', response);
    }).catch(error => console.error(error));
  };

  return (
    <div>
      {data ? (
        <div>Data: {JSON.stringify(data)}</div>
      ) : (
        <div>Loading...</div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit({ name: 'Test' }); }}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MyPage;