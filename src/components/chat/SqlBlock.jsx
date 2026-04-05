import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const SqlBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: "relative", my: 1.5, borderRadius: 2, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#282c34",
          px: 2,
          py: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "#abb2bf" }}>
          SQL
        </Typography>
        <Tooltip title={copied ? "Copiado!" : "Copiar query"}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: "#abb2bf" }}>
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        language="sql"
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  );
};

export default SqlBlock;
