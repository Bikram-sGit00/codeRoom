import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import RoomPage from "./pages/RoomPage";
import Post from "./pages/Post";

function RouterHandler() {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<App />} />

        {/* Dynamic room route */}
        <Route path="/room/:roomId" element={<RoomPage />} />

        {/* ✅ Separate Post page */}
        <Route path="/room/:roomId/post" element={<Post />} />
      </Routes>
    </Router>
  );
}

export default RouterHandler;
