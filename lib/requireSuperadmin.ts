import {
    redirect,
} from "next/navigation";

import {
    createClient,
} from "@/utils/supabase/server";


export async function requireSuperadmin() {
    const supabase =
        await createClient();


    /*
     * Step 1:
     * Must be authenticated.
     */
    const {
        data: {
            user,
        },
        error:
            userError,
    } =
        await supabase.auth.getUser();


    if (
        userError ||
        !user
    ) {
        redirect(
            "/login"
        );
    }


    /*
     * Step 2:
     * Authenticated is NOT enough.
     *
     * The profile must explicitly have:
     *
     * is_superadmin = true
     */
    const {
        data:
            profile,

        error:
            profileError,
    } =
        await supabase
            .from(
                "profiles"
            )
            .select(
                "id, first_name, last_name, avatar_url, is_superadmin"
            )
            .eq(
                "id",
                user.id
            )
            .maybeSingle();


    if (
        profileError
    ) {
        console.error(
            "Could not verify admin profile:",
            profileError
        );

        redirect(
            "/unauthorized"
        );
    }


    if (
        !profile ||
        profile.is_superadmin !==
        true
    ) {
        redirect(
            "/unauthorized"
        );
    }


    /*
     * Any page that successfully reaches
     * this return is protected.
     */
    return {
        user,
        profile,
        supabase,
    };
}