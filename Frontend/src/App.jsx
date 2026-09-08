import { BrowserRouter, Routes, Route} from "react-router-dom";
import UploadInvoice from "./pages/UploadInvoice";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <UploadInvoice />
                    }
                />
            </Routes>
        </BrowserRouter>

    );
}


export default App;