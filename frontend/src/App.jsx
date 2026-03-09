import {Navigate, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {ProtectedRoute, PublicRoute} from './components/RouteGuards';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import MainPage from "./pages/MainPage";
import Quiz from "./pages/Quiz";
import Collection from "./pages/Collection";

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route
                    path="/main-page"
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/verify-email"
                    element={
                        <PublicRoute allowAuthenticated>
                            <VerifyEmail/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <PublicRoute>
                            <ForgotPassword/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/reset-password/:token"
                    element={
                        <PublicRoute>
                            <ResetPassword/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/forgot-password/:token"
                    element={
                        <PublicRoute>
                            <ResetPassword/>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/questionnaire"
                    element={
                        <ProtectedRoute>
                            <Quiz />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/collection"
                    element={
                        <ProtectedRoute>
                            <Collection />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </AuthProvider>
    );
};

export default App;
