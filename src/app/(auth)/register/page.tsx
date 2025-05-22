'use client'
import React, { useState } from 'react'
import { createAuthStore } from '@/ZustandStore/Auth'
const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signup, login } = createAuthStore()

  
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    //getData
    const formData = new FormData(e.target as HTMLFormElement)
    const firstname = formData.get("firstname")
    const lastname = formData.get("lastname")
    const emailRaw = formData.get("email")
const email = emailRaw?.toString().trim()

if (!email || !/\S+@\S+\.\S+/.test(email)) {
  setError("Invalid email format")
  return
}
    const password = formData.get("password")

    //validate
    if (!firstname || !lastname || !email || !password) {
      setError(() => "Please fill all the fields")
      return
    }

    //signup
    setIsLoading(true)
    const responseOFsignup = await signup(
      `${firstname} ${lastname}`,
      email,
      password?.toString()
    )
    console.log({
      email,
      password,
      username: `${firstname} ${lastname}`,
    })
    if (responseOFsignup.error) {
      setError(() => responseOFsignup.error!.message)
    }
    if (responseOFsignup.success) {
      setError(() => "")
      const responseOFlogin = await login(email?.toString(), password?.toString())
      if (responseOFlogin.error) {
        setError(() => responseOFlogin.error!.message)
      }
      if (responseOFlogin.success) {
        setError(() => "")
        setIsLoading(false)
      }
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </a>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="sr-only">First Name</label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="sr-only">Last Name</label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  className="relative block w-full rounded-lg border-0 py-3 px-4 text-white bg-gray-700/50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  placeholder="Last Name"
                />
              </div>
            </div>
            
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
                autoComplete="new-password"
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
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
export default RegisterPage
