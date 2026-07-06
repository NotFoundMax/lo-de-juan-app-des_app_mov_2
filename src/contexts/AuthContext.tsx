import { onAuthStateChanged, User } from "firebase/auth";
import { get, ref, set } from "firebase/database";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Role, ROLES } from "../constants/roles";
import { signOut as authSignOut } from "../services/auth-rtdb";
import { auth, rtdb } from "../services/firebase-rtdb";

// Crea o recupera el documento del usuario
async function ensureUserDoc(user: User): Promise<Role> {
  const userRef = ref(rtdb, `users/${user.uid}`);
  const snap = await get(userRef);
  if (snap.exists()) return snap.val().role as Role;
  const role: Role = ROLES.CUSTOMER;
  await set(userRef, {
    name: user.email?.split("@")[0] || "User",
    email: user.email,
    role,
    createdAt: new Date().toISOString(),
  });
  return role;
}

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provee el contexto de autenticación a los hijos
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await ensureUserDoc(user);
          setState({ user, role, loading: false });
        } catch {
          setState({ user, role: null, loading: false });
        }
      } else {
        setState({ user: null, role: null, loading: false });
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await authSignOut();
    setState({ user: null, role: null, loading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        isAdmin: state.role === ROLES.ADMIN,
        isEmployee: state.role === ROLES.EMPLOYEE,
        isCustomer: state.role === ROLES.CUSTOMER,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Consume el contexto de autenticación de forma segura
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
