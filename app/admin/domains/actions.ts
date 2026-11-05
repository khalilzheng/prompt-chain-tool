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


function normalizeDomain(
    value: string
) {
    return value
        .trim()
        .toLowerCase()
        .replace(
            /^https?:\/\//,
            ""
        )
        .replace(
            /\/.*$/,
            ""
        );
}


export async function createDomainAction(
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const rawDomain =
        String(
            formData.get(
                "domain"
            ) ??
            ""
        );


    const domain =
        normalizeDomain(
            rawDomain
        );


    const active =
        formData.get(
            "active"
        ) ===
        "on";


    if (!domain) {
        redirect(
            "/admin/domains/new?error=missing_domain"
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "allowed_signup_domains"
            )
            .insert({
                domain,
                active,
            });


    if (error) {
        console.error(
            "Could not create allowed signup domain:",
            error
        );

        redirect(
            "/admin/domains/new?error=create_failed"
        );
    }


    revalidatePath(
        "/admin/domains"
    );


    redirect(
        "/admin/domains?created=1"
    );
}


export async function updateDomainAction(
    domainId: string,
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const rawDomain =
        String(
            formData.get(
                "domain"
            ) ??
            ""
        );


    const domain =
        normalizeDomain(
            rawDomain
        );


    const active =
        formData.get(
            "active"
        ) ===
        "on";


    if (!domain) {
        redirect(
            `/admin/domains/${domainId}/edit?error=missing_domain`
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "allowed_signup_domains"
            )
            .update({
                domain,
                active,
                updated_at:
                    new Date()
                        .toISOString(),
            })
            .eq(
                "id",
                domainId
            );


    if (error) {
        console.error(
            "Could not update allowed signup domain:",
            error
        );

        redirect(
            `/admin/domains/${domainId}/edit?error=update_failed`
        );
    }


    revalidatePath(
        "/admin/domains"
    );


    redirect(
        "/admin/domains?updated=1"
    );
}


export async function deleteDomainAction(
    domainId: string
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
                "allowed_signup_domains"
            )
            .delete()
            .eq(
                "id",
                domainId
            );


    if (error) {
        console.error(
            "Could not delete allowed signup domain:",
            error
        );

        redirect(
            "/admin/domains?error=delete_failed"
        );
    }


    revalidatePath(
        "/admin/domains"
    );


    redirect(
        "/admin/domains?deleted=1"
    );
}