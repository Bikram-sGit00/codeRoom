// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import App from "./App";
// import RoomPage from "./pages/RoomPage";

// function RouterHandler() {
//   return (
//     <Router>
//       <Routes>
//         {/* Home route */}
//         <Route path="/" element={<App />} />

//         {/* Dynamic room route */}
//         <Route path="/room/:roomId" element={<RoomPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default RouterHandler;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import RoomPage from "./pages/RoomPage";

function RouterHandler() {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<App />} />

        {/* Dynamic room route */}
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default RouterHandler;
