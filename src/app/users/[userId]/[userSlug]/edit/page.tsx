'use client'

import { useAuthStore, UserPreferences } from "@/ZustandStore/Auth";
import { client, account } from "@/models/client/config";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Page = ({ params }: { params: { userId: string, userSlug: string } }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, jwt } = useAuthStore();

    // Redirect if not authorized
    if (user?.$id !== params.userId) {
        router.push('/');
        return null;
    }

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const username = formData.get('username')?.toString();
            const password = formData.get('password')?.toString();

            if (!username || !password) {
                throw new Error('All fields are required');
            }

            if (!jwt) {
                throw new Error('Not authenticated');
            }

            // Set JWT for this request
            client.setJWT(jwt);

            // Update user details
            await account.updateName(username);
            await account.updatePassword(password);

            // Redirect back to profile
            router.push(`/users/${params.userId}/${params.userSlug}`);
            router.refresh();

        } catch (error: any) {
            setError(error?.message || 'Something went wrong while updating');
            console.error('Update failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={onFormSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            defaultValue={user?.name}
                            className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            placeholder="Username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            New Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            placeholder="New Password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default Page;