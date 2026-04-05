import { Backdrop, CircularProgress } from "@mui/material";

const LoadingOverlay = ({ open }) => (
  <Backdrop open={open} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <CircularProgress color="inherit" />
  </Backdrop>
);

export default LoadingOverlay;
