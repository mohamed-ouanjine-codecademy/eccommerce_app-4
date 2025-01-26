// /client/src/index.js
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Before React 18
// ReactDOM.render(<App />, document.getElementById('root'));

// With React 18+
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);