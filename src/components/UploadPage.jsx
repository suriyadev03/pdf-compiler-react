import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import headIcon from '../assets/icon.png'
import addFile from '../assets/addFile.png'

const UploadPage = ({setOldPdf,setNewPdf,setPdfNames,setLoder}) => {
  const navigate = useNavigate();

  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);

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
    setLoder(true)
    setPdfNames({
      oldPdfName: pdf1.name,
      newPdfName: pdf2.name,
    });
    
    // setError("");
    const formData = new FormData();
    formData.append('pdf1', pdf1);
    formData.append('pdf2', pdf2);

    try {
      const response = await axios.post(import.meta.env.VITE_SERVER_URL + "/upload", formData, {
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
      <div className=''>
      <div className='header-section'>
        <h1>Compare PDF files</h1>
        <img className='icon_image' src={headIcon}></img>
        <p>Use our side-by-side PDF comparison software below to highlight changes</p>
      </div>
      <div className='upload_pdf_Section'>
        <form>
          <div className='upload_tool_wrapper'>
          <div className="selectPdf">
            <div className='icon-class'>
            <img src={addFile}></img>
            </div>
            <span> Click Upload a Older PDF version here</span>
            <div className="pdf-wrapper">
              <canvas id="pdf-canvas-old"></canvas>
              <div id="remove-old-pdf" className="remove-pdf"><i className="fa fa-close"></i>
              </div>
            </div>
            <span className="old-pdf-name">{pdf1 ? pdf1.name : 'No file chosen'}</span>
            <input type="file" className="pdf-selector" id="old-pdf-selector" name="pdf1" accept=".pdf" required="" onChange={handleFileChange}/>
          </div>
          <div className="selectPdf">
          <div className='icon-class iconcls2'>
            <img src={addFile}></img>
            </div>
            <span>Click Upload a Newer PDF version here</span>
            <div className="pdf-wrapper">
              <canvas id="pdf-canvas-new"></canvas>
              <div id="remove-new-pdf" className="remove-pdf"><i className="fa fa-close"></i>
              </div>
            </div>
            <span className="new-pdf-name">{pdf2 ? pdf2.name : 'No file chosen'}</span>
            <input type="file" className="pdf-selector" id="new-pdf-selector" name="pdf2" accept=".pdf" required="" onChange={handleFileChange}/>
          </div>
          </div>
          <button type="submit" disabled={!pdf1 || !pdf2} onClick={handleUpload} >Compare</button>
      </form>
      </div>
      </div>
    </div>
  );
};

export default UploadPage;
