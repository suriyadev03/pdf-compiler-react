import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from './components/uploadPage';
import PreviewPage from './components/PreviewPage';
import Header from './components/Header';
import './app.css';

const App = () => {
  const [oldPdf, setOldPdf] = useState('');
  const [newPdf, setNewPdf] = useState('');
  const [pdfNames, setPdfNames] = useState({
    oldPdfName : '',
    newPdfName : '',
  });

  return (
    <React.Fragment>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<UploadPage setOldPdf={setOldPdf} setNewPdf={setNewPdf} setPdfNames={setPdfNames}/>} />
          {/* Pass props to the element directly */}
          <Route path="/preview" element={<PreviewPage oldPdf={oldPdf} newPdf={newPdf} pdfNames={pdfNames}/>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
