import { usePage } from '@inertiajs/react';

type User = {
    id: number;
    name: string;
    email: string;
    // Add other fields if needed (like avatar, role, etc.)
};

type PageProps = {
    auth: {
        user: User | null;
    };
};

export const useAuth = (): User | null => {
    const { props } = usePage<PageProps>();
    return props.auth?.user ?? null;
};
