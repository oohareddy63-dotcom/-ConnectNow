import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Snackbar } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

/* =========================
   DARK + ORANGE THEME
========================= */
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0D1117",
      paper: "rgba(17, 25, 40, 0.9)",
    },
    primary: {
      main: "#F59E0B", // Orange
    },
    secondary: {
      main: "#F59E0B",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = Login, 1 = Register
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      setError("");
      setMessage("");

      if (formState === 0) {
        if (!username || !password) {
          setError("Please enter both username and password");
          return;
        }
        await handleLogin(username, password);
      }

      if (formState === 1) {
        if (!name || !username || !password) {
          setError("Please fill all fields");
          return;
        }
        const res = await handleRegister(name, username, password);
        setMessage(res || "Registration successful!");
        setOpen(true);
        setFormState(0);
        setName("");
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
      setOpen(true);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        {/* LEFT SIDE – DARK GRADIENT */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background:
              "radial-gradient(circle at top right, #1f1b3a, #0d1117 60%)",
          }}
        />

        {/* RIGHT SIDE – AUTH CARD */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={10}
          sx={{
            background: "rgba(17, 25, 40, 0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* BRAND */}
            <h2 style={{ color: "#F59E0B", marginBottom: "5px" }}>
              #ConnectNow
            </h2>
            <p style={{ color: "#9CA3AF", marginBottom: "20px" }}>
              {formState === 0
                ? "Sign in to continue"
                : "Create a new account"}
            </p>

            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            {/* LOGIN / REGISTER TOGGLE */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant={formState === 0 ? "contained" : "text"}
                sx={{ color: "white", mr: 1 }}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "text"}
                sx={{ color: "white" }}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            {/* FORM */}
            <Box sx={{ width: "100%" }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputProps={{
                    sx: {
                      backgroundColor: "#0D1117",
                      borderRadius: "8px",
                    },
                  }}
                />
              )}

              <TextField
                margin="normal"
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  sx: {
                    backgroundColor: "#0D1117",
                    borderRadius: "8px",
                  },
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  sx: {
                    backgroundColor: "#0D1117",
                    borderRadius: "8px",
                  },
                }}
              />

              {error && (
                <p style={{ color: "#EF4444", marginTop: "8px" }}>{error}</p>
              )}

              {/* CTA BUTTON */}
              <Button
                fullWidth
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: "#F59E0B",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#D97706",
                  },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
