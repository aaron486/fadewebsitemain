import React from 'react';
import ReactDOM from 'react-dom/client';
import DeckBuilder from './DeckBuilder.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('deck-root')).render(
  <React.StrictMode>
    <DeckBuilder />
  </React.StrictMode>
);
