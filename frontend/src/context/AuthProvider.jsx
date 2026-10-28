import { useState } from "react";
import { AuthContext } from "./AuthContext";

const KEY = "spentwise_user";

function readUser() {
    try {
        return JSON.parse(localStorage.getItem(KEY));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser);

    function login(userData) {
        localStorage.setItem(KEY, JSON.stringify(userData));
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem(KEY);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}