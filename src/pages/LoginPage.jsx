import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, SupportAgent } from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Bienvenido, ${data.usuario.nombre}`);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.msg || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", p: 1 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <SupportAgent sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="text.primary">
              ARCA Soporte
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Centro de soporte inteligente
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.3 }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
