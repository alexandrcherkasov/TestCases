import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Button, Container, Form, Row, Stack } from "react-bootstrap";
import Auth from "./Auth/Auth";
import PredictionBall from "./PredictionBall/PredictionBall";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Container fluid className="vh-100">
      <h1 className="text-center">Шар предсказаний</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/Ball"
            element={
              <ProtectedRoute>
                <PredictionBall />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;
