/**
 * @fileoverview The session management component.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
