import { NotepadApp } from './components/NotepadApp';
import { ErrorProvider } from './contexts/ErrorContext';
import './App.css';
import './styles/polish.css';

function App() {
  return (
    <ErrorProvider>
      <div className="App">
        <NotepadApp />
      </div>
    </ErrorProvider>
  );
}

export default App;
