import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
// to create a store
import { create } from "zustand";
// i need more to write the functionality part
import { ID, Models, AppwriteException } from "appwrite";
import { account } from "@/models/client/config";


export interface UserPreferences {
    reputation: number;
    //if you have more preferences, you can add them here
    //for example, you can add a preference for the user's bio
    // bio:string,
    //for example, you can add a preference for the user's location
    // location:string,
}

interface IAuthStore {
    session: Models.Session | null;
    jwt: string | null;
    user: Models.User<UserPreferences> | null;
    hydrated: boolean;

    setHydrated(): void;
    verifySession(): Promise<void>;
    login(email: string, password: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
    signup(username: string, email: string, password: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
    logout(): Promise<void>;
}

export const createAuthStore = create<IAuthStore>()(
    persist(
        immer((set) => ({
            session: null,
            jwt: null,
            user: null,
            hydrated: false,
            setHydrated() {
                set({ hydrated: true })
            },
            async verifySession() {
                try {
                    const session = await account.getSession("current")
                    if (!session) {
                        return console.log("no session found")
                    }
                    set({ session: session })
                } catch (error: any) {
                    console.log(error.message)
                }
            },
            async login(email: string, password: string) {
                try {
                    const session = await account.createEmailPasswordSession(email, password)
                    const jwt = await account.createJWT()
                    const user = await account.get<UserPreferences>()
                    if (!user.prefs?.reputation) {
                        await account.updatePrefs({
                            reputation: 0
                        })
                    }
                    set({ session: session, user, jwt: jwt.jwt })
                    return { success: true }
                } catch (error: any) {
                    console.log(error.message);
                    return { success: false, error: error instanceof AppwriteException ? error : null }
                }
            },
            async signup(username: string, email: string, password: string) {
                try {
                    await account.create(ID.unique(), email, password, username)
                    console.log('user sign up')
                    return { success: true }
                } catch (error: any) {
                    console.log(error.message)
                    return { success: false, error: error instanceof AppwriteException ? error : null }
                }
            },
            async logout() {
                try {
                    await account.deleteSession('current');
                } catch (error: any) {
                    console.log(error.message);
                } finally {
                    account.client.setJWT(""); // Clean up
                    set({ session: null, user: null, jwt: null });
                }
            }
        })),
        {
            name: "auth-storage",
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (!error) {
                        state?.setHydrated();
                    }
                }
            }
        }
    )
)