import React, { useEffect, useState, useRef } from 'react';
import { diffWords } from 'diff';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const PreviewPage = ({ oldPdf, newPdf, pdfNames }) => {
  const navigate = useNavigate();
  const [diffResult, setDiffResult] = useState([]);
  const [changeRecords, setChangeRecords] = useState([]);
  const [percentage, setPercentage] = useState(10); // Start with 10%
  const [oldPdfLength, setOldPdfLength] = useState('');
  const [newPdfLength, setNewPdfLength] = useState('');
  const oldPdfRef = useRef(null);
  const newPdfRef = useRef(null);

  const getLimitedWords = (text, percentage, previousPercentage = 0) => {
    const paragraphs = text.split(/\n+/); // Split by paragraphs
    const totalWords = text.split(/\s+/).length;
  
    // Calculate the word limits for the current chunk
    const start = Math.ceil((totalWords * previousPercentage) / 100);
    const end = Math.ceil((totalWords * percentage) / 100);
  
    let wordCount = 0;
    const result = [];
  
    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.split(/\s+/);
  
      // If adding the entire paragraph is within the limit
      if (wordCount + paragraphWords.length <= end) {
        if (wordCount >= start) result.push(paragraph); // Include paragraphs within the chunk range
        wordCount += paragraphWords.length;
      } else {
        // Add only the remaining words needed from this paragraph
        const remainingWords = end - wordCount;
        if (remainingWords > 0 && wordCount >= start) {
          result.push(paragraphWords.slice(0, remainingWords).join(' '));
        }
        break;
      }
    }
  
    return result.join('\n');
  };
  
  

  useEffect(() => {
    if (!oldPdf) {
      navigate('/');
      return;
    }
    console.log('uuidv4',uuidv4());
    
    const previousPercentage = percentage - 10; // Get the previous chunk
  
    const limitedOldPdf = getLimitedWords(oldPdf, percentage, previousPercentage);
    const limitedNewPdf = getLimitedWords(newPdf, percentage, previousPercentage);
  
    const diff = diffWords(limitedOldPdf, limitedNewPdf);
    const tempChangeRecords = [];
  
    const updatedResults = diff.map((part, i, array) => {
      const changes = {
        title: '',
        addedText: '',
        removedText: '',
        pointerName: '',
        oldPdf: '',
        newPdf: ''
      };
      let uuidv4New = uuidv4()
      const updateText = part.value.replace(/\n/g, '<br/>');
      let resultClass = '';
  
      if (i < array.length - 1) {
        if (part.removed) {
          changes.newPdf = `show_${i + 1}`;
          if (array[i + 1].added) {
            resultClass = `replacedText show_${i}`;
            changes.title = 'Replaced';
            changes.addedText = array[i + 1].value;
            changes.removedText = array[i].value;
            changes.oldPdf = `show_${i}`;
          } else {
            resultClass = `removedWord show_${i}`;
            changes.title = 'Removed';
            changes.removedText = array[i].value;
            changes.oldPdf = `show_${i}`;
          }
        } else if (part.added) {
          if (!array[i - 1]?.removed) {
            resultClass = `addedText show_${i}`;
            changes.title = 'Added';
            changes.addedText = array[i].value;
            changes.newPdf = `show_${i}`;
          }
        }
        changes.pointerName = `scrollPoint_${uuidv4New}`;
        if (changes.title !== '') {
          tempChangeRecords.push(changes);
        }
      }
  
      return {
        span: (
          <span
            key={`diff_${i}_${part.value}`}
            className={`${part.removed ? 'removed show_' + i : ''} ${part.added ? 'added show_' + i : ''}`}
            dangerouslySetInnerHTML={{ __html: updateText }}
          />
        ),
        id: `scrollPoint_${uuidv4New}`,
      };
    });
    console.log("updatedResults",updatedResults);
    
    setDiffResult((prev) => [...prev, ...updatedResults]); // Append new results
    setChangeRecords((prev) => [...prev, ...tempChangeRecords]); // Append new changes
    loadMoreWords()
  }, [oldPdf, newPdf, percentage, navigate]);
  

  const handleScrollToChange = (pointerName, oldPdfClass, newPdfClass, title) => {
    const clearHighlights = (containerRef) => {
      if (containerRef.current) {
        containerRef.current.querySelectorAll('.highlightsText').forEach((el) => {
          el.classList.remove('highlightsText');
        });
      }
    };

    clearHighlights(oldPdfRef);
    clearHighlights(newPdfRef);

    if (title === 'Replaced') {
      if (oldPdfRef.current) {
        const oldElement = oldPdfRef.current.querySelector(`.${oldPdfClass}`);
        oldElement?.classList.add('highlightsText');
      }
      if (newPdfRef.current) {
        const newElement = newPdfRef.current.querySelector(`.${newPdfClass}`);
        newElement?.classList.add('highlightsText');
      }
    } else if (title === 'Added') {
      if (newPdfRef.current) {
        const newElement = newPdfRef.current.querySelector(`.${newPdfClass}`);
        newElement?.classList.add('highlightsText');
      }
    } else if (title === 'Removed') {
      if (oldPdfRef.current) {
        const oldElement = oldPdfRef.current.querySelector(`.${oldPdfClass}`);
        oldElement?.classList.add('highlightsText');
      }
    }

    const element = document.getElementById(pointerName);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const loadMoreWords = () => {
    if (percentage < 100) {
      setPercentage((prev) => Math.min(prev + 10, 100));
    }
  };

  return (
    <div className='PreviewPage'>
      <div className='PdfDiffView'>
        <div className='oldPdf' ref={oldPdfRef}>
          <div className='pdfName'>Old PDF: <b>{pdfNames.oldPdfName}</b></div>
          {diffResult.map((result) => (
            <span key={result.id} id={result.id}>
              {result.span}
            </span>
          ))}
        </div>
        <div className='newPdf' ref={newPdfRef}>
          <div className='pdfName'>New PDF: <b>{pdfNames.newPdfName}</b></div>
          {diffResult.map((result) => (
            <span key={result.id} id={result.id}>
              {result.span}
            </span>
          ))}
        </div>
      </div>
      <div className='changesShow'>
        <span>Changes:</span>
        {changeRecords.map((changes, i) => (
          <div
            key={`change_${i}_${changes.title}`}
            className='changesContainer'
            onClick={() => handleScrollToChange(changes.pointerName, changes.oldPdf, changes.newPdf, changes.title)}
          >
            <span>{i + 1}. {changes.title}</span>
            <span style={{ color: 'green' }}>{changes.addedText}</span>
            <span style={{ color: 'red' }}>{changes.removedText}</span>
          </div>
        ))}
      </div>
      {percentage < 100 && (
        // <button onClick={loadMoreWords} className='loadMore'>
        //   Load More
        // </button>
        <>
        </>
      )}
    </div>
  );
};

export default PreviewPage;
