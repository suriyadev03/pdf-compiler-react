import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = ({setOldPdf,setNewPdf,setPdfNames}) => {
  const navigate = useNavigate();

  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === "pdf1") {
      setPdf1(files[0]);
    } else if (name === "pdf2") {
      setPdf2(files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!pdf1 || !pdf2) {
      setError("Both PDF files must be selected.");
      return;
    }
    
    setPdfNames({
      oldPdfName: pdf1.name,
      newPdfName: pdf2.name,
    });
    
    setError("");
    const formData = new FormData();
    formData.append('pdf1', pdf1);
    formData.append('pdf2', pdf2);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOldPdf(response.data.text1);
      setNewPdf(response.data.text2);
      navigate('/preview')
    } catch (err) {
      setError("Error uploading files. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className='uploadPage'>
      <form>
        <div>
        <h2>Select Files to Compare</h2>
        <div>
          <div className="selectPdf">
            <span>Old PDF</span>
            <div className="pdf-wrapper">
              <canvas id="pdf-canvas-old"></canvas>
              <div id="remove-old-pdf" className="remove-pdf"><i className="fa fa-close"></i>
              </div>
            </div>
            <span className="old-pdf-name">No file chosen</span>
            <input type="file" className="pdf-selector" id="old-pdf-selector" name="pdf1" accept=".pdf" required="" onChange={handleFileChange}/>
          </div>
          <div className="selectPdf">
            <span>New PDF</span>
            <div className="pdf-wrapper">
              <canvas id="pdf-canvas-new"></canvas>
              <div id="remove-new-pdf" className="remove-pdf"><i className="fa fa-close"></i>
              </div>
            </div>
            <span className="new-pdf-name">No file chosen</span>
            <input type="file" className="pdf-selector" id="new-pdf-selector" name="pdf2" accept=".pdf" required="" onChange={handleFileChange}/>
          </div>
        </div>
        <button type="submit" onClick={handleUpload}>Compare</button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
