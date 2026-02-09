import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (!meetingCode) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div
        className="navBar"
        style={{
          backgroundColor: "#0D1117",
          color: "white",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>
            <span style={{ color: "#F59E0B" }}>#Connect</span> Now
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconButton
            sx={{ color: "white" }}
            onClick={() => navigate("/history")}
          >
            <RestoreIcon />
          </IconButton>
          <p style={{ marginRight: "20px" }}>History</p>

          <Button
            sx={{
              color: "#F59E0B",
              border: "1px solid #F59E0B",
              "&:hover": {
                backgroundColor: "#F59E0B",
                color: "#000",
              },
            }}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className="meetContainer"
        style={{
          backgroundColor: "#0D1117",
          minHeight: "calc(100vh - 70px)",
          color: "white",
        }}
      >
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education</h2>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Meeting Code"
                variant="outlined"
                InputProps={{
                  sx: {
                    backgroundColor: "#020617",
                    color: "white",
                    borderRadius: "6px",
                  },
                }}
                InputLabelProps={{
                  sx: { color: "#9CA3AF" },
                }}
              />

              <Button
                onClick={handleJoinVideoCall}
                variant="contained"
                sx={{
                  backgroundColor: "#F59E0B",
                  color: "#000",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#D97706",
                  },
                }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img
            srcSet="/logo3.png"
            alt=""
            style={{
              filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
