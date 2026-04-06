import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageTrack from "@/hooks/usePageTrack";

const CheckoutSuccess = () => {
  usePageTrack("success");
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/upsell-erro", { replace: true });
  }, [navigate]);

  return null;
};

export default CheckoutSuccess;
