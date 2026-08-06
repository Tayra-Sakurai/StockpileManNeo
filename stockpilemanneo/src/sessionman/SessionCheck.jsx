import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import supabase from "../client";

/**
 * Backend session management and OAuth/Auth Callback handler component.
 * Verifies Supabase authentication session status, handles auth callbacks (sign in, sign out, password recovery),
 * and redirects unauthenticated users to the sign in page.
 *
 * @param {object} props
 * @param {React.ReactNode=} props.children Optional child components to render when authenticated.
 * @param {string=} props.redirectTo Path to redirect when user is not logged in (default: '/signin').
 * @param {boolean=} props.autoRedirect Whether to automatically redirect when unauthenticated (default: true).
 * @param {boolean=} props.autoSignInAnonymously Whether to automatically sign in visitors anonymously if no session exists (default: false).
 * @returns {JSX.Element}
 */
function SessionCheck({ children, redirectTo = "/signin", autoRedirect = true, autoSignInAnonymously = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    // Parse URL hash or search query parameters for potential auth callback errors
    const parseUrlErrors = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#")
          ? window.location.hash.substring(1)
          : window.location.hash
      );

      const errorMsg =
        searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error");

      if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
      }
    };

    parseUrlErrors();

    const shouldRedirect = (targetPath) => {
      const currentPath = window.location.pathname;
      return currentPath !== targetPath && currentPath !== "/signup";
    };

    // Fetch initial Supabase auth session / callback session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }
        if (isMounted) {
          if (currentSession) {
            setSession(currentSession);
            setStatusMessage("ログイン中です。");
          } else if (autoSignInAnonymously) {
            // Automatically sign in visitors if enabled
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
            if (!anonError && anonData?.session) {
              setSession(anonData.session);
              setStatusMessage("匿名ユーザーとしてサインインしました。");
            } else if (autoRedirect && shouldRedirect(redirectTo)) {
              navigate(redirectTo);
            }
          } else if (autoRedirect && shouldRedirect(redirectTo)) {
            navigate(redirectTo);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "セッションの確認中にエラーが発生しました。");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Subscribe to auth state changes (handles sign in callback, sign out callback, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);

      if (event === "SIGNED_IN") {
        setStatusMessage("サインインが完了しました。");
        setError(null);
      } else if (event === "SIGNED_OUT") {
        setStatusMessage("サインアウトしました。");
        setSession(null);
        if (autoRedirect && shouldRedirect(redirectTo)) {
          navigate(redirectTo);
        }
      } else if (event === "PASSWORD_RECOVERY") {
        setStatusMessage("パスワード再設定のリクエストを確認しました。");
      } else if (event === "USER_UPDATED") {
        setStatusMessage("ユーザー情報を更新しました。");
      } else if (!newSession && autoRedirect && shouldRedirect(redirectTo)) {
        navigate(redirectTo);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, redirectTo, autoRedirect, autoSignInAnonymously]);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setStatusMessage("サインアウトしました。");
      setSession(null);
      if (autoRedirect) {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err?.message || "サインアウトに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate(redirectTo);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          セッションおよび認証情報を確認中...
        </Typography>
      </Box>
    );
  }

  if (!session) {
    if (children && !autoRedirect) {
      return <>{children}</>;
    }
    return (
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 450,
          mx: "auto",
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        ) : (
          <Alert severity="info" sx={{ width: "100%" }}>
            {statusMessage || "セッションが存在しないか、サインアウトされました。"}
          </Alert>
        )}
        <Button variant="contained" color="primary" onClick={handleGoToSignIn}>
          サインイン画面へ
        </Button>
      </Paper>
    );
  }

  if (children) {
    return <>{children}</>;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 450,
        mx: "auto",
        mt: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
      {statusMessage && <Alert severity="success" sx={{ width: "100%" }}>{statusMessage}</Alert>}
      <Typography variant="h6" component="h2">
        ログイン中です。
      </Typography>
      {session.user?.email && (
        <Typography variant="body2" color="text.secondary">
          ログインユーザー: {session.user.email}
        </Typography>
      )}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleSignOut}
        sx={{ mt: 1 }}
      >
        サインアウト
      </Button>
    </Paper>
  );
}

export default SessionCheck;