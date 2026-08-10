import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../client.js";

/**
 * Backend session management and OAuth/Auth Callback handler component.
 * Verifies Supabase authentication session status, handles auth callbacks (sign in, sign out, password recovery),
 * and redirects unauthenticated users to the sign in page.
 * @returns {import("react").JSX.Element}
 */
function SessionCheck() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error)
        navigate('/signin');
      else if (!data?.session)
        navigate('/signin');
      else {
        navigate('/');
      }
    };
    check();
  }, [searchParams, navigate]);

  return (
    <p>セッションを保存中です．しばらくお待ちください．</p>
  );
}

export default SessionCheck;
