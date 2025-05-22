'use client'
import { createAuthStore } from '@/ZustandStore/Auth'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = createAuthStore()

    const HandleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get('email')
        const password = formData.get('password')

        //validate
        if (!email || !password) {
            setError(() => "Please fill all the fields")
            return
        }

        //login
        setIsLoading(true)
        const ResponseOFlogin = await login(
            email?.toString(),
            password?.toString()
        )
        if (ResponseOFlogin.error) {
            setError(() => ResponseOFlogin.error!.message)
        }
        if (ResponseOFlogin.success) {
            setError(() => "")
            setIsLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={HandleLogin}>
                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
