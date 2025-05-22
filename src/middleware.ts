import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import setupDB from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storage.collection'
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    await Promise.all([
        setupDB(),
        getOrCreateStorage(),
    ])
    return NextResponse.next()
}

export const config = {
  matcher: [
 /*
     Include all paths except:
     - /api/*
     - /_next/*
     - /favicon.ico
     - /static/*
    */
     '/((?!api|_next|favicon.ico|static).*)'  
],
}