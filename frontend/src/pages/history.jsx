import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // snackbar later
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, #1f1b3a, #0d1117 60%)",
        color: "white",
        px: 3,
        py: 2,
      }}
    >
      {/* ================= HEADER ================= */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => routeTo("/home")}
          sx={{ color: "#F59E0B", mr: 1 }}
        >
          <HomeIcon />
        </IconButton>

        <Typography variant="h5" fontWeight="bold">
          Meeting History
        </Typography>
      </Box>

      {/* ================= HISTORY LIST ================= */}
      <Box
        sx={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {meetings.length !== 0 ? (
          meetings.map((e, i) => (
            <Card
              key={i}
              sx={{
                background: "rgba(17, 25, 40, 0.85)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.6)",
                border: "1px solid #1f2937",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1">
                  <span
                    style={{
                      color: "#F59E0B",
                      fontWeight: "bold",
                    }}
                  >
                    Code:
                  </span>{" "}
                  {e.meetingCode}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "#9CA3AF", mt: 0.5 }}
                >
                  Date: {formatDate(e.date)}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography sx={{ color: "#9CA3AF", textAlign: "center", mt: 5 }}>
            No meeting history found
          </Typography>
        )}
      </Box>
    </Box>
  );
}
