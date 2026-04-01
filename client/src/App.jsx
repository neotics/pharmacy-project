import AppRoutes from "./routes/AppRoutes";
import LanguageSwitcher from "./components/LanguageSwitcher";

const App = () => (
  <>
    <LanguageSwitcher />
    <AppRoutes />
  </>
);

export default App;
