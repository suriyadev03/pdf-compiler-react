import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from './components/uploadPage';
import PreviewPage from './components/PreviewPage';
import Header from './components/Header';
import './app.css';
import Loader from './components/Loader';

const App = () => {
  const [oldPdf, setOldPdf] = useState('');
  const [newPdf, setNewPdf] = useState('');
  const [loader, setLoder] = useState(false)
  const [loadPercentage,setLoadPercentage] = useState(0)
  const [pdfNames, setPdfNames] = useState({
    oldPdfName : '',
    newPdfName : '',
  });

  return (
    <React.Fragment>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<UploadPage setOldPdf={setOldPdf} setNewPdf={setNewPdf} setPdfNames={setPdfNames} setLoder={setLoder}/>} />
          <Route path="/preview" element={<PreviewPage oldPdf={oldPdf} newPdf={newPdf} pdfNames={pdfNames} setLoder={setLoder} setLoadPercentage={setLoadPercentage}/>} />
        </Routes>
      </Router>
      {loader && <Loader loadPercentage={loadPercentage}/>}
    </React.Fragment>
  );
};

export default App;
