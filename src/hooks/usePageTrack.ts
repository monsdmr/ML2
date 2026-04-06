import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = (): string => {
  let sid = sessionStorage.getItem("_sid");
  if (!sid) {
    sid = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem("_sid", sid);
  }
  return sid;
};

const usePageTrack = (page: string) => {
  useEffect(() => {
    const sessionId = getSessionId();
    supabase
      .from("page_views" as any)
      .insert({ page, session_id: sessionId } as any)
      .then();
  }, [page]);
};

export default usePageTrack;
