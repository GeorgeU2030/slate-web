import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Rating } from "@/pages/Rating";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/landing" replace />,
    },
    {
        path: "/landing",
        element: <Landing />,
    },
    {   path: "/register", element: <Register /> },
    {   path: "/login", element: <Login /> },
    {
        element: <ProtectedRoute />,
        children: [
          { path: "/home", element: <Home /> },
          { path: "/rating", element: <Rating /> },
        ],
    },
])