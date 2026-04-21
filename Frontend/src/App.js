import Main from "./components/Main";
import './assets/css/bootstrap.min.css';
import './assets/css/fontawesome.min.css';
import './assets/css/brands.min.css';
import './assets/css/regular.min.css';
import './assets/css/solid.min.css';
import { ThemeProvider } from './ThemeContext';
import ThemeCustomizer from './components/layout/ThemeCustomizer/ThemeCustomizer';
import { ToastProvider } from './components/ui/Toast/Toast';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="App">
          <Main />
          <ThemeCustomizer />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
