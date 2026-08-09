import { createContext } from "react";

/**
 * The user data viewer.
 * @type {import("react").Context<import("@supabase/supabase-js").User|null>}
 */
const UserViewContext = createContext(null);

export default UserViewContext;