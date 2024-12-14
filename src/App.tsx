import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { Separator } from "./components/ui/separator";
import { P } from "./components/ui/typography";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="mx-auto max-w-7xl p-8 flex justify-center items-center space-y-4">
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>
            <P className="font-bold text-lg">Glacial</P>
          </div>
          <Separator orientation="vertical" />
          <div>
            <P>QR-based data archival and retrieval</P>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
