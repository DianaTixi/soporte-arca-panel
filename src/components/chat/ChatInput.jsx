import { useState } from "react";
import { Box, TextField, IconButton, Tooltip } from "@mui/material";
import { Send, Stop } from "@mui/icons-material";

const ChatInput = ({ onSend, streaming, onAbort }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !streaming) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-end",
        p: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Escribe tu pregunta..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={streaming}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "grey.50",
          },
        }}
      />
      {streaming ? (
        <Tooltip title="Detener">
          <IconButton onClick={onAbort} color="error" sx={{ mb: 0.5 }}>
            <Stop />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Enviar (Enter)">
          <span>
            <IconButton
              type="submit"
              color="primary"
              disabled={!value.trim()}
              sx={{ mb: 0.5 }}
            >
              <Send />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default ChatInput;
