import { useState, useEffect } from 'react';

function App() {
  const [textFile, setTextFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTextFile(file);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('imagefile', textFile);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/uploadImage', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('Upload successful');
        fetchImages(); // Refresh the list of images after a successful upload
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image file:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
        const response = await fetch('http://localhost:3000/getImages');
        if (response.ok) {
            const imageFiles = await response.json();
            setImages(imageFiles || []); 
        } else {
            console.error('Error fetching images:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

useEffect(() => {
    fetchImages(); // Fetch the list of images when the component mounts
}, []);

  return (
    <div>
      <h1 className='flex items-center justify-center text-2xl bg-blue-300 p-3'>Drive Image Uploader </h1>

      <div className='flex items-center justify-center py-10 space-x-5'>
        <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white' htmlFor='file_input'>
          Upload file
        </label>
        <input
          type='file'
          name='imagefile'
          accept='.png'
          onChange={handleFileChange}
          className='block text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
          aria-describedby='file_input_help'
          id='file_input'
        />

        <button
          onClick={handleUpload}
          type='button'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5
        me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>
          Upload
        </button>

        {loading && (
          <div className=''>
            {uploadStatus && <p>{uploadStatus}</p>}
          </div>
        )}
      </div>

      <div>
        <h2 className='font-bold'>Uploaded Images:</h2>
        <div>
          {Array.isArray(images) && images.length > 0 ? (
            images.map((image, index) => (
             <div className='flex' key={index}>
               <img
                alt={`Image ${image}`}
                style={{ maxWidth: '100px', margin: '5px' }} // Adjust styling as needed
              />
             </div>
            ))
          ) : (
            <p>No images available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
