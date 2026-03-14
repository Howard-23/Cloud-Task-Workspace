import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles/reset.css';
import './styles/variables.css';
import './styles/globals.css';
import './styles/layout.css';
import './styles/utilities.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/cards.css';
import './styles/tables.css';
import './styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
