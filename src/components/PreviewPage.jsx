import React, { useEffect, useState, useRef } from 'react';
import { diffWords } from 'diff';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const PreviewPage = ({ oldPdf, newPdf, pdfNames, setLoder,setLoadPercentage }) => {
  const navigate = useNavigate();
  const [diffResult, setDiffResult] = useState([]);
  const [changeRecords, setChangeRecords] = useState([]);
  const [percentage, setPercentage] = useState(10);
  const oldPdfRef = useRef(null);
  const newPdfRef = useRef(null);

  const getLimitedWords = (text, percentage, previousPercentage = 0) => {
    const paragraphs = text.split(/\n+/);
    const totalWords = text.split(/\s+/).length;
  
    const start = Math.ceil((totalWords * previousPercentage) / 100);
    const end = Math.ceil((totalWords * percentage) / 100);
  
    let wordCount = 0;
    const result = [];
  
    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.split(/\s+/);
  
      if (wordCount + paragraphWords.length <= end) {
        if (wordCount >= start) result.push(paragraph);
        wordCount += paragraphWords.length;
      } else {
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
    
    const previousPercentage = percentage - 10;
  
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
          changes.newPdf = `show_${uuidv4New}`;
          if (array[i + 1].added) {
            resultClass = `replacedText show_${i}`;
            changes.title = 'Replaced';
            changes.addedText = array[i + 1].value;
            changes.removedText = array[i].value;
            changes.oldPdf = `show_${uuidv4New}`;
          } else {
            resultClass = `removedWord show_${i}`;
            changes.title = 'Removed';
            changes.removedText = array[i].value;
            changes.oldPdf = `show_${uuidv4New}`;
          }
        } else if (part.added) {
          if (!array[i - 1]?.removed) {
            resultClass = `addedText show_${i}`;
            changes.title = 'Added';
            changes.addedText = array[i].value;
            changes.newPdf = `show_${uuidv4New}`;
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
            className={`${part.removed ? 'removed show_' + uuidv4New : ''} ${part.added ? 'added show_' + uuidv4New : ''}`}
            dangerouslySetInnerHTML={{ __html: updateText }}
          />
        ),
        id: `scrollPoint_${uuidv4New}`,
      };
    });
    
    setDiffResult((prev) => [...prev, ...updatedResults]);
    setChangeRecords((prev) => [...prev, ...tempChangeRecords]);
    loadMoreWords()

  }, [oldPdf, newPdf, percentage, navigate]);
  

  const handleScrollToChange = (pointerName, oldPdfClass, newPdfClass, title) => {
    console.log("oldPdf, newPdf",oldPdfClass, newPdfClass);
    
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
      setLoadPercentage(percentage)
    }else{
      setLoder(false)
      console.log("loadMoreWords end");
      
    }
  };
  return (
   <div className='container'>
      <div className='PreviewPage'>
        <div className='PdfDiffView'>
          <div className='oldPdf' ref={oldPdfRef}>
            <div className='pdfName'>Old PDF: <b>{pdfNames.oldPdfName}</b></div>
            <div className='pdf_Section_content'>
              {diffResult.map((result) => (
                <span key={result.id} id={result.id}>
                  {result.span}
                </span>
              ))}
            </div>
          </div>
          <div className='newPdf' ref={newPdfRef}>
            <div className='pdfName'>New PDF: <b>{pdfNames.newPdfName}</b></div>
            <div className='pdf_Section_content'>
              {diffResult.map((result) => (
                <span key={result.id} id={result.id}>
                  {result.span}
                </span>
              ))}
            </div>
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
      </div>
    </div>
  );
};

export default PreviewPage;
