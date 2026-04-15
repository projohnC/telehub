import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TvDetails from "./pages/TvDetails";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import SimilarMov from "./pages/SimilarMov";
import SimilarSeries from "./pages/SimilarSeries";
import SearResults from "./pages/SearchResults";
import Tg from "./pages/Tg";
import ActionPage from "./pages/ActionPage";
// import Token from "./pages/Token";
import NotFoundPage from "./pages/NotFound";
// import Login from "./pages/Login";

import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AdManager from "./components/AdManager";
import AdBlockDetector from "./components/AdBlockDetector";
// import PrivateRoute from "./components/PrivateRoute";

// import { AuthProvider } from "./context/AuthContext";

import ReactGa from "react-ga";
import { useEffect } from "react";
// import { ToastContainer } from "react-toastify";
import { Route, Routes, useLocation } from "react-router-dom";


function App() {
  ReactGa.initialize("G-JDFS7KRV40");
  const location = useLocation();
  const isVerificationPage = ["/tg", "/dow", "/plyr"].includes(location.pathname);

  useEffect(() => {
    ReactGa.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <div className={isVerificationPage ? "bg-[#050a18] min-h-screen" : ""}>
      <AdManager />
      <AdBlockDetector />
      <Nav />
      <div className={isVerificationPage ? "" : "p-3 md:p-10"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="mov/:movieID"
            element={<MovieDetails />}
          />
          <Route
            path="ser/:seriesID"
            element={<TvDetails />}
          />
          <Route
            path="/Movies"
            element={<Movies />}
          />
          <Route
            path="/Series"
            element={<Series />}
          />
          <Route
            path="*"
            element={<NotFoundPage />}
          />
          <Route
            path="/similarMov/:movieID"
            element={<SimilarMov />}
          />
          <Route
            path="/similarSeries/:seriesID"
            element={<SimilarSeries />}
          />

          <Route
            path="/search/:searchResult"
            element={<SearResults />}
          />
          <Route
            path="/tg"
            element={<Tg />}
          />
          <Route
            path="/dow"
            element={<ActionPage actionType="Download" />}
          />
          <Route
            path="/plyr"
            element={<ActionPage actionType="Player" />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
