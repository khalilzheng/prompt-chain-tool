"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    redirect,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


function normalizeEmail(
    value: string
) {
    return value
        .trim()
        .toLowerCase();
}


function isValidEmail(
    value: string
) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
}


export async function createWhitelistedEmailAction(
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const email =
        normalizeEmail(
            String(
                formData.get(
                    "email"
                ) ??
                ""
            )
        );


    const active =
        formData.get(
            "active"
        ) ===
        "on";


    if (
        !email ||
        !isValidEmail(
            email
        )
    ) {
        redirect(
            "/admin/whitelist/new?error=invalid_email"
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "whitelisted_emails"
            )
            .insert({
                email,
                active,
            });


    if (error) {
        console.error(
            "Could not create whitelisted email:",
            error
        );

        redirect(
            "/admin/whitelist/new?error=create_failed"
        );
    }


    revalidatePath(
        "/admin/whitelist"
    );


    redirect(
        "/admin/whitelist?created=1"
    );
}


export async function updateWhitelistedEmailAction(
    emailId: string,
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const email =
        normalizeEmail(
            String(
                formData.get(
                    "email"
                ) ??
                ""
            )
        );


    const active =
        formData.get(
            "active"
        ) ===
        "on";


    if (
        !email ||
        !isValidEmail(
            email
        )
    ) {
        redirect(
            `/admin/whitelist/${emailId}/edit?error=invalid_email`
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "whitelisted_emails"
            )
            .update({
                email,
                active,
                updated_at:
                    new Date()
                        .toISOString(),
            })
            .eq(
                "id",
                emailId
            );


    if (error) {
        console.error(
            "Could not update whitelisted email:",
            error
        );

        redirect(
            `/admin/whitelist/${emailId}/edit?error=update_failed`
        );
    }


    revalidatePath(
        "/admin/whitelist"
    );


    redirect(
        "/admin/whitelist?updated=1"
    );
}


export async function deleteWhitelistedEmailAction(
    emailId: string
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from(
                "whitelisted_emails"
            )
            .delete()
            .eq(
                "id",
                emailId
            );


    if (error) {
        console.error(
            "Could not delete whitelisted email:",
            error
        );

        redirect(
            "/admin/whitelist?error=delete_failed"
        );
    }


    revalidatePath(
        "/admin/whitelist"
    );


    redirect(
        "/admin/whitelist?deleted=1"
    );
}